import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const analyses = sqliteTable(
  "analyses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userEmail: text("user_email").notNull(),
    company: text("company").notNull(),
    roleId: text("role_id").notNull(),
    roleLabel: text("role_label").notNull(),
    score: integer("score").notNull(),
    resumeFilename: text("resume_filename"),
    resumeObjectKey: text("resume_object_key"),
    resultJson: text("result_json").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_analyses_user_created_at").on(table.userId, table.createdAt),
  ],
);

export const siteSettingsVersions = sqliteTable(
  "site_settings_versions",
  {
    revision: integer("revision").primaryKey(),
    configJson: text("config_json").notNull(),
    updatedByUserId: text("updated_by_user_id").notNull(),
    updatedByEmail: text("updated_by_email").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);
