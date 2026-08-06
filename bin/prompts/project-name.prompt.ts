import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import { withCancel } from "../utils/prompt-guard";

export interface ProjectLocation {
  projectName: string;
  targetDir: string;
}

/**
 * Pergunta (ou lê via argv) o nome do projeto e valida se o
 * diretório de destino já existe.
 */
export async function promptProjectLocation(
  argv: string[]
): Promise<ProjectLocation> {
  let projectName = argv[2];

  if (!projectName) {
    const answer = withCancel(
      await p.text({
        message: "Project name",
        placeholder: "my-fastify-app",
      })
    );

    projectName = answer || "my-fastify-app";
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    p.log.error("Directory already exists.");
    throw new DirectoryAlreadyExistsError(targetDir);
  }

  return { projectName, targetDir };
}

export class DirectoryAlreadyExistsError extends Error {
  constructor(public readonly targetDir: string) {
    super(`Directory already exists: ${targetDir}`);
    this.name = "DirectoryAlreadyExistsError";
  }
}
