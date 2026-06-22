---
name: using-superpowers
description: Use when starting any conversation or task — establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions.
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## What this is

The meta-skill. It tells you how to discover and apply all the other
skills in this workspace. It does not produce artifacts — it changes
how you work.

In OpenClaw, skills live in `C:\Users\dchav\.openclaw\workspace\skills\`
(plus `~/.claude/skills/` for Claude Desktop native skills, and
`E:\Claude\puchica-site\docs\agency-skills\` for Puchica-specific ones).
The registry is the `INDEX.md` in each folder.

## Instruction Priority

OpenClaw skills override default agent behavior, but **user instructions
always take precedence**:

1. **User's explicit instructions** (USER.md, MEMORY.md, AGENTS.md, direct
   Telegram messages) — highest priority
2. **OpenClaw skills** — override default behavior where they conflict
3. **Default agent prompt** — lowest priority

If USER.md says "don't use TDD" and a skill says "always use TDD," follow
the user's instructions. The user is in control.

## How to Access Skills in OpenClaw

**Never read skill files manually with `read`/`exec cat` —** always use
`skill_workshop` so the skill is properly activated in the session.

OpenClaw's `skill_workshop` tool manages the lifecycle:

- `action=list` — discover available skills and pending proposals
- `action=inspect` — read a specific proposal (use proposal_id or name)
- `action=create` — draft a new skill (creates a pending proposal,
  does NOT apply it)
- `action=update` — update an existing approved/live skill
- `action=revise` — revise a pending proposal
- `action=apply` — explicitly apply a proposal (user-only trigger)
- `action=reject` / `action=quarantine` — same

**Default behavior**: skills are *pending proposals* until explicitly
applied. Read the proposal to understand the procedure, then follow it.

## Platform Adaptation

Skills speak in actions ("dispatch a subagent", "create a todo", "read
a file") rather than naming any one runtime's tools. In OpenClaw, the
core verbs are:

| Action | OpenClaw tool |
|---|---|
| Read a file | `read` |
| Edit a file | `edit` / `apply_patch` |
| Write a file | `write` |
| Run a shell command | `exec` |
| Run a long command, track it | `exec` + `process` |
| List active sessions | `sessions_list` |
| Spawn a sub-agent | `sessions_spawn` |
| Schedule a future event | `cron` |
| Read MEMORY | `memory_get` |
| Search MEMORY | `memory_search` |
| Read a workspace skill | `skill_workshop action=inspect name=<id>` |
| Generate an image | `image_generate` |
| Generate a video | `video_generate` |
| Generate music | `music_generate` |
| Analyze an image | `image` |
| Search the web | `web_search` |
| Fetch a URL | `web_fetch` |
| Send a Telegram message | (channel-mediated; let the platform handle it) |
| Update plan/goal | `update_plan` / `update_goal` |

For per-task instructions and conventions specific to the Puchica
storefront, see `E:\Claude\puchica-site\docs\agency-skills\INDEX.md`.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.**
Even a 1% chance a skill might apply means that you should invoke the
skill to check. If an invoked skill turns out to be wrong for the
situation, you don't need to use it.

```
User message received
  ↓
Might any skill apply?  ── no, definitely not ──→  Respond
  ↓ yes (even 1%)
Invoke the skill
  ↓
Announce: "Using <skill> to <purpose>"
  ↓
Has checklist?  ── yes ──→  Create a todo per item  ──→  Follow skill exactly
  ↓ no                       ↓
Follow skill exactly  ←───────┘
```

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, systematic-debugging) — these
   determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder,
   agency personas) — these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → systematic-debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, systematic-debugging): Follow exactly. Don't adapt
away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip
workflows.

## Porting note

This skill was ported from `C:\Users\dchav\.claude\skills\using-superpowers\SKILL.md`
(Claude Desktop, Anthropic). The discipline is identical. Only the
platform adaptation section (claude-code/codex/copilot/gemini mapping)
was rewritten to map onto OpenClaw's `skill_workshop` lifecycle. The
references folder in the source (`claude-code-tools.md`, etc.) is not
ported — OpenClaw has its own tool mapping built in.
