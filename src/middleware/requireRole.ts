import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";

export function requireRole(...roles: ("user" | "admin")[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("Access denied: insufficient permissions"));
    }

    next();
  };
}
