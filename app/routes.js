import {flatRoutes} from '@react-router/fs-routes';
import {hydrogenRoutes} from '@shopify/hydrogen';

const fileRoutes = await flatRoutes();

export default hydrogenRoutes([
  // Keep the former optional locale slot long enough to permanently redirect
  // known /fr, /es, and /pt-br URLs to the unprefixed English launch pages.
  // LocaleBoundary rejects unknown prefixes. Complete translated storefronts
  // can be restored only after their customer-facing content is approved.
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
