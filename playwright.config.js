import {defineConfig} from '@playwright/test';

/**
 * Browser checks run against a deployed storefront, not a local server.
 *
 * Hydrogen needs live Storefront API credentials to render anything, and the
 * CI job that runs these already deploys before it gets here — so pointing at
 * the deployed URL is both simpler and a truer test than booting a preview
 * server with mocked data. `PUCHICA_TARGET` overrides it for a preview
 * deployment or a local `npm run dev`.
 *
 * Note these specs cannot be run from the Anthropic dev container: its egress
 * allowlist does not include puchica.ca. The probe logic they call is proven
 * separately in tests/browser/probes.test.js, which runs anywhere.
 */
export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.js',
  // The site is being read, never written; nothing here races.
  fullyParallel: true,
  // A red-on-flake check gets ignored, which is worse than no check.
  retries: 2,
  reporter: [['list'], ['json', {outputFile: 'reports/browser-checks.json'}]],
  use: {
    baseURL: process.env.PUCHICA_TARGET || 'https://puchica.ca',
    // Production is a real network away; the defaults are too tight.
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
});
