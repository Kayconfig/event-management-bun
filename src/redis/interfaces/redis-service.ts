import type { Redis } from 'ioredis';

export interface RedisService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  /**
   * get redis client
   * @throws ErrRedisNotInitialized if calling this method when redis is not initialized
   */
  getClient(): Redis;
  /**
   *
   * @param key
   *
   * @throws ErrRedisNotInitialized if calling this method when redis is not initialized
   */
  get(key: string): Promise<string | null>;

  /**
   *
   * @param key
   * @param value
   * @param ttlInSeconds
   *
   *
   * @throws ErrRedisNotInitialized if calling this method when redis is not initialized
   */
  set(key: string, value: string, ttlInSeconds: number): Promise<void>;
}
