---
name: executing-plans
description: Use when you have a written implementation plan to execute with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** OpenClaw's `sessions_spawn` is a sub-agent primitive, so
subagent-driven execution is available. For plans with >5 tasks, prefer
`subagent-driven-development` (when ported) for fresh-context per task.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically — identify any questions or concerns about the plan
3. If concerns: raise them with the human partner before starting
4. If no concerns: create todos for the plan items and proceed
   - Use `update_plan` to register the plan in the session
   - Each plan task becomes a plan step

### Step 2: Execute Tasks

For each task:
1. Mark as `in_progress` (one at a time)
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as `completed`

When the plan involves shell commands, use `exec`. For long-running
work, use `exec` with `yieldMs` to background, then `process` to
poll. For multi-step work that's not in the plan, do it inline — do
not delegate to sub-agents (they narrate but don't execute; per
MEMORY.md).

### Step 3: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use `finishing-a-development-branch`
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly
- Wallet is running low and tasks remaining are non-trivial

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking
- A prior task's design assumption was invalidated by what you learned

**Don't force through blockers** — stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on `main`/`master` without explicit user consent

## Integration

**Required workflow skills:**
- `using-git-worktrees` — Ensures isolated workspace (creates one or verifies existing)
- `writing-plans` — Creates the plan this skill executes
- `finishing-a-development-branch` — Complete development after all tasks

## OpenClaw adaptation

The "fresh subagent per task + review between tasks" pattern is
approximated in OpenClaw by `sessions_spawn` with a fresh context.
The "inline execution with checkpoints" pattern is the default — you
keep the same session, update `update_plan` between tasks, and ask
the user for review at natural checkpoints.

For the Puchica storefront, plans should be saved to
`E:\Claude\puchica-site\docs\superpowers\plans\YYYY-MM-DD-<feature>.md`
(per the upstream convention), and committed alongside the code in
the same repo.

## Porting note

Source: `C:\Users\dchav\.claude\skills\executing-plans\SKILL.md`
(Anthropic). The process is platform-agnostic. OpenClaw adaptations:
- Sub-agents via `sessions_spawn` (port of subagent-driven-development)
- Todos via `update_plan` (the OpenClaw equivalent)
- The "stop on low wallet" stop-condition is added — this is a real
  failure mode for OpenClaw that doesn't exist for Claude Pro
