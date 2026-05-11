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
      /\.(json|js|ts|env|md|txt|yaml|yml)$/i.test(entry.name);

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

function installDependencies(projectPath) {
  return new Promise((resolve, reject) => {
    const install = spawn("npm", ["install"], {
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

    const vars = {
      app_name: appNameInput || projectName,
      app_description:
        appDescriptionInput ||
        "A Fastify + TypeScript + SwaggerAPI",
      app_author: appAuthorInput || "",
      app_license: appLicenseInput || "ISC"
    };

    // ========================================
    // CREATE PROJECT
    // ========================================

    const createSpinner = p.spinner();

    createSpinner.start("Creating project structure");

    copyFolderSync(templateDir, targetDir, vars);

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

      installSpinner.start("Installing dependencies");

      await installDependencies(targetDir);

      installSpinner.stop("Dependencies installed");

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

${pc.bold("Application")}
  ${pc.cyan("http://localhost:3000/docs")}

${pc.dim("Development server is running")}
`);

      return;
    }

    // ========================================
    // SUCCESS OUTPUT
    // ========================================

    p.outro(`
${pc.green("✔ Project ready")}

${pc.bold("Path")}
  ${pc.cyan(targetDir)}

${pc.bold("Next steps")}

  ${pc.yellow(`cd ${projectName}`)}
  ${pc.yellow("npm install && npm run dev")}
`);

    process.exit(0);
  } catch (err) {
    p.log.error("Something went wrong.");

    console.error(pc.red(`\n${err.message}\n`));

    process.exit(1);
  }
})();