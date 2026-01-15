import type { FastifyInstance } from 'fastify';
import assert from 'node:assert/strict';
import { after, before, suite, test } from 'node:test';
import { initializeAuthModule } from '../src/auth';
import type { SignUpDto } from '../src/auth/dtos/sign-up.dto';
import type { Event } from '../src/database/drizzle/schema';
import { initializeEventsModule } from '../src/events';
import { initializeRedisModule } from '../src/redis';
import { initializeReservationsModule } from '../src/reservations';
import { initializeUserModule } from '../src/user';
import { createTestApp } from './setups/app';
import { setupTestDb, teardownTestDb } from './setups/db';

suite('Booking integration tests', { concurrency: false }, () => {
  let app: FastifyInstance;
  const currentUser: SignUpDto = {
    username: 'test-user',
    password: 'Password123',
  };
  let userToken: string;
  const getAuth = () => ({
    authorization: `Bearer ${userToken}`,
  });

  before(async () => {
    const db = await setupTestDb();
    app = await createTestApp(db, [
      initializeUserModule,
      initializeAuthModule,
      initializeReservationsModule,
      initializeRedisModule,
      initializeEventsModule,
    ]);

    const signUpRes = await app.inject({
      method: 'post',
      url: '/auth/signup',
      payload: currentUser,
    });
    assert.equal(signUpRes.statusCode, 201);
    const signUpResBody = signUpRes.json();
    assert.notEqual(signUpResBody.data.user, undefined);
    assert.notEqual(signUpResBody.data.user, null);
    assert.notEqual(signUpResBody.data.accessToken, undefined);
    assert.notEqual(signUpResBody.data.accessToken, null);
    userToken = signUpResBody.data.accessToken;
  });
  //   beforeEach(async () => {
  //     await clearDb();
  //   });
  after(async () => {
    await teardownTestDb();
  });
  test('Reserving a seat works until full', async () => {
    const authHeader = getAuth();
    console.log({ authHeader });
    const createEventResponse = await app.inject({
      method: 'post',
      url: '/events',
      payload: { name: 'Event 1', totalSeats: 2 },
      headers: authHeader,
    });

    assert.equal(createEventResponse.statusCode, 201);
    const createEventResponseBody = createEventResponse.json();
    assert.notEqual(createEventResponseBody.data.event, undefined);
    const eventData: Event = createEventResponseBody.data.event;
    const reserveUrl = `/events/${eventData.id}/reservations`;

    const res1 = await app.inject({
      method: 'post',
      url: reserveUrl,
      headers: getAuth(),
    });

    assert.equal(res1.statusCode, 201);

    const re2 = await app.inject({
      method: 'post',
      url: reserveUrl,
      headers: getAuth(),
    });

    assert.equal(re2.statusCode, 201);

    const re3 = await app.inject({
      method: 'post',
      url: reserveUrl,
      headers: getAuth(),
    });

    assert.equal(re3.statusCode, 403);
  });
  test.todo('Returns 404 if event does not exist', async () => {});
});
