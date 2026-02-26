# Wiki Merge, Roster Notes & Interludes — Design

**Date:** 2026-02-26
**Linear Issues:** ROC-1, ROC-2, ROC-3
**Status:** Approved

---

## Context

Three features that share a common dependency: meta-progression persistence across roguelike runs.

- **ROC-1:** Merge lessons into wiki. Remove lessons tab. Expand wiki into a full field manual with more sections.
- **ROC-2:** Free-text notes per soldier in the platoon roster. A personal journal that persists.
- **ROC-3:** Interlude moments between every scene transition — banter, movement narration, objective reminders. The AI bridges what just happened with what's coming next.

The game is a roguelike that can take months to complete. Progress on the field manual and soldier observations must survive across deaths and restarts.

---

## 1. Meta-Progression Save System (Foundation)

Two-layer localStorage. Run state resets on death. Meta state persists forever.

### `normandy1944_meta` (persists across runs)

```typescript
interface MetaProgress {
  unlockedWikiEntries: string[];
  rosterNotes: Record<string, string>;    // soldierId → free text
  completedRuns: number;
  bestRun: { act: number; scene: string; time: string } | null;
  difficultyUnlocked: string[];
  achievements: string[];
}
```

### `normandy1944_run` (resets on death/new game)

The current `GameState` — act, scene, phase, roster status, ammo, morale, time, etc. Same shape as today, just namespaced.

### Engine: `src/engine/metaProgress.ts`

- `loadMeta(): MetaProgress` — load from localStorage, return defaults if empty
- `saveMeta(meta: MetaProgress): void` — persist to localStorage
- `unlockWikiEntry(id: string): void` — add to meta, save immediately
- `setRosterNote(soldierId: string, note: string): void` — update meta, save (debounced)
- `resetRun(): void` — wipe run state, keep meta
- `recordRunEnd(result: RunResult): void` — update completedRuns, bestRun, achievements

On game start: load both. On death/restart: wipe run, keep meta. On wiki unlock or note edit: persist to meta immediately.

---

## 2. Wiki / Lessons Merge (ROC-1)

Delete the lessons tab (`LessonJournal` component, `lessonTracker.ts`). Replace with an expanded wiki that absorbs lesson functionality.

### Categories

| Category | Always Available? | Content |
|---|---|---|
| **Operation** | Yes | Operation overview, D-Day timeline, objectives, map context |
| **Your Unit** | Yes | 101st Airborne history, Easy Company, chain of command |
| **Weapons & Equipment** | Yes | M1 Garand, BAR, MG42, grenades, medkits, vehicles |
| **Enemy Forces** | Partial | German units, common tactics. Some unlock on encounter |
| **Terrain & Landmarks** | Partial | Bocage, the church, the crossroads. Unlock on visit |
| **Tactics Learned** | All locked | Former "lessons." Unlock by making decisions in-game |

Structure is broad top-level for fast navigation, narrative-flavored names so it doesn't feel like a dry encyclopedia.

### Data Model

```typescript
type WikiCategory =
  | "operation"
  | "your_unit"
  | "weapons_equipment"
  | "enemy_forces"
  | "terrain_landmarks"
  | "tactics_learned";

interface WikiEntry {
  id: string;
  term: string;
  category: WikiCategory;
  shortDescription: string;
  fullDescription: string;
  tacticalNote?: string;
  alwaysAvailable: boolean;
  unlockedBy?: string[];        // decision IDs that unlock this entry
}
```

Content authored in `src/content/wiki.json`.

### UX

- Left sidebar: 6 category tabs (icon + label)
- Main area: entry list for selected category
- Locked entries show as redacted (title visible, content replaced with "???") — player knows something exists but can't read it yet
- Click entry → full article: `shortDescription`, `fullDescription`, `tacticalNote`
- Badge count on wiki toolbar button shows newly unlocked entries since last open
- Scrollable but not overwhelming — categories keep things organized

### Unlock Flow

Decisions in scenario files can specify `wikiUnlocks: string[]` (replaces the old `lessonUnlocked` field). When a decision is made, those entry IDs get added to `normandy1944_meta.unlockedWikiEntries`. The old `lessonUnlocked` field is migrated to `wikiUnlocks` in existing scenario files.

---

## 3. Roster Notes (ROC-2)

Minimal addition to the existing `RosterPanel`.

### UX

- Each soldier card gets a small note icon
- Click → text area expands below that soldier's info
- Free text, no character limit, no formatting
- Auto-saves to `normandy1944_meta.rosterNotes[soldierId]` on keystroke (debounced ~500ms)
- If a note exists, the icon renders as filled/highlighted for quick scanning
- Notes persist across runs — same soldiers, observations accumulate

### What doesn't change

- Roster display (rank, name, role, status) unchanged
- Rally system unchanged
- `Soldier` interface untouched — notes live in meta-progression, not in the soldier object
- `roster.ts` data file unchanged

---

## 4. Interludes (ROC-3)

A distinct narrative moment between every scene transition. The AI acts as a continuity editor, bridging what just happened with what's coming next.

### Game Rhythm

```
Scene → Decision → Outcome → INTERLUDE → Next Scene
```

### Data Model

Added to the destination scene (the scene being entered):

```typescript
interface Interlude {
  type: "movement" | "rest" | "transition";
  beat: string;                   // authored: "Platoon moves in wedge formation toward the church"
  context?: string;               // LLM tone hint: "tense, they just lost a man"
  objectiveReminder?: string;     // "Secure the crossroads before 0600"
}
```

Lives on `Scene.interlude`. If absent, scene transitions directly (like today).

### Rendering

1. Scene outcome finishes
2. Screen transitions to interlude view — cinematic, darker tone
3. Authored `beat` displays as stage direction
4. **LLM mode:** Narrative service generates 2-4 lines of contextual banter/narration
5. **Hardcoded mode:** Beat text only. Still provides breathing room.
6. `objectiveReminder` appears at bottom if present
7. "Continue" button or spacebar → next scene loads

### LLM Narrative Bridge (Key Design Decision)

The AI doesn't generate random banter. It finds coherence between what happened and what's coming. The prompt builder (`buildInterludePrompt()`) provides three anchors:

1. **Backward:** Previous outcome text, casualties, morale shift, the player's decision
2. **Beat:** Authored transition direction and tone context
3. **Forward:** Next scene's `narrative` / `sceneContext` — where the story is headed

Plus roster state: who's alive, who's wounded, current morale. The LLM weaves these into a short, atmospheric bridge that makes the story feel continuous rather than episodic.

### Act Transitions

Interludes between acts (1→2, 2→3) are special: longer beats, richer authored content, more LLM generation allowance. These are full briefing moments, not just banter.

### New Files

- `src/components/InterludeScreen.tsx` — interlude UI component
- `promptBuilder.ts` gets `buildInterludePrompt()` function
- `narrativeService.ts` gets `narrateInterlude()` method

---

## Dependencies Between Features

```
Meta-Progression Save System
    ├── Wiki Merge (needs meta for unlock persistence)
    ├── Roster Notes (needs meta for note persistence)
    └── (achievements, stats — future)

Interludes
    ├── Scene data model changes (interlude field)
    ├── Narrative service extension (interlude prompts)
    └── Independent of meta-progression
```

Meta-progression is the foundation. Wiki and roster notes depend on it. Interludes are architecturally independent but should be built last since they touch the game flow.

---

## Implementation Order

1. Meta-progression save system (foundation)
2. Wiki merge + content authoring (ROC-1)
3. Roster notes (ROC-2) — smallest, quick win
4. Interludes (ROC-3) — most complex, touches game flow

---

## What This Design Does NOT Cover

- Cloud saves / Supabase sync (future upgrade path)
- Export/import JSON for backup (nice-to-have later)
- Wiki terms clickable in narrative text (planned but separate)
- Actual wiki content authoring (the entries themselves — that's content work, not engineering)
- Achievement definitions (structure exists, content TBD)
