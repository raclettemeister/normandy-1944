# Going Live — Design Document

**Date**: 2026-02-26
**Status**: Approved — ready for implementation planning
**Scope**: Repo flattening, GitHub Pages deployment, CI/CD, Cloudflare Worker, Cloud Agent readiness

---

## 1. Design Summary

Flatten the two-repo structure into one. Merge the AI narrative feature branch to `main`. Deploy to GitHub Pages via GitHub Actions. Make the repo Cloud Agent-ready so Cursor's Cloud Agents can onboard, execute tasks (like the i18n plan), test in-browser, and produce demo videos with merge-ready PRs.

The Cloudflare Worker (LLM proxy) is deployed manually and stays off the critical path — it's only needed when someone has an access code.

---

## 2. Repo Flattening

### Current state

```
cursor new test/              ← parent repo, no GitHub remote
├── docs/                     ← GAME_SPEC.md, plans (i18n, AI narrative, difficulty), scene guides
│   ├── GAME_SPEC.md
│   ├── plans/
│   │   ├── 2026-02-25-i18n-design.md
│   │   ├── 2026-02-25-i18n-plan.md
│   │   ├── 2026-02-25-ai-narrative-pivot-research.md
│   │   ├── 2026-02-25-normandy-1944-design.md
│   │   ├── 2026-02-26-difficulty-and-dm-layer-design.md
│   │   ├── 2026-02-26-difficulty-and-dm-layer-plan.md
│   │   └── 2026-02-26-going-live-design.md (this file)
│   └── scenes/
└── normandy-1944/            ← nested repo, remote: raclettemeister/normandy-1944
    ├── docs/
    │   ├── GAME_SPEC.md      ← may be older version
    │   ├── agent-logs/
    │   └── plans/
    │       └── 2026-02-25-normandy-1944-design.md
    └── (all game code)
```

### Target state

```
normandy-1944/                ← single repo, remote: raclettemeister/normandy-1944
├── docs/
│   ├── GAME_SPEC.md          ← latest version (from parent)
│   ├── agent-logs/
│   ├── plans/                ← all plans merged in
│   └── scenes/               ← scene writing guides
├── .github/workflows/
│   └── deploy.yml            ← GitHub Actions: test → build → deploy to Pages
├── src/
├── tests/
├── worker/
├── README.md                 ← Cloud Agent-friendly
├── package.json
└── vite.config.ts
```

### What moves where

| From (parent) | To (normandy-1944) | Notes |
|---|---|---|
| `docs/GAME_SPEC.md` | `docs/GAME_SPEC.md` | Replace — parent version is newer |
| `docs/plans/*.md` | `docs/plans/*.md` | Merge — add files that don't exist |
| `docs/scenes/` | `docs/scenes/` | Copy — doesn't exist in normandy-1944 |

The parent repo becomes disposable after flattening. The user's Cursor workspace moves to `normandy-1944/`.

---

## 3. Git Strategy

### Before flattening: merge AI features to main

The `feat/ai-narrative-pivot` branch (33 commits) merges to `main` before anything else. Reasons:

1. **The i18n plan targets the full codebase** — it modifies `AccessCodeInput.tsx`, `FreeTextInput.tsx`, `narrativeService.ts`, `promptBuilder.ts`, and other files that only exist on the feature branch. Branching i18n off a `main` without these files makes the plan immediately wrong.
2. **AI features degrade gracefully** — without an access code, the game runs in offline mode (hardcoded text, all decisions visible). No player will encounter AI features unless given a code.
3. **Simpler branch topology** — one `main` with everything, feature branches for new work. No parallel long-lived branches.

### After merging

| Branch | Purpose |
|---|---|
| `main` | Deployed, playable game (easy mode works without LLM, AI mode behind access code) |
| `feat/i18n` | French/English support (branches off `main`, merges when complete) |

### Merge approach

Standard merge (not squash) to preserve the 33-commit history. The commits are well-structured with clear messages.

---

## 4. GitHub Pages Deployment

### GitHub Actions workflow

`.github/workflows/deploy.yml`:

- **Trigger**: push to `main`
- **Steps**: checkout → setup node 22 → `npm ci` → `npm test` → `npm run build` → deploy to Pages
- **Secrets**: `VITE_NARRATIVE_API_URL` injected at build time (empty = offline mode)
- **Permissions**: `pages: write`, `id-token: write`

### One-time setup

1. Repo Settings → Pages → Source: "GitHub Actions"
2. Add `VITE_NARRATIVE_API_URL` as a repository secret (empty for now, set to Worker URL later)

### Vite base path

Already configured as `/normandy-1944/` in `vite.config.ts`. Matches the GitHub Pages URL `raclettemeister.github.io/normandy-1944`. No change needed.

### Result

Game live at `https://raclettemeister.github.io/normandy-1944/`. Auto-deploys on every push to `main`. Tests gate deployment — if tests fail, deploy doesn't happen.

---

## 5. Cloudflare Worker

### What it does

Validates access codes against KV and proxies requests to Anthropic's Claude API with streaming support. ~150 lines of code.

### Deployment

Manual, off the critical path:

1. Verify Cloudflare account / `wrangler` auth
2. Set Anthropic API key: `cd worker && npx wrangler secret put ANTHROPIC_API_KEY`
3. Deploy: `cd worker && npx wrangler deploy`
4. Note the Worker URL
5. Add URL as `VITE_NARRATIVE_API_URL` GitHub repo secret
6. Next push to `main` auto-rebuilds with the Worker URL baked in

### When it matters

Not yet. The Worker only matters when a player has an access code and the `VITE_NARRATIVE_API_URL` is set. Until then, the game runs in offline mode.

### CORS

The Worker must allow requests from `raclettemeister.github.io`. Verify this in `worker/src/index.ts` before deploying.

---

## 6. Cloud Agent Readiness

### Why it matters

Cursor's Cloud Agents run in isolated VMs, onboard from the GitHub repo, use the software to test changes, and produce merge-ready PRs with demo videos and screenshots. The i18n implementation (2,825-line plan) is a perfect Cloud Agent task.

### Requirements

**Zero-config dev setup:**
- `npm install && npm run dev` → game runs at `localhost:5173/normandy-1944/`
- `npm test` → all tests pass
- No `.env` required for basic functionality

**README.md must include:**
- One-line project description
- Quick start commands
- Tech stack summary
- Architecture overview (engine, components, content, services, worker)
- Links to `docs/GAME_SPEC.md` and `docs/plans/`
- How to run tests

**Task definitions:**
- `docs/plans/*.md` contain structured implementation plans with exact file paths, step-by-step instructions, and verification criteria
- These serve as work orders for Cloud Agents

---

## 7. Sequencing

```
Step 1: Merge feat/ai-narrative-pivot → main
Step 2: Flatten docs from parent into normandy-1944/
Step 3: Write README.md
Step 4: Add GitHub Actions workflow
Step 5: Verify tests pass locally
Step 6: Push to origin/main
Step 7: Enable GitHub Pages in repo settings
Step 8: Verify game live at raclettemeister.github.io/normandy-1944
    ↓
Step 9 (parallel, whenever): Deploy Cloudflare Worker
    ↓
Step 10 (separate session): Create feat/i18n branch, execute existing plan (Cloud Agent candidate)
```

### Dependency chain

```
Merge AI branch → Flatten docs → README + CI/CD → Push → Site live
                                                       → Cloud Agents can onboard
                                                       → i18n work begins
                                                       → Worker deployed (whenever)
```

---

## 8. Pre-flight Checks

Before pushing, verify:

- [ ] `npm test` passes on merged `main`
- [ ] `npm run build` succeeds
- [ ] `.gitignore` covers `.env.local`, `node_modules/`, `dist/`
- [ ] No secrets in committed files
- [ ] Vite base path `/normandy-1944/` works in dev mode
- [ ] Worker CORS allows `raclettemeister.github.io`

---

## 9. Decisions Log

| # | Decision | Reasoning |
|---|---|---|
| 1 | Flatten to single repo | One source of truth. Parent repo was a workspace container, not a project. |
| 2 | Merge AI features to main before going live | i18n plan targets the full codebase. AI features degrade gracefully behind access codes. Simpler branch topology. |
| 3 | GitHub Pages (not Cloudflare Pages) | Already configured (Vite base path). Same GitHub ecosystem. No new accounts needed. |
| 4 | GitHub Actions CI/CD for frontend | Auto-deploy on push. Tests gate deployment. Standard, well-documented. |
| 5 | Manual Worker deployment | Worker changes rarely (~150 lines). Automation is overhead without benefit. |
| 6 | Cloud Agent readiness as first-class concern | i18n plan is a perfect Cloud Agent task. Good README + clean setup = better agent onboarding and demos. |
| 7 | Skip Worker deployment on critical path | Worker only matters with access codes. Deploy it whenever, not as a blocker. |

---

**Open this in your editor and annotate it directly. Even a quick read-through usually catches something.**
