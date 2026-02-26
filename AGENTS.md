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
