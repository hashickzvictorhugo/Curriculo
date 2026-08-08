import {
  getDefaultSiteConfig,
  validateSiteConfig,
  type SiteConfig,
} from "./site-config";

type StoredSiteSettingsRow = {
  revision: number;
  config_json: string;
  updated_by_user_id: string;
  updated_by_email: string;
  created_at: string;
};

export type SiteSettingsSnapshot = {
  revision: number;
  config: SiteConfig;
  updatedAt: string | null;
  updatedByEmail: string | null;
};

export type PublicSiteSettingsSnapshot = Pick<
  SiteSettingsSnapshot,
  "revision" | "config"
>;

export class SiteSettingsConflictError extends Error {
  constructor() {
    super("A configuração foi alterada em outra sessão. Recarregue o painel e tente novamente.");
    this.name = "SiteSettingsConflictError";
  }
}

export class SiteSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiteSettingsValidationError";
  }
}

export async function getSiteSettings(): Promise<SiteSettingsSnapshot> {
  const database = await getDatabase();
  const row = await database
    .prepare(
      `SELECT revision, config_json, updated_by_user_id, updated_by_email, created_at
       FROM site_settings_versions
       ORDER BY revision DESC
       LIMIT 1`,
    )
    .first<StoredSiteSettingsRow>();

  if (!row) {
    return defaultSnapshot();
  }

  return snapshotFromRow(row);
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettingsSnapshot> {
  try {
    const { revision, config } = await getSiteSettings();
    return { revision, config };
  } catch (error) {
    if (!isMissingPublicSettingsStorage(error)) throw error;
    const { revision, config } = defaultSnapshot();
    return { revision, config };
  }
}

export async function saveSiteSettings(input: {
  expectedRevision: number;
  config: unknown;
  updatedByUserId: string;
  updatedByEmail: string;
}): Promise<SiteSettingsSnapshot> {
  let config: SiteConfig;
  try {
    config = validateSiteConfig(input.config);
  } catch (error) {
    throw new SiteSettingsValidationError(
      error instanceof Error ? error.message : "Configuração inválida.",
    );
  }
  const configJson = JSON.stringify(config);
  const nextRevision = input.expectedRevision + 1;
  const database = await getDatabase();

  const result = await database
    .prepare(
      `INSERT INTO site_settings_versions
         (revision, config_json, updated_by_user_id, updated_by_email, created_at)
       SELECT ?, ?, ?, ?, CURRENT_TIMESTAMP
       WHERE ? = COALESCE(
         (SELECT MAX(revision) FROM site_settings_versions),
         0
       )`,
    )
    .bind(
      nextRevision,
      configJson,
      input.updatedByUserId,
      input.updatedByEmail,
      input.expectedRevision,
    )
    .run();

  if (!result.success) {
    throw new Error("Não foi possível salvar a configuração.");
  }
  if ((result.meta.changes ?? 0) !== 1) {
    throw new SiteSettingsConflictError();
  }

  const savedRow = await database
    .prepare(
      `SELECT revision, config_json, updated_by_user_id, updated_by_email, created_at
       FROM site_settings_versions
       WHERE revision = ?
       LIMIT 1`,
    )
    .bind(nextRevision)
    .first<StoredSiteSettingsRow>();

  if (!savedRow) {
    throw new Error("A configuração foi salva, mas não pôde ser recarregada.");
  }

  return snapshotFromRow(savedRow);
}

function snapshotFromRow(row: StoredSiteSettingsRow): SiteSettingsSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(row.config_json);
  } catch {
    throw new Error("A configuração salva está corrompida.");
  }

  return {
    revision: row.revision,
    config: validateSiteConfig(parsed),
    updatedAt: row.created_at,
    updatedByEmail: row.updated_by_email,
  };
}

function defaultSnapshot(): SiteSettingsSnapshot {
  return {
    revision: 0,
    config: getDefaultSiteConfig(),
    updatedAt: null,
    updatedByEmail: null,
  };
}

function isMissingPublicSettingsStorage(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("banco de dados de configurações está indisponível") ||
    (message.includes("no such table") && message.includes("site_settings_versions"))
  );
}

async function getDatabase() {
  let runtimeEnv: typeof import("cloudflare:workers").env;
  try {
    runtimeEnv = (await import("cloudflare:workers")).env;
  } catch {
    throw new Error("O banco de dados de configurações está indisponível.");
  }

  if (!runtimeEnv.DB) {
    throw new Error("O banco de dados de configurações está indisponível.");
  }
  return runtimeEnv.DB;
}
