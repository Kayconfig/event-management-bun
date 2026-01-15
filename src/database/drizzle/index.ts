import {
  drizzle,
  NodePgDatabase,
  type NodePgClient,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ErrDbNotInitialized } from '../errors/err-db-not-initialized';
import * as schema from './schema';

let pool: Pool | null = null;
export type DrizzleDbType = NodePgDatabase<typeof schema> & {
  $client: NodePgClient;
};
let db: DrizzleDbType | null = null;

export function getDb(): DrizzleDbType {
  if (!db) {
    throw ErrDbNotInitialized.create();
  }
  return db;
}

export async function connectDb(dbUrl: string) {
  if (!pool) {
    pool = new Pool({ connectionString: dbUrl });
  }
  db = drizzle(pool, { schema });
  return db;
}
export async function disconnectDb() {
  if (!pool) {
    throw new Error('database pool not initialized');
  }
  await pool.end();
}
