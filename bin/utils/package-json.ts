import fs from "node:fs";
import path from "node:path";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

const DEPS_TO_REMOVE = ["@prisma/client", "dotenv"];
const DEV_DEPS_TO_REMOVE = ["prisma"];

/**
 * Remove as dependências relacionadas ao Prisma do package.json
 * gerado no diretório de destino, usado quando o usuário opta
 * por não configurar um banco de dados.
 */
export function stripPrismaFromPackageJson(targetDir: string): void {
  const pkgPath = path.join(targetDir, "package.json");

  if (!fs.existsSync(pkgPath)) return;

  const pkg: PackageJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  if (pkg.dependencies) {
    for (const dep of DEPS_TO_REMOVE) {
      delete pkg.dependencies[dep];
    }
  }

  if (pkg.devDependencies) {
    for (const dep of DEV_DEPS_TO_REMOVE) {
      delete pkg.devDependencies[dep];
    }
  }

  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}
