import { Router } from "express";
import { addRegistration, categories, createId, events, registrations, removeRegistrationsForEvent, type EventItem, type Registration } from "../data/campushub.store";
import { validate } from "../middleware/validate";
import { createEventSchema, createRegistrationSchema, eventIdSchema, updateEventSchema, type CreateEventInput, type CreateRegistrationInput, type UpdateEventInput } from "../schemas/event.schemas";
import { createApiError } from "../types/api-error";

const eventsRouter = Router();
eventsRouter.use((_req, _res, next) => { console.log("3. router"); next(); });

function findEvent(id: string) { return events.find((event) => event.id === id); }
function categoryExists(categoryId: string) { return categories.some((category) => category.id === categoryId); }
function eventNotFound(id: string) { return createApiError(`Event with id ${id} was not found`, 404, "EVENT_NOT_FOUND"); }

// This route must precede /:id so "error" is not treated as an ID.
eventsRouter.get("/error/test", (_req, _res, next) => next(new Error("Test error")));

eventsRouter.get("/", (_req, res) => res.status(200).json(events));

eventsRouter.post("/", validate(createEventSchema), (req, res, next) => {
  const input = req.body as CreateEventInput;
  if (!categoryExists(input.categoryId)) {
    return next(createApiError("categoryId does not reference an existing category", 400, "CATEGORY_NOT_FOUND"));
  }
  const now = new Date().toISOString();
  const event: EventItem = {
    id: createId(), title: input.title, categoryId: input.categoryId,
    ...(input.description === undefined ? {} : { description: input.description }),
    createdAt: now, updatedAt: now,
  };
  events.push(event);
  return res.location(`/api/events/${event.id}`).status(201).json(event);
});

eventsRouter.post("/:id/registrations", validate(eventIdSchema, "params"), validate(createRegistrationSchema), (req, res, next) => {
  const { id: eventId } = req.params as unknown as { id: string };
  const input = req.body as CreateRegistrationInput;
  if (!findEvent(eventId)) return next(eventNotFound(eventId));
  if (registrations.some((registration) => registration.eventId === eventId && registration.participantId === input.participantId)) {
    return next(createApiError("Participant is already registered for this event", 409, "REGISTRATION_ALREADY_EXISTS"));
  }
  const registration: Registration = { id: createId(), eventId, participantId: input.participantId, createdAt: new Date().toISOString() };
  addRegistration(registration);
  return res.location(`/api/events/${eventId}/registrations/${registration.id}`).status(201).json(registration);
});

eventsRouter.get("/:id", validate(eventIdSchema, "params"), (req, res, next) => {
  const { id } = req.params as unknown as { id: string };
  const event = findEvent(id);
  return event ? res.status(200).json(event) : next(eventNotFound(id));
});

eventsRouter.patch("/:id", validate(eventIdSchema, "params"), validate(updateEventSchema), (req, res, next) => {
  const { id } = req.params as unknown as { id: string };
  const input = req.body as UpdateEventInput;
  const event = findEvent(id);
  if (!event) return next(eventNotFound(id));
  if (input.categoryId && !categoryExists(input.categoryId)) {
    return next(createApiError("categoryId does not reference an existing category", 400, "CATEGORY_NOT_FOUND"));
  }
  Object.assign(event, input, { updatedAt: new Date().toISOString() });
  return res.status(200).json(event);
});

eventsRouter.delete("/:id", validate(eventIdSchema, "params"), (req, res, next) => {
  const { id } = req.params as unknown as { id: string };
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return next(eventNotFound(id));
  events.splice(index, 1);
  // Delete registrations together with the event to avoid orphan records.
  removeRegistrationsForEvent(id);
  return res.status(204).end();
});

export default eventsRouter;
