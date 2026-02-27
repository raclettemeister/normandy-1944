# Project Map

Architectural reference for normandy-1944. Read this to orient yourself before making changes.

---

## Architecture Overview

Three layers plus a backend:

```
┌─────────────────────────────────────────────┐
│  src/components/   React UI                 │
│  Renders game state. All text via i18n.     │
├─────────────────────────────────────────────┤
│  src/engine/       Pure Game Logic          │
│  State machine, outcomes, resources.        │
│  No React. No side effects.                 │
├─────────────────────────────────────────────┤
│  src/content/      Game Content             │
│  Scenarios, wiki, soldier data.             │
│  Defines choices and narrative, not logic.  │
└─────────────────────────────────────────────┘
         ↕ (optional AI narration)
┌─────────────────────────────────────────────┐
│  worker/           Cloudflare Worker        │
│  Proxies Anthropic API. Access codes. CORS. │
└─────────────────────────────────────────────┘
```

**Boundary rules:**
- Engine has no React imports — pure TypeScript logic
- Components never modify engine state directly — they go through `GameScreen.tsx`
- Scenarios define content (narrative, choices, outcomes), not behavior
- Worker is independently deployed and has its own `package.json`

---

## Data Flow

Player makes a choice:
1. `DecisionPanel` renders available choices
2. Player selects → `GameScreen` receives the decision
3. `GameScreen` calls `outcomeEngine.resolveOutcome()` with game state + decision
4. Engine computes effective score (tactical quality + state modifiers + dice roll)
5. Engine returns outcome (resource changes, casualties, narrative triggers)
6. `GameScreen` updates state, advances scene
7. Components re-render with new state
8. (Optional) `narrativeService` calls Worker → Anthropic API for AI narration

---

## `src/engine/` — Game Logic (8 files)

| File | Purpose |
|------|---------|
| `gameState.ts` | Core state machine. Phase calculation, capabilities derivation, time management, state transitions, initial state creation with difficulty settings. |
| `outcomeEngine.ts` | Outcome resolution. Computes effective scores from tactical tiers, rolls outcomes within ranges, assigns casualties, handles scene transitions, determines counterattack triggers. |
| `scenarioLoader.ts` | Scenario registry. Registers and retrieves scenarios by act or ID, manages scene transitions and decision availability. |
| `roster.ts` | Platoon roster. 18 named soldiers with ranks, roles, backgrounds, traits. Rally event handling. |
| `battleOrders.ts` | Mission timeline. OPORD milestones, achievement status tracking. |
| `achievementTracker.ts` | Achievement system. Loading/unlocking achievements from localStorage, checking unlock conditions. |
| `balanceEnvelope.ts` | Balance math. Derives min/max outcome ranges (menLost, ammoSpent, moraleChange, readinessChange) from decision tiers. |
| `metaProgress.ts` | Meta-progression persistence. Saves/loads wiki entries, roster notes, completed runs, best stats, difficulty unlocks to localStorage. |

---

## `src/components/` — React UI (19 files)

| File | Purpose |
|------|---------|
| `GameScreen.tsx` | **Main orchestrator.** Manages tactical cycle (Briefing → Plan → Prep → Execution), coordinates state, handles AI narrative generation. Most game flow logic lives here. |
| `MainMenu.tsx` | Entry screen. Difficulty selection, achievements, wiki, reset, access code input. |
| `DecisionPanel.tsx` | Decision selection UI. Available decisions with seeded shuffle, captain position selector, 2IC comments. |
| `BriefingPhase.tsx` | Briefing phase. Player plan, 2IC reaction, soldier reactions, DM reasoning, commit/revise options. |
| `PlanPhase.tsx` | Planning phase. Free-text input for orders + decision panel, reveal tokens, captain position. |
| `PrepPhase.tsx` | Preparation phase. Prep action selection (2IC conversations), time cost tracking. |
| `NarrativePanel.tsx` | Scene/outcome/rally narrative display with streaming text support. |
| `InterludeScreen.tsx` | Between-scene interludes. Beat text, narrative text (streaming), objective reminders. |
| `StatusPanel.tsx` | Resource display. Men, ammo, morale (color-coded), readiness, time, alert status. |
| `OrdersPanel.tsx` | Battle orders display. OPORD text, mission timeline, milestone status, commander's intent. |
| `RosterPanel.tsx` | Soldier roster. Expandable details, editable notes (debounced), role formatting, status indicators. |
| `WikiPanel.tsx` | Wiki browser. Categorized entries, filtering, unlock status, detail viewing. |
| `FreeTextInput.tsx` | Text input form for player orders. Validation, character limits, loading states. |
| `StreamingText.tsx` | Character-by-character text reveal animation for narrative text. |
| `AccessCodeInput.tsx` | Access code validation form for LLM narrative mode. |
| `AchievementPopup.tsx` | Achievement unlock notification popup. |
| `DeathReport.tsx` | Game over screen. Death narrative, final stats, last lesson, restart/epilogue options. |
| `EpilogueScreen.tsx` | End-game epilogue. Generated narratives per soldier based on status. |
| `LanguageSelector.tsx` | Language toggle (English/French). |

---

## `src/services/` — LLM Integration (4 files)

| File | Purpose |
|------|---------|
| `narrativeService.ts` | Coordinates all LLM calls. Scene narration, outcome narratives, rally text, epilogues, interlude text. Detects mode (hardcoded vs LLM). |
| `promptBuilder.ts` | Builds system/user prompts for DM evaluation, narration, classification, rally, epilogue, interlude. Includes game state as context. |
| `dmLayer.ts` | DM (Dungeon Master) evaluation layer. Evaluates player text against tactical tiers using LLM. Validates tier assignments. |
| `eventLog.ts` | Event tracking. Records playthrough events (casualties, brave acts), filters by soldier/type, provides recent events for DM context. |

---

## `src/types/index.ts` — Type Definitions

Single file exporting all game types: `GameState`, `Soldier`, `Decision`, `Scenario`, `Outcome`, `Achievement`, `MetaProgress`, and related interfaces.

---

## `src/content/scenarios/` — Game Content

**Act 1 (implemented):** 7 scenes + index
| File | Scene |
|------|-------|
| `act1/scene01_landing.ts` | The Landing — parachute drop, gear check, compass finding |
| `act1/scene02_finding_north.ts` | Finding North — navigation in bocage country |
| `act1/scene03_first_contact.ts` | First Contact — initial enemy encounter |
| `act1/scene04_the_sergeant.ts` | The Sergeant — meeting sergeant, rallying scattered men |
| `act1/scene05_the_patrol.ts` | The Patrol — stealth/engagement decisions |
| `act1/scene06_the_farmhouse.ts` | The Farmhouse — tactical decisions at farmhouse |
| `act1/scene07_the_road.ts` | The Road — road movement, final Act 1 objective |
| `act1/index.ts` | Registry — imports and registers all Act 1 scenes |

**Acts 2-3:** Not yet implemented.

---

## `src/locales/` — Internationalization

Configuration in `src/locales/i18n.ts`. Two languages: English (`en/`) and French (`fr/`).

Namespaces (each a separate JSON file):
- `ui` — Button labels, menu items, panel titles
- `game` — Status labels, mechanics terms, in-game text
- `soldiers` — Soldier names, ranks, backgrounds, traits
- `orders` — OPORD text and mission content
- `achievements` — Achievement titles and descriptions
- `secondInCommand` — 2IC comments and reactions
- `scenes/act1_scene01` through `scenes/act1_scene07` — Per-scene narrative and decision text

---

## `tests/` — Test Structure (16 files)

| Directory | Coverage |
|-----------|----------|
| `tests/engine/` | `gameState`, `outcomeEngine`, `balanceEnvelope`, `metaProgress`, `rosterNotes` |
| `tests/services/` | `dmLayer`, `narrativeService`, `promptBuilder`, `eventLog`, `interludePrompt` |
| `tests/content/` | `validation` (scenario structure), `wiki` (entry integrity), `relationships` (soldier links) |
| `tests/integration/` | `tacticalCycle` (full DM → outcome → state flow) |
| `tests/i18n/` | `i18n` (config/switching), `locale-keys` (EN/FR key parity) |

Run all: `npm test`
Run one: `npx vitest run tests/path/to/test.ts`

---

## `worker/` — Cloudflare Worker Backend

Independently deployed. Separate `package.json` and `tsconfig.json`.

**Entry:** `worker/src/index.ts` (~100 lines)

**Endpoints:**
- `POST /api/validate-code` — Validates access codes against Cloudflare KV
- `POST /api/narrative` — Proxies narrative generation to Anthropic API (requires Bearer token)

**Config:** `worker/wrangler.jsonc` — KV binding for `ACCESS_CODES`, compatibility date 2025-01-01

**Deploy:** `cd worker && wrangler deploy` (manual, not in CI)

**Secret:** `ANTHROPIC_API_KEY` set via `wrangler secret put`

---

## Key Patterns

### Adding a New Scenario
1. Create `src/content/scenarios/act{N}/scene{NN}_{name}.ts`
2. Export a `Scenario` object matching the type in `src/types/index.ts`
3. Register it in `src/content/scenarios/act{N}/index.ts`
4. Add locale files: `src/locales/en/scenes/act{N}_scene{NN}.json` and `fr/` equivalent
5. Add content validation in `tests/content/validation.test.ts`

### Adding a New Component
1. Create `src/components/ComponentName.tsx` (PascalCase)
2. Use `useTranslation()` for all display text
3. Import and use in parent component (usually `GameScreen.tsx` or `MainMenu.tsx`)

### Adding/Modifying i18n Strings
1. Add key to `src/locales/en/<namespace>.json`
2. Add same key to `src/locales/fr/<namespace>.json`
3. Use via `t('namespace:key')` in component
4. Run `tests/i18n/locale-keys.test.ts` to verify parity

### Adding a New Test
1. Create `tests/<mirror-src-path>/<name>.test.ts`
2. Use Vitest (`describe`, `it`, `expect`)
3. Run: `npx vitest run tests/path/to/test.ts`

---

## What NOT to Do

- **Don't put game logic in components.** State calculations, outcome resolution, and resource management belong in `src/engine/`.
- **Don't hardcode user-facing strings.** Everything goes through i18n. Both `en/` and `fr/` must be updated.
- **Don't modify engine state from UI.** Components read state; `GameScreen.tsx` orchestrates mutations.
- **Don't skip i18n key parity.** If you add an English key without a French key, the locale-keys test will fail.
- **Don't import React in engine files.** Engine is pure TypeScript logic, framework-agnostic.
- **Don't deploy worker changes through CI.** Worker deploys are manual via `wrangler deploy`.
