import { prisma } from "../../lib/prisma.js";
import { toApiStatus, type ApiTaskStatus } from "../../lib/status.js";

export interface AdminStatsResponse {
  totals: {
    users: number;
    tasks: number;
  };
  byStatus: Record<ApiTaskStatus, number>;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  const [userCount, taskCount, tasksByStatus] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.task.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const byStatus: Record<ApiTaskStatus, number> = {
    Pending: 0,
    "In Progress": 0,
    Testing: 0,
    Completed: 0,
  };

  for (const group of tasksByStatus) {
    const apiStatus = toApiStatus(group.status);
    if (apiStatus in byStatus) {
      byStatus[apiStatus] = group._count._all;
    }
  }

  return {
    totals: {
      users: userCount,
      tasks: taskCount,
    },
    byStatus,
  };
}

export async function getAdminUsers(): Promise<{ users: AdminUserResponse[] }> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      taskCount: u._count.tasks,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
  };
}
