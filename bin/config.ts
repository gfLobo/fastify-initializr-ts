import path from "node:path";

/**
 * Diretório onde vive o template base do projeto Fastify + TS
 * que será copiado para o diretório de destino escolhido pelo usuário.
 *
 * Em CommonJS, `__dirname` já existe nativamente (sem precisar de
 * import.meta.url / fileURLToPath, que são exclusivos de ESM).
 */
export const TEMPLATE_DIR = path.resolve(__dirname, "../fastify-ts");
