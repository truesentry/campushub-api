import { Router } from "express";

interface EventItem {
  id: number;
  title: string;
  date: string;
}

const events: EventItem[] = [
  {
    id: 1,
    title: "JavaScript Meetup",
    date: "2026-10-10",
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

eventsRouter.get("/:id", (req, res) => {
  const event = events.find((item) => item.id === Number(req.params.id));

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  return res.status(200).json(event);
});

eventsRouter.post("/", (req, res) => {
  const { title, date } = req.body as { title?: unknown; date?: unknown };

  if (typeof title !== "string" || !title.trim() || typeof date !== "string" || !date.trim()) {
    return res.status(400).json({ message: "title and date are required" });
  }

  const newEvent: EventItem = {
    id: nextEventId++,
    title: title.trim(),
    date: date.trim(),
  };
  events.push(newEvent);

  return res.status(201).json(newEvent);
});

eventsRouter.patch("/:id", (req, res) => {
  const event = events.find((item) => item.id === Number(req.params.id));

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const { title, date } = req.body as { title?: unknown; date?: unknown };
  if (title === undefined && date === undefined) {
    return res.status(400).json({ message: "At least title or date is required" });
  }
  if ((title !== undefined && (typeof title !== "string" || !title.trim())) || (date !== undefined && (typeof date !== "string" || !date.trim()))) {
    return res.status(400).json({ message: "title and date must be non-empty strings" });
  }

  if (typeof title === "string") event.title = title.trim();
  if (typeof date === "string") event.date = date.trim();

  return res.status(200).json(event);
});

eventsRouter.delete("/:id", (req, res) => {
  const index = events.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  events.splice(index, 1);
  return res.status(204).end();
});

export default eventsRouter;
