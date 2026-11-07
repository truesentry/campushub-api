import type { NextFunction, Request, Response } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log("2. logger");
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms requestId=${req.requestId}`);
  });

  next();
}
