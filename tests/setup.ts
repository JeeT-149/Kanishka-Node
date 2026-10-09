import { prisma } from "../src/lib/prisma.js";

export async function clearDatabase(): Promise<void> {
  // Clear tables in reverse dependency order
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
