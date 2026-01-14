export class ErrHighDemandOnEvents extends Error {
  constructor(cause: string, eventId: string) {
    super(`${cause}. high demand on event ${eventId}`);
  }
  static create(cause: string, eventId: string): ErrHighDemandOnEvents {
    return new ErrHighDemandOnEvents(cause, eventId);
  }
}
