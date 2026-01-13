import { type ReservationRepository } from './interfaces/reservation-repository';
import { type ReservationService } from './interfaces/reservation-service';

export function createReservationService(
  repository: ReservationRepository
): ReservationService {
  return {
    async getCountForEvent(eventId) {
      return await repository.getReservationCountForEvent(eventId);
    },
    async create(newReservation) {
      try {
        return await repository.create(newReservation);
      } catch (error) {
        // TODO: handle unique error
        throw error;
      }
    },
  };
}
