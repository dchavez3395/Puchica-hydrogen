/**
 * Tiny logger that prefixes every message with `[puchica]` and no-ops in
 * production browsers. Server-side diagnostics (rewriter bypasses,
 * deferred-query failures, action errors) remain observable in Oxygen logs
 * without shipping `console.*` to shoppers' DevTools.
 *
 * Why this exists: the audit found five `console.error` call sites that
 * ship to the user's browser console. In production, an error from a
 * deferred query (e.g. footer menu failed) is a non-fatal warning for
 * the merchant, not a customer-facing message.
 *
 * Usage:
 *   import {log, warn, error} from '~/lib/logger';
 *   warn('rewriter bypassed for', url);
 *   error('failed to load', err);
 *
 * All three are no-ops only in a production browser.
 */

const PREFIX = '[puchica]';

const isProd = () => {
  try {
    return Boolean(import.meta.env?.PROD);
  } catch {
    return false;
  }
};

export const shouldLog = ({prod = isProd(), browser = typeof document !== 'undefined'} = {}) =>
  !prod || !browser;

export function log(...args) {
  if (!shouldLog()) return;
  // eslint-disable-next-line no-console
  console.log(PREFIX, ...args);
}

export function warn(...args) {
  if (!shouldLog()) return;
   
  console.warn(PREFIX, ...args);
}

export function error(...args) {
  if (!shouldLog()) return;
   
  console.error(PREFIX, ...args);
}
