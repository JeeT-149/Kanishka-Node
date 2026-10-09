import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

// Pre-computed hash of a dummy password for constant-time comparisons when email is not found
const DUMMY_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoO0vX9FpI16hZgW12u5yCgA6w3c4U5yKq";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function dummyCompare(password: string): Promise<boolean> {
  // Always runs full bcrypt comparison to prevent timing side-channel attacks
  return bcrypt.compare(password, DUMMY_HASH);
}
