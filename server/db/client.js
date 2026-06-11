// server/db/client.js
import { PrismaClient } from "@prisma/client";

export const createPrisma = () => {
  if (!process.env.DATABASE_URL) {
    console.error(
      "[pfm] DATABASE_URL is required. Put your Railway Postgres connection string in .env\n" +
        "[pfm] (Postgres service → Variables → DATABASE_PUBLIC_URL when connecting from outside Railway)."
    );
    process.exit(1);
  }
  return new PrismaClient();
};
