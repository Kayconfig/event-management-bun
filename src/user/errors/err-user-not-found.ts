export class ErrUserNotFound extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrUserNotFound {
    return new ErrUserNotFound(msg);
  }
}
