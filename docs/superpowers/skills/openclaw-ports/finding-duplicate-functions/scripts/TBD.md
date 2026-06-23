# finding-duplicate-functions — scripts TBD

The upstream `finding-duplicate-functions` skill ships 5 helper scripts
in `C:\Users\dchav\.claude\skills\finding-duplicate-functions\scripts\`.
They have not been ported yet. This file is a placeholder.

## Scripts to port

1. `extract-functions.sh` — bash + ripgrep + jq. Walks a source dir,
   extracts function/method definitions with N lines of context,
   outputs JSON.
2. `categorize-prompt.md` — pure markdown prompt. Used in Phase 2
   to ask a subagent to group the catalog by domain.
3. `find-duplicates-prompt.md` — pure markdown prompt. Used in
   Phase 4 to ask a subagent to find semantic duplicates within
   a category.
4. `prepare-category-analysis.sh` — bash + jq. Splits a categorized
   JSON into per-category files.
5. `generate-report.sh` — bash + jq. Aggregates the per-category
   duplicate reports into a single markdown report.

## Status

None ported. The methodology is captured in `SKILL.md`; the
executable helpers are pending.

## Porting effort

Low. The bash scripts are small (200-400 lines combined) and only
require ripgrep + jq, both of which work in this environment. The
markdown prompts are pure text and can be copy-pasted as-is.

The blocker is time, not complexity. If you need to run
finding-duplicate-functions on the Puchica repo, do the porting
inline first (5-10 min), then run the workflow.

## What works today

Just `SKILL.md`. You can read the methodology and apply it
manually. The scripts automate the boring parts.
