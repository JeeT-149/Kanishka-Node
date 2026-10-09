import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const testUrl =
  process.env.DATABASE_URL_TEST ||
  "postgresql://postgres:postgres@localhost:5432/kanishka_ops?schema=test";

try {
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });
} catch (err) {
  console.error("Failed to migrate test database:", err);
  process.exit(1);
}
