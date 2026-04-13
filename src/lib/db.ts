import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = new PrismaClient();
  }
  return globalForPrisma._prisma;
}

// Lazy proxy — PrismaClient is only instantiated on first query, not at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    return (getClient() as any)[prop];
  },
});
