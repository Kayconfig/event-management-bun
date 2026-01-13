import type {
  NewReservation,
  Reservation,
} from '../../database/drizzle/schema';

export interface ReservationService {
  getCountForEvent(eventId: string): Promise<number>;
  create(newReservation: NewReservation): Promise<Reservation>;
}
