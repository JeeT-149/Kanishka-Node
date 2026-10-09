import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "../lib/errors.js";

export interface ValidationTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schema: ValidationTarget) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Request["query"];
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        const firstMessage = details[0]?.message || "Validation failed";
        return next(AppError.badRequest(firstMessage, details));
      }
      next(err);
    }
  };
}
