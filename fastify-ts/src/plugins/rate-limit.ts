import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";


export default fp(async (app:any) => {
    await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "60")
    })
});