import 'dotenv/config';
import { createApp } from './app.ts';
import { getSecretOrThrow } from './config/get-secret.ts';
import { connectDb } from './database/drizzle/index.ts';

const dbUrl = getSecretOrThrow('DATABASE_URL');
const db = await connectDb(dbUrl);

const app = await createApp(db);
const PORT = getSecretOrThrow('PORT');
app.listen({ port: PORT }, () => {
  app.log.info(`server listening on port ${PORT}`);
});
