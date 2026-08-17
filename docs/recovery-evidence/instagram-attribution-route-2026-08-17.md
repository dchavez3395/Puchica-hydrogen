# Instagram attribution route — 2026-08-17

## Outcome

The Instagram-only operating plan now has a stable first-party attribution
route prepared and verified in a private Oxygen preview. It is not yet in
Production, and the Instagram profile was not edited.

## Why this change was needed

- The existing Instagram profile link uses `utm_source=ig` and
  `utm_medium=social` but has no campaign value.
- Shopify analytics from August 15 through the checkpoint showed 18 sessions:
  16 without UTM values, one `codex_qa / measurement` session, and one
  `meta_setup_test / organic` session.
- Shopify reported no Instagram-attributed session, completed checkout or
  order in that period. The current blank traffic cannot be credited to
  Instagram without evidence.

## Prepared route

`/instagram` redirects to the storefront root and overwrites the attribution
fields with this fixed set while preserving unrelated click identifiers:

- source: `instagram`
- medium: `organic_social`
- campaign: `travel_edit_organic_202608`
- content: `profile_bio`

The redirect is temporary, non-cacheable and non-indexable.

## Verification

- Full test suite: **106/106 passed**.
- Lint: zero errors; existing unrelated warnings only.
- Production build: passed.
- Private Oxygen preview: passed.
- Preview response: `302` to the storefront root with the four fixed UTM
  values and a preserved verification click identifier.
- No production deployment, profile edit, content publication, ad spend,
  payment, supplier order or store-setting change was made.

## Remaining user-only boundary

1. Complete Shopify's interactive confirmation to promote the verified build
   to Production.
2. After the live `/instagram` response is checked, approve changing the
   Instagram profile URL to `https://puchica.ca/instagram`.

Until both steps are complete, keep the current profile link unchanged and do
not infer Instagram demand from unattributed sessions.
