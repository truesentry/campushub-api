import { Router } from "express";
import { env } from "../config/env";
import { validate } from "../middleware/validate";
import { createEventSchema, eventIdSchema, updateEventSchema, type CreateEventInput, type UpdateEventInput } from "../schemas/event.schemas";
import { createApiError } from "../types/api-error";

interface EventItem {
  id: number;
  title: string;
  date: string;
  description?: string;
  isOnline: boolean;
}

const events: EventItem[] = [
  {
    id: 1,
    title: "JavaScript Meetup",
    date: "2026-10-10",
    isOnline: false,
  },
];

let nextEventId = 2;
const eventsRouter = Router();

// This middleware belongs to the router, so it runs only for /api/events.
eventsRouter.use((_req, _res, next) => {
  console.log("3. router");
  next();
});

// Keep this route before /:id, otherwise "error" would be interpreted as an id.
eventsRouter.get("/error/test", (_req, _res, next) => {
  next(new Error("Test error"));
});

eventsRouter.get("/", (_req, res) => {
  res.status(200).json(events);
});

eventsRouter.get("/:id", validate(eventIdSchema, "params"), (req, res, next) => {
  const { id } = req.params as unknown as { id: number };
  const event = events.find((item) => item.id === id);

  if (!event) {
    return next(createApiError(`Event with id ${id} was not found`, 404, "EVENT_NOT_FOUND"));
  }

  return res.status(200).json(event);
});

eventsRouter.post("/", validate(createEventSchema), (req, res, next) => {
  const input = req.body as CreateEventInput;
  const duplicate = events.find((event) => event.title.toLowerCase() === input.title.toLowerCase() && event.date === input.date);
  if (duplicate) {
    return next(createApiError("Event with the same title and date already exists", 409, "EVENT_ALREADY_EXISTS"));
  }
  if (events.length >= env.MAX_EVENTS) {
    return next(createApiError("Maximum number of events has been reached", 409, "EVENT_LIMIT_REACHED"));
  }

  const newEvent: EventItem = {
    id: nextEventId++,
    ...input,
  };
  events.push(newEvent);

  return res.status(201).json(newEvent);
});

eventsRouter.patch("/:id", validate(eventIdSchema, "params"), validate(updateEventSchema), (req, res, next) => {
  const { id } = req.params as unknown as { id: number };
  const event = events.find((item) => item.id === id);

  if (!event) {
    return next(createApiError(`Event with id ${id} was not found`, 404, "EVENT_NOT_FOUND"));
  }

  Object.assign(event, req.body as UpdateEventInput);

  return res.status(200).json(event);
});

eventsRouter.delete("/:id", validate(eventIdSchema, "params"), (req, res, next) => {
  const { id } = req.params as unknown as { id: number };
  const index = events.findIndex((item) => item.id === id);

  if (index === -1) {
    return next(createApiError(`Event with id ${id} was not found`, 404, "EVENT_NOT_FOUND"));
  }

  events.splice(index, 1);
  return res.status(204).end();
});

export default eventsRouter;
