import express from "express";
import { randomUUID } from "node:crypto";
import {
  readEvents,
  writeEvents,
  type EventRecord,
} from "./fileEventStore";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "campushub-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/events-from-file", async (_req, res) => {
  try {
    const events = await readEvents();

    return res.status(200).json(events);
  } catch (error) {
    console.error("Failed to read events:", error);

    return res.status(500).json({
      message: "Не вдалося прочитати або зберегти події",
    });
  }
});

app.post("/api/events-from-file", async (req, res) => {
  const body = req.body as
    | { title?: unknown; date?: unknown }
    | undefined;

  const title = body?.title;
  const date = body?.date;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T00:00:00.000Z`))
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
    console.error("Failed to add event:", error);

    return res.status(500).json({
      message: "Не вдалося прочитати або зберегти події",
    });
  }
});

export default app;