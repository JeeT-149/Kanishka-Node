import { describe, it, expect } from "vitest";
import {
  toPrismaStatus,
  toApiStatus,
  isApiTaskStatus,
  API_TASK_STATUSES,
} from "../src/lib/status.js";

describe("Task status mapping (lib/status.ts)", () => {
  it("recognizes all valid API statuses", () => {
    for (const status of API_TASK_STATUSES) {
      expect(isApiTaskStatus(status)).toBe(true);
    }
    expect(isApiTaskStatus("InvalidStatus")).toBe(false);
    expect(isApiTaskStatus("pending")).toBe(false);
  });

  it("correctly maps API strings to Prisma enum values", () => {
    expect(toPrismaStatus("Pending")).toBe("Pending");
    expect(toPrismaStatus("In Progress")).toBe("InProgress");
    expect(toPrismaStatus("Testing")).toBe("Testing");
    expect(toPrismaStatus("Completed")).toBe("Completed");
  });

  it("correctly maps Prisma enum values to API strings", () => {
    expect(toApiStatus("Pending")).toBe("Pending");
    expect(toApiStatus("InProgress")).toBe("In Progress");
    expect(toApiStatus("In Progress")).toBe("In Progress");
    expect(toApiStatus("Testing")).toBe("Testing");
    expect(toApiStatus("Completed")).toBe("Completed");
  });

  it("throws on invalid status mapping", () => {
    expect(() => toApiStatus("NonExistentStatus" as never)).toThrow();
  });
});
