import type { NextFunction, Request, Response } from "express";
import { createApiError } from "../types/api-error";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  console.log("4. notFound");
  return next(createApiError(`Route ${req.method} ${req.originalUrl} was not found`, 404, "ROUTE_NOT_FOUND"));
}
