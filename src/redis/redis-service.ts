import { Redis } from 'ioredis';
import { getSecretOrThrow } from '../config/get-secret';
import { ErrRedisNotInitialized } from './error/err-redis-not-initialized.error';
import type { RedisService } from './interfaces/redis-service';

export function createRedisService(): RedisService {
  let redisClient: Redis | null = null;
  const getClient = (): Redis => {
    if (!redisClient) {
      throw ErrRedisNotInitialized.create();
    }
    return redisClient;
  };
  return {
    async connect() {
      if (!redisClient) {
        redisClient = new Redis({
          host: getSecretOrThrow('REDIS_HOST'),
          port: getSecretOrThrow('REDIS_PORT'),
          lazyConnect: true,
        });
        await redisClient.connect();
      }
    },

    async disconnect() {
      if (redisClient) {
        await redisClient.quit();
      }
    },

    async get(key) {
      const client = getClient();
      return await client.get(key);
    },

    async set(key, value, ttl) {
      const client = getClient();
      client.set(key, value, 'EX', ttl);
    },
    getClient,
  };
}
