import express, { type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import {
  readEvents,
  writeEvents,
  type EventRecord,
} from "./fileEventStore";
import eventsRouter from "./routes/events.router";

const app = express();

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("1. requestId");
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("2. logger");
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms requestId=${req.requestId}`);
  });

  next();
}

function notFound(req: Request, res: Response) {
  console.log("4. notFound");
  return res.status(404).json({
    statusCode: 404,
    message: "Route not found",
    requestId: req.requestId,
  });
}

function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  console.log("5. errorHandler");
  console.error(error);
  return res.status(500).json({
    statusCode: 500,
    message: "Internal server error",
    requestId: req.requestId,
  });
}

// These must be before all routes so every response can be traced and logged.
app.use(requestIdMiddleware);
app.use(loggerMiddleware);
app.use(express.json());
app.use((_req, res, next) => {
  // Custom response header: it is checked in the Postman collection.
  res.setHeader("X-API-Name", "CampusHub");
  next();
});

const DATA_FILE_ERROR_MESSAGE = "Не вдалося прочитати або зберегти події";

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sendDataFileError(res: express.Response, error: unknown) {
  console.error("Failed to work with events:", error);
  return res.status(500).json({ message: DATA_FILE_ERROR_MESSAGE });
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "campushub-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/events", eventsRouter);

app.get("/api/events-from-file", async (req, res) => {
  const { date } = req.query;

  if (date !== undefined && !isValidDate(date)) {
    return res.status(400).json({ message: "Параметр date має формат YYYY-MM-DD" });
  }

  try {
    const events = await readEvents();
    const filteredEvents = date ? events.filter((event) => event.date === date) : events;
    return res.status(200).json(filteredEvents);
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

app.get("/api/events-from-file/:id", async (req, res) => {
  try {
    const event = (await readEvents()).find((item) => item.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Подію не знайдено" });
    }
    return res.status(200).json(event);
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

app.post("/api/events-from-file", async (req, res) => {
  const body = req.body as
    | { title?: unknown; date?: unknown }
    | undefined;

  const title = body?.title;
  const date = body?.date;

  if (
    !isNonEmptyString(title) ||
    !isValidDate(date)
  ) {
    return res.status(400).json({
      message: "Потрібно передати назву та дату у форматі YYYY-MM-DD",
    });
  }

  try {
    const events = await readEvents();

    const newEvent: EventRecord = {
      id: randomUUID(),
      title: title.trim(),
      date,
    };

    const updatedEvents = [...events, newEvent];

    await writeEvents(updatedEvents);

    return res.status(201).json(newEvent);
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

app.put("/api/events-from-file/:id", async (req, res) => {
  const body = req.body as { title?: unknown; date?: unknown } | undefined;
  if (!isNonEmptyString(body?.title) || !isValidDate(body?.date)) {
    return res.status(400).json({ message: "Потрібно передати назву та дату у форматі YYYY-MM-DD" });
  }

  try {
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Подію не знайдено" });
    }

    const updatedEvent: EventRecord = { id: req.params.id, title: body.title.trim(), date: body.date };
    events[index] = updatedEvent;
    await writeEvents(events);
    return res.status(200).json(updatedEvent);
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

app.patch("/api/events-from-file/:id", async (req, res) => {
  const body = req.body as { title?: unknown; date?: unknown } | undefined;
  const hasTitle = body?.title !== undefined;
  const hasDate = body?.date !== undefined;

  if ((!hasTitle && !hasDate) || (hasTitle && !isNonEmptyString(body?.title)) || (hasDate && !isValidDate(body?.date))) {
    return res.status(400).json({ message: "Передайте title та/або date; дата має формат YYYY-MM-DD" });
  }

  try {
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Подію не знайдено" });
    }

    const currentEvent = events[index];
    const updatedEvent: EventRecord = {
      ...currentEvent,
      ...(hasTitle ? { title: (body!.title as string).trim() } : {}),
      ...(hasDate ? { date: body!.date as string } : {}),
    };
    events[index] = updatedEvent;
    await writeEvents(events);
    return res.status(200).json(updatedEvent);
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

app.delete("/api/events-from-file/:id", async (req, res) => {
  try {
    const events = await readEvents();
    const filteredEvents = events.filter((event) => event.id !== req.params.id);
    if (filteredEvents.length === events.length) {
      return res.status(404).json({ message: "Подію не знайдено" });
    }

    await writeEvents(filteredEvents);
    return res.status(204).end();
  } catch (error) {
    return sendDataFileError(res, error);
  }
});

// These are deliberately last: they receive only unmatched routes and errors.
app.use(notFound);
app.use(errorHandler);

export default app;
