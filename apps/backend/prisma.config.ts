import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error(`❌ DATABASE_URL not found at: ${envPath}`);
} else {
  console.log(`✅ Database configuration loaded from root .env`);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});