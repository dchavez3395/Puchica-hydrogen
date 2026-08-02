import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';

/**
 * React Router 7.9.x Configuration for Hydrogen
 *
 * This configuration uses the official Hydrogen preset to provide optimal
 * React Router settings for Shopify Oxygen deployment. The preset enables
 * validated performance optimizations while ensuring compatibility.
 */
export default {
  presets: [hydrogenPreset()],
  // Keep the complete route manifest in the initial document. The storefront
  // has a small, stable route set, so this modest payload tradeoff removes the
  // unauthenticated /__manifest discovery endpoint while Hydrogen remains on
  // React Router 7.16.x.
  routeDiscovery: {mode: 'initial'},
};

/** @typedef {import('@react-router/dev/config').Config} Config */
