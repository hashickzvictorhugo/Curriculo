import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { analyses } from "../../../db/schema";
import type { MatchResult } from "../../../lib/matcher";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Faça login para acessar o histórico." }, { status: 401 });
  }

  try {
    const rows = await getDb()
      .select()
      .from(analyses)
      .where(eq(analyses.userId, user.userId))
      .orderBy(desc(analyses.createdAt))
      .limit(20);

    return Response.json({
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
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Faça login para salvar esta análise." }, { status: 401 });
  }

  let objectKey: string | null = null;

  try {
    const form = await request.formData();
    const company = String(form.get("company") ?? "").trim().slice(0, 120);
    const roleId = String(form.get("roleId") ?? "").trim().slice(0, 80);
    const roleLabel = String(form.get("roleLabel") ?? "").trim().slice(0, 120);
    const resultJson = String(form.get("result") ?? "");
    const resume = form.get("resume");
    const result = JSON.parse(resultJson) as MatchResult;

    if (!company || !roleId || !roleLabel || !Number.isFinite(result.score)) {
      return Response.json({ error: "Dados da análise incompletos." }, { status: 400 });
    }

    let resumeFilename: string | null = null;
    if (resume instanceof File && resume.size > 0) {
      if (resume.size > MAX_FILE_SIZE) {
        return Response.json({ error: "O currículo deve ter no máximo 10 MB." }, { status: 400 });
      }
      if (!ALLOWED_TYPES.has(resume.type) && !/\.(pdf|docx|txt|md)$/i.test(resume.name)) {
        return Response.json({ error: "Envie um arquivo PDF, DOCX ou TXT." }, { status: 400 });
      }
      if (!env.RESUMES) throw new Error("Armazenamento de currículos indisponível.");

      resumeFilename = resume.name.slice(0, 180);
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
    return Response.json(
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
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

function safeParseResult(value: string): MatchResult | null {
  try {
    return JSON.parse(value) as MatchResult;
  } catch {
    return null;
  }
}

function safeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 120);
}

function routeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  if (message.includes("no such table")) {
    return "O histórico está sendo preparado. Tente novamente em instantes.";
  }
  return message;
}

