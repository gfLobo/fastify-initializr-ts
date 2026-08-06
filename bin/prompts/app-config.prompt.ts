import * as p from "@clack/prompts";
import pc from "picocolors";
import { withCancel } from "../utils/prompt-guard";
import type { AppConfig } from "../types";

/**
 * Coleta as informações gerais da aplicação a partir do usuário,
 * aplicando valores padrão sensatos quando o campo é deixado em branco.
 */
export async function promptAppConfig(
  projectName: string
): Promise<AppConfig> {
  p.note("Configure your application", pc.bold("Setup"));

  const name = withCancel(
    await p.text({
      message: "App name",
      placeholder: projectName,
      initialValue: projectName,
    })
  );

  const description = withCancel(
    await p.text({
      message: "Description",
      placeholder: "A Fastify + TypeScript + SwaggerAPI",
    })
  );

  const author = withCancel(
    await p.text({
      message: "Author",
    })
  );

  const license = withCancel(
    await p.text({
      message: "License",
      placeholder: "ISC",
      initialValue: "ISC",
    })
  );

  return {
    name: name || projectName,
    description: description || "A Fastify + TypeScript + SwaggerAPI",
    author: author || "",
    license: license || "ISC",
  };
}
