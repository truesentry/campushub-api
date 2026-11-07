import { z } from "zod";

const uuidMessage = "Identifier must be a valid UUID";
const eventFields = {
  title: z.string().trim().min(3, "Title must contain at least 3 characters").max(100, "Title must contain no more than 100 characters"),
  description: z.string().trim().max(500, "Description must contain no more than 500 characters").optional(),
  categoryId: z.string().uuid(uuidMessage),
};

export const createEventSchema = z.object(eventFields).strict();
export const updateEventSchema = z.object({
  title: eventFields.title.optional(),
  description: eventFields.description,
  categoryId: eventFields.categoryId.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });
export const eventIdSchema = z.object({ id: z.string().uuid(uuidMessage) });
export const createRegistrationSchema = z.object({
  participantId: z.string().uuid("participantId must be a valid UUID"),
}).strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
