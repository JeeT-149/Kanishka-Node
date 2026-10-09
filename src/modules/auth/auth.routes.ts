import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { handleRegister, handleLogin, handleGetMe } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(handleRegister),
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(handleLogin),
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(handleGetMe),
);
