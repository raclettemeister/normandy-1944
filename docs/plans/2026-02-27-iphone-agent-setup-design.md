# iPhone Agent Setup — Design Document

**Goal:** Make the normandy-1944 repo fully operable from iPhone via cursor.com/agent, preserving the development discipline currently provided by local Superpowers skills and Cockpit user rules.

**Core problem:** The web agent only sees what's committed to the repo. All development discipline currently lives in local-only locations — Superpowers plugin cache, Cursor user settings, local MCP servers. The web agent gets none of it.

**Approach:** Tiered system. Always-on `.cursor/rules/` for core discipline (lean, ~150-200 words each). On-demand `docs/workflows/` for detailed protocols (read when triggered). CI hardening as the safety net. Project map as the architectural reference.

---

## Section 1: `.cursor/rules/` — Always-On Rules

Three rule files, always included in agent context. Each kept deliberately lean to minimize context window cost.

### 1a. `.cursor/rules/project-context.md`

`alwaysApply: true`

Contents:
- What this project is: text-based tactical roguelike, D-Day 1944, React 19 + Vite frontend, Cloudflare Worker backend
- Architecture layers: `src/engine/` (game logic), `src/content/scenarios/` (3 acts), `src/components/` (React UI), `src/services/` (LLM integration), `worker/` (Cloudflare Worker API)
- Key conventions: i18n via i18next (EN/FR), all UI text in `src/locales/`, game content in scenario files, tests in `tests/` mirroring `src/` structure
- Deploy: GitHub Pages (frontend via CI), Cloudflare Workers (backend via `wrangler deploy`)
- Pointer to full spec: `docs/GAME_SPEC.md`
- Pointer to architecture: `docs/PROJECT_MAP.md`

### 1b. `.cursor/rules/coding-standards.md`

`alwaysApply: true`

Contents:
- TypeScript: Strict mode, explicit types for function signatures, no `any`
- React: Functional components only, hooks for state, no class components
- File naming: kebab-case for files, PascalCase for components
- i18n: All user-facing strings through `useTranslation()`, never hardcoded
- Reuse: Before creating anything new, search for existing utilities in `src/engine/` and `src/components/`
- Testing: Vitest, tests in `tests/` directory, run `npm test` to verify
- If you've made architectural changes, update `docs/PROJECT_MAP.md`

### 1c. `.cursor/rules/workflow-discipline.md`

`alwaysApply: true`

Contents — condensed Cockpit Core:
- **Search first:** Before writing anything, search the codebase. Verify, don't assume.
- **Reuse first:** Extend existing functions/patterns before creating new ones.
- **Explain before doing:** State what you're about to do and why. Flag risks.
- **No assumptions:** Only use information from files you've read, user messages, tool results. Missing context? Search first, then ask.
- **Verification iron law:** No completion claims without running the verification command and showing output. "Should work" is not evidence. Run `npm test`, read the output, THEN claim results.

Workflow triggers:
- Before starting any new feature or significant change → read and follow `docs/workflows/brainstorming.md`
- Before implementing from a plan → read and follow `docs/workflows/executing-plans.md`
- When writing an implementation plan → read and follow `docs/workflows/writing-plans.md`
- When debugging any bug or test failure → read and follow `docs/workflows/debugging.md`
- Before claiming work is complete → read and follow `docs/workflows/verification.md`
- Before merging or creating a PR → read and follow `docs/workflows/code-review.md`

---

## Section 2: `docs/workflows/` — On-Demand Protocols

Six protocol files, each self-contained. Ported from Superpowers skills, adapted for a web agent that works in a single thread without sub-skill invocation.

### 2a. `docs/workflows/brainstorming.md`

Source: `superpowers:brainstorming`

The design-before-code gate:
1. Explore project context first (read files, recent commits)
2. Ask clarifying questions one at a time (prefer multiple choice)
3. Propose 2-3 approaches with trade-offs and a recommendation
4. Present design section by section, get approval on each
5. Save design doc to `docs/plans/YYYY-MM-DD-<topic>-design.md`
6. Transition: read and follow `docs/workflows/writing-plans.md`

Hard gate: Do NOT write any code until user has approved the design.

Push back if user says "looks good" on first pass — ask them to review more carefully.

### 2b. `docs/workflows/writing-plans.md`

Source: `superpowers:writing-plans`

How to write bite-sized implementation plans:
- Each step is one action (2-5 minutes): write test → run it → implement → verify → commit
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
- Save to `docs/plans/YYYY-MM-DD-<feature-name>-plan.md`
- Plan header must include: Goal, Architecture, Tech Stack
- After saving, offer execution options to user

### 2c. `docs/workflows/executing-plans.md`

Source: `superpowers:executing-plans` + `superpowers:subagent-driven-development`

How to implement from a plan:
1. Load plan, review critically, raise concerns before starting
2. Create task checklist from plan
3. Execute in batches of 3 tasks
4. For each task: follow steps exactly, run verifications, commit
5. After each batch: show what was done, show verification output, say "Ready for feedback"
6. Stop immediately if blocked — ask, don't guess
7. When all tasks done: run full test suite, present completion options (merge, PR, keep branch, discard)

Key discipline:
- Never start implementation on main branch without explicit user consent
- Between batches, re-read the plan to stay aligned
- Don't skip verifications even if "obvious"
- If verification fails, debug (follow `docs/workflows/debugging.md`) before continuing

### 2d. `docs/workflows/debugging.md`

Source: `superpowers:systematic-debugging`

Four-phase process:
- **Phase 1 — Root Cause Investigation:** Read error messages carefully, reproduce consistently, check recent changes (git diff), trace data flow. In multi-component systems, add diagnostic logging at each boundary before proposing fixes.
- **Phase 2 — Pattern Analysis:** Find working examples in codebase, compare against broken code, identify every difference.
- **Phase 3 — Hypothesis and Testing:** Form single hypothesis ("X is the root cause because Y"), test with smallest possible change, one variable at a time.
- **Phase 4 — Implementation:** Create failing test case first, implement single fix, verify fix, verify no regressions.

Hard gates:
- No fixes without completing Phase 1
- If 3+ fixes fail, stop and question the architecture — discuss with user before attempting more
- Red flags: "quick fix for now", "just try changing X", "I don't fully understand but..."

### 2e. `docs/workflows/verification.md`

Source: `superpowers:verification-before-completion`

The evidence-before-claims gate:

Gate function:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the full command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim

Common failures table:
| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | `npm test` output: 0 failures | Previous run, "should pass" |
| Linter clean | `npm run lint` output: 0 errors | Partial check |
| Build succeeds | `npm run build`: exit 0 | Linter passing |
| Bug fixed | Regression test passes | "Code changed, assumed fixed" |

Red flags: Using "should", "probably", "seems to". Expressing satisfaction before verification. Trusting own reports without evidence.

### 2f. `docs/workflows/code-review.md`

Source: `superpowers:requesting-code-review` + `superpowers:finishing-a-development-branch`

Pre-merge checklist:
1. Run full test suite fresh — must pass
2. Get git diff of all changes since branching
3. Check against original plan/requirements line by line
4. Look for: unused code, missed edge cases, broken i18n, hardcoded strings, patterns that deviate from existing code
5. Verify no files accidentally included (env files, build artifacts)

Completion options (present exactly these 4):
1. Merge back to main locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work

For option 4 (discard): require explicit typed confirmation before deleting.

---

## Section 3: CI Hardening

### 3a. New PR Check Workflow

File: `.github/workflows/pr-check.yml`

Triggers on `pull_request` to `main`. Does NOT deploy. Steps:
1. `npm ci` — install dependencies
2. `npm run lint` — catch style/pattern issues (ESLint)
3. `tsc -b` — catch type errors (standalone, not bundled in build)
4. `npm test` — run test suite
5. `npm run build` — verify it builds

Ordered fastest-to-fail first for quick iPhone feedback.

### 3b. Add Lint Step to Deploy Workflow

Add `npm run lint` before `npm test` in the existing `.github/workflows/deploy.yml`, so pushes directly to main also get lint-checked.

### 3c. No Branch Protection

Solo developer on iPhone — branch protection would block workflow. CI checks on PRs are the safety net.

---

## Section 4: Project Map

### 4a. `docs/PROJECT_MAP.md`

Single file (~200-300 lines) covering:

**Architecture overview:** Three layers — engine (pure logic), content (scenarios), UI (React). Plus worker (Cloudflare backend).

**File-by-file map:** Important files in each directory with one-line descriptions. Not exhaustive — the key files an agent needs to know about.

**Data flow:** Player action → Component dispatches → Engine processes → State updates → Component re-renders → (optionally) Worker called for AI narration.

**Key patterns to reuse:**
- How to add a new scenario
- How to add a new component
- How to add/modify i18n strings
- How to add a new test

**What NOT to do:**
- Don't put game logic in components
- Don't hardcode user-facing strings
- Don't modify engine state directly from UI
- Don't skip i18n extraction

### 4b. Maintenance Rule

Included in `coding-standards.md`: "If you've made architectural changes (new directories, new patterns, new services), update `docs/PROJECT_MAP.md` before completing the task."

---

## Deliverables Summary

| # | File | Type | Purpose |
|---|------|------|---------|
| 1 | `.cursor/rules/project-context.md` | Always-on rule | Agent orientation |
| 2 | `.cursor/rules/coding-standards.md` | Always-on rule | Pattern enforcement |
| 3 | `.cursor/rules/workflow-discipline.md` | Always-on rule | Core discipline + workflow triggers |
| 4 | `docs/workflows/brainstorming.md` | On-demand protocol | Design-before-code gate |
| 5 | `docs/workflows/writing-plans.md` | On-demand protocol | Implementation plan creation |
| 6 | `docs/workflows/executing-plans.md` | On-demand protocol | Plan execution with checkpoints |
| 7 | `docs/workflows/debugging.md` | On-demand protocol | Systematic debugging |
| 8 | `docs/workflows/verification.md` | On-demand protocol | Evidence-before-claims gate |
| 9 | `docs/workflows/code-review.md` | On-demand protocol | Pre-merge review checklist |
| 10 | `.github/workflows/pr-check.yml` | CI workflow | PR validation pipeline |
| 11 | `.github/workflows/deploy.yml` | CI workflow (modify) | Add lint step |
| 12 | `docs/PROJECT_MAP.md` | Reference doc | Architectural cheat sheet |

12 deliverables. Estimated implementation: ~45-60 minutes of agent work.
