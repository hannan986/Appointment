import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma._prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma._prisma;
}

// Lazy proxy — PrismaClient is only instantiated on first query, not at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    return (getClient() as any)[prop];
  },
});
