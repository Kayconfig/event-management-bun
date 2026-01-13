import { type FastifyInstance } from 'fastify';
import { dependencyUtils } from '../common/utils/dependency-utils';
import { createUserRepository } from './user-repository';
import { createUserService } from './user-service';

export function initializeUserModule(app: FastifyInstance) {
  const repository = createUserRepository(app);
  const service = createUserService(repository);
  dependencyUtils.setUserService(app, service);
}
