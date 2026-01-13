import { count, eq } from 'drizzle-orm';
import { type DrizzleDbType } from '../database/drizzle';
import {
  type NewReservation,
  type Reservation,
  reservations,
} from '../database/drizzle/schema';
import { type ReservationRepository } from './interfaces/reservation-repository';

export function createReservationDrizzleRepository(
  db: DrizzleDbType
): ReservationRepository {
  const getReservationCountForEvent = async (
    eventId: string
  ): Promise<number> => {
    const [result] = await db
      .select({ count: count() })
      .from(reservations)
      .where(eq(reservations.eventId, eventId));

    if (!result) {
      return 0;
    }
    return result.count;
  };

  const create = async (data: NewReservation): Promise<Reservation> => {
    const [newReservation] = await db
      .insert(reservations)
      .values(data)
      .returning();

    if (!newReservation) {
      throw new Error(
        'reservationsRepository.create error. reservation should be created'
      );
    }

    return newReservation;
  };

  return {
    getReservationCountForEvent,
    create,
  };
}
