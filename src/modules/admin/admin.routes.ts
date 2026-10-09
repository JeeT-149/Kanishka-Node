import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { requireConsoleToken } from "../../middleware/requireConsoleToken.js";
import {
  handleGetConfig,
  handleGetStats,
  handleGetUsers,
  handleRequestOtp,
  handleVerifyOtp,
} from "./admin.controller.js";

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticate);
adminRouter.use(requireRole("admin"));

// Configuration check
adminRouter.get("/config", asyncHandler(handleGetConfig));

// Optional Admin OTP endpoints
adminRouter.post("/otp/request", asyncHandler(handleRequestOtp));
adminRouter.post("/otp/verify", asyncHandler(handleVerifyOtp));

// Admin stats (protected by console token when ADMIN_OTP_ENABLED=true)
adminRouter.get("/stats", requireConsoleToken, asyncHandler(handleGetStats));

// Admin user directory (protected by console token when ADMIN_OTP_ENABLED=true)
adminRouter.get("/users", requireConsoleToken, asyncHandler(handleGetUsers));
