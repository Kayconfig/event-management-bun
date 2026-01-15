# Event Booking System

A modular Node.js application for managing event bookings, built with Fastify and TypeScript.

## Tech Stack
- **Runtime**: Bun
- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod

## Installation

1. Ensure Bun, PostgreSQL, and Redis are installed.
2. Clone the repository.
3. Install dependencies: `bun install`
4. Set up environment variables in `.env` (see `.env.example`).
5. Start databases: `docker-compose up -d`
6. Run migrations: `bunx drizzle-kit generate && bunx drizzle-kit migrate`
7. Start the server: `bun run dev`

## Usage

Run the development server: `bun run dev`

The server starts on the configured port (default 3000).

## API Endpoints

### Authentication
- `POST /auth/signin` - Sign in user
- `POST /auth/signup` - Sign up user

### Events
- `POST /events` - Create event (authenticated)
- `GET /events` - Get user's events (authenticated)
- `GET /events/:eventId` - Get event by ID (authenticated)
- `POST /events/:eventId/reservations` - Reserve a seat (authenticated)

## Testing

Run tests: `bun test`

Run tests in watch mode: `bun test --watch`

## Contributing

- Project structure: Modular plugins (auth, events) with controller/service/repository layers.
- Follow TypeScript conventions and Zod validation.
- Ensure tests pass before submitting changes.

## License

MIT

## Author

Kayode Odole