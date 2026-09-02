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