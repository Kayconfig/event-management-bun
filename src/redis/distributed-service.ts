import type { Redis } from 'ioredis';
import Redlock from 'redlock';
import type { LogCallback, WarnCallback } from '../common/types/logger';
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
  logger: { log: LogCallback; warn: WarnCallback }
): DistributedService {
  const redlock = createRedLockInstance(redisClients);
  return {
    async getLock(resourceKey: string) {
      try {
        const ttlInMs = 10;
        const lock = await redlock.acquire(resourceKey, ttlInMs);
        logger.log(`lock acquired for ${resourceKey}`);
        return lock;
      } catch (error) {
        logger.warn(`failed to get lock for ${resourceKey}`);
        return null;
      }
    },

    async releaseLock(lock) {
      if (lock) {
        try {
          logger.log(`releasing lock ${lock.value}`);
          await redlock.release(lock);
        } catch (err) {
          logger.warn(`failed to release lock`, err);
        }
      }
    },
  };
}
