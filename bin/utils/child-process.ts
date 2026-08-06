import { spawn, type ChildProcess } from "node:child_process";

/**
 * Instala as dependências do projeto via `npm install`,
 * incluindo pacotes extras (ex: adapter do Prisma) quando necessário.
 */
export function installDependencies(
  projectPath: string,
  extraPkgs: string[] = []
): Promise<void> {
  return runCommand("npm", ["install", ...extraPkgs], projectPath);
}

/**
 * Executa `npx prisma generate` no diretório do projeto.
 */
export function runPrismaGenerate(projectPath: string): Promise<void> {
  return runCommand("npx", ["prisma", "generate"], projectPath);
}

/**
 * Inicia o servidor de desenvolvimento (`npm run dev`) e resolve
 * assim que o processo é efetivamente disparado (não espera ele finalizar).
 */
export function runDevServer(projectPath: string): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const dev = spawn("npm", ["run", "dev"], {
      cwd: projectPath,
      stdio: "inherit",
    });

    dev.on("spawn", () => resolve(dev));
    dev.on("error", reject);
  });
}

/**
 * Executa um comando de sistema e resolve a Promise quando ele
 * finaliza com código de saída 0, rejeitando caso contrário.
 */
function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${command} ${args.join(" ")} failed with code ${code}`)
        );
      }
    });

    child.on("error", reject);
  });
}
