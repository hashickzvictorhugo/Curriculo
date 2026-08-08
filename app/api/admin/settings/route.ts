import {
  isAdminAuthError,
  requireAdminUser,
} from "../../../../lib/admin-auth";
import {
  getSiteSettings,
  saveSiteSettings,
  SiteSettingsConflictError,
  SiteSettingsValidationError,
} from "../../../../lib/site-settings.server";

export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 500 * 1024;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

export async function GET() {
  try {
    await requireAdminUser();
    return json(await getSiteSettings());
  } catch (error) {
    return routeError(error);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireAdminUser();
    const payload = await readJsonBody(request);

    if (!isRecord(payload)) {
      return json({ error: "Corpo da requisição inválido." }, { status: 400 });
    }

    const expectedRevision = payload.expectedRevision;
    if (!Number.isSafeInteger(expectedRevision) || (expectedRevision as number) < 0) {
      return json({ error: "A revisão esperada é inválida." }, { status: 422 });
    }
    if (!("config" in payload)) {
      return json({ error: "A configuração não foi informada." }, { status: 422 });
    }

    const snapshot = await saveSiteSettings({
      expectedRevision: expectedRevision as number,
      config: payload.config,
      updatedByUserId: user.userId,
      updatedByEmail: user.email,
    });
    return json(snapshot);
  } catch (error) {
    return routeError(error);
  }
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    throw new ApiRequestError(403, "Origem da requisição inválida.");
  }

  if (!origin || origin === "null") {
    throw new ApiRequestError(403, "Origem da requisição ausente.");
  }

  let suppliedOrigin: string;
  try {
    suppliedOrigin = new URL(origin).origin;
  } catch {
    throw new ApiRequestError(403, "Origem da requisição inválida.");
  }

  if (suppliedOrigin !== requestOrigin) {
    throw new ApiRequestError(403, "Requisições externas não são permitidas.");
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    throw new ApiRequestError(415, "Envie a configuração como application/json.");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new ApiRequestError(413, "A configuração ultrapassa o limite de 500 KB.");
  }

  const bytes = await readLimitedBody(request);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new ApiRequestError(400, "O corpo da requisição não usa UTF-8 válido.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiRequestError(400, "O JSON enviado é inválido.");
  }
}

async function readLimitedBody(request: Request): Promise<Uint8Array> {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new ApiRequestError(413, "A configuração ultrapassa o limite de 500 KB.");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

class ApiRequestError extends Error {
  constructor(
    public readonly status: 400 | 403 | 413 | 415,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function routeError(error: unknown): Response {
  if (error instanceof ApiRequestError || isAdminAuthError(error)) {
    return json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SiteSettingsConflictError) {
    return json({ error: error.message }, { status: 409 });
  }
  if (error instanceof SiteSettingsValidationError) {
    return json({ error: error.message }, { status: 422 });
  }

  const message = error instanceof Error ? error.message : "Erro inesperado.";
  if (message.includes("no such table")) {
    return json(
      { error: "O armazenamento das configurações ainda está sendo preparado." },
      { status: 503 },
    );
  }
  return json({ error: "Não foi possível processar a configuração agora." }, { status: 500 });
}

function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) {
    headers.set(name, value);
  }
  return Response.json(body, { ...init, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
