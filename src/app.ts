import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { prisma } from "./lib/prisma.js";

// Routes will be registered here as modules are built
import { authRouter } from "./modules/auth/auth.routes.js";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export function createApp() {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Body parser
  app.use(express.json({ limit: "1mb" }));

  // Database-checked health endpoint
  app.get("/api/health", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  });

  // API Modules
  app.use("/api/auth", authRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/admin", adminRouter);

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Global centralized error handler
  app.use(errorHandler);

  return app;
}
