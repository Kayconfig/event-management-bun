import type { OffsetPaginationDto } from '../../common/dtos/offset-pagination.dto';
import type {
  Event,
  NewEvent,
  Reservation,
} from '../../database/drizzle/schema';

export interface EventsRepository {
  findById(eventId: string): Promise<Event | null>;
  createEvent(newEvent: NewEvent): Promise<Event>;
  findByUserId(
    userId: string,
    paginationParams: OffsetPaginationDto
  ): Promise<Event[]>;
  findReservationsByUserId(
    userId: string,
    paginationParams: OffsetPaginationDto
  ): Promise<Reservation[]>;
}
