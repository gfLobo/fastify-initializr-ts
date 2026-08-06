#!/usr/bin/env node

import * as p from "@clack/prompts";
import pc from "picocolors";

import { printBanner } from "./utils/banner";
import { withCancel } from "./utils/prompt-guard";
import { runDevServer } from "./utils/child-process";

import {
  promptProjectLocation,
  DirectoryAlreadyExistsError,
} from "./prompts/project-name.prompt";
import { promptAppConfig } from "./prompts/app-config.prompt";
import { promptDatabaseConfig } from "./prompts/database.prompt";

import { buildTemplateVars } from "./core/template-vars";
import { scaffoldProject } from "./core/scaffold";
import { installProjectDependencies } from "./core/install";
import {
  printServerRunningOutro,
  printNextStepsOutro,
} from "./core/output";

async function main(): Promise<void> {
  printBanner();

  const { projectName, targetDir } = await promptProjectLocation(process.argv);

  const appConfig = await promptAppConfig(projectName);
  const databaseConfig = await promptDatabaseConfig();

  const vars = buildTemplateVars(appConfig, databaseConfig);

  const createSpinner = p.spinner();
  createSpinner.start("Creating project structure");

  scaffoldProject(targetDir, vars, databaseConfig);

  createSpinner.stop("Project created");

  const installNow = withCancel(
    await p.confirm({
      message: "Install dependencies?",
      initialValue: true,
    })
  );

  if (!installNow) {
    printNextStepsOutro(projectName, targetDir, databaseConfig);
    process.exit(0);
  }

  await installProjectDependencies(targetDir, databaseConfig);

  const devSpinner = p.spinner();
  devSpinner.start("Starting development server");
  await runDevServer(targetDir);
  devSpinner.stop("Development server started");

  printServerRunningOutro(targetDir, databaseConfig);
}

main().catch((err: unknown) => {
  p.log.error("Something went wrong.");

  if (err instanceof DirectoryAlreadyExistsError) {
    console.log(pc.dim(`\n${err.targetDir}\n`));
    process.exit(1);
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error(pc.red(`\n${message}\n`));
  process.exit(1);
});
