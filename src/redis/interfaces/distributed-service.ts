import { Lock } from 'redlock';

export interface DistributedService {
  getLock(resourceKey: string): Promise<Lock | null>;
  releaseLock(lock: Lock | null): Promise<void>;
}
