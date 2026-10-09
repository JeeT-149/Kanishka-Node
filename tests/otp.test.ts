import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken } from "../src/lib/jwt.js";
import { hashPassword } from "../src/lib/password.js";
import { clearDatabase, disconnectDatabase } from "./setup.js";
import { validateConsoleToken } from "../src/modules/admin/otp.service.js";

const app = createApp();

describe("Optional Admin Console OTP (Phase 14)", () => {
  let adminToken: string;
  let adminId: number;

  beforeEach(async () => {
    await clearDatabase();
    await prisma.adminOtp.deleteMany();

    const passwordHash = await hashPassword("Admin@123");
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: passwordHash,
        role: "admin",
      },
    });
    adminId = admin.id;
    adminToken = signToken(adminId);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("checks admin config endpoint", async () => {
    const res = await request(app)
      .get("/api/admin/config")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("otpRequired");
  });

  it("requests OTP and saves hashed record to database", async () => {
    const res = await request(app)
      .post("/api/admin/otp/request")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Verification code sent");
    expect(res.body.devCode).toBeDefined();

    const dbOtp = await prisma.adminOtp.findFirst({
      where: { userId: adminId },
    });
    expect(dbOtp).toBeDefined();
    expect(dbOtp?.attempts).toBe(0);
    expect(dbOtp?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("fails verification with incorrect code and increments attempts", async () => {
    await request(app)
      .post("/api/admin/otp/request")
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .post("/api/admin/otp/verify")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ code: "000000" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain("Invalid verification code");

    const dbOtp = await prisma.adminOtp.findFirst({
      where: { userId: adminId },
    });
    expect(dbOtp?.attempts).toBe(1);
  });

  it("successfully verifies OTP and issues scoped console token", async () => {
    const reqRes = await request(app)
      .post("/api/admin/otp/request")
      .set("Authorization", `Bearer ${adminToken}`);

    const validCode = reqRes.body.devCode;

    const verifyRes = await request(app)
      .post("/api/admin/otp/verify")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ code: validCode });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.consoleToken).toBeDefined();

    const isValid = validateConsoleToken(verifyRes.body.consoleToken, adminId);
    expect(isValid).toBe(true);

    // Verify OTP was consumed
    const consumedOtp = await prisma.adminOtp.findFirst({
      where: { userId: adminId },
    });
    expect(consumedOtp).toBeNull();
  });
});
