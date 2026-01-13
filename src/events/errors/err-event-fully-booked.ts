export class ErrEventFullyBooked extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrEventFullyBooked {
    return new ErrEventFullyBooked(msg);
  }
}
