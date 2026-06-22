---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace, or before executing implementation plans. Ensures an isolated workspace exists via native tools or git worktree fallback.
---

# Using Git Worktrees

## Overview

Ensure work happens in an isolated workspace. Prefer your platform's
native worktree tools. Fall back to manual git worktrees only when no
native tool is available.

**Core principle:** Detect existing isolation first. Then use native
tools. Then fall back to git. Never fight the harness.

**Announce at start:** "I'm using the using-git-worktrees skill to set
up an isolated workspace."

## Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated
workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git
submodules. Before concluding "already in a worktree," verify you are
not in a submodule:

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already
in a linked worktree. Skip to Step 2 (Project Setup). Do NOT create
another worktree.

Report with branch state:
- On a branch: "Already in isolated workspace at `<path>` on branch
  `<name>`."
- Detached HEAD: "Already in isolated workspace at `<path>` (detached
  HEAD, externally managed). Branch creation needed at finish time."

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** You are in a
normal repo checkout.

Has the user already indicated their worktree preference in your
instructions? If not, ask for consent before creating a worktree:

> "Would you like me to set up an isolated worktree? It protects your
> current branch from changes."

Honor any existing declared preference without asking. If the user
declines consent, work in place and skip to Step 2.

## Step 1: Create Isolated Workspace

**You have two mechanisms. Try them in this order.**

### 1a. Native Worktree Tools (preferred)

The user has asked for an isolated workspace (Step 0 consent). Do you
already have a way to create a worktree? In OpenClaw, the equivalent
is `sessions_spawn` with a clean context — that *is* a worktree, just
a process-level one rather than a filesystem one.

If you have a clean subagent context available, prefer that over
`git worktree add`. Spawn the subagent, do the work, return. The
parent session's filesystem state is untouched.

Only proceed to Step 1b if you do not have a clean subagent context
or you need filesystem-level isolation (e.g. parallel work on
different branches that needs to coexist on disk).

### 1b. Git Worktree Fallback

**Only use this if Step 1a does not apply** — you have no clean
subagent context or you need filesystem-level isolation.

#### Directory Selection

Follow this priority order. Explicit user preference always beats
observed filesystem state.

1. **Check your instructions for a declared worktree directory
   preference.** If the user has already specified one, use it
   without asking.

2. **Check for an existing project-local worktree directory:**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   If found, use it. If both exist, `.worktrees` wins.

3. **If there is no other guidance available**, default to
   `.worktrees/` at the project root.

#### Safety Verification (project-local directories only)

**MUST verify directory is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:** Add to .gitignore, commit the change, then proceed.

**Why critical:** Prevents accidentally committing worktree contents
to repository.

#### Create the Worktree

```bash
# Determine path based on chosen location
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** If `git worktree add` fails with a permission
error (sandbox denial), tell the user the sandbox blocked worktree
creation and you're working in the current directory instead. Then run
setup and baseline tests in place.

**Windows note:** `git worktree add` works on Windows under PowerShell
and Git Bash. If running through OpenClaw's `exec` (which uses
PowerShell), paths must be absolute Windows paths. Branch names with
forward slashes become nested directories (e.g. `feature/x` →
`.worktrees/feature/x`).

## Step 2: Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

**OpenClaw note:** `npm install` and equivalent long-running setup
commands should run via `exec` with `yieldMs=60000` or longer, then
`process` to poll. Do not block the session.

## Step 3: Verify Clean Baseline

Run tests to ensure workspace starts clean:

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or
investigate.

**If tests pass:** Report ready.

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native isolation tool (e.g. `sessions_spawn`) available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check instruction file, then default `.worktrees/` |
| Directory not ignored | Add to .gitignore + commit |
| Permission error on create | Sandbox fallback, work in place |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

### Fighting the harness

- **Problem:** Using `git worktree add` when the platform already
  provides isolation
- **Fix:** Step 0 detects existing isolation. Step 1a defers to
  native tools.

### Skipping detection

- **Problem:** Creating a nested worktree inside an existing one
- **Fix:** Always run Step 0 before creating anything

### Skipping ignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always use `git check-ignore` before creating
  project-local worktree

### Assuming directory location

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: explicit instructions > existing
  project-local directory > default

### Proceeding with failing tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

## Red Flags

**Never:**
- Create a worktree when Step 0 detects existing isolation
- Use `git worktree add` when you have a native tool (e.g.
  `sessions_spawn`). This is the #1 mistake — if you have it, use it.
- Skip Step 1a by jumping straight to Step 1b's git commands
- Create worktree without verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking

**Always:**
- Run Step 0 detection first
- Prefer native tools over git fallback
- Follow directory priority: explicit instructions > existing
  project-local directory > default
- Verify directory is ignored for project-local
- Auto-detect and run project setup
- Verify clean test baseline

## Puchica convention

For `E:\Claude\puchica-site`:
- The repo has no `.worktrees/` directory yet. The default for new
  work is to commit directly to `main` since Daniel works solo.
- For longer-lived parallel work, prefer `sessions_spawn` (Step 1a)
  over `git worktree add`.
- `git worktree add` works fine on Windows; just use absolute
  Windows paths.

## Porting note

Source: `C:\Users\dchav\.claude\skills\using-git-worktrees\SKILL.md`
(Anthropic). Methodology preserved verbatim. OpenClaw adaptations:
- Step 1a now suggests `sessions_spawn` (clean subagent context) as
  the preferred isolation mechanism, since OpenClaw has that as a
  first-class primitive.
- Windows-specific path notes added for the `git worktree add` step.
- "OpenClaw note" added to Step 2 about long-running setup commands.
- Puchica convention section: Daniel works solo, prefers committing
  to main; use `sessions_spawn` over `git worktree` for parallel
  work.
