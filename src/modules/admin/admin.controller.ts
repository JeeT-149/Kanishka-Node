import type { Request, Response } from "express";
import * as adminService from "./admin.service.js";

export async function handleGetStats(_req: Request, res: Response): Promise<void> {
  const result = await adminService.getAdminStats();
  res.status(200).json(result);
}

export async function handleGetUsers(_req: Request, res: Response): Promise<void> {
  const result = await adminService.getAdminUsers();
  res.status(200).json(result);
}
