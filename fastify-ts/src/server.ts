import Fastify from "fastify";
import swagger from "@/plugins/swagger";
import healthController from "@/controllers/healthController";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";


const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();

async function buildServer() {

  await app.register(swagger);
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