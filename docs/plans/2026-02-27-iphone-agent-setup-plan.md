# iPhone Agent Setup — Implementation Plan

> **For Claude:** Read and follow `docs/workflows/executing-plans.md` to implement this plan task-by-task.

**Goal:** Make the repo fully operable from iPhone via cursor.com/agent by embedding development discipline into the repo itself.

**Architecture:** Three `.cursor/rules/` files (always-on), six `docs/workflows/` protocol files (on-demand), one CI workflow addition, one CI workflow modification, one project map document.

**Tech Stack:** Markdown, YAML (GitHub Actions)

**Design doc:** `docs/plans/2026-02-27-iphone-agent-setup-design.md`

---

### Task 1: Create `.cursor/rules/project-context.md`

**Files:**
- Create: `.cursor/rules/project-context.md`

**Step 1: Create the rules directory and file**

```markdown
---
description: Project context and architecture overview for normandy-1944
alwaysApply: true
---

# Project Context

Normandy 1944 is a text-based tactical roguelike set during D-Day airborne operations. You command 2nd Platoon, Easy Company, 506th PIR, 101st Airborne Division.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, deployed to GitHub Pages
- **Backend:** Cloudflare Worker (TypeScript), Anthropic API (Claude Sonnet 4)
- **Testing:** Vitest with happy-dom
- **i18n:** i18next + react-i18next (English and French)

## Architecture

- `src/engine/` — Pure game logic. State machine, outcome resolution, resource management. No React imports.
- `src/content/scenarios/` — Game content organized by act/scene. Each scenario defines narrative, choices, outcomes, state changes.
- `src/components/` — React UI. Reads engine state, renders it. All text through i18n `useTranslation()`.
- `src/services/` — LLM integration. Prompt building, narrative generation, DM evaluation layer.
- `src/types/` — TypeScript type definitions (single `index.ts`).
- `src/locales/` — i18n locale files. `en/` and `fr/` with JSON files per namespace.
- `worker/` — Cloudflare Worker backend. Proxies Anthropic API calls. Separate deploy via `wrangler deploy`.
- `tests/` — Vitest tests mirroring `src/` structure.

## Key References

- Full game design: `docs/GAME_SPEC.md`
- Architecture map: `docs/PROJECT_MAP.md`
- Design documents: `docs/plans/`
- Scene writing guides: `docs/scenes/`

## Deploy

- **Frontend:** Push to `main` → GitHub Actions → GitHub Pages
- **Backend:** Manual `wrangler deploy` from `worker/` directory
```

**Step 2: Verify file exists**

Run: `cat .cursor/rules/project-context.md | head -5`
Expected: Shows the frontmatter with `alwaysApply: true`

**Step 3: Commit**

```bash
git add .cursor/rules/project-context.md
git commit -m "chore: add project-context cursor rule for agent orientation"
```

---

### Task 2: Create `.cursor/rules/coding-standards.md`

**Files:**
- Create: `.cursor/rules/coding-standards.md`

**Step 1: Create the file**

```markdown
---
description: Coding standards and patterns for normandy-1944
alwaysApply: true
---

# Coding Standards

## TypeScript

- Strict mode enabled. No `any` types.
- Explicit return types on exported functions.
- Use `interface` for object shapes, `type` for unions/intersections.

## React

- Functional components only. No class components.
- Hooks for all state management. No external state libraries.
- Components in `src/components/`, one component per file.

## File Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase.tsx` (filename matches export)
- Tests: `tests/<mirror-src-path>/<name>.test.ts`

## i18n

- ALL user-facing strings through `useTranslation()` hook.
- Never hardcode display text in components.
- Locale files in `src/locales/{en,fr}/` as JSON.
- When adding new strings: add to both `en/` and `fr/` locale files.

## Reuse First

- Before creating anything new, search `src/engine/` and `src/components/` for existing utilities.
- Check `src/types/index.ts` for existing type definitions.
- Follow existing patterns in similar files rather than inventing new ones.

## Testing

- Framework: Vitest with happy-dom environment.
- Tests in `tests/` directory, mirroring `src/` structure.
- Run: `npm test` to execute full suite.
- Run: `npx vitest run tests/path/to/test.ts` for a single test file.

## Architecture Boundaries

- Game logic stays in `src/engine/`. No React imports in engine files.
- Components never modify engine state directly — they dispatch through the game loop in `GameScreen.tsx`.
- Scenarios define content, not behavior. Behavior lives in the engine.

## Maintenance

- If you create new directories, patterns, or services, update `docs/PROJECT_MAP.md` before completing the task.
```

**Step 2: Commit**

```bash
git add .cursor/rules/coding-standards.md
git commit -m "chore: add coding-standards cursor rule for pattern enforcement"
```

---

### Task 3: Create `.cursor/rules/workflow-discipline.md`

**Files:**
- Create: `.cursor/rules/workflow-discipline.md`

**Step 1: Create the file**

```markdown
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
```

**Step 2: Commit**

```bash
git add .cursor/rules/workflow-discipline.md
git commit -m "chore: add workflow-discipline cursor rule with core principles and protocol triggers"
```

---

### Task 4: Create `docs/workflows/brainstorming.md`

**Files:**
- Create: `docs/workflows/brainstorming.md`

**Step 1: Create the workflows directory and file**

```markdown
# Brainstorming Protocol

Use this protocol before starting any new feature, significant change, or when the user asks to plan something.

**Hard gate:** Do NOT write any code until the user has approved the design.

---

## Step 1: Explore Project Context

Before asking questions:
- Read relevant source files, docs, and recent commits
- Check `docs/PROJECT_MAP.md` for architecture overview
- Check `docs/GAME_SPEC.md` if the feature touches game mechanics
- Look at existing `docs/plans/` for prior designs on related topics

## Step 2: Ask Clarifying Questions

- Ask questions **one at a time** — don't overwhelm
- Prefer **multiple choice** when possible (easier to answer on iPhone)
- Focus on: purpose, constraints, success criteria
- Keep going until you understand what you're building

## Step 3: Propose Approaches

- Propose **2-3 different approaches** with trade-offs
- Lead with your recommendation and explain why
- Be honest about downsides of each option

## Step 4: Present Design

- Present the design **section by section**
- Scale each section to its complexity (a few sentences if straightforward, longer if nuanced)
- After each section, ask: "Does this look right so far?"
- Cover as needed: architecture, components, data flow, error handling, testing

## Step 5: Push Back

If the user approves immediately without annotation, push back:
> "Are you sure? Even a quick read-through usually catches something."

This is not politeness — first-pass approval almost always misses something.

## Step 6: Save Design Document

Save the validated design to:
```
docs/plans/YYYY-MM-DD-<topic>-design.md
```

## Step 7: Transition to Planning

Read and follow `docs/workflows/writing-plans.md` to create the implementation plan.

---

## Principles

- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **One question at a time** — Respect that the user may be on iPhone
- **Incremental validation** — Get approval section by section, not all at once
- **Be flexible** — Go back and clarify when something doesn't make sense
```

**Step 2: Commit**

```bash
git add docs/workflows/brainstorming.md
git commit -m "chore: add brainstorming workflow protocol"
```

---

### Task 5: Create `docs/workflows/writing-plans.md`

**Files:**
- Create: `docs/workflows/writing-plans.md`

**Step 1: Create the file**

```markdown
# Writing Plans Protocol

Use this protocol when you have an approved design and need to create an implementation plan.

---

## Plan Format

Save plans to: `docs/plans/YYYY-MM-DD-<feature-name>-plan.md`

Every plan starts with this header:

```
# [Feature Name] — Implementation Plan

> **For Claude:** Read and follow `docs/workflows/executing-plans.md` to implement this plan.

**Goal:** [One sentence]
**Architecture:** [2-3 sentences]
**Tech Stack:** [Key technologies]
**Design doc:** [Path to the design document]
```

## Task Granularity

Each step is **one action (2-5 minutes)**:
- "Write the failing test" — one step
- "Run it to make sure it fails" — one step
- "Implement the minimal code" — one step
- "Run the tests" — one step
- "Commit" — one step

## Task Structure

```
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `tests/exact/path/to/test.ts`

**Step 1: Write the failing test**
[Complete test code]

**Step 2: Run test to verify it fails**
Run: `npx vitest run tests/path/test.ts`
Expected: FAIL with "[specific error]"

**Step 3: Write minimal implementation**
[Complete implementation code]

**Step 4: Run test to verify it passes**
Run: `npx vitest run tests/path/test.ts`
Expected: PASS

**Step 5: Commit**
git commit -m "feat: [description]"
```

## Rules

- **Exact file paths** always — no "add a file in the appropriate directory"
- **Complete code** in plan — no "add validation logic here"
- **Exact commands** with expected output
- **DRY, YAGNI, TDD** — test first, minimal implementation, no gold-plating
- **Frequent commits** — one commit per task minimum

## After Writing the Plan

Offer the user a choice:
1. **Execute now** — Start implementing immediately in this session
2. **Execute later** — Save the plan, user will start a new session to implement

If executing now, read and follow `docs/workflows/executing-plans.md`.
```

**Step 2: Commit**

```bash
git add docs/workflows/writing-plans.md
git commit -m "chore: add writing-plans workflow protocol"
```

---

### Task 6: Create `docs/workflows/executing-plans.md`

**Files:**
- Create: `docs/workflows/executing-plans.md`

**Step 1: Create the file**

```markdown
# Executing Plans Protocol

Use this protocol when implementing from a written plan.

---

## Step 1: Load and Review

1. Read the plan file completely
2. Review critically — identify any questions or concerns
3. If concerns: raise them with the user **before starting**
4. Create a task checklist tracking each task's status

## Step 2: Execute in Batches

**Default batch size: 3 tasks**

For each task:
1. Mark as in-progress
2. Follow each step **exactly as written** in the plan
3. Run all verification commands specified
4. Do not skip tests or verification steps
5. Commit after each task
6. Mark as complete

## Step 3: Report After Each Batch

When a batch is complete, report:
- What was implemented (brief summary per task)
- Verification output (test results, build output)
- Any issues encountered

Then say: **"Ready for feedback."**

Wait for user response before continuing.

## Step 4: Continue or Adjust

Based on user feedback:
- Apply requested changes
- Execute next batch of 3 tasks
- Repeat until all tasks complete

## Step 5: Complete

After all tasks:
1. Run full test suite: `npm test`
2. Run lint: `npm run lint`
3. Run build: `npm run build`
4. Show all verification output
5. Present completion options:
   - Merge back to main locally
   - Push and create a Pull Request
   - Keep the branch as-is
   - Discard this work

---

## When to Stop and Ask

**Stop executing immediately when:**
- A test fails unexpectedly
- The plan has ambiguous or unclear instructions
- You discover the plan is missing a step
- A dependency is missing or broken
- You need to make a decision not covered by the plan

**Ask for clarification rather than guessing.** Guessing wastes more time than asking.

## Key Discipline

- **Never start on main branch** without explicit user consent — create a feature branch
- **Between batches**, re-read the relevant section of the plan to stay aligned
- **Don't "improve" the plan** during execution — follow it as written, note improvements for later
- **If debugging is needed**, follow `docs/workflows/debugging.md`
- **Before claiming completion**, follow `docs/workflows/verification.md`
```

**Step 2: Commit**

```bash
git add docs/workflows/executing-plans.md
git commit -m "chore: add executing-plans workflow protocol"
```

---

### Task 7: Create `docs/workflows/debugging.md`

**Files:**
- Create: `docs/workflows/debugging.md`

**Step 1: Create the file**

```markdown
# Systematic Debugging Protocol

Use this protocol when encountering any bug, test failure, or unexpected behavior. **Before proposing fixes.**

**Hard gate:** No fixes without completing Phase 1.

---

## Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

### 1. Read Error Messages Carefully
- Don't skip past errors or warnings — they often contain the exact solution
- Read stack traces completely
- Note line numbers, file paths, error codes

### 2. Reproduce Consistently
- Can you trigger it reliably? What are the exact steps?
- If not reproducible, gather more data — don't guess

### 3. Check Recent Changes
- `git diff` — what changed?
- Recent commits that could cause this?
- New dependencies, config changes?

### 4. Trace Data Flow
- Where does the bad value originate?
- What called this function with the wrong input?
- Keep tracing upstream until you find the source
- Fix at the source, not at the symptom

### 5. Multi-Component Systems
If the bug crosses component boundaries (UI → engine → worker):
- Add diagnostic logging at each boundary
- Run once to see WHERE it breaks
- Then investigate that specific component

## Phase 2: Pattern Analysis

1. **Find working examples** — locate similar working code in the codebase
2. **Compare** — what's different between working and broken?
3. **List every difference** — don't assume "that can't matter"
4. **Check dependencies** — what settings, config, environment does this need?

## Phase 3: Hypothesis and Testing

1. **Form a single hypothesis:** "I think X is the root cause because Y"
2. **Test minimally:** Make the SMALLEST possible change
3. **One variable at a time:** Don't fix multiple things at once
4. **Verify:** Did it work? Yes → Phase 4. No → new hypothesis.

## Phase 4: Implementation

1. **Write a failing test** that reproduces the bug
2. **Run it** — confirm it fails for the right reason
3. **Implement a single fix** addressing the root cause
4. **Run the test** — confirm it passes
5. **Run the full test suite** — confirm no regressions
6. **Commit**

---

## Escalation Rules

- **After 3 failed fix attempts:** STOP. The problem is likely architectural, not a simple bug. Discuss with the user before attempting more fixes.
- **"Quick fix" temptation:** If you're thinking "just try changing X," STOP. Return to Phase 1.
- **Compounding symptoms:** If each fix reveals a new problem in a different place, the architecture is wrong. Stop fixing symptoms.

## Red Flags — Return to Phase 1

- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "I don't fully understand but this might work"
- "It's probably X, let me fix that"
- Proposing solutions before tracing data flow
```

**Step 2: Commit**

```bash
git add docs/workflows/debugging.md
git commit -m "chore: add systematic debugging workflow protocol"
```

---

### Task 8: Create `docs/workflows/verification.md`

**Files:**
- Create: `docs/workflows/verification.md`

**Step 1: Create the file**

```markdown
# Verification Protocol

Use this protocol before claiming any work is complete, fixed, or passing.

**Iron law:** No completion claims without fresh verification evidence.

---

## The Gate

Before making ANY claim about work status:

1. **IDENTIFY** — What command proves this claim?
2. **RUN** — Execute the full command (fresh, not cached)
3. **READ** — Full output. Check exit code. Count failures.
4. **VERIFY** — Does the output actually confirm the claim?
5. **ONLY THEN** — Make the claim, citing the evidence

Skip any step = the claim is unverified.

## What Each Claim Requires

| Claim | Required Evidence | NOT Sufficient |
|-------|-------------------|----------------|
| "Tests pass" | `npm test` output showing 0 failures | A previous run, "should pass" |
| "Lint is clean" | `npm run lint` output showing 0 errors | Partial check, assumption |
| "Build succeeds" | `npm run build` with exit code 0 | "Lint passed so build should too" |
| "Bug is fixed" | Regression test passes + original symptom gone | "I changed the code" |
| "No regressions" | Full test suite passes after changes | Single test file passing |
| "Requirements met" | Line-by-line checklist against plan | "Tests pass" |

## Red Flags — STOP

If you catch yourself about to say any of these, STOP and run verification:

- "Should work now"
- "This probably passes"
- "Looks correct to me"
- "I'm confident this fixes it"
- "Great!" / "Perfect!" / "Done!" (before running verification)
- Any form of satisfaction before evidence

## Verification Commands for This Project

```bash
# Tests
npm test

# Lint
npm run lint

# Type check + build
npm run build

# Single test file
npx vitest run tests/path/to/test.ts

# All checks (full verification)
npm run lint && npm run build && npm test
```

## After Verification

Report the actual results with evidence:
- ✅ "Tests pass: 47/47 tests passed in 16 test files"
- ❌ "Tests failing: 2 failures in `tests/engine/gameState.test.ts`"

Never paraphrase or summarize test output — show the actual numbers.
```

**Step 2: Commit**

```bash
git add docs/workflows/verification.md
git commit -m "chore: add verification workflow protocol"
```

---

### Task 9: Create `docs/workflows/code-review.md`

**Files:**
- Create: `docs/workflows/code-review.md`

**Step 1: Create the file**

```markdown
# Code Review Protocol

Use this protocol before merging to main or creating a pull request.

---

## Step 1: Run Full Verification

Run all checks fresh:
```bash
npm run lint && npm run build && npm test
```

All three must pass. If any fail, fix before continuing.

## Step 2: Review the Diff

```bash
git diff main...HEAD
```

For each changed file, check:
- [ ] Does the change match the plan/requirements?
- [ ] No unused code left behind (dead imports, commented-out code)
- [ ] No hardcoded user-facing strings (should use i18n)
- [ ] No `any` types introduced
- [ ] No game logic leaked into components (or vice versa)
- [ ] Architecture boundaries respected (engine has no React imports)

## Step 3: Check Against Requirements

If implementing from a plan:
1. Re-read the plan
2. Go through each requirement line by line
3. Confirm each one is addressed in the diff
4. Note any gaps

## Step 4: Check for Accidents

- [ ] No `.env` files or secrets in the diff
- [ ] No `node_modules/` or build artifacts
- [ ] No unrelated changes mixed in
- [ ] Commit messages explain WHY, not just WHAT

## Step 5: Present Completion Options

Present exactly these 4 options:

1. **Merge back to main locally**
2. **Push and create a Pull Request**
3. **Keep the branch as-is** (handle it later)
4. **Discard this work**

For option 4: require explicit typed confirmation before deleting anything.

---

## Quick Checks

For smaller changes that don't warrant the full protocol:
1. Run `npm run lint && npm run build && npm test`
2. Review `git diff` for obvious issues
3. Commit with a descriptive message
```

**Step 2: Commit**

```bash
git add docs/workflows/code-review.md
git commit -m "chore: add code-review workflow protocol"
```

---

### Task 10: Create `.github/workflows/pr-check.yml`

**Files:**
- Create: `.github/workflows/pr-check.yml`

**Step 1: Create the workflow file**

```yaml
name: PR Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc -b

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_NARRATIVE_API_URL: https://placeholder.workers.dev
```

**Step 2: Verify YAML syntax**

Run: `cat .github/workflows/pr-check.yml | head -3`
Expected: Shows `name: PR Check`

**Step 3: Commit**

```bash
git add .github/workflows/pr-check.yml
git commit -m "ci: add PR check workflow with lint, type check, test, and build"
```

---

### Task 11: Add lint step to deploy workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add lint step before tests**

In `.github/workflows/deploy.yml`, add a new step after "Install dependencies" and before "Run tests":

```yaml
      - name: Lint
        run: npm run lint
```

The steps section should read: Checkout → Setup Node → Install dependencies → **Lint** → Run tests → Build → Setup Pages → Upload → Deploy.

**Step 2: Verify the change**

Run: `grep -A2 "Lint" .github/workflows/deploy.yml`
Expected: Shows the lint step

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add lint step to deploy workflow"
```

---

### Task 12: Create `docs/PROJECT_MAP.md`

**Files:**
- Create: `docs/PROJECT_MAP.md`

**Step 1: Create the file**

The project map should contain the complete file-by-file reference. This is a large file — write it based on the actual codebase contents discovered during research. Key sections:

1. **Architecture Overview** — Three-layer diagram: Engine → Content → UI, plus Worker backend
2. **`src/engine/` file map** — All 8 files with descriptions:
   - `gameState.ts` — Core state machine: phase calculation, capabilities, time management, state transitions, initial state with difficulty
   - `outcomeEngine.ts` — Outcome resolution: effective scores, dice rolls, casualty assignment, scene transitions, counterattack triggers
   - `scenarioLoader.ts` — Scenario registry: registers/retrieves scenarios by act or ID, manages scene transitions
   - `roster.ts` — Platoon roster: 18 named soldiers with ranks, roles, backgrounds, traits, rally handling
   - `battleOrders.ts` — Mission timeline: milestone tracking, achievement status
   - `achievementTracker.ts` — Achievement system: loading/unlocking from localStorage
   - `balanceEnvelope.ts` — Balance math: derives min/max outcome ranges from decision tiers
   - `metaProgress.ts` — Persistence: saves/loads wiki entries, roster notes, run stats to localStorage
3. **`src/components/` file map** — All 19 components with descriptions
4. **`src/services/` file map** — All 4 services with descriptions
5. **`src/content/scenarios/` structure** — Act 1 scenes (7 scenes + index), Acts 2-3 not yet implemented
6. **`src/locales/` structure** — EN/FR locale files by namespace
7. **Data Flow** — Player action → DecisionPanel → GameScreen dispatches → outcomeEngine processes → gameState updates → components re-render → (optionally) narrativeService calls Worker for AI text
8. **Key Patterns** — How to add a scenario, component, i18n strings, test
9. **What NOT to Do** — Common mistakes to avoid

**Step 2: Commit**

```bash
git add docs/PROJECT_MAP.md
git commit -m "docs: add PROJECT_MAP.md architectural reference for agent orientation"
```

---

### Task 13: Final Verification

**Step 1: Run lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings (markdown/yaml files don't get linted, only .ts/.tsx)

**Step 2: Run type check**

Run: `npx tsc -b`
Expected: Exit 0, no errors (no TypeScript files changed)

**Step 3: Run tests**

Run: `npm test`
Expected: All existing tests pass, no regressions

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Verify all files exist**

Run: `ls -la .cursor/rules/ && ls -la docs/workflows/ && ls -la .github/workflows/`
Expected: 3 rule files, 6 workflow files, 2 CI workflows

---

### Task 14: Final Commit and Summary

**Step 1: Check for any uncommitted files**

Run: `git status`

If any files remain uncommitted, add and commit them.

**Step 2: Verify commit history**

Run: `git log --oneline -15`

Should show ~12 new commits for the setup work.
