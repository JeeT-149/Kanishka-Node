import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { handleGetStats, handleGetUsers } from "./admin.controller.js";

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authenticate);
adminRouter.use(requireRole("admin"));

// Admin stats
adminRouter.get("/stats", asyncHandler(handleGetStats));

// Admin user directory with task counts
adminRouter.get("/users", asyncHandler(handleGetUsers));
