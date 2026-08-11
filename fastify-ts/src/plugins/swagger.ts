import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export default fp(async (app:any) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "app_name API",
        description: "app_name documentation",
        version: "1.0.0"
      }
    },
    transform: jsonSchemaTransform
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs"
  });
});