import type { FastifyBaseLogger } from 'fastify';
import type { Redis } from 'ioredis';
import Redlock from 'redlock';
import type { DistributedService } from './interfaces/distributed-service';

function createRedLockInstance(redisClients: Redis[]) {
  // using any here because Redlock has not update types to latest redis
  return new Redlock(redisClients as any, {
    retryCount: 3,
    retryDelay: 3,
    retryJitter: 10,
  });
}

export function createDistributedService(
  redisClients: Redis[],
  logger: FastifyBaseLogger
): DistributedService {
  const redlock = createRedLockInstance(redisClients);
  return {
    async getLock(resourceKey: string) {
      try {
        const ttlInMs = 10;
        const lock = await redlock.acquire(resourceKey, ttlInMs);
        logger.info(`lock acquired for ${resourceKey}`);
        return lock;
      } catch (error) {
        logger.info(`failed to get lock for ${resourceKey}`);
        return null;
      }
    },

    async releaseLock(lock) {
      if (lock) {
        try {
          logger.info(`releasing lock ${lock?.value}`);
          await redlock.release(lock);
        } catch (err) {
          logger.info(`failed to release lock: ${lock?.value}`);
        }
      }
    },
  };
}
