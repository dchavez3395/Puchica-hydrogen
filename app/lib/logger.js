/**
 * Tiny logger that prefixes every message with `[puchica]` and no-ops in
 * production. The intent is to keep server-side diagnostics (rewriter
 * bypasses, deferred-query failures, action errors) observable in dev
 * and Oxygen logs without shipping `console.*` to shoppers' DevTools.
 *
 * Why this exists: the audit found five `console.error` call sites that
 * ship to the user's browser console. In production, an error from a
 * deferred query (e.g. footer menu failed) is a non-fatal warning for
 * the merchant, not a customer-facing message.
 *
 * Usage:
 *   import {log, warn, error} from '~/lib/logger';
 *   warn('rewriter bypassed for', url);    // dev only
 *   error('failed to load', err);          // dev only
 *
 * All three are no-ops in `import.meta.env.PROD`.
 */

const PREFIX = '[puchica]';

const isProd = () => {
  try {
    return Boolean(import.meta.env?.PROD);
  } catch {
    return false;
  }
};

export function log(...args) {
  if (isProd()) return;
  // eslint-disable-next-line no-console
  console.log(PREFIX, ...args);
}

export function warn(...args) {
  if (isProd()) return;
   
  console.warn(PREFIX, ...args);
}

export function error(...args) {
  if (isProd()) return;
   
  console.error(PREFIX, ...args);
}
