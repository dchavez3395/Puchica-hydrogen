# Organic release execution — 2026-08-10

## Production code

- Commit: `96bebf092110cbf932b798a71659916d641aca09`
- Oxygen production asset: `4183074`
- Production bundle observed on `puchica.ca`: `entry.client-CoNZOTeK.js`
- Shopify CLI production build, upload, routability verification, and deployment
  all completed with exit code 0.

## Shopify catalog result

- Exactly **9 products are Active**.
- Exactly **29 rejected legacy products are Draft**.
- The active cohort is published to both required publications: `Online Store`
  and Hydrogen `Puchica Storefront`.
- Canada has 10 exact allowlisted SKUs across the 9 pages.
- The United States has 8 exact allowlisted SKUs.
- Packing cubes and the Large Blue storage bag remain Canada-only.
- Ads remain blocked.

## Partial-failure recovery

The first apply attempt safely stopped after quarantining the legacy catalog
because three archived candidate records still owned clean product handles.
No unsafe record became customer-visible. The archived records were kept
archived and renamed to audit-specific handles, freeing these customer URLs:

- `white-luggage-id-tag`
- `large-blue-handled-clothes-storage-bag`
- `black-hanging-travel-toiletry-organizer`

The release controller was strengthened to detect any future non-cohort handle
collision during preflight, before mutations begin. A second dry run passed,
then the idempotent apply completed and its built-in postflight passed.

## Live verification state

The Shopify Admin source of truth confirms 9 Active cohort products with the
required evidence and route tags, and 29 Draft legacy products. Independent
customer-path QA for Canada and the United States is the final release step.
React hydration warnings observed on production are being treated as a hard QA
gate until the clean-client result is known. No paid traffic may start while
that gate is open.
