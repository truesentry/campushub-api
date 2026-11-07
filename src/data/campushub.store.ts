import { randomUUID } from "node:crypto";

export interface Category { id: string; name: string; }
export interface EventItem { id: string; title: string; description?: string; categoryId: string; createdAt: string; updatedAt: string; }
export interface Registration { id: string; eventId: string; participantId: string; createdAt: string; }

export const categories: Category[] = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Lectures" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Meetups" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Workshops" },
];

const initialTime = "2026-11-07T00:00:00.000Z";
export const events: EventItem[] = [{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "CampusHub Welcome Meetup",
  description: "An introductory event for students.",
  categoryId: "22222222-2222-4222-8222-222222222222",
  createdAt: initialTime,
  updatedAt: initialTime,
}];
export const registrations: Registration[] = [];

export function createId() { return randomUUID(); }
export function removeRegistrationsForEvent(eventId: string) {
  for (let index = registrations.length - 1; index >= 0; index -= 1) {
    if (registrations[index].eventId === eventId) registrations.splice(index, 1);
  }
}
export function addRegistration(registration: Registration) { registrations.push(registration); }
