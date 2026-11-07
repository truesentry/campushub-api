import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  console.log("1. requestId");
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
