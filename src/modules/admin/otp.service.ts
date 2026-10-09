import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { hashPassword, comparePassword } from "../../lib/password.js";
import { signConsoleToken, verifyToken } from "../../lib/jwt.js";
import { AppError } from "../../lib/errors.js";
import type { AuthenticatedUser } from "../../middleware/authenticate.js";

export async function requestOtp(user: AuthenticatedUser): Promise<{ message: string; devCode?: string }> {
  // Generate random 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Delete previous OTPs for this user
  await prisma.adminOtp.deleteMany({
    where: { userId: user.id },
  });

  // Create new active OTP record
  await prisma.adminOtp.create({
    data: {
      userId: user.id,
      codeHash,
      attempts: 0,
      expiresAt,
    },
  });

  // Deliver code
  if (env.OTP_DELIVERY === "smtp" && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: user.email,
        subject: "Your Kiln & Leaf Admin Console Verification Code",
        text: `Your 6-digit admin console verification code is: ${code}. It expires in 5 minutes.`,
        html: `<p>Your 6-digit admin console verification code is: <strong>${code}</strong>.</p><p>This code expires in 5 minutes.</p>`,
      });
    } catch (err) {
      console.error("Failed to send OTP via SMTP:", err);
    }
  } else {
    // Console delivery in development / testing
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔑 [ADMIN CONSOLE OTP] Verification code for ${user.email}: ${code}\n`);
    }
  }

  return {
    message: "Verification code sent successfully.",
    ...(process.env.NODE_ENV === "test" ? { devCode: code } : {}),
  };
}

export async function verifyOtp(userId: number, code: string): Promise<{ consoleToken: string }> {
  const otpRecord = await prisma.adminOtp.findFirst({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw AppError.badRequest("Invalid or expired verification code.");
  }

  if (otpRecord.attempts >= 5) {
    await prisma.adminOtp.delete({ where: { id: otpRecord.id } });
    throw AppError.badRequest("Too many failed attempts. Please request a new verification code.");
  }

  const isValid = await comparePassword(code, otpRecord.codeHash);

  if (!isValid) {
    await prisma.adminOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw AppError.badRequest("Invalid verification code.");
  }

  // OTP successfully verified; delete used code
  await prisma.adminOtp.delete({ where: { id: otpRecord.id } });

  const consoleToken = signConsoleToken(userId);
  return { consoleToken };
}

export function validateConsoleToken(token: string, expectedUserId: number): boolean {
  try {
    const payload = verifyToken(token);
    return payload.scope === "admin-console" && Number(payload.sub) === expectedUserId;
  } catch {
    return false;
  }
}
