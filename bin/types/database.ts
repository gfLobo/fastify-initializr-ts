export type DbProviderKey =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "mongodb"
  | "sqlserver"
  | "cockroachdb";

export interface DbPreset {
  label: string;
  provider: string;
  adapterPkg: string | null;
  adapterClass: string | null;
  adapterImport: string | null;
  urlVar: string;
  directUrlVar: string;
  extraDeps: string[];
}

export type DbPresetsMap = Record<DbProviderKey, DbPreset>;
