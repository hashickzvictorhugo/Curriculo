import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { analyses } from "../../../db/schema";
import type { MatchResult } from "../../../lib/matcher";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RESULT_SIZE = 256 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + MAX_RESULT_SIZE + (512 * 1024);
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return json({ error: "Faça login para acessar o histórico." }, { status: 401 });
  }

  try {
    const rows = await getDb()
      .select()
      .from(analyses)
      .where(eq(analyses.userId, user.userId))
      .orderBy(desc(analyses.createdAt))
      .limit(20);

    return json({
      analyses: rows.map((row) => ({
        id: row.id,
        company: row.company,
        roleId: row.roleId,
        roleLabel: row.roleLabel,
        score: row.score,
        resumeFilename: row.resumeFilename,
        createdAt: row.createdAt,
        result: safeParseResult(row.resultJson),
      })),
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return routeError(error);
  }

  const user = await getChatGPTUser();
  if (!user) {
    return json({ error: "Faça login para salvar esta análise." }, { status: 401 });
  }

  let objectKey: string | null = null;

  try {
    const form = await readMultipartForm(request);
    const company = readRequiredText(form, "company", 120);
    const roleId = readRequiredText(form, "roleId", 80);
    const roleLabel = readRequiredText(form, "roleLabel", 120);
    const result = parseResult(form.get("result"));
    const resume = form.get("resume");

    let resumeFilename: string | null = null;
    if (resume instanceof File && resume.size > 0) {
      if (resume.size > MAX_FILE_SIZE) {
        throw new ApiRequestError(413, "O currículo deve ter no máximo 10 MB.");
      }
      if (!ALLOWED_TYPES.has(resume.type) && !/\.(pdf|docx|txt|md)$/i.test(resume.name)) {
        throw new ApiRequestError(415, "Envie um arquivo PDF, DOCX ou TXT.");
      }
      if (!env.RESUMES) {
        throw new ApiRequestError(503, "O armazenamento de currículos está indisponível agora.");
      }

      resumeFilename = displayFilename(resume.name);
      objectKey = `${user.userId}/${crypto.randomUUID()}/${safeFilename(resume.name)}`;
      await env.RESUMES.put(objectKey, resume.stream(), {
        httpMetadata: { contentType: resume.type || "application/octet-stream" },
        customMetadata: { owner: user.userId, originalName: resumeFilename },
      });
    }

    const record = {
      id: crypto.randomUUID(),
      userId: user.userId,
      userEmail: user.email,
      company,
      roleId,
      roleLabel,
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      resumeFilename,
      resumeObjectKey: objectKey,
      resultJson: JSON.stringify(result),
    };

    await getDb().insert(analyses).values(record);
    return json(
      {
        analysis: {
          id: record.id,
          company,
          roleId,
          roleLabel,
          score: record.score,
          resumeFilename,
          result,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (objectKey && env.RESUMES) await env.RESUMES.delete(objectKey).catch(() => undefined);
    return routeError(error);
  }
}

function safeParseResult(value: string): MatchResult | null {
  try {
    return parseResult(value);
  } catch {
    return null;
  }
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") {
    throw new ApiRequestError(403, "Origem da requisição ausente.");
  }

  let requestOrigin: string;
  let suppliedOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
    suppliedOrigin = new URL(origin).origin;
  } catch {
    throw new ApiRequestError(403, "Origem da requisição inválida.");
  }

  if (requestOrigin !== suppliedOrigin) {
    throw new ApiRequestError(403, "Requisições externas não são permitidas.");
  }
}

async function readMultipartForm(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type")?.trim() ?? "";
  if (!/^multipart\/form-data(?:;|$)/i.test(contentType)) {
    throw new ApiRequestError(415, "Envie os dados como multipart/form-data.");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const parsedLength = Number(declaredLength);
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      throw new ApiRequestError(400, "Tamanho da requisição inválido.");
    }
    if (parsedLength > MAX_REQUEST_SIZE) {
      throw new ApiRequestError(413, "A requisição ultrapassa o limite permitido.");
    }
  }

  const body = await readLimitedBody(request);
  const bodyBuffer = new ArrayBuffer(body.byteLength);
  new Uint8Array(bodyBuffer).set(body);
  try {
    return await new Response(bodyBuffer, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    throw new ApiRequestError(400, "Os dados enviados são inválidos.");
  }
}

async function readLimitedBody(request: Request): Promise<Uint8Array> {
  if (!request.body) {
    throw new ApiRequestError(400, "A requisição está vazia.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_SIZE) {
      await reader.cancel().catch(() => undefined);
      throw new ApiRequestError(413, "A requisição ultrapassa o limite permitido.");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function readRequiredText(form: FormData, field: string, maxLength: number): string {
  const value = form.get(field);
  if (typeof value !== "string") {
    throw new ApiRequestError(400, "Dados da análise incompletos.");
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new ApiRequestError(400, "Dados da análise incompletos.");
  }
  if (normalized.length > maxLength) {
    throw new ApiRequestError(400, "Um dos campos enviados ultrapassa o limite permitido.");
  }
  return normalized;
}

function parseResult(value: FormDataEntryValue | string | null): MatchResult {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiRequestError(400, "O resultado da análise não foi informado.");
  }
  if (new TextEncoder().encode(value).byteLength > MAX_RESULT_SIZE) {
    throw new ApiRequestError(413, "O resultado da análise ultrapassa o limite permitido.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }
  if (!isRecord(parsed) || !isRecord(parsed.keywords) || !isRecord(parsed.signals)) {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }

  const result: MatchResult = {
    score: readNumber(parsed.score, 0, 100),
    level: readBoundedString(parsed.level, 160),
    summary: readBoundedString(parsed.summary, 2_000),
    dimensions: readDimensions(parsed.dimensions),
    matchedSkills: readStringArray(parsed.matchedSkills),
    missingSkills: readStringArray(parsed.missingSkills),
    strengths: readStringArray(parsed.strengths),
    gaps: readStringArray(parsed.gaps),
    recommendations: readStringArray(parsed.recommendations, 40, 1_000),
    keywords: {
      matched: readStringArray(parsed.keywords.matched),
      missing: readStringArray(parsed.keywords.missing),
    },
    signals: {
      years: readNumber(parsed.signals.years, 0, 100),
      hasDegree: readBoolean(parsed.signals.hasDegree),
      hasMetrics: readBoolean(parsed.signals.hasMetrics),
    },
  };

  if (parsed.analysisVersion !== undefined) {
    const version = readNumber(parsed.analysisVersion, 0, 1_000);
    if (!Number.isSafeInteger(version)) {
      throw new ApiRequestError(400, "O resultado da análise é inválido.");
    }
    result.analysisVersion = version;
  }

  if (parsed.companyMatch !== undefined) {
    if (!isRecord(parsed.companyMatch)) {
      throw new ApiRequestError(400, "O resultado da análise é inválido.");
    }
    result.companyMatch = {
      score: readNumber(parsed.companyMatch.score, 0, 100),
      sectorLabel: readBoundedString(parsed.companyMatch.sectorLabel, 160),
      detail: readBoundedString(parsed.companyMatch.detail, 2_000),
      matchedSignals: readStringArray(parsed.companyMatch.matchedSignals),
      missingSignals: readStringArray(parsed.companyMatch.missingSignals),
    };
  }

  return result;
}

const DIMENSION_IDS = new Set([
  "skills",
  "experience",
  "context",
  "company",
  "softSkills",
  "education",
]);

function readDimensions(value: unknown): MatchResult["dimensions"] {
  if (!Array.isArray(value) || value.length > 12) {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }

  return value.map((dimension) => {
    if (!isRecord(dimension) || typeof dimension.id !== "string" || !DIMENSION_IDS.has(dimension.id)) {
      throw new ApiRequestError(400, "O resultado da análise é inválido.");
    }
    const weight = dimension.weight === undefined
      ? undefined
      : readNumber(dimension.weight, 0, 100);
    return {
      id: dimension.id as MatchResult["dimensions"][number]["id"],
      label: readBoundedString(dimension.label, 160),
      score: readNumber(dimension.score, 0, 100),
      detail: readBoundedString(dimension.detail, 2_000),
      ...(weight === undefined ? {} : { weight }),
    };
  });
}

function readStringArray(value: unknown, maxItems = 60, maxLength = 500): string[] {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }
  return value.map((item) => readBoundedString(item, maxLength));
}

function readBoundedString(value: unknown, maxLength: number): string {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }
  return value;
}

function readNumber(value: unknown, minimum: number, maximum: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }
  return value;
}

function readBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new ApiRequestError(400, "O resultado da análise é inválido.");
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 120) || "curriculo";
}

function displayFilename(value: string): string {
  const printable = [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint >= 0x20 && codePoint !== 0x7f;
    })
    .join("");
  return printable.slice(0, 180) || "curriculo";
}

class ApiRequestError extends Error {
  constructor(
    public readonly status: 400 | 403 | 413 | 415 | 503,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function routeError(error: unknown): Response {
  if (error instanceof ApiRequestError) {
    return json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Erro inesperado.";
  if (message.includes("no such table")) {
    return json(
      { error: "O histórico está sendo preparado. Tente novamente em instantes." },
      { status: 503 },
    );
  }
  console.error("Falha ao processar uma solicitação de análise.", error instanceof Error ? error.name : "UnknownError");
  return json({ error: "Não foi possível atualizar o histórico agora." }, { status: 500 });
}

function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) {
    headers.set(name, value);
  }
  return Response.json(body, { ...init, headers });
}
