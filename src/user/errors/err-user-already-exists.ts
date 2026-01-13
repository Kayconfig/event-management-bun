export class ErrUserAlreadyExists extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrUserAlreadyExists {
    return new ErrUserAlreadyExists(msg);
  }
}
