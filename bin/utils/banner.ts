import pc from "picocolors";

/**
 * Limpa o terminal e imprime o banner de identificação do CLI.
 */
export function printBanner(): void {
  console.clear();

  console.log(
    pc.cyan(`
   ▲ fastify-initializr-ts
  `)
  );
}
