import type { FastifyInstance } from 'fastify';
import assert from 'node:assert/strict';
import { after, before, suite, test } from 'node:test';
import { initializeAuthModule } from '../src/auth';
import type { SignUpDto } from '../src/auth/dtos/sign-up.dto';
import { initializeUserModule } from '../src/user';
import { createTestApp } from './setups/app';
import { setupTestDb, teardownTestDb } from './setups/db';

suite('Auth integration tests', { concurrency: false }, () => {
  let app: FastifyInstance;

  before(async () => {
    const db = await setupTestDb();
    app = await createTestApp(db, [
      initializeUserModule,
      initializeAuthModule,
    ]);
  });

  after(async () => {
    await teardownTestDb();
  });

  test('Signup creates user and returns token', async () => {
    const signupPayload: SignUpDto = {
      username: 'testuser',
      password: 'Password123',
    };

    const res = await app.inject({
      method: 'post',
      url: '/auth/signup',
      payload: signupPayload,
    });

    assert.equal(res.statusCode, 201);
    const body = res.json();
    assert.notEqual(body.data.user, undefined);
    assert.notEqual(body.data.accessToken, undefined);
    assert.equal(body.data.user.username, 'testuser');
  });

  test('Signup with existing username returns 409', async () => {
    const signupPayload: SignUpDto = {
      username: 'existinguser',
      password: 'Password123',
    };

    // First signup
    await app.inject({
      method: 'post',
      url: '/auth/signup',
      payload: signupPayload,
    });

    // Second signup with same username
    const res = await app.inject({
      method: 'post',
      url: '/auth/signup',
      payload: signupPayload,
    });

    assert.equal(res.statusCode, 409);
    const body = res.json();
    assert(body.errors.includes('username already exists'));
  });

  test('Signin with correct credentials returns token', async () => {
    const signupPayload: SignUpDto = {
      username: 'signinuser',
      password: 'Password123',
    };

    // Signup first
    await app.inject({
      method: 'post',
      url: '/auth/signup',
      payload: signupPayload,
    });

    // Signin
    const res = await app.inject({
      method: 'post',
      url: '/auth/signin',
      payload: {
        username: 'signinuser',
        password: 'Password123',
      },
    });

    assert.equal(res.statusCode, 201);
    const body = res.json();
    assert.notEqual(body.data.user, undefined);
    assert.notEqual(body.data.accessToken, undefined);
    assert.equal(body.data.user.username, 'signinuser');
  });

  test('Signin with wrong password returns 401', async () => {
    const res = await app.inject({
      method: 'post',
      url: '/auth/signin',
      payload: {
        username: 'testuser',
        password: 'WrongPassword',
      },
    });

    assert.equal(res.statusCode, 401);
  });

  test('Signin with non-existent user returns 401', async () => {
    const res = await app.inject({
      method: 'post',
      url: '/auth/signin',
      payload: {
        username: 'nonexistent',
        password: 'Password123',
      },
    });

    assert.equal(res.statusCode, 401);
  });
});