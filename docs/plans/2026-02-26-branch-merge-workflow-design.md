# Branch Merge Workflow for Solo + AI Agent Development

**Date:** 2026-02-26
**Context:** Multiple AI agents worked in parallel on feature branches. Need to merge everything to main professionally.

## The Problem

When running parallel agents, each on its own branch, work accumulates in branches but main stays stale. The temptation is to dump everything on main at once. The professional approach: merge in dependency order with merge commits that preserve the story.

## The Workflow

### Pre-flight

1. **Clean your working tree.** Commit or stash any uncommitted changes on the current branch before switching.
2. **Map the dependency order.** Which branches build on which? Merge foundations first.

### Merge Sequence

```bash
# 1. Switch to main
git checkout main

# 2. Merge each branch in dependency order, oldest/foundation first
git merge --no-ff feat/branch-name -m "Merge feat/branch-name: one-line summary of what this adds"

# 3. Repeat for next branch
git merge --no-ff feat/next-branch -m "Merge feat/next-branch: one-line summary"

# 4. Verify the graph
git log --oneline --graph -15

# 5. Delete merged branches (safe — refuses if not merged)
git branch -d feat/branch-name feat/next-branch
```

### Key Flags

- **`--no-ff`** (no fast-forward): Forces a merge commit even when the history is linear. This creates a bookmark in history — "everything between here and the last merge was one feature." Without it, commits just appear inline and you lose the grouping.
- **`-d`** (lowercase delete): Safety net. Git refuses to delete a branch that hasn't been fully merged into HEAD.

### Why Merge Commits Matter

- **Revertability:** `git revert -m 1 <merge-commit>` undoes an entire feature in one shot.
- **Readability:** `git log --graph` shows clear feature boundaries.
- **Bisectability:** `git bisect` can skip entire features to find where a bug was introduced.

## Applied Today (2026-02-26)

### Branch State

| Branch | Commits ahead of main | Contains |
|--------|----------------------|----------|
| `main` | — | Baseline only |
| `feat/ai-narrative-pivot` | 2 | GAME_SPEC AI narrative section + submodule LLM seeds |
| `feat/wiki-roster-interludes` | 3 + 1 uncommitted | Everything in ai-narrative-pivot + meta-progression save system + design/plan docs + submodule wiki/roster/interlude implementation |

### Dependency Order

`ai-narrative-pivot` is a subset of `wiki-roster-interludes`. Merge ai-narrative-pivot first.

### Execution

1. Commit submodule update on `feat/wiki-roster-interludes`
2. `git checkout main`
3. `git merge --no-ff feat/ai-narrative-pivot`
4. `git merge --no-ff feat/wiki-roster-interludes`
5. Verify with `git log --oneline --graph`
6. Delete both feature branches

## Going Forward

- **One branch per agent/feature.** Name it `feat/<description>`.
- **Merge to main only when the work is complete** (or at least stable).
- **Always `--no-ff`** so each feature is a bookmarked unit.
- **Delete merged branches** — the merge commit preserves the history.
- **If branches diverge** (edit the same files), merge them to main one at a time and resolve conflicts at each step — never try to merge two divergent branches simultaneously.
