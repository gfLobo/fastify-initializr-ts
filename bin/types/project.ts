import type { DbPreset } from "./database";

export interface AppConfig {
  name: string;
  description: string;
  author: string;
  license: string;
}

export interface DatabaseConfig {
  enabled: boolean;
  preset: DbPreset | null;
  databaseUrl: string;
  directUrl: string;
}

export interface ProjectSetup {
  projectName: string;
  targetDir: string;
  appConfig: AppConfig;
  databaseConfig: DatabaseConfig;
}

/**
 * Mapa de variáveis usadas na substituição de placeholders
 * dentro dos arquivos de template (ex: {{app_name}}).
 */
export type TemplateVars = Record<string, string>;
