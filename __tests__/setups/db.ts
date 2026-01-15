import { pushSchema } from 'drizzle-kit/api';
import { sql } from 'drizzle-orm';
import { getSecretOrThrow } from '../../src/config/get-secret';
import {
  connectDb,
  disconnectDb,
  type DrizzleDbType,
} from '../../src/database/drizzle';
import * as schema from '../../src/database/drizzle/schema';

async function createTables() {
  const db = getDb();
  console.log('creating tables...');
  const result = await pushSchema(schema, db as any);
  await result.apply();
  console.log('done creating tables.');
}

let cachedDb: DrizzleDbType | null = null;

function getDb(): DrizzleDbType {
  if (!cachedDb) {
    throw new Error('database not initialized yet');
  }
  return cachedDb;
}

export async function setupTestDb(): Promise<DrizzleDbType> {
  const dbUrl = getSecretOrThrow('TEST_DATABASE_URL');
  cachedDb = await connectDb(dbUrl);
  await createTables();
  return cachedDb;
}

export async function clearDb() {
  const db = getDb();
  const schemas = db._.schema;
  if (!schemas) {
    return;
  }
  console.log('🗑️ emptying all db tables');
  const queries = Object.values(schemas).map((tableSchema) => {
    console.log(`preparing truncate query for table ${tableSchema.dbName}`);
    return sql.raw(`truncate table ${tableSchema.dbName} cascade;`);
  });
  await db.transaction(async (tx) => {
    for (const query of queries) {
      await tx.execute(query);
    }
  });
  console.log('Tables emptied');
}

export async function teardownTestDb() {
  await clearDb();
  await disconnectDb();
}
