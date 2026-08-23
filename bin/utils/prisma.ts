import fs from "node:fs";
import path from "node:path";
import type { DbPreset } from "../types";

/**
 * Monta o conteúdo do arquivo `prisma.ts` de acordo com o preset
 * de banco de dados escolhido. Bancos sem adapter dedicado (ex: MongoDB)
 * usam o PrismaClient padrão.
 *
 * Cada driver adapter do Prisma tem uma assinatura de construtor diferente,
 * então o corpo gerado varia por `preset.provider`, não apenas pela
 * presença de `adapterPkg`:
 * - postgresql / cockroachdb (@prisma/adapter-pg)         -> new PrismaPg({ connectionString })
 * - sqlite       (@prisma/adapter-libsql)                 -> new PrismaLibSQL({ url })
 * - mysql        (@prisma/adapter-mariadb)                -> new PrismaMariaDb({ host, port, user, password, database })
 * - planetscale  (@prisma/adapter-planetscale)            -> new PrismaPlanetScale({ url, fetch })
 * - sqlserver    (@prisma/adapter-mssql)                  -> new PrismaMssql({ server, port, database, user, password, options })
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

  const header = [
    'import "dotenv/config";',
    `import { ${preset.adapterClass} } from "${preset.adapterImport}";`,
    'import { PrismaClient } from "../generated/prisma/client";',
    "",
  ];

  switch (preset.provider) {
    case "planetscale": {
      // @prisma/adapter-planetscale é HTTP/fetch-based (sem TCP), então
      // não segue nem o padrão { connectionString } nem o { host, port, ... }
      // dos outros adapters. Em Node < 18 é preciso injetar um fetch via undici.
      return [
        'import "dotenv/config";',
        `import { ${preset.adapterClass} } from "${preset.adapterImport}";`,
        'import { PrismaClient } from "../generated/prisma/client";',
        'import { fetch as undiciFetch } from "undici"; // Necessário apenas em Node.js < 18',
        "",
        `const adapter = new ${preset.adapterClass}({`,
        "  url: process.env.DATABASE_URL,",
        "  fetch: undiciFetch,",
        "});",
        "const prisma = new PrismaClient({ adapter });",
        "",
        "export { prisma };",
      ].join("\n");
    }

    case "mysql": {
      // @prisma/adapter-mariadb não aceita connectionString: é preciso
      // desmembrar a URL em host/port/user/password/database.
      return [
        ...header,
        "// Ex.: mysql://user:password@host:3306/database",
        "const url = new URL(`${process.env.DIRECT_URL}`);",
        "",
        `const adapter = new ${preset.adapterClass}({`,
        "  host: url.hostname,",
        "  port: url.port ? Number(url.port) : 3306,",
        "  user: decodeURIComponent(url.username),",
        "  password: decodeURIComponent(url.password),",
        '  database: url.pathname.replace(/^\\//, ""),',
        "});",
        "const prisma = new PrismaClient({ adapter });",
        "",
        "export { prisma };",
      ].join("\n");
    }

    case "sqlserver": {
      // @prisma/adapter-mssql também não aceita connectionString.
      // A URL do SQL Server usa formato JDBC (";" em vez de "&"),
      // então fazemos um parse manual dos parâmetros.
      return [
        ...header,
        "// Ex.: sqlserver://host:1433;database=db;user=USER;password=PASSWORD;encrypt=true",
        "const raw = `${process.env.DIRECT_URL}`;",
        'const [hostPart, ...params] = raw.replace(/^sqlserver:\\/\\//, "").split(";");',
        'const [host, port] = hostPart.split(":");',
        "",
        "const options: Record<string, string> = {};",
        "for (const param of params) {",
        '  const [key, value] = param.split("=");',
        "  if (key && value !== undefined) options[key.trim().toLowerCase()] = value.trim();",
        "}",
        "",
        `const adapter = new ${preset.adapterClass}({`,
        "  server: host,",
        "  port: port ? Number(port) : 1433,",
        "  database: options.database,",
        "  user: options.user,",
        "  password: options.password,",
        "  options: {",
        '    encrypt: options.encrypt !== "false",',
        '    trustServerCertificate: options.trustservercertificate === "true",',
        "  },",
        "});",
        "const prisma = new PrismaClient({ adapter });",
        "",
        "export { prisma };",
      ].join("\n");
    }

    case "sqlite": {
      // @prisma/adapter-libsql espera { url }, não { connectionString }.
      return [
        ...header,
        "const connectionString = `${process.env.DIRECT_URL}`;",
        "",
        `const adapter = new ${preset.adapterClass}({ url: connectionString });`,
        "const prisma = new PrismaClient({ adapter });",
        "",
        "export { prisma };",
      ].join("\n");
    }

    default: {
      // postgresql e cockroachdb usam @prisma/adapter-pg -> { connectionString }
      return [
        ...header,
        "const connectionString = `${process.env.DIRECT_URL}`;",
        "",
        `const adapter = new ${preset.adapterClass}({ connectionString });`,
        "const prisma = new PrismaClient({ adapter });",
        "",
        "export { prisma };",
      ].join("\n");
    }
  }
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