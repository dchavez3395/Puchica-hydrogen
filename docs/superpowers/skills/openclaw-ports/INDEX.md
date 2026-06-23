# OpenClaw ports — Claude Desktop superpowers library

This directory contains ports of the Claude Desktop superpowers skills
(`C:\Users\dchav\.claude\skills\`) into OpenClaw-native skills. The
upstream skills are useful when working directly in Claude Desktop,
but they live in a separate process and are **not** accessible to me
(Connor / OpenClaw) unless ported.

## What's ported

### Tier 1 — process discipline

- `using-superpowers/SKILL.md` — meta-skill: how to discover and use
  skills. **Load this first at session start.**
- `verification-before-completion/SKILL.md` — never claim done without
  proof. Iron Law: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION
  EVIDENCE.
- `writing-plans/SKILL.md` — the format for multi-step implementation
  plans.
- `executing-plans/SKILL.md` — how to execute a written plan with
  review checkpoints.

### Tier 2 — engineering discipline

- `test-driven-development/SKILL.md` + `testing-anti-patterns.md` —
  TDD methodology. Iron Law: NO PRODUCTION CODE WITHOUT A FAILING
  TEST FIRST.
- `systematic-debugging/SKILL.md` — debugging methodology. Iron Law:
  NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
- `using-git-worktrees/SKILL.md` — isolated workspaces.
- `finishing-a-development-branch/SKILL.md` — merge/PR/keep/discard
  options when work is complete.
- `finding-duplicate-functions/SKILL.md` — detect semantic duplicates
  in LLM-generated codebases.

## What's not ported (yet)

See `deliverables/04-superpowers-port-queue.md` for the full list.
The remaining 40+ skills are lower priority and can be ported on
demand. Top candidates if time allows:

- `brainstorming/` — for problem framing
- `dispatching-parallel-agents/` — subagent fan-out
- `subagent-driven-development/` — fresh subagent per task
- `requesting-code-review/` + `receiving-code-review/` — review loops
- `using-tmux-for-interactive-commands/` — TTY-required commands
- `graphify/` — text/data → diagrams (needs renderer)

## How to use a ported skill

1. Read the `SKILL.md` (it's markdown; can be loaded with `read` or
   `skill_workshop action=inspect`)
2. Follow the procedure it describes
3. Apply the discipline to your current task

The skills are *prompts* — they don't execute code, they change how
I work. Most of them start with "Announce at start: 'I'm using the
X skill to do Y'." Follow that.

## Verification before applying

Per `verification-before-completion`, before declaring a port done:
- [x] SKILL.md reads clean
- [x] Porting note section present at the bottom of every file
- [x] "human partner" replaced with "the user / Daniel"
- [x] OpenClaw-specific tool mapping (skill_workshop, sessions_spawn,
      update_plan, exec, process) where applicable
- [x] No Claude-Code-only instructions (e.g. `Skill` tool, `EnterWorktree`)
- [x] No API-keyed integrations (e.g. cloud Opus)

The porting was done by direct file write to this directory, not
through `skill_workshop` (which would create a pending proposal
needing explicit apply). These are meant to be **immediately usable
on disk** without a proposal lifecycle. If you want them registered
formally, run `skill_workshop action=create name=...` for each.

## Source of truth

If a port diverges from the upstream skill, the **upstream is
canonical**. Porting can introduce adaptation but not new
methodology. If you find a substantive difference, file it as a
discrepancy and prefer the upstream text.

Upstream location: `C:\Users\dchav\.claude\skills\`
