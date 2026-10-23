import { randomUUID } from "node:crypto";
import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";

export interface EventRecord {
  id: string;
  title: string;
  date: string;
}

export class DataFileError extends Error {
  public readonly originalError: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = "DataFileError";
    this.originalError = originalError;
  }
}

const eventsFilePath = join(
  __dirname,
  "..",
  "data",
  "events.json"
);

export async function readEvents(): Promise<EventRecord[]> {
  try {
    const content = await readFile(eventsFilePath, "utf8");
    const data: unknown = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error("The JSON file must contain an array");
    }

    return data as EventRecord[];
  } catch (error) {
    throw new DataFileError(
      "Failed to read events.json",
      error
    );
  }
}

export async function writeEvents(
  events: EventRecord[]
): Promise<void> {
  const tempFilePath = `${eventsFilePath}.${randomUUID()}.tmp`;

  try {
    const content = JSON.stringify(events, null, 2) + "\n";

    await writeFile(tempFilePath, content, "utf8");
    await rename(tempFilePath, eventsFilePath);
  } catch (error) {
    try {
      await rm(tempFilePath, { force: true });
    } catch (cleanupError) {
      console.error("Failed to remove temporary file:", cleanupError);
    }

    throw new DataFileError(
      "Failed to save events.json",
      error
    );
  }
}