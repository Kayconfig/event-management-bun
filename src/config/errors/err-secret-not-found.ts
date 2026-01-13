export class ErrSecretNotFound extends Error {
  constructor(msg: string) {
    super(msg);
  }

  static create(msg: string): ErrSecretNotFound {
    return new ErrSecretNotFound(msg);
  }
}
