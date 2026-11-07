CampusHub API

Backend-проєкт CampusHub на Node.js, TypeScript та Express.

Requirements
Node.js >= 20
npm
Installation

Clone the repository and install dependencies:

npm install
Environment

Create a .env file if environment variables are required.

Example:

PORT=3000
NODE_ENV=development

The .env.example file contains the example configuration.

Development

Run the development server:

npm run dev

By default, the API will be available at:

http://localhost:3000
Build

Compile TypeScript:

npm run build

The compiled files will be placed in the dist directory.

Type checking

Run TypeScript type checking without generating files:

npm run typecheck
Production

Start the compiled application:

npm run start
Health endpoint

The project contains a health endpoint:

GET /health

Example:

curl http://localhost:3000/health

Response:

{
  "status": "ok",
  "service": "campushub-api",
  "timestamp": "2026-09-02T09:30:00.000Z"
}

The timestamp value is generated dynamically for every request.

Postman collection

Import `postman/CampusHub-HTTP-Methods.postman_collection.json` into Postman and run the collection in order after starting the server with `npm run dev`.

The collection has 8 requests: 5 positive and 3 negative. It uses no secrets or environment files: the collection variable `baseUrl` already has the value `http://localhost:3000`.

It tests:

- query parameter: `GET /api/events-from-file?date=2026-09-12`;
- path parameter: `/api/events-from-file/:id`;
- JSON body for `POST`, `PUT`, and `PATCH`;
- custom request header `X-Lab-Request` and response header `X-API-Name`;
- expected statuses `200`, `201`, `204`, `400`, and `404`;
- `Content-Type` and a fragment of the response body for every request. The successful `204` DELETE correctly has no response body or `Content-Type`.

The full HTTP methods table is in `HTTP_METHODS.md`.

## Router and middleware practice

The separate events router lives in `src/routes/events.router.ts` (after compilation, it becomes `dist/routes/events.router.js`) and is mounted with `app.use('/api/events', eventsRouter)`.

The router keeps its data in a simple in-memory array. Restarting the server resets this array to the initial event.

### Middleware order

1. `requestIdMiddleware` runs first. It gives every request a `requestId` and sends it back as the `X-Request-Id` response header. It must run before routes so successful responses, 404 responses, errors, and logs all have the same identifier.
2. `loggerMiddleware` runs before routes so it can subscribe to the finished response and log every request, including failures. Its line contains method, URL, status, duration, and `requestId`.
3. `eventsRouter` handles only requests beginning with `/api/events`.
4. `notFound` is after all routes. Therefore it runs only if no route sent a response and returns a JSON `404` response with `requestId`.
5. `errorHandler` is last. Express sends errors from `next(error)` to this four-parameter middleware, which returns the common JSON `500` format.

Temporary console messages make this order visible: `1. requestId`, `2. logger`, `3. router`, `4. notFound`, and `5. errorHandler`.

### Commands to check the router

Run the server first with `npm run dev`, then in a second terminal execute:

```bash
curl -i http://localhost:3000/api/events
curl -i http://localhost:3000/api/events/1
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"2026-11-15"}'
curl -i -X PATCH http://localhost:3000/api/events/1 -H "Content-Type: application/json" -d '{"title":"Updated Event"}'
curl -i -X DELETE http://localhost:3000/api/events/1
curl -i http://localhost:3000/api/unknown
```

For the global error handler check, open `http://localhost:3000/api/events/error/test`. It returns `500` with the same `requestId` that appears in `X-Request-Id` and in the server log.

## Practical work 4: configuration, validation, and uniform errors

This continuation uses `dotenv` and Zod. The local `.env` file is ignored by Git; `.env.example` documents the required variables: `PORT`, `NODE_ENV`, `LOG_LEVEL`, and `MAX_EVENTS`.

- `src/config/env.ts` parses and validates environment variables before the server starts. Invalid values such as `PORT=hello`, `PORT=99999`, or `NODE_ENV=local` stop startup and print a configuration error.
- `src/schemas/event.schemas.ts` strictly validates event creation, partial updates, and numeric positive path IDs. Unknown fields are rejected; `PATCH {}` is rejected.
- `src/middleware/validate.ts` is one reusable middleware for `body`, `params`, or `query`. Validated data replaces the raw request data, so `req.params.id` is a number and default values are applied.
- `src/middleware/not-found.ts` forwards an error to the global handler. `src/middleware/error-handler.ts` returns every API error using Problem Details (`application/problem+json`) with `code` and `requestId`.
- `src/routes/events.router.ts` applies business rules: missing event (`404`), duplicate event (`409`), and configured event limit (`409`).

Use the detailed commands, statuses, response-header checks, and JSON examples in `docs/practical-4-curl-results.md`.

Project structure
campushub-api/
├── src/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
Scripts
npm run dev — start development server with automatic restart
npm run build — compile TypeScript
npm run start — start compiled application
npm run typecheck — check TypeScript types
npm test — run tests
Architecture

src/app.ts contains the Express application, middleware and routes.

src/server.ts is responsible for starting the HTTP server and opening the configured port.

Separating these responsibilities allows the Express application to be tested without starting a network server.
