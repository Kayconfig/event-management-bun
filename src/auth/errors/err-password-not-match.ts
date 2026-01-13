export class ErrPasswordNotMatch extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrPasswordNotMatch {
    return new ErrPasswordNotMatch(msg);
  }
}
