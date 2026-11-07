# CampusHub API examples

All paths below are relative to `http://localhost:3000`. Errors use `Content-Type: application/problem+json` and include a `requestId` that matches the `X-Request-Id` response header.

## Create an event

```http
POST /api/events
Content-Type: application/json

{
  "title": "Node.js Workshop",
  "description": "A practical workshop for students.",
  "categoryId": "33333333-3333-4333-8333-333333333333"
}
```

```http
HTTP/1.1 201 Created
Location: /api/events/<event-uuid>
Content-Type: application/json; charset=utf-8
```

```json
{
  "id": "<event-uuid>",
  "title": "Node.js Workshop",
  "description": "A practical workshop for students.",
  "categoryId": "33333333-3333-4333-8333-333333333333",
  "createdAt": "2026-11-07T00:00:00.000Z",
  "updatedAt": "2026-11-07T00:00:00.000Z"
}
```

## Read, update, and delete an event

```http
GET /api/events/<event-uuid>
PATCH /api/events/<event-uuid>
Content-Type: application/json

{ "title": "Updated Node.js Workshop" }
DELETE /api/events/<event-uuid>
```

The first two calls return `200 OK`; PATCH preserves `id` and `createdAt` while changing `updatedAt`. DELETE returns `204 No Content` with no body. A later GET for the same ID returns `404`.

## Register a participant

```http
POST /api/events/<event-uuid>/registrations
Content-Type: application/json

{ "participantId": "22222222-2222-4222-8222-222222222222" }
```

```http
HTTP/1.1 201 Created
Location: /api/events/<event-uuid>/registrations/<registration-uuid>
```

```json
{
  "id": "<registration-uuid>",
  "eventId": "<event-uuid>",
  "participantId": "22222222-2222-4222-8222-222222222222",
  "createdAt": "2026-11-07T00:00:00.000Z"
}
```

## Error examples

| Situation | Status | Stable code |
| --- | --- | --- |
| Missing `title`, unknown body field, or invalid UUID | 400 | `VALIDATION_ERROR` |
| `categoryId` is a valid UUID but absent from categories | 400 | `CATEGORY_NOT_FOUND` |
| Event does not exist | 404 | `EVENT_NOT_FOUND` |
| Repeated `eventId` + `participantId` pair | 409 | `REGISTRATION_ALREADY_EXISTS` |

Example Problem Details response:

```json
{
  "type": "https://example.com/problems/registration-already-exists",
  "title": "Registration already exists",
  "status": 409,
  "detail": "Participant is already registered for this event",
  "instance": "/api/events/<event-uuid>/registrations",
  "code": "REGISTRATION_ALREADY_EXISTS",
  "requestId": "<request-uuid>"
}
```
