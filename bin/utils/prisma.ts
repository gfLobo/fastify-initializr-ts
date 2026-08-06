import fs from "node:fs";
import path from "node:path";
import type { DbPreset } from "../types";

/**
 * Monta o conteúdo do arquivo `prisma.ts` de acordo com o preset
 * de banco de dados escolhido. Bancos sem adapter dedicado (ex: MongoDB)
 * usam o PrismaClient padrão.
 */
export function buildPrismaTs(preset: DbPreset): string {
  if (!preset.adapterPkg) {
    return [
      'import "dotenv/config";',
      'import { PrismaClient } from "../generated/prisma/client";',
      "",
      "const prisma = new PrismaClient();",
      "",
      "export { prisma };",
    ].join("\n");
  }

  return [
    'import "dotenv/config";',
    `import { ${preset.adapterClass} } from "${preset.adapterImport}";`,
    'import { PrismaClient } from "../generated/prisma/client";',
    "",
    "const connectionString = `${process.env.DIRECT_URL}`;",
    "",
    `const adapter = new ${preset.adapterClass}({ connectionString });`,
    "const prisma = new PrismaClient({ adapter });",
    "",
    "export { prisma };",
  ].join("\n");
}

/**
 * Percorre recursivamente um diretório e substitui o conteúdo
 * de todo arquivo `prisma.ts` encontrado.
 */
export function overridePrismaTs(dir: string, content: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      overridePrismaTs(fullPath, content);
    } else if (entry.name === "prisma.ts") {
      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
}
