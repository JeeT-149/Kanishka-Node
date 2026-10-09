import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken } from "../src/lib/jwt.js";
import { hashPassword } from "../src/lib/password.js";
import { clearDatabase, disconnectDatabase } from "./setup.js";

const app = createApp();

describe("Admin API (/api/admin)", () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await clearDatabase();

    const passwordHash = await hashPassword("Password123");

    const user = await prisma.user.create({
      data: {
        name: "Regular User",
        email: "user@example.com",
        password: passwordHash,
        role: "user",
      },
    });
    userToken = signToken(user.id);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: passwordHash,
        role: "admin",
      },
    });
    adminToken = signToken(admin.id);

    // Create tasks across different statuses
    await prisma.task.createMany({
      data: [
        { title: "Task 1", status: "Pending", userId: user.id },
        { title: "Task 2", status: "InProgress", userId: user.id },
        { title: "Task 3", status: "Testing", userId: admin.id },
        { title: "Task 4", status: "Completed", userId: admin.id },
      ],
    });
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("Access Control", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const resStats = await request(app).get("/api/admin/stats");
      expect(resStats.status).toBe(401);

      const resUsers = await request(app).get("/api/admin/users");
      expect(resUsers.status).toBe(401);
    });

    it("rejects regular users with 403 FORBIDDEN", async () => {
      const resStats = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${userToken}`);
      expect(resStats.status).toBe(403);
      expect(resStats.body.error.code).toBe("FORBIDDEN");

      const resUsers = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`);
      expect(resUsers.status).toBe(403);
      expect(resUsers.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("GET /api/admin/stats", () => {
    it("returns accurate user/task totals and byStatus breakdown", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totals).toEqual({
        users: 2,
        tasks: 4,
      });
      expect(res.body.byStatus).toEqual({
        Pending: 1,
        "In Progress": 1,
        Testing: 1,
        Completed: 1,
      });
    });
  });

  describe("GET /api/admin/users", () => {
    it("returns all users with their associated taskCount and no passwords", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBe(2);

      const regular = res.body.users.find((u: { email: string }) => u.email === "user@example.com");
      expect(regular).toBeDefined();
      expect(regular.taskCount).toBe(2);
      expect(regular.password).toBeUndefined();

      const adminUser = res.body.users.find((u: { email: string }) => u.email === "admin@example.com");
      expect(adminUser).toBeDefined();
      expect(adminUser.taskCount).toBe(2);
      expect(adminUser.password).toBeUndefined();
    });
  });
});
