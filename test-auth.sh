#!/usr/bin/env bun

/**
 * Test runner script for the auth service
 * Usage: bun run test:auth
 */

import { spawn } from 'child_process';

const testProcess = spawn('bun', ['test', 'src/auth/auth-service.test.ts'], {
  stdio: 'inherit',
  shell: true,
});

testProcess.on('exit', (code) => {
  process.exit(code || 0);
});