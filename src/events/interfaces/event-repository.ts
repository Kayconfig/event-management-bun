import type { Event, NewEvent } from '../../database/drizzle/schema';

export interface EventsRepository {
  findById(eventId: string): Promise<Event | null>;
  createEvent(newEvent: NewEvent): Promise<Event>;
}
