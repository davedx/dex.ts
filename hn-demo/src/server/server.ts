import { PrismaClient } from "../../generated/prisma/client";
import { createDexServer } from "dex.ts";
import "dotenv/config";

createDexServer({
  context: {
    prisma: new PrismaClient(),
  },
});
