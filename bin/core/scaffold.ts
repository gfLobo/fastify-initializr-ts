import fs from "node:fs";
import path from "node:path";
import { copyFolderSync, removePathSync } from "../utils/fs";
import { stripPrismaFromPackageJson } from "../utils/package-json";
import { buildPrismaTs, overridePrismaTs } from "../utils/prisma";
import { TEMPLATE_DIR } from "../config";
import type { DatabaseConfig, TemplateVars } from "../types";

/**
 * Copia o template base para o diretório de destino e aplica os
 * ajustes necessários de acordo com a escolha de banco de dados:
 * - Se habilitado: sobrescreve o arquivo `prisma.ts` com o adapter correto.
 * - Se desabilitado: remove pastas/arquivos relacionados ao Prisma
 *   e limpa as dependências do package.json.
 */
export function scaffoldProject(
  targetDir: string,
  vars: TemplateVars,
  databaseConfig: DatabaseConfig
): void {
  copyFolderSync(TEMPLATE_DIR, targetDir, vars);

  if (databaseConfig.enabled && databaseConfig.preset) {
    overridePrismaTs(targetDir, buildPrismaTs(databaseConfig.preset));
    return;
  }

  removePathSync(path.join(targetDir, "lib"));
  removePathSync(path.join(targetDir, "prisma"));
  removePathSync(path.join(targetDir, "prisma.config.ts"));
  stripDatabaseVarsFromEnv(targetDir);
  stripPrismaFromPackageJson(targetDir);
}


/**
 * Sem banco configurado, remove DATABASE_URL / DIRECT_URL do `.env`
 * para não deixar placeholders (ex.: "app_db_url") no projeto gerado.
 */
function stripDatabaseVarsFromEnv(targetDir: string): void {
  const envPath = path.join(targetDir, ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => !/^(DATABASE_URL|DIRECT_URL)=/.test(line))
    .join("\n")
    .replace(/^\s+/, "");

  fs.writeFileSync(envPath, content, "utf8");
}
