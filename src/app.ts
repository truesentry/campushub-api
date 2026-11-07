import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { notFound } from "./middleware/not-found";
import { requestId } from "./middleware/request-id";
import eventsRouter from "./routes/events.router";

const app = express();

// They run before every route, including the not-found and global-error flows.
app.use(requestId);
app.use(logger);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "campushub-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/events", eventsRouter);

// These must remain after all routes.
app.use(notFound);
app.use(errorHandler);

export default app;
