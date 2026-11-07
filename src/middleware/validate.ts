import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import type { ApiError } from "../types/api-error";

type ValidationSource = "body" | "params" | "query";

export function validate(schema: ZodType, source: ValidationSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const error = new Error("Request validation failed") as ApiError;
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.validationErrors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message,
      }));
      return next(error);
    }

    (req as unknown as Record<ValidationSource, unknown>)[source] = result.data;
    return next();
  };
}
