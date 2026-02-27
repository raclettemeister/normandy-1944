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
- "Tests pass: 47/47 tests passed in 16 test files"
- "Tests failing: 2 failures in `tests/engine/gameState.test.ts`"

Never paraphrase or summarize test output — show the actual numbers.
