export class ErrDbNotInitialized extends Error {
  constructor() {
    super('db not initialized');
  }
  static create(): ErrDbNotInitialized {
    return new ErrDbNotInitialized();
  }
}
