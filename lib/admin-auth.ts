import {
  getChatGPTUser,
  type ChatGPTUser,
} from "../app/chatgpt-auth";

type RuntimeEnv = typeof import("cloudflare:workers").env & {
  ADMIN_USER_IDS?: string;
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

  const allowedUserIds = await readAllowedUserIds();
  if (!allowedUserIds.size) {
    throw new AdminAuthError(503, "O acesso administrativo ainda não foi configurado.");
  }

  if (!allowedUserIds.has(user.userId)) {
    throw new AdminAuthError(403, "Esta conta não tem acesso administrativo.");
  }

  return user;
}

export async function isAdminUser(user: ChatGPTUser | null): Promise<boolean> {
  if (!user) return false;
  return (await readAllowedUserIds()).has(user.userId);
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}

async function readAllowedUserIds(): Promise<Set<string>> {
  let runtimeEnv: RuntimeEnv;
  try {
    runtimeEnv = (await import("cloudflare:workers")).env as RuntimeEnv;
  } catch {
    return new Set();
  }

  const rawValue = runtimeEnv.ADMIN_USER_IDS;
  if (typeof rawValue !== "string") return new Set();

  return new Set(
    rawValue
      .split(/[;,\n]/)
      .map((value) => value.trim())
      .filter(isPlausibleUserId),
  );
}

function isPlausibleUserId(value: string): boolean {
  return value.length >= 16 && value.length <= 256 && !/\s/.test(value);
}
