import { PrismaClient } from "@prisma/client";

// Some environments set PRISMA_CLIENT_ENGINE_TYPE=client globally, which requires a driver adapter.
// This project uses the standard binary engine.
if (process.env.PRISMA_CLIENT_ENGINE_TYPE !== "binary") {
  process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

