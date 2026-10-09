import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(16).default(10),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_ENABLED: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === undefined || val === true || val === "true" || val === "1"),
  ADMIN_OTP_ENABLED: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true" || val === "1"),
  OTP_DELIVERY: z.enum(["console", "smtp"]).default("console"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Kiln & Leaf Ops <ops@example.com>"),
  ALLOW_SEED: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true" || val === "1"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
