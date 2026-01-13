import type { Event, Reservation } from '../database/drizzle/schema';
import type { ReservationService } from '../reservations/interfaces/reservation-service';
import type { CreateEventDto } from './dtos/create-event-dto';
import { ErrEventFullyBooked } from './errors/err-event-fully-booked';
import { ErrEventNotFound } from './errors/err-event-not-found';
import type { EventsRepository } from './interfaces/event-repository';
import type { EventsService } from './interfaces/event-service';

export function createEventsService(
  repo: EventsRepository,
  reservationService: ReservationService
): EventsService {
  const findById = async (eventId: string): Promise<Event> => {
    const event = await repo.findById(eventId);
    if (!event) {
      throw ErrEventNotFound.create(
        `findById failed. event with id ${eventId} not found`
      );
    }

    return event;
  };

  const reserveSeat = async (
    eventId: string,
    userId: string
  ): Promise<Reservation> => {
    const event = await findById(eventId);
    const existingReservations = await reservationService.getCountForEvent(
      eventId
    );

    if (existingReservations >= event.totalSeats) {
      throw ErrEventFullyBooked.create(
        `reserveSeat failed. event id: ${eventId} fully booked`
      );
    }
    const reservation = await reservationService.create({
      eventId,
      userId,
    });

    return reservation;
  };

  const createEvent = async (
    newEvent: CreateEventDto,
    userId: string
  ): Promise<Event> => {
    return await repo.createEvent({
      name: newEvent.name,
      totalSeats: newEvent.totalSeats,
      userId,
    });
  };

  return { findById, reserveSeat, createEvent };
}
