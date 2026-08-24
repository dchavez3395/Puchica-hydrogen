# Puchica agency skills — index

**Rewritten 2026-08-24.** The previous version of this file was written on
2026-06-21 for a project that no longer exists, and every session that read it
started from false facts. What it got wrong is recorded at the bottom, because
the failure mode matters more than the file.

## Scope

Three persona files remain. They are **prompt scaffolding, not agents**: you
load one to focus the model on a discipline. They do not act on their own, and
they do not carry authority over the gates.

| File | Use it for |
| --- | --- |
| `frontend-design.md` | Any visual change — colour, type, layout, motion, copy voice |
| `05-frontend-developer.md` | Hydrogen + React Router implementation, JSX, GraphQL |
| `01-seo-specialist.md` | Meta titles, descriptions, structured data, sitemap |

Four files were deleted on 2026-08-24:

- `02-content-creator.md`, `03-ui-designer.md`, `04-ux-architect.md` — raw
  unmodified upstream personas. Generic, never adapted, and available at the
  source repository if wanted. They added volume, not judgement.
- `06-image-prompt-engineer.md` — drove `runners/images/run.py`, which does not
  exist in this repository, to bulk-generate replacement product photography.
  That workflow is now **prohibited**: no generated product image may change the
  actual item, quantity, dimensions, colour, controls or capabilities. Keeping a
  persona whose whole purpose is that workflow was a standing invitation to
  breach the image-fidelity gate.

Upstream is <https://github.com/msitarzewski/agency-agents> (MIT). Browse it
there rather than vendoring more personas into this repo.

## Current project facts

Verified against the live store and `main` on 2026-08-24. **Read
`docs/CURRENT-SCOPE.md` first** — it is canonical and supersedes this file
wherever they disagree.

- **Repo:** this checkout. There is no `E:\` or `D:\` path; earlier files
  written on a Windows machine are historical.
- **Catalog:** six approved offers, gated in `app/lib/launch-catalog.js`. Not
  6,000 products. Any persona instruction that assumes catalog scale — bulk
  rewrites, category taxonomies, mega-menus — is out of scope.
- **Storefront API:** live and working.
- **Admin API:** live and working. The old note that the token was "dead, not
  needed" was wrong and cost real time. The genuine credential issue is a leaked
  Admin-token-shaped secret in Git history that still needs rotating.
- **Markets:** Canada only. The United States is commercially suspended.
- **Paid acquisition:** off. No offer currently passes the acquisition gate.

## What a persona may not do

Personas are prompt scaffolding written by us, not evidence and not authority.
None of them may:

- approve a product, market, price or supplier route — that is
  `launch-catalog.js` plus a fresh DSers quote;
- weaken or bypass an evidence gate, the release gate or the acquisition gate;
- assert a product fact, delivery promise, review, or scarcity claim that is not
  independently evidenced;
- authorize spend, a public post, a supplier payment or a credential change.

If a persona file and a gate disagree, the gate wins and the persona file is
wrong. Fix the file.

## Why the old index was dangerous

It was not merely out of date. It stated confident falsehoods in the voice of
project documentation:

- a dead Admin API that was in fact working;
- a 6,000-product catalog that had been cut to six offers;
- a "currently in flight, don't duplicate" list of June work long since finished;
- Windows paths and a local upstream directory that no session could reach;
- a Phase 2 content-expansion plan for a catalog that no longer exists.

A stale document is worse than a missing one, because a missing document makes a
session go and look. **If you change scope, update or delete the files that
describe the old scope in the same commit.**
