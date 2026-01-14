import type { OffsetPaginationDto } from '../../common/dtos/offset-pagination.dto';
import type { Event, Reservation } from '../../database/drizzle/schema';
import type { CreateEventDto } from '../dtos/create-event-dto';

export interface EventsService {
  /**
   * Gets the event by id
   * @param eventId event id
   *
   *
   * @throws ErrEventNotFound
   */
  findById(eventId: string): Promise<Event>;

  /**
   *
   * @param eventId event id
   * @param userId user id
   *
   * @throws ErrEventNotFound
   * @throws ErrEventFullyBooked
   */
  reserveSeat(eventId: string, userId: string): Promise<Reservation>;

  createEvent(dto: CreateEventDto, userId: string): Promise<Event>;

  findByUserId(
    userId: string,
    paginationParams: OffsetPaginationDto
  ): Promise<Event[]>;
}
