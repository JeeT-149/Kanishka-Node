import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { validateConsoleToken } from "../modules/admin/otp.service.js";

export function requireConsoleToken(req: Request, _res: Response, next: NextFunction): void {
  // If OTP is disabled (default), pass through
  if (!env.ADMIN_OTP_ENABLED) {
    return next();
  }

  if (!req.user) {
    return next(AppError.unauthorized());
  }

  const consoleToken = req.headers["x-admin-console-token"];

  if (!consoleToken || typeof consoleToken !== "string") {
    return next(
      new AppError(
        403,
        "FORBIDDEN",
        "Admin console OTP verification required. Provide X-Admin-Console-Token header.",
      ),
    );
  }

  const isValid = validateConsoleToken(consoleToken, req.user.id);

  if (!isValid) {
    return next(
      new AppError(
        403,
        "FORBIDDEN",
        "Invalid or expired admin console token. Please verify OTP again.",
      ),
    );
  }

  next();
}
