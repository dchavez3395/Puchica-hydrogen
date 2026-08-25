import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ANALYTICS_READY_DEADLINE_MS,
  scheduleAnalyticsReady,
} from '../app/lib/analytics-ready.js';

/** Collect scheduled frames and timers so each path can be driven by hand. */
function harness() {
  const frames = [];
  const timers = [];
  let readyCalls = 0;

  scheduleAnalyticsReady(
    () => {
      readyCalls += 1;
    },
    {
      raf: (callback) => frames.push(callback),
      defer: (callback, delay) => timers.push({callback, delay}),
    },
  );

  return {
    frames,
    timers,
    calls: () => readyCalls,
    // The deadline is armed first, so the paint path is every timer after it.
    deadline: () => timers.find((t) => t.delay === ANALYTICS_READY_DEADLINE_MS),
  };
}

test('analytics readiness waits for two animation frames and a task', () => {
  const h = harness();

  assert.equal(h.calls(), 0);
  assert.equal(h.frames.length, 1);

  h.frames.shift()();
  assert.equal(h.calls(), 0);
  assert.equal(h.frames.length, 1);

  h.frames.shift()();
  assert.equal(h.calls(), 0);

  const paintTask = h.timers.find((t) => t.delay === 0);
  assert.ok(paintTask, 'the second frame must defer the release by a task');
  paintTask.callback();
  assert.equal(h.calls(), 1);
});

test('analytics readiness still defers when animation frames are unavailable', () => {
  const timers = [];
  let readyCalls = 0;

  scheduleAnalyticsReady(
    () => {
      readyCalls += 1;
    },
    {
      raf: undefined,
      defer: (callback, delay) => timers.push({callback, delay}),
    },
  );

  assert.equal(readyCalls, 0);
  const immediate = timers.find((t) => t.delay === 0);
  assert.ok(immediate, 'with no rAF the release must be deferred by a task');
  immediate.callback();
  assert.equal(readyCalls, 1);
});

test('a tab that never paints still releases the bus on the deadline', () => {
  // This is the failure that was live on puchica.ca. Hydrogen's publish()
  // refuses to deliver ANY event to ANY subscriber until every registered
  // integration reports ready, so a pixel waiting on a frame that never comes
  // silences Shopify's own analytics too. Forcing this one key ready from the
  // console flushed the whole queue, which is how it was found.
  const h = harness();

  // No frames are ever run: a background or throttled tab does not paint.
  assert.equal(h.calls(), 0);

  const deadline = h.deadline();
  assert.ok(deadline, 'a deadline release must be armed');
  deadline.callback();
  assert.equal(h.calls(), 1, 'the deadline must release the bus on its own');
});

test('the deadline is armed before anything that could throw', () => {
  // A raf implementation that throws stands in for any later step failing.
  const timers = [];
  let readyCalls = 0;

  assert.throws(() =>
    scheduleAnalyticsReady(
      () => {
        readyCalls += 1;
      },
      {
        raf: () => {
          throw new Error('no frames here');
        },
        defer: (callback, delay) => timers.push({callback, delay}),
      },
    ),
  );

  const deadline = timers.find((t) => t.delay === ANALYTICS_READY_DEADLINE_MS);
  assert.ok(deadline, 'the deadline must already be armed when raf throws');
  deadline.callback();
  assert.equal(readyCalls, 1);
});

test('the paint path and the deadline together release exactly once', () => {
  // ready() flushes Hydrogen's wait-room queue, so releasing twice would
  // republish every buffered event a second time.
  const h = harness();

  h.frames.shift()();
  h.frames.shift()();
  h.timers.find((t) => t.delay === 0).callback();
  assert.equal(h.calls(), 1);

  h.deadline().callback();
  assert.equal(h.calls(), 1, 'a late deadline must not republish the queue');
});

test('the deadline is short enough to measure and long enough to paint', () => {
  // Two frames at 60Hz is ~33ms; the deadline must sit comfortably above that
  // so a normally painting tab always wins the race, and well below the point
  // where a visitor has bounced.
  assert.ok(ANALYTICS_READY_DEADLINE_MS >= 100);
  assert.ok(ANALYTICS_READY_DEADLINE_MS <= 1000);
});
