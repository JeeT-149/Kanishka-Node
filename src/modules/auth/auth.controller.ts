import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { AppError } from "../../lib/errors.js";

export async function handleRegister(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export async function handleGetMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized("Authentication required");
  }
  res.status(200).json({ user: req.user });
}
