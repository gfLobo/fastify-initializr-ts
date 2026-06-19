#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const pc = require("picocolors");
const p = require("@clack/prompts");

// ========================================
// BANNER
// ========================================

console.clear();

console.log(
  pc.cyan(`
   ▲ fastify-initializr-ts
  `)
);

// ========================================
// PATHS
// ========================================

const templateDir = path.resolve(__dirname, "../fastify-ts");

// ========================================
// DATABASE PRESETS
// ========================================

const DB_PRESETS = {
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

// ========================================
// HELPERS
// ========================================

function cancel(value) {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}

function copyFolderSync(src, dest, vars = {}) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath, vars);
      continue;
    }

    const fileBuffer = fs.readFileSync(srcPath);

    const isTextFile =
      /\.(json|js|ts|env|md|txt|yaml|yml|prisma)$/i.test(entry.name);

    if (isTextFile) {
      let content = fileBuffer.toString("utf8");

      for (const [key, value] of Object.entries(vars)) {
        content = content.replaceAll(key, value);
      }

      fs.writeFileSync(destPath, content, "utf8");
    } else {
      fs.writeFileSync(destPath, fileBuffer);
    }
  }
}

function removePathSync(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function stripPrismaFromPackageJson(targetDir) {
  const pkgPath = path.join(targetDir, "package.json");

  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const depsToRemove = ["@prisma/client", "dotenv"];
  const devDepsToRemove = ["prisma"];

  if (pkg.dependencies) {
    for (const dep of depsToRemove) {
      delete pkg.dependencies[dep];
    }
  }

  if (pkg.devDependencies) {
    for (const dep of devDepsToRemove) {
      delete pkg.devDependencies[dep];
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
}

function buildPrismaTs(preset) {
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

function overridePrismaTs(dir, content) {
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

function installDependencies(projectPath, extraPkgs = []) {
  return new Promise((resolve, reject) => {
    const args = ["install", ...extraPkgs];

    const install = spawn("npm", args, {
      cwd: projectPath,
      stdio: "inherit"
    });

    install.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install failed with code ${code}`));
    });

    install.on("error", reject);
  });
}

function runDevServer(projectPath) {
  return new Promise((resolve, reject) => {
    const dev = spawn("npm", ["run", "dev"], {
      cwd: projectPath,
      stdio: "inherit"
    });

    dev.on("spawn", () => {
      resolve(dev);
    });

    dev.on("error", reject);
  });
}

// ========================================
// MAIN
// ========================================

(async () => {
  try {
    // ========================================
    // PROJECT NAME
    // ========================================

    let projectName = process.argv[2];

    if (!projectName) {
      projectName = cancel(
        await p.text({
          message: "Project name",
          placeholder: "my-fastify-app"
        })
      );

      projectName ||= "my-fastify-app";
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    // ========================================
    // CHECK DIRECTORY
    // ========================================

    if (fs.existsSync(targetDir)) {
      p.log.error("Directory already exists.");
      console.log(pc.dim(`\n${targetDir}\n`));
      process.exit(1);
    }

    // ========================================
    // CONFIGURATION
    // ========================================

    p.note(
      "Configure your application",
      pc.bold("Setup")
    );

    const appNameInput = cancel(
      await p.text({
        message: "App name",
        placeholder: projectName,
        initialValue: projectName
      })
    );

    const appDescriptionInput = cancel(
      await p.text({
        message: "Description",
        placeholder: "A Fastify + TypeScript + SwaggerAPI"
      })
    );

    const appAuthorInput = cancel(
      await p.text({
        message: "Author"
      })
    );

    const appLicenseInput = cancel(
      await p.text({
        message: "License",
        placeholder: "ISC",
        initialValue: "ISC"
      })
    );

    // ========================================
    // DATABASE CONFIGURATION (OPCIONAL)
    // ========================================

    const useDatabase = cancel(
      await p.confirm({
        message: "Configure a database with Prisma?",
        initialValue: true
      })
    );

    let preset = null;
    let dbUrlInput = "";
    let directUrlInput = "";

    if (useDatabase) {
      p.note("Configure your database", pc.bold("Database"));

      const dbChoice = cancel(
        await p.select({
          message: "Database provider",
          options: Object.entries(DB_PRESETS).map(([value, dbPreset]) => ({
            value,
            label: dbPreset.label,
          })),
        })
      );

      preset = DB_PRESETS[dbChoice];

      dbUrlInput = cancel(
        await p.text({
          message:
            preset.urlVar === preset.directUrlVar
              ? "Connection string (DATABASE_URL)"
              : "Pooled connection string (DATABASE_URL)",
          placeholder:
            dbChoice === "sqlite"
              ? "file:./dev.db"
              : dbChoice === "mongodb"
              ? "mongodb+srv://user:pass@cluster.mongodb.net/mydb"
              : `${dbChoice}://user:pass@host:5432/mydb`,
        })
      );

      directUrlInput = dbUrlInput;

      if (preset.urlVar !== preset.directUrlVar) {
        directUrlInput = cancel(
          await p.text({
            message: "Direct connection string (DIRECT_URL)",
            placeholder: `${dbChoice}://user:pass@host:5432/mydb`,
            initialValue: dbUrlInput || "",
          })
        );
      }
    }

    const vars = {
      app_name: appNameInput || projectName,
      app_description:
        appDescriptionInput ||
        "A Fastify + TypeScript + SwaggerAPI",
      app_author: appAuthorInput || "",
      app_license: appLicenseInput || "ISC",
      ...(useDatabase
        ? {
            app_db_url: dbUrlInput || "",
            app_db_direct_url: directUrlInput || dbUrlInput || "",
            app_db_adapter: preset.adapterClass || "",
            app_db_adapter_dir: preset.adapterImport || "",
            app_db_provider: preset.provider,
            app_db_stack_tagline: " + Prisma",
            app_db_stack_item: "\n* Prisma",
            app_db_section: [
              "",
              "## Database",
              "",
              `* Provider: \`${preset.provider}\``,
              "* ORM: Prisma",
              "",
              "```bash",
              "npx prisma generate",
              "npx prisma migrate dev",
              "```",
              "",
              "",
            ].join("\n"),
          }
        : {
            app_db_stack_tagline: "",
            app_db_stack_item: "",
            app_db_section: "",
          }),
    };

    // ========================================
    // CREATE PROJECT
    // ========================================

    const createSpinner = p.spinner();

    createSpinner.start("Creating project structure");

    copyFolderSync(templateDir, targetDir, vars);

    if (useDatabase) {
      overridePrismaTs(targetDir, buildPrismaTs(preset));
    } else {
      removePathSync(path.join(targetDir, "lib"));
      removePathSync(path.join(targetDir, "prisma"));
      removePathSync(path.join(targetDir, "prisma.config.ts"));
      stripPrismaFromPackageJson(targetDir);
    }

    createSpinner.stop("Project created");

    // ========================================
    // INSTALL
    // ========================================

    const installNow = cancel(
      await p.confirm({
        message: "Install dependencies?",
        initialValue: true
      })
    );

    if (installNow) {
      const installSpinner = p.spinner();

      const extraPkgs =
        useDatabase && preset
          ? [
              ...(preset.adapterPkg ? [preset.adapterPkg] : []),
              ...preset.extraDeps,
            ]
          : [];

      installSpinner.start(
        extraPkgs.length > 0
          ? `Installing dependencies + ${extraPkgs.join(", ")}`
          : "Installing dependencies"
      );

      await installDependencies(targetDir, extraPkgs);

      installSpinner.stop("Dependencies installed");

      // ========================================
      // PRISMA GENERATE (se aplicável)
      // ========================================

      if (useDatabase) {
        const generateSpinner = p.spinner();

        generateSpinner.start("Running prisma generate");

        await new Promise((resolve, reject) => {
          const gen = spawn("npx", ["prisma", "generate"], {
            cwd: targetDir,
            stdio: "inherit"
          });

          gen.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`prisma generate failed with code ${code}`));
          });

          gen.on("error", reject);
        });

        generateSpinner.stop("Prisma client generated");
      }

      // ========================================
      // RUN DEV SERVER
      // ========================================

      const devSpinner = p.spinner();

      devSpinner.start("Starting development server");

      await runDevServer(targetDir);

      devSpinner.stop("Development server started");

      // ========================================
      // SUCCESS OUTPUT
      // ========================================

      p.outro(`
${pc.green("✔ Project ready")}

${pc.bold("Path")}
  ${pc.cyan(targetDir)}
${
  useDatabase
    ? `\n${pc.bold("Database")}\n  ${pc.dim("Provider:")} ${pc.yellow(preset.provider)}${
        preset.adapterPkg ? `\n  ${pc.dim("Adapter: ")} ${pc.yellow(preset.adapterPkg)}` : ""
      }\n`
    : ""
}
${pc.bold("Application")}
  ${pc.cyan("http://localhost:3000/docs")}

${pc.dim("Development server is running")}
`);

      return;
    }

    // ========================================
    // SUCCESS OUTPUT
    // ========================================

    const nextSteps = [
      `cd ${projectName}`,
      "npm install && npm run dev",
      useDatabase && "npx prisma generate",
    ].filter(Boolean);

    p.outro(`
${pc.green("✔ Project ready")}

${pc.bold("Path")}
  ${pc.cyan(targetDir)}
${
  useDatabase
    ? `\n${pc.bold("Database")}\n  ${pc.dim("Provider:")} ${pc.yellow(preset.provider)}${
        preset.adapterPkg ? `\n  ${pc.dim("Adapter: ")} ${pc.yellow(preset.adapterPkg)}` : ""
      }\n`
    : ""
}
${pc.bold("Next steps")}
${nextSteps.map((s) => `  ${pc.yellow(s)}`).join("\n")}
`);

    process.exit(0);
  } catch (err) {
    p.log.error("Something went wrong.");

    console.error(pc.red(`\n${err.message}\n`));

    process.exit(1);
  }
})();