import { z } from "zod";
import { API_TASK_STATUSES } from "../../lib/status.js";

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Task ID must be a positive integer"),
});

export const createTaskBodySchema = z
  .object({
    title: z
      .string({ required_error: "Title is required" })
      .trim()
      .min(1, "Title must not be empty")
      .max(120, "Title cannot exceed 120 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional()
      .nullable(),
    status: z.any().optional(), // Ignored in service; status forced to Pending
    userId: z.any().optional(), // Ignored in service; userId from token
    user_id: z.any().optional(),
  })
  .passthrough();

export const updateTaskBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title must not be empty")
      .max(120, "Title cannot exceed 120 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional()
      .nullable(),
    status: z.any().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if ("status" in data && data.status !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["status"],
        message: "status can only be changed via PATCH /api/tasks/:id/status",
      });
      return;
    }
    if (data.title === undefined && data.description === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of title or description must be provided",
      });
    }
  });

export const updateTaskStatusBodySchema = z
  .object({
    status: z.enum(API_TASK_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${API_TASK_STATUSES.join(", ")}`,
      }),
    }),
  })
  .strict();

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(API_TASK_STATUSES).optional(),
  q: z.string().trim().optional(),
  userId: z.coerce.number().int().positive().optional(),
});

export const createTaskSchema = {
  body: createTaskBodySchema,
};

export const updateTaskSchema = {
  params: taskIdParamSchema,
  body: updateTaskBodySchema,
};

export const updateTaskStatusSchema = {
  params: taskIdParamSchema,
  body: updateTaskStatusBodySchema,
};

export const getTaskSchema = {
  params: taskIdParamSchema,
};

export const listTasksSchema = {
  query: listTasksQuerySchema,
};

export type CreateTaskInput = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskBodySchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusBodySchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
