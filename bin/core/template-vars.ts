import type { AppConfig, DatabaseConfig, TemplateVars } from "../types";

/**
 * Converte as configurações de app e banco de dados coletadas via
 * prompts em um mapa plano de variáveis, pronto para ser usado na
 * substituição de placeholders dos arquivos de template.
 */
export function buildTemplateVars(
  appConfig: AppConfig,
  databaseConfig: DatabaseConfig
): TemplateVars {
  const baseVars: TemplateVars = {
    app_name: appConfig.name,
    app_description: appConfig.description,
    app_author: appConfig.author,
    app_license: appConfig.license,
  };

  if (!databaseConfig.enabled || !databaseConfig.preset) {
    return {
      ...baseVars,
      app_db_stack_tagline: "",
      app_db_stack_item: "",
      app_db_section: "",
    };
  }

  const { preset } = databaseConfig;

  return {
    ...baseVars,
    app_db_url: databaseConfig.databaseUrl,
    app_db_direct_url: databaseConfig.directUrl || databaseConfig.databaseUrl,
    app_db_adapter: preset.adapterClass || "",
    app_db_adapter_dir: preset.adapterImport || "",
    app_db_provider: preset.provider,
    app_db_stack_tagline: " + Prisma",
    app_db_stack_item: "\n* Prisma",
    app_db_section: buildDatabaseSection(preset.provider),
  };
}

function buildDatabaseSection(provider: string): string {
  return [
    "",
    "## Database",
    "",
    `* Provider: \`${provider}\``,
    "* ORM: Prisma",
    "",
    "```bash",
    "npx prisma generate",
    "npx prisma migrate dev",
    "```",
    "",
    "",
  ].join("\n");
}
