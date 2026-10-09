import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Kanishka Ops API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`📡 Healthcheck available at: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("🔌 HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("💾 Prisma client disconnected.");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnect:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds timeout
  setTimeout(() => {
    console.error("⚠️ Forcefully shutting down due to timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
