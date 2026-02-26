# Normandy 1944

A text-based tactical roguelike set during the D-Day airborne operations. You command 2nd Platoon, Easy Company, 506th Parachute Infantry Regiment, 101st Airborne Division — dropped into occupied France on the night of June 5-6, 1944.

## The Game

You start alone in a flooded Norman field at 0115 hours. Your stick was scattered by flak. Your rifle is at the bottom of a ditch. You have a pistol, two grenades, and a cricket clicker.

Your mission: rally your men, navigate to the objective, and survive.

**Every decision costs time. Every minute makes the enemy stronger.**

### Core Mechanics

- **5 resources** — Men, Ammo, Morale, Enemy Readiness, Time
- **Outcome engine** — Tactical quality + state modifiers + dice = results
- **Battle Orders** — Timed objectives from the OPORD. The game doesn't remind you. The clock is always visible. You do the math.
- **18 named soldiers** — Each with traits, personalities, backstories. You learn who they are across playthroughs.
- **Lessons Learned** — Real tactical knowledge unlocked through play, persisting across runs. The roguelike progression is player knowledge, not stat upgrades.

### Current State (Demo)

Act 1, Scenes 1-6: The Drop. Landing, orientation, first contact, rallying your platoon sergeant, a German patrol encounter, and a farmhouse clearing.

## Quick Start

```bash
npm install
npm run dev
```

Game runs at http://localhost:5173/normandy-1944/

## Run Tests

```bash
npm test
```

216 tests across 10 test files.

## Production Build

```bash
npm run build
```

Output in `dist/`. Deployed to GitHub Pages automatically on push to `main`.

## Tech Stack

- Frontend: React 19, TypeScript 5.9, Vite 7
- Testing: Vitest 4
- Backend: Cloudflare Workers (LLM proxy, access code validation)
- Deployment: GitHub Pages (frontend), Cloudflare Workers (backend)

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

- [Game Specification](docs/GAME_SPEC.md) — Complete game design
- [Design Documents](docs/plans/) — Architecture decisions, implementation plans
- [Scene Writing Guides](docs/scenes/) — Per-scene narrative and decision guides

## AI Narration

The game supports two modes: offline (default) and AI mode with an access code. In offline mode, pre-authored narrative and outcomes are used. AI mode uses an LLM to generate dynamic narrative and decisions; it degrades gracefully if the service is unavailable or the access code is invalid.

## License

All rights reserved.
