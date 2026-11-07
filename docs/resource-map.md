# CampusHub resource map

| Resource | Purpose | Main fields |
| --- | --- | --- |
| `events` | University events | `id`, `title`, `description`, `categoryId`, `createdAt`, `updatedAt` |
| `categories` | Event categories | `id`, `name` |
| `registrations` | Participant registrations for events | `id`, `eventId`, `participantId`, `createdAt` |

## Relationships

- One category contains many events; each event has exactly one `categoryId`.
- One event has many registrations; each registration belongs to one event.
- A participant may register for many different events.
- The pair `eventId` + `participantId` is unique: a participant cannot register twice for the same event.
- Deleting an event also removes its registrations. This cascade prevents registrations that point to a deleted event.

## In-memory categories

| id | name |
| --- | --- |
| `11111111-1111-4111-8111-111111111111` | Lectures |
| `22222222-2222-4222-8222-222222222222` | Meetups |
| `33333333-3333-4333-8333-333333333333` | Workshops |

Data is stored only in memory and is reset when the server restarts.

## Event fields

The client must send `title` and `categoryId` when creating an event. `description` is optional. The server creates `id`, `createdAt`, and `updatedAt`; a client cannot set or change those service fields. On a PATCH request, only submitted client fields change and `updatedAt` receives a new timestamp.
