import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  sub: string; // userId as string
  scope?: string;
  iat?: number;
  exp?: number;
}

export function signToken(userId: number | string, expiresIn: string = env.JWT_EXPIRES_IN): string {
  const payload: JwtPayload = {
    sub: String(userId),
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn as unknown as number,
  });
}

export function signConsoleToken(userId: number | string): string {
  const payload: JwtPayload = {
    sub: String(userId),
    scope: "admin-console",
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30m" as unknown as number,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as JwtPayload;
}
