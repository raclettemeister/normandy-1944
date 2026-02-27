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
