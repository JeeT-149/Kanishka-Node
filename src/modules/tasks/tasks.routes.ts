import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import {
  createTaskSchema,
  listTasksSchema,
  getTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./tasks.schemas.js";
import {
  handleCreateTask,
  handleListTasks,
  handleGetTask,
  handleUpdateTask,
  handleUpdateTaskStatus,
} from "./tasks.controller.js";

export const tasksRouter = Router();

// All task routes require authentication
tasksRouter.use(authenticate);

// Create task
tasksRouter.post(
  "/",
  validate(createTaskSchema),
  asyncHandler(handleCreateTask),
);

// List tasks (User: own; Admin: all)
tasksRouter.get(
  "/",
  validate(listTasksSchema),
  asyncHandler(handleListTasks),
);

// View specific task (Owner or Admin only)
tasksRouter.get(
  "/:id",
  validate(getTaskSchema),
  asyncHandler(handleGetTask),
);

// Update task title/description (Owner or Admin only; no status updates allowed)
tasksRouter.put(
  "/:id",
  validate(updateTaskSchema),
  asyncHandler(handleUpdateTask),
);

// Update task status (ADMIN ONLY)
tasksRouter.patch(
  "/:id/status",
  requireRole("admin"),
  validate(updateTaskStatusSchema),
  asyncHandler(handleUpdateTaskStatus),
);
