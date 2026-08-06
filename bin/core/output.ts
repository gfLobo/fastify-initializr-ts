import * as p from "@clack/prompts";
import pc from "picocolors";
import type { DatabaseConfig } from "../types";

/**
 * Imprime o resumo final quando o servidor de desenvolvimento
 * já foi iniciado automaticamente pelo CLI.
 */
export function printServerRunningOutro(
  targetDir: string,
  databaseConfig: DatabaseConfig
): void {
  p.outro(`
${pc.green("✔ Project ready")}

${pc.bold("Path")}
  ${pc.cyan(targetDir)}
${buildDatabaseSummary(databaseConfig)}
${pc.bold("Application")}
  ${pc.cyan("http://localhost:3000/docs")}

${pc.dim("Development server is running")}
`);
}

/**
 * Imprime o resumo final com os próximos passos manuais,
 * usado quando o usuário optou por não instalar as dependências agora.
 */
export function printNextStepsOutro(
  projectName: string,
  targetDir: string,
  databaseConfig: DatabaseConfig
): void {
  const nextSteps = [
    `cd ${projectName}`,
    "npm install && npm run dev",
    databaseConfig.enabled && "npx prisma generate",
  ].filter((step): step is string => Boolean(step));

  p.outro(`
${pc.green("✔ Project ready")}

${pc.bold("Path")}
  ${pc.cyan(targetDir)}
${buildDatabaseSummary(databaseConfig)}
${pc.bold("Next steps")}
${nextSteps.map((step) => `  ${pc.yellow(step)}`).join("\n")}
`);
}

function buildDatabaseSummary(databaseConfig: DatabaseConfig): string {
  if (!databaseConfig.enabled || !databaseConfig.preset) {
    return "";
  }

  const { preset } = databaseConfig;

  const adapterLine = preset.adapterPkg
    ? `\n  ${pc.dim("Adapter: ")} ${pc.yellow(preset.adapterPkg)}`
    : "";

  return `\n${pc.bold("Database")}\n  ${pc.dim("Provider:")} ${pc.yellow(
    preset.provider
  )}${adapterLine}\n`;
}
