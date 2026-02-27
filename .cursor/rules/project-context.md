---
description: Project context and architecture overview for normandy-1944
alwaysApply: true
---

# Project Context

Normandy 1944 is a text-based tactical roguelike set during D-Day airborne operations. You command 2nd Platoon, Easy Company, 506th PIR, 101st Airborne Division.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, deployed to GitHub Pages
- **Backend:** Cloudflare Worker (TypeScript), Anthropic API (Claude Sonnet 4)
- **Testing:** Vitest with happy-dom
- **i18n:** i18next + react-i18next (English and French)

## Architecture

- `src/engine/` — Pure game logic. State machine, outcome resolution, resource management. No React imports.
- `src/content/scenarios/` — Game content organized by act/scene. Each scenario defines narrative, choices, outcomes, state changes.
- `src/components/` — React UI. Reads engine state, renders it. All text through i18n `useTranslation()`.
- `src/services/` — LLM integration. Prompt building, narrative generation, DM evaluation layer.
- `src/types/` — TypeScript type definitions (single `index.ts`).
- `src/locales/` — i18n locale files. `en/` and `fr/` with JSON files per namespace.
- `worker/` — Cloudflare Worker backend. Proxies Anthropic API calls. Separate deploy via `wrangler deploy`.
- `tests/` — Vitest tests mirroring `src/` structure.

## Key References

- Full game design: `docs/GAME_SPEC.md`
- Architecture map: `docs/PROJECT_MAP.md`
- Design documents: `docs/plans/`
- Scene writing guides: `docs/scenes/`

## Deploy

- **Frontend:** Push to `main` → GitHub Actions → GitHub Pages
- **Backend:** Manual `wrangler deploy` from `worker/` directory
