import 'dotenv/config';
import { createApp } from './app.ts';
import { getSecretOrThrow } from './config/get-secret.ts';
import { connectDb, getDb } from './database/drizzle/index.ts';

await connectDb();
const db = getDb();

const app = await createApp(db);
const PORT = getSecretOrThrow('PORT');
app.listen({ port: PORT }, () => {
  app.log.info(`server listening on port ${PORT}`);
});
