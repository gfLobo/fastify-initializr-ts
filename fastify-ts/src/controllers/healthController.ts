import { z } from "zod";
import { FastifyTypedInstance } from "@/types/fastifyInstance";

export default async function healthController(app: FastifyTypedInstance) {

  app.get("/health", {
    schema: {
      description: "Heartbeat",
      tags: ["Health"],
      response: {
        200: z.string(),
      },
    },
  }, async (request, reply) => {
    return "healthy";
  });
}