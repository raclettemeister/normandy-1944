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
