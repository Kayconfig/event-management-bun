export class ErrEventNotFound extends Error {
  constructor(message: string) {
    super(message);
  }

  static create(message: string): ErrEventNotFound {
    return new ErrEventNotFound(message);
  }
}
