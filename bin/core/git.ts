import * as p from "@clack/prompts";
import { runQuiet } from "../utils/child-process";

export type GitInitResult = "initialized" | "git-missing" | "already-in-repo";

/**
 * Inicializa um repositório git no diretório do projeto.
 *
 * Nunca lança erro: git é um extra, então uma falha aqui não deve
 * derrubar a criação do projeto.
 * - git não instalado           -> ignora e avisa
 * - já dentro de um repositório -> ignora (evita criar repo aninhado)
 */
export async function initGitRepository(
  targetDir: string
): Promise<GitInitResult> {
  if ((await runQuiet("git", ["--version"], targetDir)) !== 0) {
    return "git-missing";
  }

  if (
    (await runQuiet("git", ["rev-parse", "--is-inside-work-tree"], targetDir)) ===
    0
  ) {
    return "already-in-repo";
  }

  const code = await runQuiet("git", ["init"], targetDir);

  if (code !== 0) {
    throw new Error(`git init failed with code ${code}`);
  }

  return "initialized";
}

/**
 * Versão com spinner e mensagens para uso direto no fluxo do CLI.
 */
export async function initGitRepositoryWithFeedback(
  targetDir: string
): Promise<void> {
  const gitSpinner = p.spinner();
  gitSpinner.start("Initializing git repository");

  try {
    const result = await initGitRepository(targetDir);

    switch (result) {
      case "initialized":
        gitSpinner.stop("Git repository initialized");
        break;
      case "already-in-repo":
        gitSpinner.stop("Already inside a git repository, skipping git init");
        break;
      case "git-missing":
        gitSpinner.stop("Git not found, skipping git init");
        break;
    }
  } catch (err) {
    gitSpinner.stop("Could not initialize git repository");
    p.log.warn(err instanceof Error ? err.message : String(err));
  }
}
