import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";

// Turso (libSQL) in production; falls back to a local SQLite file for dev.
// The same adapter handles both `libsql://` (remote) and `file:` (local) URLs.
const url = process.env.TURSO_DATABASE_URL ?? "file:./prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const adapter = new PrismaLibSql({ url, authToken });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
