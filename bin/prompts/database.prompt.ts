import * as p from "@clack/prompts";
import pc from "picocolors";
import { withCancel } from "../utils/prompt-guard";
import { DB_PRESETS } from "../constants/db-presets";
import type { DatabaseConfig, DbProviderKey } from "../types";

const DISABLED_DATABASE_CONFIG: DatabaseConfig = {
  enabled: false,
  preset: null,
  databaseUrl: "",
  directUrl: "",
};

/**
 * Pergunta se o usuário deseja configurar um banco de dados e,
 * em caso positivo, coleta o provedor e as connection strings.
 */
export async function promptDatabaseConfig(): Promise<DatabaseConfig> {
  const useDatabase = withCancel(
    await p.confirm({
      message: "Configure a database with Prisma?",
      initialValue: true,
    })
  );

  if (!useDatabase) {
    return DISABLED_DATABASE_CONFIG;
  }

  p.note("Configure your database", pc.bold("Database"));

  const dbChoice = withCancel(
    await p.select<DbProviderKey>({
      message: "Database provider",
      options: Object.entries(DB_PRESETS).map(([value, dbPreset]) => ({
        value: value as DbProviderKey,
        label: dbPreset.label,
      })),
    })
  );

  const preset = DB_PRESETS[dbChoice];

  const databaseUrl = withCancel(
    await p.text({
      message:
        preset.urlVar === preset.directUrlVar
          ? "Connection string (DATABASE_URL)"
          : "Pooled connection string (DATABASE_URL)",
      placeholder: getPlaceholderForProvider(dbChoice),
    })
  );

  let directUrl = databaseUrl;

  if (preset.urlVar !== preset.directUrlVar) {
    directUrl = withCancel(
      await p.text({
        message: "Direct connection string (DIRECT_URL)",
        placeholder: `${dbChoice}://user:pass@host:5432/mydb`,
        initialValue: databaseUrl || "",
      })
    );
  }

  return {
    enabled: true,
    preset,
    databaseUrl: databaseUrl || "",
    directUrl: directUrl || databaseUrl || "",
  };
}

function getPlaceholderForProvider(provider: DbProviderKey): string {
  if (provider === "sqlite") return "file:./dev.db";
  if (provider === "mongodb")
    return "mongodb+srv://user:pass@cluster.mongodb.net/mydb";
  return `${provider}://user:pass@host:5432/mydb`;
}
