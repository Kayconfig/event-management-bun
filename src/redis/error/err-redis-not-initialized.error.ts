export class ErrRedisNotInitialized extends Error {
  constructor() {
    super('redis not initialized');
  }

  static create(): ErrRedisNotInitialized {
    return new ErrRedisNotInitialized();
  }
}
