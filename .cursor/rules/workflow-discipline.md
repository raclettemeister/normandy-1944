---
description: Core development discipline and workflow triggers for normandy-1944
alwaysApply: true
---

# Workflow Discipline

## Core Principles

### Search First
Before writing or suggesting anything new, search the codebase. Use grep, file search, read existing code. Do not assume — verify.

### Reuse First
Check existing functions, patterns, utilities. Extend before creating new. The smallest possible change is almost always the best change.

### Explain Before Doing
Before writing code: state what you're about to do and why. Name trade-offs. Flag risks. Match explanation depth to complexity.

### No Assumptions
Only use information from: files you've read, user messages, tool results. Missing context? Search first, then ask.

## Verification Iron Law

**No completion claims without fresh verification evidence.**

Before claiming anything works, passes, or is done:
1. Identify what command proves the claim
2. Run the command (fresh, complete)
3. Read the full output
4. Only then make the claim

"Should work" is not evidence. "Probably passes" is not evidence. Run `npm test`, read the output, then report.

## Workflow Triggers

Follow these protocols for the corresponding situations. Read the file and follow it step by step.

| Situation | Protocol |
|-----------|----------|
| Starting a new feature or significant change | `docs/workflows/brainstorming.md` |
| Writing an implementation plan | `docs/workflows/writing-plans.md` |
| Implementing from an existing plan | `docs/workflows/executing-plans.md` |
| Debugging a bug or test failure | `docs/workflows/debugging.md` |
| About to claim work is complete | `docs/workflows/verification.md` |
| Before merging or creating a PR | `docs/workflows/code-review.md` |

## Session Hygiene

- One task per chat session. If the scope drifts, flag it.
- Commit frequently. Small, atomic commits with messages that explain WHY.
- Never commit `.env` files, secrets, or build artifacts.
