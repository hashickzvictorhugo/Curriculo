import {
  getChatGPTUser,
  type ChatGPTUser,
} from "../app/chatgpt-auth";

type RuntimeEnv = typeof import("cloudflare:workers").env & {
  ADMIN_EMAILS?: string;
};

export class AdminAuthError extends Error {
  constructor(
    public readonly status: 401 | 403 | 503,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function requireAdminUser(): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (!user) {
    throw new AdminAuthError(401, "Faça login para acessar o painel administrativo.");
  }

  const allowedEmails = await readAllowedEmails();
  if (!allowedEmails.size) {
    throw new AdminAuthError(503, "O acesso administrativo ainda não foi configurado.");
  }

  if (!allowedEmails.has(normalizeEmail(user.email))) {
    throw new AdminAuthError(403, "Esta conta não tem acesso administrativo.");
  }

  return user;
}

export async function isAdminUser(user: ChatGPTUser | null): Promise<boolean> {
  if (!user) return false;
  return (await readAllowedEmails()).has(normalizeEmail(user.email));
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}

async function readAllowedEmails(): Promise<Set<string>> {
  let runtimeEnv: RuntimeEnv;
  try {
    runtimeEnv = (await import("cloudflare:workers")).env as RuntimeEnv;
  } catch {
    return new Set();
  }

  const rawValue = runtimeEnv.ADMIN_EMAILS;
  if (typeof rawValue !== "string") return new Set();

  return new Set(
    rawValue
      .split(/[;,\n]/)
      .map(normalizeEmail)
      .filter(isPlausibleEmail),
  );
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
