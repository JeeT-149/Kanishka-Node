import type { Request, Response } from "express";
import * as adminService from "./admin.service.js";
import * as otpService from "./otp.service.js";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";

export async function handleGetConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    otpRequired: env.ADMIN_OTP_ENABLED,
  });
}

export async function handleGetStats(_req: Request, res: Response): Promise<void> {
  const result = await adminService.getAdminStats();
  res.status(200).json(result);
}

export async function handleGetUsers(_req: Request, res: Response): Promise<void> {
  const result = await adminService.getAdminUsers();
  res.status(200).json(result);
}

export async function handleRequestOtp(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const result = await otpService.requestOtp(req.user);
  res.status(200).json(result);
}

export async function handleVerifyOtp(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const code = req.body?.code;
  if (!code || typeof code !== "string" || code.trim().length !== 6) {
    throw AppError.badRequest("Verification code must be 6 digits.");
  }
  const result = await otpService.verifyOtp(req.user.id, code.trim());
  res.status(200).json(result);
}
