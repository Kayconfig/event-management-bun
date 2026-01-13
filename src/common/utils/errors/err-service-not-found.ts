export class ErrServiceNotFound extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrServiceNotFound {
    return new ErrServiceNotFound(msg);
  }
}
