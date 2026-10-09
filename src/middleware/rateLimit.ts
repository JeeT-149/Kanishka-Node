import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../config/env.js";

export const authRateLimiter = env.RATE_LIMIT_ENABLED
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: env.AUTH_RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: {
            code: "RATE_LIMITED",
            message: "Too many authentication requests, please try again in 15 minutes",
          },
        });
      },
    })
  : (_req: Request, _res: Response, next: () => void) => next();
