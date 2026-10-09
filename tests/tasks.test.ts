import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken } from "../src/lib/jwt.js";
import { hashPassword } from "../src/lib/password.js";
import { clearDatabase, disconnectDatabase } from "./setup.js";

const app = createApp();

describe("Tasks API & Authorization Matrix (/api/tasks)", () => {
  let userAToken: string;
  let userAId: number;

  let userBToken: string;
  let userBId: number;

  let adminToken: string;
  let adminId: number;

  let userATaskId: number;
  let userBTaskId: number;

  beforeEach(async () => {
    await clearDatabase();

    const passwordHash = await hashPassword("Password123");

    // Create User A
    const userA = await prisma.user.create({
      data: {
        name: "User A",
        email: "usera@example.com",
        password: passwordHash,
        role: "user",
      },
    });
    userAId = userA.id;
    userAToken = signToken(userAId);

    // Create User B
    const userB = await prisma.user.create({
      data: {
        name: "User B",
        email: "userb@example.com",
        password: passwordHash,
        role: "user",
      },
    });
    userBId = userB.id;
    userBToken = signToken(userBId);

    // Create Admin
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

    // Seed task for User A
    const taskA = await prisma.task.create({
      data: {
        title: "User A Batch Roast",
        description: "Roast Ethiopian lot 10",
        status: "Pending",
        userId: userAId,
      },
    });
    userATaskId = taskA.id;

    // Seed task for User B
    const taskB = await prisma.task.create({
      data: {
        title: "User B Packaging",
        description: "Package Colombian cans",
        status: "InProgress",
        userId: userBId,
      },
    });
    userBTaskId = taskB.id;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("Anonymous Access", () => {
    it("rejects unauthorized access with 401 UNAUTHORIZED", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");

      const resCreate = await request(app)
        .post("/api/tasks")
        .send({ title: "Anonymous Task" });
      expect(resCreate.status).toBe(401);
    });
  });

  describe("Regular User (User A)", () => {
    it("can create a task with forced Pending status and user_id from token", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          title: "Cupping Session #1",
          description: "Cupping washed Gesha sample",
          status: "Completed", // Even if supplied, forced to Pending
          userId: 9999, // Even if supplied, ignored
        });

      expect(res.status).toBe(201);
      expect(res.body.task.status).toBe("Pending");
      expect(res.body.task.userId).toBe(userAId);
      expect(res.body.task.title).toBe("Cupping Session #1");
    });

    it("can only view their own tasks in list", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(userATaskId);
      expect(res.body.data[0].userId).toBe(userAId);
    });

    it("can view their own specific task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task.id).toBe(userATaskId);
      expect(res.body.task.status).toBe("Pending");
    });

    it("can update their own task title and description", async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          title: "Updated Batch Roast",
          description: "Updated description notes",
        });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe("Updated Batch Roast");
      expect(res.body.task.description).toBe("Updated description notes");
    });

    it("returns 400 when attempting to update status via PUT", async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          title: "Try Status",
          status: "Completed",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(JSON.stringify(res.body.error)).toContain(
        "status can only be changed via PATCH /api/tasks/:id/status",
      );
    });

    it("returns 403 FORBIDDEN when regular user attempts to PATCH status", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}/status`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ status: "Testing" });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 404 NOT_FOUND (hidden existence) when accessing another user's task", async () => {
      // User B tries to get User A's task
      const resGet = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(resGet.status).toBe(404);
      expect(resGet.body.error.code).toBe("NOT_FOUND");

      // User A tries to get User B's task
      const resGetB = await request(app)
        .get(`/api/tasks/${userBTaskId}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(resGetB.status).toBe(404);
      expect(resGetB.body.error.code).toBe("NOT_FOUND");

      // User B tries to edit User A's task
      const resPut = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${userBToken}`)
        .send({ title: "Malicious Edit" });

      expect(resPut.status).toBe(404);
      expect(resPut.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Admin Access", () => {
    it("can view ALL tasks including owner details", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].user).toBeDefined();
      expect(res.body.data[0].user.email).toBeDefined();
    });

    it("can filter tasks by status and search keyword (q)", async () => {
      const resStatus = await request(app)
        .get("/api/tasks?status=In%20Progress")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(resStatus.status).toBe(200);
      expect(resStatus.body.data.length).toBe(1);
      expect(resStatus.body.data[0].status).toBe("In Progress");

      const resSearch = await request(app)
        .get("/api/tasks?q=ethiopian")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(resSearch.status).toBe(200);
      expect(resSearch.body.data.length).toBe(1);
      expect(resSearch.body.data[0].id).toBe(userATaskId);
    });

    it("can filter tasks by specific userId as admin", async () => {
      const res = await request(app)
        .get(`/api/tasks?userId=${userBId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].userId).toBe(userBId);
    });

    it("can view any user's task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task.id).toBe(userATaskId);
    });

    it("can edit any user's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Admin Edited User A Task" });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe("Admin Edited User A Task");
    });

    it("can update task status through PATCH /api/tasks/:id/status", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "In Progress" });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe("In Progress");

      // Update to Testing
      const res2 = await request(app)
        .patch(`/api/tasks/${userATaskId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Testing" });

      expect(res2.status).toBe(200);
      expect(res2.body.task.status).toBe("Testing");

      // Update to Completed
      const res3 = await request(app)
        .patch(`/api/tasks/${userATaskId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Completed" });

      expect(res3.status).toBe(200);
      expect(res3.body.task.status).toBe("Completed");
    });

    it("returns 400 on invalid status enum value", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${userATaskId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "UnknownStatus" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 on non-existent task status update", async () => {
      const res = await request(app)
        .patch("/api/tasks/999999/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Testing" });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
