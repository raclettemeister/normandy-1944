# Normandy 1944 — Agent Instructions

## Cursor Cloud specific instructions

### Services

| Service | Command | URL | Notes |
|---|---|---|---|
| Vite dev server | `npm run dev` | http://localhost:5173/normandy-1944/ | Only required service. Game is fully playable in offline/hardcoded mode. |
| Cloudflare Worker | `cd worker && npm install && wrangler dev` | — | Optional. Only needed for LLM narrative mode. |

### Key commands

See `package.json` scripts. Quick reference:

- **Dev server**: `npm run dev`
- **Tests**: `npm test` (Vitest, 250 tests, ~2s)
- **Lint**: `npm run lint`
- **Build**: `npm run build` (runs `tsc -b && vite build`)

### Gotchas

- **Build (`npm run build`) has a pre-existing TS error** in `src/components/GameScreen.tsx` (unused variable `outcome` at line 335). The `tsc -b` step fails. The Vite dev server is unaffected since it transpiles without full type checking.
- **Lint (`npm run lint`) exits non-zero** due to pre-existing unused-variable errors and a ref-access-during-render warning in `StreamingText.tsx`. These are existing codebase issues.
- The game runs entirely in offline/hardcoded mode by default (no `.env` file needed). AI narrative mode requires `VITE_NARRATIVE_API_URL` pointing to a deployed Cloudflare Worker.
- The dev server serves the app at the `/normandy-1944/` base path (matching the GitHub Pages deployment), not at root `/`.

## Working protocol (Cockpit core)

### Core principles

1. **Search first**: before writing or suggesting new code, search the codebase and verify what already exists.
2. **Reuse first**: extend existing utilities/patterns before creating new ones.
3. **Explain before doing**: briefly explain what is about to change, why, trade-offs, and risks.
4. **No assumptions**: rely only on repo files, user instructions, and tool outputs.

### The three laws

1. **No code without architecture**: if there is no design/spec for a meaningful feature, create one first.
2. **No moving forward without iteration**: revise plans at least once; do not treat first-pass plans as final.
3. **No "done" without review**: review the diff, run relevant checks, and commit with a message that explains why.

### Session discipline

- Prefer a fresh chat for a clearly new task.
- Perform anti-drift checks periodically to confirm the scope is still aligned.
- End cleanly: commit staged changes and avoid leaving partial work behind.

## Research -> Plan -> Annotate protocol (for feature work)

Use this flow for new features, significant changes, or when planning is explicitly requested.

### Step 1: Research

- Deep-read the relevant code and docs.
- Write findings to: `docs/plans/YYYY-MM-DD-<topic>-research.md`
- Include: current behavior, dependencies, constraints, edge cases, and gotchas.
- Ask the user to review and correct anything inaccurate before planning.

### Step 2: Plan

- After research review, write: `docs/plans/YYYY-MM-DD-<topic>-plan.md`
- Break work into 2-5 minute tasks with exact file paths and verification steps.
- Ask the user to annotate the plan directly in the markdown file.

### Step 3: Annotate -> Update -> Repeat

- Read inline annotations from the user.
- Update the plan and iterate until the user confirms it is ready.

### Step 4: Implement

- Implement only after explicit go-ahead (for example: "implement it all").
