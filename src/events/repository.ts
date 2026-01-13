import { type DrizzleDbType } from '../database/drizzle';
import { createEventsDrizzleRepository } from './drizzle-repository-client';
import { type EventsRepository } from './interfaces/event-repository';

export function createEventsRepository(db: DrizzleDbType): EventsRepository {
  return createEventsDrizzleRepository(db);
}
