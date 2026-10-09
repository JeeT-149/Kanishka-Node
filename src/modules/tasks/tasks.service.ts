import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { toPrismaStatus, toApiStatus, type ApiTaskStatus } from "../../lib/status.js";
import type { AuthenticatedUser } from "../../middleware/authenticate.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from "./tasks.schemas.js";
import { Prisma } from "@prisma/client";

export interface TaskResponse {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: ApiTaskStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export function formatTask(task: {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}): TaskResponse {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    status: toApiStatus(task.status),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    ...(task.user ? { user: task.user } : {}),
  };
}

export async function createTask(
  input: CreateTaskInput,
  currentUser: AuthenticatedUser,
): Promise<{ task: TaskResponse }> {
  const newTask = await prisma.task.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: "Pending", // Status is strictly forced to Pending on creation
      userId: currentUser.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { task: formatTask(newTask) };
}

export async function listTasks(
  query: ListTasksQuery,
  currentUser: AuthenticatedUser,
): Promise<{
  data: TaskResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {};

  // Access control: regular user only sees their own tasks.
  // Admin sees all, with optional filter by specific userId.
  if (currentUser.role === "admin") {
    if (query.userId) {
      where.userId = query.userId;
    }
  } else {
    where.userId = currentUser.id;
  }

  // Filter by status
  if (query.status) {
    where.status = toPrismaStatus(query.status);
  }

  // Search filter (q) across title and description
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
    ];
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: tasks.map(formatTask),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getTaskById(
  id: number,
  currentUser: AuthenticatedUser,
): Promise<{ task: TaskResponse }> {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Never reveal task existence to users who don't own it
  if (!task || (currentUser.role !== "admin" && task.userId !== currentUser.id)) {
    throw AppError.notFound("Task not found");
  }

  return { task: formatTask(task) };
}

export async function updateTask(
  id: number,
  input: UpdateTaskInput,
  currentUser: AuthenticatedUser,
): Promise<{ task: TaskResponse }> {
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask || (currentUser.role !== "admin" && existingTask.userId !== currentUser.id)) {
    throw AppError.notFound("Task not found");
  }

  const updateData: Prisma.TaskUpdateInput = {};
  if (input.title !== undefined) {
    updateData.title = input.title.trim();
  }
  if (input.description !== undefined) {
    updateData.description = input.description ? input.description.trim() : null;
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { task: formatTask(updatedTask) };
}

export async function updateTaskStatus(
  id: number,
  newStatus: ApiTaskStatus,
): Promise<{ task: TaskResponse }> {
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    throw AppError.notFound("Task not found");
  }

  const prismaStatus = toPrismaStatus(newStatus);

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: prismaStatus },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { task: formatTask(updatedTask) };
}
