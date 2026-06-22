---
name: finding-duplicate-functions
description: Use when auditing a codebase for semantic duplication — functions that do the same thing but have different names or implementations. Especially useful for LLM-generated codebases where new functions are often created rather than reusing existing ones.
---

# Finding Duplicate-Intent Functions

## Overview

LLM-generated codebases accumulate semantic duplicates: functions that
serve the same purpose but were implemented independently. Classical
copy-paste detectors (jscpd) find syntactic duplicates but miss "same
intent, different implementation."

This skill uses a two-phase approach: classical extraction followed by
LLM-powered intent clustering.

## When to Use

- Codebase has grown organically with multiple contributors (human or
  LLM)
- You suspect utility functions have been reimplemented multiple times
- Before major refactoring to identify consolidation opportunities
- After jscpd has been run and syntactic duplicates are already handled

## Quick Reference

| Phase | Tool | Model | Output |
|-------|------|-------|--------|
| 1. Extract | `scripts/extract-functions.sh` | - | `catalog.json` |
| 2. Categorize | `scripts/categorize-prompt.md` | haiku | `categorized.json` |
| 3. Split | `scripts/prepare-category-analysis.sh` | - | `categories/*.json` |
| 4. Detect | `scripts/find-duplicates-prompt.md` | opus | `duplicates/*.json` |
| 5. Report | `scripts/generate-report.sh` | - | `report.md` |

## Process

```
1. Extract function catalog
     ↓
2. Categorize by domain (haiku subagent)
     ↓
3. Split into categories
     ↓
4. Find duplicates per category (opus subagent per category)
     ↓
5. Generate report
     ↓
6. Human review & consolidate
```

### Phase 1: Extract Function Catalog

```bash
./scripts/extract-functions.sh src/ -o catalog.json
```

Options:
- `-o FILE`: Output file (default: stdout)
- `-c N`: Lines of context to capture (default: 15)
- `-t GLOB`: File types (default: `*.ts,*.tsx,*.js,*.jsx`)
- `--include-tests`: Include test files (excluded by default)

Test files (`*.test.*`, `*.spec.*`, `__tests__/**`) are excluded by
default since test utilities are less likely to be consolidation
candidates.

### Phase 2: Categorize by Domain

Dispatch a **haiku** subagent using the prompt in
`scripts/categorize-prompt.md`. In OpenClaw, use `sessions_spawn` with
model `ollama/gemma4:latest` (8B) for the categorization step — it
doesn't need Opus, but per MEMORY.md, gemma4 narrates plans rather
than executing. Verify the output is valid JSON before proceeding.

Insert the contents of `catalog.json` where indicated in the prompt
template. Save output as `categorized.json`.

### Phase 3: Split into Categories

```bash
./scripts/prepare-category-analysis.sh categorized.json ./categories
```

Creates one JSON file per category. Only categories with 3+ functions
are worth analyzing.

### Phase 4: Find Duplicates (Per Category)

For each category file in `./categories/`, dispatch an **opus**
subagent using the prompt in `scripts/find-duplicates-prompt.md`.

In OpenClaw, model `ollama/qwen3.6:latest` is the closest analog to
Opus (36B vs 8B), but it currently fails to load on this host
(14 GB OOM; per MEMORY.md). For now, do this phase inline rather than
delegating, or use cloud Opus via Ollama-cloud if available.

Save each output as `./duplicates/{category}.json`.

### Phase 5: Generate Report

```bash
./scripts/generate-report.sh ./duplicates ./duplicates-report.md
```

Produces a prioritized markdown report grouped by confidence level.

### Phase 6: Human Review

Review the report. For HIGH confidence duplicates:
1. Verify the recommended survivor has tests
2. Update callers to use the survivor
3. Delete the duplicates
4. Run tests

## High-Risk Duplicate Zones

Focus extraction on these areas first — they accumulate duplicates
fastest:

| Zone | Common Duplicates |
|------|-------------------|
| `utils/`, `helpers/`, `lib/` | General utilities reimplemented |
| Validation code | Same checks written multiple ways |
| Error formatting | Error-to-string conversions |
| Path manipulation | Joining, resolving, normalizing paths |
| String formatting | Case conversion, truncation, escaping |
| Date formatting | Same formats implemented repeatedly |
| API response shaping | Similar transformations for different endpoints |

## Common Mistakes

**Extracting too much**: Focus on exported functions and public methods.
Internal helpers are less likely to be duplicated across files.

**Skipping the categorization step**: Going straight to duplicate
detection on the full catalog produces noise. Categories focus the
comparison.

**Using haiku for duplicate detection**: Haiku is cost-effective for
categorization but misses subtle semantic duplicates. Use Opus for the
actual duplicate analysis.

**Consolidating without tests**: Before deleting duplicates, ensure
the survivor has tests covering all use cases of the deleted functions.

## OpenClaw adaptation

**Tools required by the upstream scripts (not yet ported):**
- `ripgrep` (rg) — present in PATH, works
- `jq` — present in PATH, works
- `bash` — works under Git Bash; PowerShell paths work too

**Scripts to port** (currently in `TBD.md` placeholders):
- `scripts/extract-functions.sh` — bash + ripgrep + jq; should port
  cleanly to PowerShell or run via Git Bash
- `scripts/categorize-prompt.md` — pure markdown prompt, easy copy
- `scripts/find-duplicates-prompt.md` — pure markdown prompt, easy copy
- `scripts/prepare-category-analysis.sh` — bash + jq
- `scripts/generate-report.sh` — bash + jq

For the Puchica repo specifically: the codebase is small (102 source
files per the audit) and LLM-generated. A useful first pass would
focus on `app/components/` and `app/lib/` since those are where
utilities cluster.

## Porting note

Source: `C:\Users\dchav\.claude\skills\finding-duplicate-functions\SKILL.md`
(Anthropic). Methodology preserved verbatim. OpenClaw adaptations:
- Subagent model mapping: haiku → `ollama/gemma4:latest` (with
  verification per MEMORY.md), opus → currently not loadable locally
  (qwen3.6 36B OOMs) so use inline or cloud Ollama Opus
- "human partner" → "the user / Daniel" throughout
- Scripts TBD section: the upstream scripts require ripgrep + jq
  (which work) but haven't been ported yet — list them as
  placeholders for the next shift

Phase 2 categorization note: OpenClaw's gemma4 8B is unreliable for
multi-step tasks. If categorization fails, fall back to a manual
review of `catalog.json` grouped by file path prefix.
