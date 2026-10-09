import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";

interface PrismaErrorShape {
  code: string;
  meta?: {
    target?: string[] | string;
  };
}

function isPrismaError(err: unknown): err is PrismaErrorShape {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const obj = err as Record<string, unknown>;
  return typeof obj.code === "string" && obj.code.startsWith("P");
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Explicit AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // 2. Prisma Known Request Errors
  if (isPrismaError(err)) {
    if (err.code === "P2002") {
      // Unique constraint failed
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(", ")
        : String(err.meta?.target || "resource");
      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: `A record with this ${target} already exists`,
        },
      });
      return;
    }
    if (err.code === "P2025") {
      // Record to update or delete not found
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Requested resource was not found",
        },
      });
      return;
    }
  }

  // 3. Body parser JSON syntax errors
  if (err instanceof SyntaxError && "status" in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Malformed JSON payload",
      },
    });
    return;
  }

  // 4. Default 500 Internal Server Error (Never leak stack traces or internal DB info)
  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled error:", err);
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred",
    },
  });
}
