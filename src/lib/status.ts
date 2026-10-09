export const API_TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Testing",
  "Completed",
] as const;

export type ApiTaskStatus = (typeof API_TASK_STATUSES)[number];

export type PrismaTaskStatus = "Pending" | "InProgress" | "Testing" | "Completed";

const API_TO_PRISMA: Record<ApiTaskStatus, PrismaTaskStatus> = {
  Pending: "Pending",
  "In Progress": "InProgress",
  Testing: "Testing",
  Completed: "Completed",
};

const PRISMA_TO_API: Record<PrismaTaskStatus, ApiTaskStatus> = {
  Pending: "Pending",
  InProgress: "In Progress",
  Testing: "Testing",
  Completed: "Completed",
};

export function isApiTaskStatus(value: unknown): value is ApiTaskStatus {
  return typeof value === "string" && API_TASK_STATUSES.includes(value as ApiTaskStatus);
}

export function toPrismaStatus(apiStatus: ApiTaskStatus): PrismaTaskStatus {
  const mapped = API_TO_PRISMA[apiStatus];
  if (!mapped) {
    throw new Error(`Invalid API task status: ${apiStatus}`);
  }
  return mapped;
}

export function toApiStatus(prismaStatus: PrismaTaskStatus | string): ApiTaskStatus {
  if (prismaStatus === "InProgress" || prismaStatus === "In Progress") {
    return "In Progress";
  }
  if (prismaStatus in PRISMA_TO_API) {
    return PRISMA_TO_API[prismaStatus as PrismaTaskStatus];
  }
  if (isApiTaskStatus(prismaStatus)) {
    return prismaStatus;
  }
  throw new Error(`Invalid Prisma task status: ${prismaStatus}`);
}
