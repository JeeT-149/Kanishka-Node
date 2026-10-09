import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Authentication token required"));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(AppError.unauthorized("Authentication token required"));
  }

  try {
    const payload = verifyToken(token);
    const userId = Number(payload.sub);

    if (!userId || isNaN(userId)) {
      return next(AppError.unauthorized("Invalid token payload"));
    }

    // Always load the latest user record and role from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // User was deleted or does not exist
      return next(AppError.unauthorized("User account no longer exists"));
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    // JWT expiration, tampered signature, invalid algorithm, etc.
    if (err instanceof Error && err.name === "TokenExpiredError") {
      return next(AppError.unauthorized("Token has expired"));
    }
    return next(AppError.unauthorized("Invalid or malformed token"));
  }
}
