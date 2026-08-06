import * as p from "@clack/prompts";
import {
  installDependencies,
  runPrismaGenerate,
} from "../utils/child-process";
import type { DatabaseConfig } from "../types";

/**
 * Instala as dependências do projeto (incluindo pacotes extras do
 * banco de dados, se aplicável) e, quando um banco está configurado,
 * executa `prisma generate` em seguida.
 */
export async function installProjectDependencies(
  targetDir: string,
  databaseConfig: DatabaseConfig
): Promise<void> {
  const extraPkgs = getExtraPackages(databaseConfig);

  const installSpinner = p.spinner();

  installSpinner.start(
    extraPkgs.length > 0
      ? `Installing dependencies + ${extraPkgs.join(", ")}`
      : "Installing dependencies"
  );

  await installDependencies(targetDir, extraPkgs);

  installSpinner.stop("Dependencies installed");

  if (databaseConfig.enabled) {
    const generateSpinner = p.spinner();

    generateSpinner.start("Running prisma generate");
    await runPrismaGenerate(targetDir);
    generateSpinner.stop("Prisma client generated");
  }
}

function getExtraPackages(databaseConfig: DatabaseConfig): string[] {
  if (!databaseConfig.enabled || !databaseConfig.preset) {
    return [];
  }

  const { preset } = databaseConfig;

  return [...(preset.adapterPkg ? [preset.adapterPkg] : []), ...preset.extraDeps];
}
