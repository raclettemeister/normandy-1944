# Going Live — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Flatten the two-repo structure, merge the AI narrative feature branch, deploy to GitHub Pages with CI/CD, and make the repo Cloud Agent-ready.

**Architecture:** Single git repo (`raclettemeister/normandy-1944`) with GitHub Actions CI/CD that auto-deploys to GitHub Pages on push to `main`. Cloudflare Worker deployed manually, off the critical path.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, GitHub Actions, GitHub Pages, Cloudflare Workers

**Base path:** `/Users/julienthibaut/cursor new test/normandy-1944/` (the nested repo — all commands run here)

---

## Task 1: Fix TypeScript Build Errors on Feature Branch

The feature branch (`feat/ai-narrative-pivot`) has 3 TypeScript errors that prevent `npm run build` from succeeding. Tests pass (216/216), but the production build fails. Fix these before anything else.

**Files:**
- Modify: `src/components/EpilogueScreen.tsx` (line ~53)
- Modify: `src/components/GameScreen.tsx` (lines ~135-145)
- Modify: `src/types/index.ts` (if `Scenario` needs a `title` field)

**Step 1: Identify the exact errors**

Run:
```bash
cd "/Users/julienthibaut/cursor new test/normandy-1944"
npm run build 2>&1 | grep "error TS"
```

Expected output:
```
src/components/EpilogueScreen.tsx(53,11): error TS6133: 'allStatuses' is declared but its value is never read.
src/components/GameScreen.tsx(135,103): error TS2339: Property 'title' does not exist on type 'Scenario'.
src/components/GameScreen.tsx(145,48): error TS2339: Property 'title' does not exist on type 'Scenario'.
```

**Step 2: Fix EpilogueScreen.tsx — remove unused variable**

Open `src/components/EpilogueScreen.tsx`. Find the `allStatuses` variable declaration around line 53. Either remove it or prefix with underscore if it's destructured. The fix depends on context — if `allStatuses` is truly unused, delete the declaration. If it was meant to be used, use it.

**Step 3: Fix GameScreen.tsx — resolve `title` property**

Open `src/components/GameScreen.tsx` around lines 135-145. It references `scene.title` but `Scenario` doesn't have a `title` field. Two possible fixes:
- If the UI needs a title, add `title?: string` to the `Scenario` interface in `src/types/index.ts`
- If `title` was a mistake, replace with the correct field (likely `scene.id` or derive from `scene.narrative`)

Check what `title` is being used for in context before deciding.

**Step 4: Verify the build passes**

Run:
```bash
npm run build
```

Expected: Build succeeds with `✓ built in` message, no TS errors.

**Step 5: Verify tests still pass**

Run:
```bash
npm test
```

Expected: 216 tests passed (10 test files).

---

## Task 2: Commit Dirty Working Tree + Fixes

There are 7 uncommitted modified files on the feature branch, plus the build fixes from Task 1.

**Files:**
- Modified (pre-existing): `src/components/BriefingPhase.tsx`, `src/components/FreeTextInput.tsx`, `src/components/GameScreen.tsx`, `src/components/NarrativePanel.tsx`, `src/components/PlanPhase.tsx`, `src/services/promptBuilder.ts`, `src/styles/game.css`
- Modified (from Task 1): `src/components/EpilogueScreen.tsx`, possibly `src/types/index.ts`

**Step 1: Review the dirty changes**

Run:
```bash
git diff --stat
```

Skim the diff to understand what the uncommitted changes are (UI refinements? bug fixes? half-finished work?). If any changes look broken or half-done, discuss with the user before committing.

**Step 2: Stage and commit all changes**

Run:
```bash
git add -A
git commit -m "fix: resolve TypeScript build errors and commit pending UI refinements"
```

**Step 3: Verify clean working tree**

Run:
```bash
git status
```

Expected: `nothing to commit, working tree clean`

**Step 4: Verify build + tests**

Run:
```bash
npm run build && npm test
```

Expected: Build succeeds, 216 tests pass.

---

## Task 3: Merge Feature Branch to Main

Merge `feat/ai-narrative-pivot` (33+ commits) into `main` using a standard merge. This brings all AI narrative, difficulty, DM layer, and tactical cycle code into `main`. These features degrade gracefully — without an access code, the game runs in offline mode (hardcoded text, all decisions visible).

**Step 1: Switch to main**

Run:
```bash
git checkout main
```

**Step 2: Merge the feature branch**

Run:
```bash
git merge feat/ai-narrative-pivot --no-edit
```

Expected: Fast-forward or clean merge. If there are conflicts (unlikely — no parallel work on `main`), resolve them and commit.

**Step 3: Verify build + tests on merged main**

Run:
```bash
npm run build && npm test
```

Expected: Build succeeds, 216 tests pass.

If tests fail or build breaks, stop and debug. Do not proceed with a broken `main`.

---

## Task 4: Flatten Docs from Parent Repo

Copy documentation from the parent workspace (`cursor new test/docs/`) into the `normandy-1944/docs/` directory. The parent has newer/more complete planning docs.

**Files:**
- Copy: Parent `docs/plans/*.md` → `normandy-1944/docs/plans/`
- Copy: Parent `docs/scenes/` → `normandy-1944/docs/scenes/`
- Replace: Parent `docs/GAME_SPEC.md` → `normandy-1944/docs/GAME_SPEC.md` (parent version is newer)

**Step 1: Copy plan files that don't already exist in normandy-1944**

Run:
```bash
# From the normandy-1944 directory
cp -n "/Users/julienthibaut/cursor new test/docs/plans/"*.md docs/plans/
```

The `-n` flag prevents overwriting files that already exist. The normandy-1944 repo already has `docs/plans/2026-02-25-normandy-1944-design.md` — don't overwrite it.

**Step 2: Copy scenes directory**

Run:
```bash
cp -r "/Users/julienthibaut/cursor new test/docs/scenes/" docs/scenes/
```

**Step 3: Replace GAME_SPEC.md with parent version**

Run:
```bash
cp "/Users/julienthibaut/cursor new test/docs/GAME_SPEC.md" docs/GAME_SPEC.md
```

**Step 4: Verify docs structure**

Run:
```bash
ls docs/
ls docs/plans/
ls docs/scenes/
```

Expected:
```
docs/
├── GAME_SPEC.md
├── agent-logs/
├── plans/
│   ├── 2026-02-25-ai-narrative-pivot-design.md
│   ├── 2026-02-25-ai-narrative-pivot-plan.md
│   ├── 2026-02-25-ai-narrative-pivot-research.md
│   ├── 2026-02-25-difficulty-pivot-session-notes.md
│   ├── 2026-02-25-i18n-design.md
│   ├── 2026-02-25-i18n-plan.md
│   ├── 2026-02-25-normandy-1944-design.md
│   ├── 2026-02-26-difficulty-and-dm-layer-design.md
│   ├── 2026-02-26-difficulty-and-dm-layer-plan.md
│   ├── 2026-02-26-going-live-design.md
│   ├── 2026-02-26-going-live-plan.md
│   └── 2026-02-26-wiki-roster-interludes-design.md
└── scenes/
    ├── WRITING_GUIDE.md
    ├── act1-scene01-landing.md
    ├── act1-scene02-finding-north.md
    ├── act1-scene03-first-contact.md
    ├── act1-scene04-the-sergeant.md
    ├── act1-scene05-the-patrol.md
    └── act1-scene06-the-farmhouse.md
```

**Step 5: Commit**

Run:
```bash
git add docs/
git commit -m "docs: flatten planning docs and scene guides from parent workspace"
```

---

## Task 5: Update README.md

The existing README.md is good but needs updates for Cloud Agent readiness: setup instructions, architecture overview, and links to docs.

**Files:**
- Modify: `README.md`

**Step 1: Read the current README**

Read `README.md` to understand what exists.

**Step 2: Update README with Cloud Agent-friendly content**

Rewrite `README.md` to include these sections. Keep the existing game description — it's well written. Add:

```markdown
## Quick Start

```bash
npm install
npm run dev
```

Game runs at `http://localhost:5173/normandy-1944/`

## Run Tests

```bash
npm test
```

## Production Build

```bash
npm run build
```

Output in `dist/`. Deployed to GitHub Pages automatically on push to `main`.

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7
- **Testing**: Vitest 4
- **Backend**: Cloudflare Workers (LLM proxy, access code validation)
- **Deployment**: GitHub Pages (frontend), Cloudflare Workers (backend)

## Architecture

```
src/
├── types/          — TypeScript interfaces (GameState, Scenario, Soldier, etc.)
├── engine/         — Game logic (outcome engine, state management, roster, battle orders)
├── components/     — React UI (GameScreen, NarrativePanel, DecisionPanel, etc.)
├── content/        — Game content (scenarios, relationships, wiki entries)
├── services/       — LLM integration (narrative service, DM layer, prompt builder)
└── styles/         — CSS

tests/              — Vitest test suites (engine, content validation, services, integration)
worker/             — Cloudflare Worker (Anthropic API proxy + access code validation)
docs/               — Game spec, design docs, implementation plans, scene writing guides
```

## Documentation

- **[Game Specification](docs/GAME_SPEC.md)** — Complete game design (setting, mechanics, content schema, UI spec)
- **[Design Documents](docs/plans/)** — Architecture decisions, implementation plans
- **[Scene Writing Guides](docs/scenes/)** — Per-scene narrative and decision guides

## AI Narration

The game has two modes:
- **Offline mode** (default): Hardcoded narrative text, all decisions visible. No backend needed.
- **AI mode** (with access code): LLM-generated narrative via Cloudflare Worker proxy. Dynamic text, free-text player actions, personalized epilogues.

AI mode degrades gracefully — if the LLM is unavailable, the game falls back to offline mode per-scene.
```

Preserve the existing "The Game" and "Core Mechanics" sections. Add the new sections after them.

**Step 3: Verify the README renders correctly**

Skim the file to check markdown formatting.

**Step 4: Commit**

Run:
```bash
git add README.md
git commit -m "docs: update README with setup instructions and architecture overview"
```

---

## Task 6: Add GitHub Actions Deploy Workflow

Create the CI/CD workflow that auto-deploys to GitHub Pages on push to `main`.

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow directory**

Run:
```bash
mkdir -p .github/workflows
```

**Step 2: Create the workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

  # Allow manual trigger from Actions tab
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
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

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_NARRATIVE_API_URL: ${{ secrets.VITE_NARRATIVE_API_URL }}

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 3: Verify the file is valid YAML**

Run:
```bash
cat .github/workflows/deploy.yml
```

Visually confirm the YAML structure is correct (indentation, no tabs).

**Step 4: Commit**

Run:
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Pages deployment"
```

---

## Task 7: Verify Everything Locally

Final pre-flight check before pushing.

**Step 1: Verify clean working tree**

Run:
```bash
git status
```

Expected: `nothing to commit, working tree clean`, on branch `main`.

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Verify tests**

Run:
```bash
npm test
```

Expected: All tests pass.

**Step 4: Check .gitignore covers sensitive files**

Run:
```bash
git ls-files | grep -E "\.env|\.local" || echo "No sensitive files tracked — good"
```

Expected: "No sensitive files tracked — good"

**Step 5: Review the commit log**

Run:
```bash
git log --oneline -5
```

Expected: The recent commits should be the doc flatten, README update, CI workflow, and the merge.

---

## Task 8: Push to GitHub

Push the merged `main` with docs and CI workflow to the remote.

**Step 1: Push main**

Run:
```bash
git push origin main
```

Expected: Push succeeds to `https://github.com/raclettemeister/normandy-1944.git`.

If the push is rejected (remote has changes), pull first:
```bash
git pull --rebase origin main
git push origin main
```

**Step 2: Push the feature branch too (preserve it)**

Run:
```bash
git push origin feat/ai-narrative-pivot
```

This preserves the feature branch on GitHub in case we need it.

**Step 3: Verify push succeeded**

Run:
```bash
git log --oneline origin/main -3
```

Expected: Shows the recent commits we just pushed.

---

## Task 9: Enable GitHub Pages

This is a manual step in the GitHub web UI.

**Step 1: Open the repo settings**

Go to: `https://github.com/raclettemeister/normandy-1944/settings/pages`

**Step 2: Configure Pages source**

- Under "Build and deployment" → Source: select **"GitHub Actions"** (not "Deploy from a branch")
- Save

**Step 3: Trigger the first deploy**

The push in Task 8 should have already triggered the workflow. Check:

Go to: `https://github.com/raclettemeister/normandy-1944/actions`

If the workflow hasn't run, trigger it manually from the Actions tab (the workflow has `workflow_dispatch` enabled).

**Step 4: Wait for deployment**

The workflow takes ~30-60 seconds. Watch it in the Actions tab.

Expected: Green checkmark. All steps pass (install, test, build, deploy).

**Step 5: Verify the game is live**

Open: `https://raclettemeister.github.io/normandy-1944/`

Expected: The game's main menu loads. "NORMANDY 1944" title visible. "Begin Operation" button works. The game is playable.

---

## Task 10: Add VITE_NARRATIVE_API_URL Secret (Optional, for later)

Only needed when the Cloudflare Worker is deployed and you want AI features active in production.

**Step 1: Go to repo secrets**

Go to: `https://github.com/raclettemeister/normandy-1944/settings/secrets/actions`

**Step 2: Add the secret**

- Name: `VITE_NARRATIVE_API_URL`
- Value: The Cloudflare Worker URL (e.g., `https://normandy-narrative.your-account.workers.dev`)

**Step 3: Re-trigger deploy**

Push any commit to `main`, or manually trigger the workflow from the Actions tab. The next build will bake the Worker URL into the frontend.

---

## Task 11: Deploy Cloudflare Worker (Optional, for later)

Only needed when you want to give someone an access code for AI narration.

**Step 1: Verify wrangler auth**

Run:
```bash
cd worker
npx wrangler whoami
```

Expected: Shows your Cloudflare account info. If not authenticated, run `npx wrangler login`.

**Step 2: Set the Anthropic API key**

Run:
```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste your Anthropic API key when prompted.

**Step 3: Check CORS in worker code**

Open `worker/src/index.ts`. Verify the CORS headers allow `https://raclettemeister.github.io` as an origin. If it's set to `*` or `localhost` only, update it.

**Step 4: Deploy**

Run:
```bash
npx wrangler deploy
```

Expected: Deployment succeeds, shows the Worker URL.

**Step 5: Set the GitHub secret**

Follow Task 10 with the Worker URL from Step 4.

**Step 6: Create a test access code**

Run:
```bash
npx wrangler kv:key put --binding=ACCESS_CODES "NORMANDY-TEST-0001" '{"active":true,"currentUses":0,"label":"test"}'
```

**Step 7: Test the full flow**

Open `https://raclettemeister.github.io/normandy-1944/`, enter the access code, verify AI narration activates.

---

## Summary

| Task | What | Time est. | Critical path? |
|---|---|---|---|
| 1 | Fix TS build errors | 5 min | Yes |
| 2 | Commit dirty working tree + fixes | 2 min | Yes |
| 3 | Merge feature branch to main | 2 min | Yes |
| 4 | Flatten docs from parent | 5 min | Yes |
| 5 | Update README.md | 10 min | Yes |
| 6 | Add GitHub Actions workflow | 5 min | Yes |
| 7 | Verify everything locally | 3 min | Yes |
| 8 | Push to GitHub | 1 min | Yes |
| 9 | Enable GitHub Pages (manual, web UI) | 2 min | Yes |
| 10 | Add Worker URL secret | 2 min | No — later |
| 11 | Deploy Cloudflare Worker | 10 min | No — later |

**Critical path: Tasks 1-9 (~35 minutes).** Tasks 10-11 can happen anytime later.
