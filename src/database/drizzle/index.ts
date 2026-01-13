import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getSecretOrThrow } from '../../config/get-secret';
import { ErrDbNotInitialized } from '../errors/err-db-not-initialized';
import * as schema from './schema';

const pool = new Pool({ connectionString: getSecretOrThrow('DATABASE_URL') });
export type DrizzleDbType = NodePgDatabase<typeof schema>;
let db: DrizzleDbType | null = null;

export function getDb(): DrizzleDbType {
  if (!db) {
    throw ErrDbNotInitialized.create();
  }
  return db;
}

export async function connectDb() {
  db = drizzle(pool, { schema });
}
export async function disconnectDb() {
  await pool.end();
}
