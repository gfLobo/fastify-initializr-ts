import "dotenv/config";
import { app_db_adapter } from "@prisma/app_db_adapter_dir";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DIRECT_URL}`;

const adapter = new app_db_adapter({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };