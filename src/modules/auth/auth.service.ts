import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword, dummyCompare } from "../../lib/password.js";
import { signToken } from "../../lib/jwt.js";
import { AppError } from "../../lib/errors.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponse(user: {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(input: RegisterInput): Promise<{ user: UserResponse }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw AppError.conflict("An account with this email address already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  // Role is strictly forced to "user" to prevent privilege escalation
  const newUser = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    },
  });

  return {
    user: toUserResponse(newUser),
  };
}

export async function login(input: LoginInput): Promise<{ token: string; user: UserResponse }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Constant-time compare to mitigate timing attack enumeration
    await dummyCompare(input.password);
    throw AppError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = signToken(user.id);

  return {
    token,
    user: toUserResponse(user),
  };
}
