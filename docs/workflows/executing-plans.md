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
