import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken } from "../src/lib/jwt.js";
import { clearDatabase, disconnectDatabase } from "./setup.js";

const app = createApp();

describe("Authentication & User API (/api/auth)", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("successfully registers a user with role 'user'", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Roaster",
          email: "roaster@example.com",
          password: "Password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe("Test Roaster");
      expect(res.body.user.email).toBe("roaster@example.com");
      expect(res.body.user.role).toBe("user");
      expect(res.body.user.password).toBeUndefined(); // Never leak password hash!
      expect(res.body.user.id).toBeTypeOf("number");
    });

    it("prevents role escalation by forcing role to 'user' even when 'admin' is sent", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Attacker User",
          email: "attacker@example.com",
          password: "Password123",
          role: "admin",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("user");

      const dbUser = await prisma.user.findUnique({
        where: { email: "attacker@example.com" },
      });
      expect(dbUser?.role).toBe("user");
    });

    it("returns 409 CONFLICT on duplicate email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Original User",
          email: "duplicate@example.com",
          password: "Password123",
        });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "DUPLICATE@example.com", // Case insensitive check
          password: "Password123",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("returns 400 VALIDATION_ERROR on invalid input", async () => {
      // Invalid email
      const res1 = await request(app)
        .post("/api/auth/register")
        .send({
          name: "A",
          email: "not-an-email",
          password: "Password123",
        });
      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe("VALIDATION_ERROR");

      // Password without number
      const res2 = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Valid Name",
          email: "valid@example.com",
          password: "OnlyLettersPassword",
        });
      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe("VALIDATION_ERROR");

      // Password shorter than 8 chars
      const res3 = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Valid Name",
          email: "valid@example.com",
          password: "Short1",
        });
      expect(res3.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Alice",
          email: "alice@example.com",
          password: "Password123",
        });
    });

    it("returns JWT token and user info on valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "ALICE@EXAMPLE.COM", // Case-insensitive email login
          password: "Password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTypeOf("string");
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("alice@example.com");
      expect(res.body.user.password).toBeUndefined();
    });

    it("returns identical 401 UNAUTHORIZED message for wrong password and unknown email", async () => {
      const resWrongPassword = await request(app)
        .post("/api/auth/login")
        .send({
          email: "alice@example.com",
          password: "WrongPassword999",
        });

      const resUnknownEmail = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "Password123",
        });

      expect(resWrongPassword.status).toBe(401);
      expect(resUnknownEmail.status).toBe(401);
      expect(resWrongPassword.body.error.message).toBe("Invalid email or password");
      expect(resUnknownEmail.body.error.message).toBe("Invalid email or password");
      expect(resWrongPassword.body.error.code).toBe("UNAUTHORIZED");
      expect(resUnknownEmail.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns authenticated user details", async () => {
      const reg = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Bob",
          email: "bob@example.com",
          password: "Password123",
        });
      const userId = reg.body.user.id;
      const token = signToken(userId);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.email).toBe("bob@example.com");
      expect(res.body.user.password).toBeUndefined();
    });

    it("returns 401 if user was deleted from the database", async () => {
      const reg = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Temporary",
          email: "temp@example.com",
          password: "Password123",
        });
      const userId = reg.body.user.id;
      const token = signToken(userId);

      // Delete user directly from DB
      await prisma.user.delete({ where: { id: userId } });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 for tampered or invalid tokens", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
