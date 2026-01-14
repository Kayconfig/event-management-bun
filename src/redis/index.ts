import type { FastifyInstance } from 'fastify';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { createDistributedService } from './distributed-service';
import { createRedisService } from './redis-service';

export async function initializeRedisModule(app: FastifyInstance) {
  const redisService = createRedisService();
  await redisService.connect();
  const redisClients = [redisService.getClient()];
  const distributedService = createDistributedService(redisClients, {
    log: app.log.info,
    warn: app.log.warn,
  });
  dependencyUtils.setDistributedService(app, distributedService);
}
