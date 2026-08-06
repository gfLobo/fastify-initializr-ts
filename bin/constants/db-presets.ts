import type { DbPresetsMap } from "../types";

/**
 * Presets de configuração para cada provedor de banco de dados suportado.
 * Cada preset descreve o adapter do Prisma, dependências extras e
 * variáveis de ambiente esperadas.
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
    label: "MySQL / PlanetScale",
    provider: "mysql",
    adapterPkg: "@prisma/adapter-mysql",
    adapterClass: "PrismaMysql",
    adapterImport: "@prisma/adapter-mysql",
    urlVar: "DATABASE_URL",
    directUrlVar: "DIRECT_URL",
    extraDeps: ["mysql2"],
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
