import * as p from "@clack/prompts";

/**
 * Verifica se o valor retornado por um prompt do @clack/prompts
 * representa um cancelamento (ex: usuário pressionou Ctrl+C).
 *
 * Caso positivo, encerra o processo de forma limpa.
 * Caso contrário, retorna o valor já com o tipo estreitado (sem símbolo de cancel).
 */
export function withCancel<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value as T;
}
