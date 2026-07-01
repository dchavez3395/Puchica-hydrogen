import {flatRoutes} from '@react-router/fs-routes';
import {hydrogenRoutes} from '@shopify/hydrogen';

const fileRoutes = await flatRoutes();

export default hydrogenRoutes([
  // URL-based locales: every file route is mounted under an OPTIONAL `:locale?`
  // segment, so English serves unprefixed (`/products/x`) while French /
  // Spanish / Portuguese serve under `/fr`, `/es`, `/pt-br`. LocaleBoundary
  // validates the segment and 404s unknown prefixes. The language the
  // Storefront API queries with is resolved from the URL in
  // getLocaleFromRequest (app/lib/i18n.js). See docs/plan-url-locales-hreflang.md.
  //
  // NOTE: verify against `npm run dev` before shipping — RR match ranking for
  // single-segment paths and resource routes (sitemap.xml, robots.txt) under an
  // optional dynamic parent is the thing to confirm. To revert, replace this
  // whole array with `...fileRoutes`.
  {
    path: ':locale?',
    file: 'components/LocaleBoundary.jsx',
    children: fileRoutes,
  },
]);

/** @typedef {import('@react-router/dev/routes').RouteConfig} RouteConfig */
