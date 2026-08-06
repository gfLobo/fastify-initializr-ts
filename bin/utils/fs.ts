import fs from "node:fs";
import path from "node:path";
import type { TemplateVars } from "../types";

const TEXT_FILE_PATTERN = /\.(json|js|ts|env|md|txt|yaml|yml|prisma)$/i;

/**
 * Copia recursivamente uma pasta de template para um destino,
 * substituindo placeholders (chaves de `vars`) em arquivos de texto.
 */
export function copyFolderSync(
  src: string,
  dest: string,
  vars: TemplateVars = {}
): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath, vars);
      continue;
    }

    const fileBuffer = fs.readFileSync(srcPath);
    const isTextFile = TEXT_FILE_PATTERN.test(entry.name);

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

/**
 * Remove um arquivo ou diretório (recursivamente) se ele existir.
 */
export function removePathSync(target: string): void {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}
