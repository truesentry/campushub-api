import type { NextFunction, Request, Response } from "express";
import type { ApiError, ValidationErrorItem } from "../types/api-error";

const titles: Record<string, string> = {
  VALIDATION_ERROR: "Request validation failed",
  EVENT_NOT_FOUND: "Event not found",
  CATEGORY_NOT_FOUND: "Category not found",
  REGISTRATION_ALREADY_EXISTS: "Registration already exists",
  ROUTE_NOT_FOUND: "Route not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  errors?: ValidationErrorItem[];
}

export function errorHandler(error: ApiError, req: Request, res: Response, _next: NextFunction) {
  console.log("5. errorHandler");
  const status = error.statusCode || 500;
  const isServerError = status >= 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const response: ProblemDetails = {
    type: `https://example.com/problems/${code.toLowerCase().replaceAll("_", "-")}`,
    title: titles[code] || "Request failed",
    status,
    detail: isServerError ? "An unexpected server error occurred" : error.message,
    instance: req.originalUrl,
    code,
    requestId: req.requestId,
  };

  if (error.validationErrors) response.errors = error.validationErrors;
  if (isServerError) console.error({ requestId: req.requestId, message: error.message, stack: error.stack });

  return res.status(status).type("application/problem+json").json(response);
}
