import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.js";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    console.error("❌ Refusing to run seed in production without ALLOW_SEED=true");
    process.exit(1);
  }

  console.log("🌱 Starting database seeding...");

  // Seed credentials
  const adminPassword = await hashPassword("Admin@123");
  const user1Password = await hashPassword("User@123");
  const user2Password = await hashPassword("User@1234");

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Operations Admin",
      password: adminPassword,
      role: "admin",
    },
    create: {
      email: "admin@example.com",
      name: "Operations Admin",
      password: adminPassword,
      role: "admin",
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      name: "Divyajeet Roaster",
      password: user1Password,
      role: "user",
    },
    create: {
      email: "user@example.com",
      name: "Divyajeet Roaster",
      password: user1Password,
      role: "user",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {
      name: "Kanishka Cupper",
      password: user2Password,
      role: "user",
    },
    create: {
      email: "user2@example.com",
      name: "Kanishka Cupper",
      password: user2Password,
      role: "user",
    },
  });

  console.log("👤 Seeded users: admin@example.com, user@example.com, user2@example.com");

  // Roastery-themed tasks
  const sampleTasks = [
    {
      userId: admin.id,
      title: "Roast batch ET-014 (Yirgacheffe)",
      description: "Profile 14 minute roast, first crack at 9:30, drop at 212°C for filter roast.",
      status: "InProgress" as const,
    },
    {
      userId: user1.id,
      title: "Restock 250 g craft tins",
      description: "Transfer 50 degassing tins from dry storage to retail packaging station.",
      status: "Pending" as const,
    },
    {
      userId: user2.id,
      title: "QA cupping for Coorg lot #89",
      description: "Cup 5 bowl protocol against SCA standard. Evaluate acidity, body, and finish.",
      status: "Testing" as const,
    },
    {
      userId: user1.id,
      title: "Clean & calibrate Mahlkönig EK43 grinder",
      description: "Deep clean burrs, remove fines buildup, check dial alignment at zero point.",
      status: "Completed" as const,
    },
    {
      userId: user2.id,
      title: "Pack holiday reserve gift boxes",
      description: "Assemble numbered batch gift boxes with whole-bean canisters and tasting cards.",
      status: "Pending" as const,
    },
    {
      userId: admin.id,
      title: "Sample roast monsoon malabar green beans",
      description: "Ikawa profile test on 50g green sample from Karnataka estate.",
      status: "Completed" as const,
    },
    {
      userId: user1.id,
      title: "Verify moisture content for Rwandan lot",
      description: "Check grain moisture meter readings across 10 jute sacks in quarantine.",
      status: "InProgress" as const,
    },
  ];

  for (const t of sampleTasks) {
    const existing = await prisma.task.findFirst({
      where: {
        userId: t.userId,
        title: t.title,
      },
    });

    if (!existing) {
      await prisma.task.create({
        data: t,
      });
    }
  }

  console.log(`📋 Verified ${sampleTasks.length} sample tasks without duplicates.`);
  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
