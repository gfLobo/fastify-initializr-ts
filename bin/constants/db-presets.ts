import type { DbPresetsMap } from "../types";

/**
 * Presets de configuração para cada provedor de banco de dados suportado.
 * Cada preset descreve o adapter do Prisma, dependências extras e
 * variáveis de ambiente esperadas.
 *
 * IMPORTANTE: cada driver adapter do Prisma tem uma assinatura de
 * construtor diferente (veja prisma.ts para o detalhe de cada uma):
 * - @prisma/adapter-pg           -> { connectionString }
 * - @prisma/adapter-libsql       -> { url }
 * - @prisma/adapter-mariadb      -> objeto de config (host, port, user, password, database)
 * - @prisma/adapter-mssql        -> objeto de config (server, port, database, user, password, options)
 */
export const DB_PRESETS: DbPresetsMap = {
  postgresql: {
    label: "PostgreSQL (Supabase / Neon / padrão)",
    provider: "postgresql",
    adapterPkg: "@prisma/adapter-pg",
    adapterClass: "PrismaPg",
    adapterImport: "@prisma/adapter-pg",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: ["pg"],
  },
  mysql: {
    label: "MySQL / MariaDB (self-hosted)",
    provider: "mysql",
    // @prisma/adapter-mysql foi descontinuado. O adapter oficial atual
    // (Prisma ORM v7+) para MySQL/MariaDB self-hosted é @prisma/adapter-mariadb,
    // que já embute o driver "mariadb" como dependência — não é
    // necessário instalar mysql2 separadamente.
    // Doc: https://www.prisma.io/docs/orm/core-concepts/supported-databases/mysql
    adapterPkg: "@prisma/adapter-mariadb",
    adapterClass: "PrismaMariaDb",
    adapterImport: "@prisma/adapter-mariadb",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: [],
  },
  planetscale: {
    label: "MySQL (PlanetScale serverless)",
    provider: "planetscale",
    // PlanetScale usa um adapter HTTP/fetch próprio, sem conexão TCP.
    // Não tem "direct connection" separada como pg/mariadb; migrações
    // usam `prisma db push` em vez de `prisma migrate`.
    // Doc: https://www.prisma.io/docs/orm/core-concepts/supported-databases/mysql#planetscale
    adapterPkg: "@prisma/adapter-planetscale",
    adapterClass: "PrismaPlanetScale",
    adapterImport: "@prisma/adapter-planetscale",
    urlVar: "DATABASE_URL",
    directUrlVar: "DATABASE_URL",
    // undici só é necessário em Node.js < 18 (fetch nativo cobre o resto),
    // mas é leve o bastante para instalar sempre e evitar erro silencioso.
    extraDeps: ["undici"],
  },
  sqlite: {
    label: "SQLite (local / Turso / libSQL)",
    provider: "sqlite",
    adapterPkg: "@prisma/adapter-libsql",
    adapterClass: "PrismaLibSQL",
    adapterImport: "@prisma/adapter-libsql",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: ["@libsql/client"],
  },
  mongodb: {
    label: "MongoDB",
    provider: "mongodb",
    adapterPkg: null,
    adapterClass: null,
    adapterImport: null,
    urlVar: "DATABASE_URL",
    directUrlVar: "DATABASE_URL",
    extraDeps: [],
  },
  sqlserver: {
    label: "SQL Server",
    provider: "sqlserver",
    adapterPkg: "@prisma/adapter-mssql",
    adapterClass: "PrismaMssql",
    adapterImport: "@prisma/adapter-mssql",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: ["mssql"],
  },
  cockroachdb: {
    label: "CockroachDB",
    provider: "cockroachdb",
    adapterPkg: "@prisma/adapter-pg",
    adapterClass: "PrismaPg",
    adapterImport: "@prisma/adapter-pg",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: ["pg"],
  },
};