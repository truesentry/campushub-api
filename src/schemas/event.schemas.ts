import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createEventSchema = z.object({
  title: z.string().trim().min(3, "Title must contain at least 3 characters").max(100, "Title must contain no more than 100 characters"),
  date: z.string().regex(datePattern, "Date must use YYYY-MM-DD format"),
  description: z.string().trim().max(500).optional(),
  isOnline: z.boolean().default(false),
}).strict();

// Do not derive this from createEventSchema.partial(): its default(false) would
// turn an empty PATCH body into { isOnline: false } and incorrectly accept it.
export const updateEventSchema = z.object({
  title: z.string().trim().min(3, "Title must contain at least 3 characters").max(100, "Title must contain no more than 100 characters").optional(),
  date: z.string().regex(datePattern, "Date must use YYYY-MM-DD format").optional(),
  description: z.string().trim().max(500).optional(),
  isOnline: z.boolean().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export const eventIdSchema = z.object({
  id: z.coerce.number().int("Event id must be an integer").positive("Event id must be positive"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
