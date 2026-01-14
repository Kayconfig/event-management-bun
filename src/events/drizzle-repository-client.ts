import { eq } from 'drizzle-orm';
import { type DrizzleDbType } from '../database/drizzle';
import { events } from '../database/drizzle/schema';
import { type EventsRepository } from './interfaces/event-repository';

export function createEventsDrizzleRepository(
  db: DrizzleDbType
): EventsRepository {
  return {
    async findById(eventId) {
      const event = await db.query.events.findFirst({
        where: eq(events.id, eventId),
      });
      return event ?? null;
    },

    async createEvent(newEvent) {
      const [event] = await db.insert(events).values(newEvent).returning();
      if (!event) {
        throw new Error(
          'eventRepository.createEvent failed. event should be created'
        );
      }
      return event;
    },
    async findByUserId(userId, paginationParams) {
      const { limit, skip } = paginationParams;
      const userEvents = await db.query.events.findMany({
        where: eq(events.userId, userId),
        offset: skip,
        limit,
      });
      return userEvents;
    },
  };
}
