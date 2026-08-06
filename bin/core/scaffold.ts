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
  stripPrismaFromPackageJson(targetDir);
}
