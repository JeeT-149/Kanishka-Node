import type { Request, Response } from "express";
import * as tasksService from "./tasks.service.js";
import { AppError } from "../../lib/errors.js";
import type { ApiTaskStatus } from "../../lib/status.js";
import type { ListTasksQuery } from "./tasks.schemas.js";

export async function handleCreateTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const result = await tasksService.createTask(req.body, req.user);
  res.status(201).json(result);
}

export async function handleListTasks(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const result = await tasksService.listTasks(
    req.query as unknown as ListTasksQuery,
    req.user,
  );
  res.status(200).json(result);
}

export async function handleGetTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const taskId = Number(req.params.id);
  const result = await tasksService.getTaskById(taskId, req.user);
  res.status(200).json(result);
}

export async function handleUpdateTask(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const taskId = Number(req.params.id);
  const result = await tasksService.updateTask(taskId, req.body, req.user);
  res.status(200).json(result);
}

export async function handleUpdateTaskStatus(req: Request, res: Response): Promise<void> {
  const taskId = Number(req.params.id);
  const status = req.body.status as ApiTaskStatus;
  const result = await tasksService.updateTaskStatus(taskId, status);
  res.status(200).json(result);
}
