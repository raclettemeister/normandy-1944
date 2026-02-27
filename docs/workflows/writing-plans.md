# Writing Plans Protocol

Use this protocol when you have an approved design and need to create an implementation plan.

---

## Plan Format

Save plans to: `docs/plans/YYYY-MM-DD-<feature-name>-plan.md`

Every plan starts with this header:

```markdown
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

````markdown
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
````

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
