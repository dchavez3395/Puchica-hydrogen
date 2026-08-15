import assert from 'node:assert/strict';
import test from 'node:test';

import {scheduleAnalyticsReady} from '../app/lib/analytics-ready.js';

test('analytics readiness waits for two animation frames and a task', () => {
  const frames = [];
  const tasks = [];
  let readyCalls = 0;

  scheduleAnalyticsReady(
    () => {
      readyCalls += 1;
    },
    {
      raf: (callback) => frames.push(callback),
      defer: (callback) => tasks.push(callback),
    },
  );

  assert.equal(readyCalls, 0);
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(readyCalls, 0);
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(readyCalls, 0);
  assert.equal(tasks.length, 1);

  tasks.shift()();
  assert.equal(readyCalls, 1);
});

test('analytics readiness still defers when animation frames are unavailable', () => {
  const tasks = [];
  let readyCalls = 0;

  scheduleAnalyticsReady(
    () => {
      readyCalls += 1;
    },
    {
      raf: undefined,
      defer: (callback) => tasks.push(callback),
    },
  );

  assert.equal(readyCalls, 0);
  assert.equal(tasks.length, 1);
  tasks.shift()();
  assert.equal(readyCalls, 1);
});
