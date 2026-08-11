import Fastify from "fastify";
import swagger from "@/plugins/swagger";
import rateLimit from "@/plugins/rate-limit";
import healthController from "@/controllers/healthController";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";



const app = Fastify({
  logger: true,
  // 2 minutes: a reasonable timeout for processing requests, balancing performance and user experience
  connectionTimeout: parseInt(process.env.connectionTimeout || "120000"),

  // 1 minute: suitable for most payloads, including moderate file uploads
  requestTimeout: parseInt(process.env.requestTimeout || "60000"),

  // 10 seconds: ensures efficient resource usage for idle connections
  keepAliveTimeout: parseInt(process.env.keepAliveTimeout || "10000"),

  http: {
    // 15 seconds: prevents slow clients from holding connections too long
    headersTimeout: parseInt(process.env.headersTimeout || "15000"),
  }
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();

async function buildServer() {

  await app.register(swagger);
  await app.register(rateLimit);
  await app.register(healthController);
  return app;
}

buildServer();




export default async function handler(req: any, res: any) {
  await app.ready();
  app.server.emit('request', req, res);
}


if (process.env.NODE_ENV !== 'production') {
  async function startServer() {
    try {
      const address = await app.listen({ port: 3000 });
      console.info(`Server running at: ${address}`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  }
  startServer();
}