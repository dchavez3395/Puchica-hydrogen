import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {shouldLog} from '../app/lib/logger.js';

test('production server diagnostics remain visible while browser logs are quiet', () => {
  assert.equal(shouldLog({prod: true, browser: false}), true);
  assert.equal(shouldLog({prod: true, browser: true}), false);
  assert.equal(shouldLog({prod: false, browser: true}), true);
});

test('deployment is gated by tests, release checks, build, deploy, and live health', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  const commands = [
    'npm test',
    'npm run launch-check',
    'npm run build',
    'shopify hydrogen deploy',
    'npm run production-health',
  ];
  let previousIndex = -1;

  for (const command of commands) {
    const index = workflow.indexOf(command);
    assert.ok(index > previousIndex, `${command} must exist in deployment order`);
    previousIndex = index;
  }
});
