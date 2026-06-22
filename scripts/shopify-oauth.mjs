/**
 * Shopify Admin API — OAuth client credentials token helper.
 *
 * Dev Dashboard apps (Spring '26 model) no longer expose a static shpat_ token.
 * Instead, exchange CLIENT_ID + CLIENT_SECRET for a 24-hour access token at
 * runtime. This module handles fetching and in-memory caching so scripts don't
 * mint a new token on every request.
 *
 * Required env vars:
 *   SHOPIFY_CLIENT_ID     — from Dev Dashboard → PuchicaAdmin → Settings
 *   SHOPIFY_CLIENT_SECRET — same page (keep secret, never commit)
 *   PUBLIC_STORE_DOMAIN   — e.g. ug91ve-sz.myshopify.com
 *
 * Usage:
 *   import { getAdminToken, adminGraphQL } from './shopify-oauth.mjs';
 *   const token = await getAdminToken();
 *   const data  = await adminGraphQL('{ shop { name } }');
 */

const TOKEN_REFRESH_BUFFER_S = 300; // refresh 5 min before expiry

let _cache = null; // { token: string, expiresAt: number }

/**
 * Returns a valid Admin API access token, fetching a fresh one if the cached
 * token is absent or within 5 minutes of expiry.
 */
export async function getAdminToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_cache && _cache.expiresAt - now > TOKEN_REFRESH_BUFFER_S) {
    return _cache.token;
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const store = process.env.PUBLIC_STORE_DOMAIN;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET in env. ' +
        'Copy them from Dev Dashboard → PuchicaAdmin → Settings.',
    );
  }
  if (!store) {
    throw new Error('Missing PUBLIC_STORE_DOMAIN in env.');
  }

  const url = `https://${store}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token fetch failed (HTTP ${res.status}): ${body}`);
  }

  const {access_token, expires_in} = await res.json();
  if (!access_token) {
    throw new Error('Token response missing access_token field.');
  }

  _cache = {token: access_token, expiresAt: now + (expires_in ?? 86399)};
  return access_token;
}

/**
 * Convenience wrapper: fetches a token and runs one Admin GraphQL call.
 * Returns the parsed JSON response body (check .errors yourself).
 *
 * @param {string} query  - GraphQL query or mutation string
 * @param {object} [vars] - GraphQL variables
 * @param {string} [store] - override store domain (defaults to PUBLIC_STORE_DOMAIN)
 * @param {string} [apiVersion] - defaults to 2026-04
 */
export async function adminGraphQL(query, vars, {store, apiVersion = '2026-04'} = {}) {
  const token = await getAdminToken();
  const domain = store ?? process.env.PUBLIC_STORE_DOMAIN;
  const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables: vars}),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Admin GraphQL HTTP ${res.status}: ${body}`);
  }

  return res.json();
}
