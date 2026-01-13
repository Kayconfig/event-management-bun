import type {
  NewReservation,
  Reservation,
} from '../../database/drizzle/schema';

export interface ReservationRepository {
  getReservationCountForEvent(eventId: string): Promise<number>;
  create(data: NewReservation): Promise<Reservation>;
}
