import { describe, it, expect, mock, beforeEach, spyOn } from 'bun:test';
import { createEventsService } from './service';
import { type Event, type Reservation, type NewReservation } from '../database/drizzle/schema';
import { type EventsRepository } from './interfaces/event-repository';
import { type ReservationService } from '../reservations/interfaces/reservation-service';
import { type DistributedService } from '../redis/interfaces/distributed-service';
import { type CreateEventDto } from './dtos/create-event-dto';
import { ErrEventNotFound } from './errors/err-event-not-found';
import { ErrEventFullyBooked } from './errors/err-event-fully-booked';
import { ErrHighDemandOnEvents } from './errors/err-high-demand-on-event';

describe('EventsService', () => {
  let mockEventsRepo: EventsRepository;
  let mockReservationService: ReservationService;
  let mockDistributedService: DistributedService;
  let eventsService: any;

  beforeEach(() => {
    mockEventsRepo = {
      findById: mock(),
      createEvent: mock(),
    };

    mockReservationService = {
      getCountForEvent: mock(),
      create: mock(),
    };

    mockDistributedService = {
      getLock: mock(),
      releaseLock: mock(),
    };

    eventsService = createEventsService(mockEventsRepo, mockReservationService, mockDistributedService);
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      const eventId = 'event-123';
      const expectedEvent: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-456',
        createdAt: new Date(),
      };

      mockEventsRepo.findById.mockResolvedValueOnce(expectedEvent);

      const result = await eventsService.findById(eventId);

      expect(mockEventsRepo.findById).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedEvent);
    });

    it('should throw ErrEventNotFound when event not found', async () => {
      const eventId = 'nonexistent-event';

      mockEventsRepo.findById.mockResolvedValueOnce(null);

      try {
        await eventsService.findById(eventId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrEventNotFound);
        expect(error.message).toContain(eventId);
      }
    });

    it('should propagate errors from repository', async () => {
      const eventId = 'event-123';
      const repoError = new Error('Database connection failed');

      mockEventsRepo.findById.mockRejectedValueOnce(repoError);

      try {
        await eventsService.findById(eventId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBe(repoError);
      }
    });
  });

  describe('reserveSeat', () => {
    it('should successfully reserve a seat when event exists and has available seats', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const expectedReservation: Reservation = {
        id: 'reservation-123',
        eventId,
        userId,
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(50); // 50 reservations, 100 total seats
      mockReservationService.create.mockResolvedValueOnce(expectedReservation);

      const result = await eventsService.reserveSeat(eventId, userId);

      expect(mockDistributedService.getLock).toHaveBeenCalledWith(`event-${eventId}`);
      expect(mockEventsRepo.findById).toHaveBeenCalledWith(eventId);
      expect(mockReservationService.getCountForEvent).toHaveBeenCalledWith(eventId);
      expect(mockReservationService.create).toHaveBeenCalledWith({
        eventId,
        userId,
      });
      expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      expect(result).toEqual(expectedReservation);
    });

    it('should throw ErrEventNotFound when event does not exist', async () => {
      const eventId = 'nonexistent-event';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(null);

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrEventNotFound);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should throw ErrEventFullyBooked when event is fully booked', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(100); // Fully booked

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrEventFullyBooked);
        expect(error.message).toContain(eventId);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should throw ErrEventFullyBooked when reservations exceed total seats', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 50,
        userId: 'user-789',
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(51); // More reservations than seats

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrEventFullyBooked);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should allow reservation when reservations equal total seats minus one', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const expectedReservation: Reservation = {
        id: 'reservation-123',
        eventId,
        userId,
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(99); // One seat left
      mockReservationService.create.mockResolvedValueOnce(expectedReservation);

      const result = await eventsService.reserveSeat(eventId, userId);

      expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      expect(result).toEqual(expectedReservation);
    });

    it('should propagate errors from getCountForEvent', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const countError = new Error('Failed to get reservation count');

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockRejectedValueOnce(countError);

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBe(countError);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should propagate errors from create reservation', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const createError = new Error('Failed to create reservation');

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(50);
      mockReservationService.create.mockRejectedValueOnce(createError);

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBe(createError);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });
  });

  describe('createEvent', () => {
    it('should successfully create an event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'New Event',
        totalSeats: 200,
      };
      const userId = 'user-123';

      const expectedEvent: Event = {
        id: 'event-456',
        name: 'New Event',
        totalSeats: 200,
        userId,
        createdAt: new Date(),
      };

      mockEventsRepo.createEvent.mockResolvedValueOnce(expectedEvent);

      const result = await eventsService.createEvent(createEventDto, userId);

      expect(mockEventsRepo.createEvent).toHaveBeenCalledWith({
        name: 'New Event',
        totalSeats: 200,
        userId,
      });
      expect(result).toEqual(expectedEvent);
    });

    it('should propagate errors from repository createEvent', async () => {
      const createEventDto: CreateEventDto = {
        name: 'New Event',
        totalSeats: 200,
      };
      const userId = 'user-123';

      const createError = new Error('Failed to create event');

      mockEventsRepo.createEvent.mockRejectedValueOnce(createError);

      try {
        await eventsService.createEvent(createEventDto, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBe(createError);
      }
    });
  });

  describe('distributed locking', () => {
    it('should throw ErrHighDemandOnEvents when unable to acquire lock', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';

      mockDistributedService.getLock.mockResolvedValueOnce(null); // Lock not acquired

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrHighDemandOnEvents);
        expect(error.message).toContain(eventId);
        expect(error.message).toContain('high demand on event');
      }
    });

    it('should release lock even when findById throws an error', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockRejectedValueOnce(new Error('Database error'));

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Database error');
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should release lock when reservation creation fails', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(50);
      mockReservationService.create.mockRejectedValueOnce(new Error('Reservation failed'));

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Reservation failed');
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should use correct resource key for locking', async () => {
      const eventId = 'event-456';
      const userId = 'user-123';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 100,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const expectedReservation: Reservation = {
        id: 'reservation-123',
        eventId,
        userId,
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(50);
      mockReservationService.create.mockResolvedValueOnce(expectedReservation);

      await eventsService.reserveSeat(eventId, userId);

      expect(mockDistributedService.getLock).toHaveBeenCalledWith(`event-${eventId}`);
    });
  });

  describe('edge cases', () => {
    it('should handle event with zero total seats (should not allow reservations)', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 0,
        userId: 'user-789',
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(0);

      try {
        await eventsService.reserveSeat(eventId, userId);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(ErrEventFullyBooked);
        expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      }
    });

    it('should handle event with minimum seats (1 seat)', async () => {
      const eventId = 'event-123';
      const userId = 'user-456';
      const mockLock = { unlock: mock() };

      const event: Event = {
        id: eventId,
        name: 'Test Event',
        totalSeats: 1,
        userId: 'user-789',
        createdAt: new Date(),
      };

      const expectedReservation: Reservation = {
        id: 'reservation-123',
        eventId,
        userId,
        createdAt: new Date(),
      };

      mockDistributedService.getLock.mockResolvedValueOnce(mockLock);
      mockDistributedService.releaseLock.mockResolvedValueOnce(undefined);
      mockEventsRepo.findById.mockResolvedValueOnce(event);
      mockReservationService.getCountForEvent.mockResolvedValueOnce(0);
      mockReservationService.create.mockResolvedValueOnce(expectedReservation);

      const result = await eventsService.reserveSeat(eventId, userId);

      expect(mockDistributedService.releaseLock).toHaveBeenCalledWith(mockLock);
      expect(result).toEqual(expectedReservation);
    });
  });
});