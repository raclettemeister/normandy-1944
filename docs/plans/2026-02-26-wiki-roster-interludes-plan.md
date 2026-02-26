# Wiki Merge, Roster Notes & Interludes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build meta-progression persistence, merge lessons into an expanded wiki, add free-text roster notes, and create interlude scenes between transitions.

**Architecture:** Four sequential features sharing a localStorage meta-progression layer. Meta-progress is the foundation (wiki + roster notes depend on it). Interludes are independent but built last since they touch game flow. All features are pure client-side — no backend changes.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, localStorage

**Design Doc:** `docs/plans/2026-02-26-wiki-roster-interludes-design.md`

---

## Task 1: Meta-Progression Save System (Foundation)

> Unify the scattered localStorage keys (`normandy1944_lessons`, `normandy1944_achievements`) into a single `normandy1944_meta` key with a typed `MetaProgress` interface.

**Files:**
- Create: `normandy-1944/src/engine/metaProgress.ts`
- Create: `normandy-1944/tests/engine/metaProgress.test.ts`
- Modify: `normandy-1944/src/types/index.ts` (add MetaProgress interface)
- Modify: `normandy-1944/src/engine/gameState.ts` (use metaProgress instead of lessonTracker)
- Modify: `normandy-1944/src/components/GameScreen.tsx` (use metaProgress for unlock calls)
- Modify: `normandy-1944/src/components/MainMenu.tsx` (use metaProgress for reset)
- Modify: `normandy-1944/src/engine/lessonTracker.ts` (deprecate — will be deleted after wiki merge)

### Step 1.1: Add MetaProgress type

Add to `normandy-1944/src/types/index.ts` at the end of the file, before the closing types:

```typescript
// ─── Meta-Progression ─────────────────────────────────────────────

export interface MetaProgress {
  unlockedWikiEntries: string[];
  rosterNotes: Record<string, string>;
  completedRuns: number;
  bestRun: { act: number; scene: string; time: string } | null;
  difficultyUnlocked: string[];
  achievements: string[];
}
```

### Step 1.2: Write the failing test for metaProgress

Create `normandy-1944/tests/engine/metaProgress.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadMeta,
  saveMeta,
  unlockWikiEntry,
  setRosterNote,
  resetRun,
  recordRunEnd,
  resetMeta,
  migrateFromLegacy,
} from "../../src/engine/metaProgress.ts";
import type { MetaProgress } from "../../src/types/index.ts";

const STORAGE_KEY = "normandy1944_meta";
const LEGACY_LESSONS_KEY = "normandy1944_lessons";
const LEGACY_ACHIEVEMENTS_KEY = "normandy1944_achievements";

beforeEach(() => {
  localStorage.clear();
});

describe("loadMeta", () => {
  it("returns defaults when localStorage is empty", () => {
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
    expect(meta.rosterNotes).toEqual({});
    expect(meta.completedRuns).toBe(0);
    expect(meta.bestRun).toBeNull();
    expect(meta.difficultyUnlocked).toEqual([]);
    expect(meta.achievements).toEqual([]);
  });

  it("loads saved meta from localStorage", () => {
    const saved: MetaProgress = {
      unlockedWikiEntries: ["m1_garand"],
      rosterNotes: { henderson: "Good leader" },
      completedRuns: 2,
      bestRun: { act: 3, scene: "victory", time: "1800" },
      difficultyUnlocked: ["medium"],
      achievements: ["first_drop"],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const meta = loadMeta();
    expect(meta).toEqual(saved);
  });

  it("returns defaults on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not json");
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});

describe("saveMeta", () => {
  it("persists to localStorage", () => {
    const meta = loadMeta();
    meta.completedRuns = 5;
    saveMeta(meta);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!).completedRuns).toBe(5);
  });
});

describe("unlockWikiEntry", () => {
  it("adds entry to unlockedWikiEntries", () => {
    unlockWikiEntry("m1_garand");
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toContain("m1_garand");
  });

  it("does not duplicate entries", () => {
    unlockWikiEntry("m1_garand");
    unlockWikiEntry("m1_garand");
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries.filter(e => e === "m1_garand")).toHaveLength(1);
  });
});

describe("setRosterNote", () => {
  it("saves note for soldier", () => {
    setRosterNote("henderson", "Solid NCO");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Solid NCO");
  });

  it("overwrites existing note", () => {
    setRosterNote("henderson", "First note");
    setRosterNote("henderson", "Updated note");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Updated note");
  });
});

describe("resetMeta", () => {
  it("clears all meta data", () => {
    unlockWikiEntry("test");
    resetMeta();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});

describe("migrateFromLegacy", () => {
  it("migrates legacy lessons into unlockedWikiEntries", () => {
    localStorage.setItem(LEGACY_LESSONS_KEY, JSON.stringify(["assess_before_acting", "dead_reckoning"]));
    localStorage.setItem(LEGACY_ACHIEVEMENTS_KEY, JSON.stringify(["first_drop"]));
    migrateFromLegacy();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toContain("assess_before_acting");
    expect(meta.unlockedWikiEntries).toContain("dead_reckoning");
    expect(meta.achievements).toContain("first_drop");
  });

  it("removes legacy keys after migration", () => {
    localStorage.setItem(LEGACY_LESSONS_KEY, JSON.stringify(["test"]));
    migrateFromLegacy();
    expect(localStorage.getItem(LEGACY_LESSONS_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_ACHIEVEMENTS_KEY)).toBeNull();
  });

  it("does nothing when no legacy data exists", () => {
    migrateFromLegacy();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});
```

### Step 1.3: Run tests to verify they fail

Run: `cd normandy-1944 && npx vitest run tests/engine/metaProgress.test.ts`
Expected: FAIL — module not found

### Step 1.4: Implement metaProgress.ts

Create `normandy-1944/src/engine/metaProgress.ts`:

```typescript
import type { MetaProgress } from "../types/index.ts";

const STORAGE_KEY = "normandy1944_meta";
const LEGACY_LESSONS_KEY = "normandy1944_lessons";
const LEGACY_ACHIEVEMENTS_KEY = "normandy1944_achievements";

function createDefaultMeta(): MetaProgress {
  return {
    unlockedWikiEntries: [],
    rosterNotes: {},
    completedRuns: 0,
    bestRun: null,
    difficultyUnlocked: [],
    achievements: [],
  };
}

export function loadMeta(): MetaProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultMeta();
    return JSON.parse(stored) as MetaProgress;
  } catch {
    return createDefaultMeta();
  }
}

export function saveMeta(meta: MetaProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}

export function unlockWikiEntry(id: string): void {
  const meta = loadMeta();
  if (!meta.unlockedWikiEntries.includes(id)) {
    meta.unlockedWikiEntries.push(id);
    saveMeta(meta);
  }
}

export function setRosterNote(soldierId: string, note: string): void {
  const meta = loadMeta();
  meta.rosterNotes[soldierId] = note;
  saveMeta(meta);
}

export function resetRun(): void {
  localStorage.removeItem("normandy1944_run");
}

export function recordRunEnd(result: {
  act: number;
  scene: string;
  time: string;
}): void {
  const meta = loadMeta();
  meta.completedRuns += 1;
  if (
    !meta.bestRun ||
    result.act > meta.bestRun.act
  ) {
    meta.bestRun = result;
  }
  saveMeta(meta);
}

export function resetMeta(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function migrateFromLegacy(): void {
  const legacyLessons = localStorage.getItem(LEGACY_LESSONS_KEY);
  const legacyAchievements = localStorage.getItem(LEGACY_ACHIEVEMENTS_KEY);

  if (!legacyLessons && !legacyAchievements) return;

  const meta = loadMeta();

  if (legacyLessons) {
    try {
      const lessons = JSON.parse(legacyLessons) as string[];
      for (const id of lessons) {
        if (!meta.unlockedWikiEntries.includes(id)) {
          meta.unlockedWikiEntries.push(id);
        }
      }
    } catch { /* ignore corrupt data */ }
    localStorage.removeItem(LEGACY_LESSONS_KEY);
  }

  if (legacyAchievements) {
    try {
      const achievements = JSON.parse(legacyAchievements) as string[];
      for (const id of achievements) {
        if (!meta.achievements.includes(id)) {
          meta.achievements.push(id);
        }
      }
    } catch { /* ignore corrupt data */ }
    localStorage.removeItem(LEGACY_ACHIEVEMENTS_KEY);
  }

  saveMeta(meta);
}
```

### Step 1.5: Run tests to verify they pass

Run: `cd normandy-1944 && npx vitest run tests/engine/metaProgress.test.ts`
Expected: ALL PASS

### Step 1.6: Wire metaProgress into GameScreen

In `normandy-1944/src/components/GameScreen.tsx`:

1. Replace import: `import { unlockLesson } from "../engine/lessonTracker.ts"` → `import { unlockWikiEntry, migrateFromLegacy } from "../engine/metaProgress.ts"`
2. Replace both calls to `unlockLesson(...)` (lines ~126 and ~447) with `unlockWikiEntry(...)` — the argument stays the same (the lesson ID becomes a wiki entry ID; these are the "tactics_learned" entries).
3. Add `migrateFromLegacy()` call at the top of the component (one-time migration on first load).

### Step 1.7: Wire metaProgress into MainMenu

In `normandy-1944/src/components/MainMenu.tsx`:

Replace the `handleReset` function body:
- Remove: `resetLessons(); localStorage.removeItem("normandy1944_achievements");`
- Replace with: `resetMeta();`
- Update import accordingly.

### Step 1.8: Wire metaProgress into gameState.ts

In `normandy-1944/src/engine/gameState.ts`:

1. Replace import: `import { loadLessons } from "./lessonTracker.ts"` → `import { loadMeta } from "./metaProgress.ts"`
2. In `createInitialState()`, change line 154: `lessonsUnlocked: loadLessons()` → `lessonsUnlocked: loadMeta().unlockedWikiEntries`

### Step 1.9: Run full test suite

Run: `cd normandy-1944 && npx vitest run`
Expected: ALL PASS (existing tests should not break; `gameState.test.ts` test for "starts with empty lessons" may need updating since `loadMeta()` returns `[]` by default anyway)

### Step 1.10: Commit

```bash
git add -A && git commit -m "feat: add meta-progression save system (ROC foundation)"
```

---

## ✅ Checkpoint: Meta-Progression Complete

Verify:
- [ ] `loadMeta()` returns defaults on fresh localStorage
- [ ] `unlockWikiEntry()` persists to localStorage
- [ ] `setRosterNote()` persists to localStorage
- [ ] `migrateFromLegacy()` moves old lessons/achievements into new format
- [ ] `resetMeta()` clears everything
- [ ] All existing tests pass
- [ ] Game still starts and runs (manual check)

---

## Task 2: Wiki Merge — Types & Data Model (ROC-1, Part A)

> Replace the old WikiCategory/WikiEntry types with the design doc's 6-category model. Create the wiki content file. This task handles the data layer only — UI comes in Task 3.

**Files:**
- Modify: `normandy-1944/src/types/index.ts` (replace WikiCategory, update WikiEntry)
- Create: `normandy-1944/src/content/wiki.ts` (wiki entry definitions)
- Create: `normandy-1944/tests/content/wiki.test.ts`

### Step 2.1: Update WikiCategory and WikiEntry types

In `normandy-1944/src/types/index.ts`, replace the existing wiki types (lines ~313-331):

**Old:**
```typescript
export type WikiCategory =
  | "weapon_us"
  | "weapon_german"
  | "equipment"
  | "tactic"
  | "unit"
  | "terrain"
  | "vehicle";

export interface WikiEntry {
  id: string;
  term: string;
  category: WikiCategory;
  shortDescription: string;
  fullDescription: string;
  tacticalNote?: string;
}
```

**New:**
```typescript
export type WikiCategory =
  | "operation"
  | "your_unit"
  | "weapons_equipment"
  | "enemy_forces"
  | "terrain_landmarks"
  | "tactics_learned";

export interface WikiEntry {
  id: string;
  term: string;
  category: WikiCategory;
  shortDescription: string;
  fullDescription: string;
  tacticalNote?: string;
  alwaysAvailable: boolean;
  unlockedBy?: string[];
}
```

### Step 2.2: Write the wiki content data file

Create `normandy-1944/src/content/wiki.ts` with entries across all 6 categories. Requirements:
- At minimum 2-3 entries per category (18+ total)
- All "tactics_learned" entries must have `alwaysAvailable: false` and map 1:1 to existing `lessonUnlocked` IDs from scenario files: `assess_before_acting`, `dead_reckoning`, `supply_discipline`, `recognition_signals`, `identify_before_engaging`, `rally_procedures`, `ambush_doctrine`, `tactical_patience`, `stealth_operations`, `positive_identification`, `route_selection`
- All "operation" and "your_unit" entries: `alwaysAvailable: true`
- Some "enemy_forces" and "terrain_landmarks" entries locked, some always available
- Export: `WIKI_ENTRIES: WikiEntry[]`, `getWikiEntry(id)`, `getEntriesByCategory(category)`

See design doc Section 2 for category structure.

### Step 2.3: Write wiki content validation test

Create `normandy-1944/tests/content/wiki.test.ts` that validates:
- No duplicate IDs
- Every entry has required fields
- All tactics_learned entries are locked with unlockedBy
- operation/your_unit entries are always available
- All 6 categories have at least one entry
- `getWikiEntry()` finds by ID, returns undefined for unknowns
- `getEntriesByCategory()` filters correctly

### Step 2.4: Run tests

Run: `cd normandy-1944 && npx vitest run tests/content/wiki.test.ts`
Expected: ALL PASS

### Step 2.5: Commit

```bash
git add -A && git commit -m "feat: add wiki data model and content entries (ROC-1 data layer)"
```

---

## ✅ Checkpoint: Wiki Data Layer Complete

Verify:
- [ ] WikiCategory type has 6 new categories
- [ ] WikiEntry has `alwaysAvailable` and `unlockedBy` fields
- [ ] wiki.ts has 18+ entries across all categories
- [ ] All 11 existing lesson IDs have matching tactics_learned wiki entries
- [ ] Wiki content tests pass

---

## Task 3: Wiki Merge — UI & Remove Lessons (ROC-1, Part B)

> Rewrite WikiPanel with category navigation, locked/unlocked display. Delete LessonJournal. Update toolbar. Rename `lessonUnlocked` → `wikiUnlocks` across codebase.

**Files:**
- Rewrite: `normandy-1944/src/components/WikiPanel.tsx`
- Delete: `normandy-1944/src/components/LessonJournal.tsx`
- Delete: `normandy-1944/src/engine/lessonTracker.ts`
- Modify: `normandy-1944/src/components/GameScreen.tsx` (remove lessons overlay, pass meta to wiki)
- Modify: `normandy-1944/src/styles/game.css` (wiki styles, remove lesson styles)
- Modify: `normandy-1944/src/types/index.ts` (rename lessonUnlocked → wikiUnlocks in OutcomeTemplate, lessonsUnlocked → wikiUnlocked in GameState)
- Modify: All scenario files (rename field)
- Modify: `normandy-1944/src/engine/gameState.ts`, `normandy-1944/src/services/promptBuilder.ts`, `normandy-1944/src/components/GameScreen.tsx` (rename references)

### Step 3.1: Rewrite WikiPanel.tsx

Replace `normandy-1944/src/components/WikiPanel.tsx` entirely with a component that:
- Accepts props: `unlockedEntryIds: string[]`, `onClose: () => void`
- Left sidebar: 6 category buttons with unlocked/total count
- Main area: list of entries for selected category
- Locked entries show term but "???" for description, disabled click
- Click unlocked entry → full article view with Back button
- Article shows: term, shortDescription, fullDescription, tacticalNote (if present)
- Uses `WIKI_ENTRIES` and `getEntriesByCategory` from `../content/wiki.ts`

### Step 3.2: Update GameScreen — remove lessons, wire wiki

In `normandy-1944/src/components/GameScreen.tsx`:

1. Remove `LessonJournal` import
2. Change Overlay type: remove `"lessons"`
3. Add import: `import { loadMeta } from "../engine/metaProgress.ts"`
4. Add at top of component body: `const meta = loadMeta();`
5. Remove Lessons toolbar button (the one with `data-testid="lesson-journal-btn"`)
6. Pass `unlockedEntryIds={meta.unlockedWikiEntries}` to WikiPanel
7. Remove the `overlay === "lessons"` conditional rendering block

### Step 3.3: Rename `lessonUnlocked` → `wikiUnlocks` in types

In `normandy-1944/src/types/index.ts`:
- `OutcomeTemplate.lessonUnlocked` → `OutcomeTemplate.wikiUnlocks`
- `GameState.lessonsUnlocked` → `GameState.wikiUnlocked`

### Step 3.4: Rename references across codebase

Find-and-replace across all files:
- `lessonUnlocked` → `wikiUnlocks` in all scenario files and GameScreen
- `lessonsUnlocked` → `wikiUnlocked` in gameState.ts, GameScreen.tsx, promptBuilder.ts, and any test files
- Update `PendingTransition` interface in GameScreen
- Update any `GameEndData` references

### Step 3.5: Add wiki CSS styles

Replace the `/* ─── Wiki Panel */` section in `game.css` with full wiki styling:
- `.wiki-panel`, `.wiki-layout` (flex row)
- `.wiki-categories` (sidebar nav)
- `.wiki-category-btn`, `.wiki-category-btn--active`
- `.wiki-entries` (scrollable entry list)
- `.wiki-entry-btn`, `.wiki-entry-btn--locked`
- `.wiki-article__*` (article view)
- `.wiki-back-btn`
- Mobile responsive: stack categories horizontally on small screens

Remove the `/* ─── Lesson Journal */` CSS section.

### Step 3.6: Delete old files

- Delete `normandy-1944/src/components/LessonJournal.tsx`
- Delete `normandy-1944/src/engine/lessonTracker.ts`
- Verify no remaining imports reference these deleted files (grep for `LessonJournal` and `lessonTracker`)

### Step 3.7: Run full test suite

Run: `cd normandy-1944 && npx vitest run`
Expected: ALL PASS — update any tests that reference the renamed fields

### Step 3.8: Manual verification

Open the game in browser. Verify:
- Wiki button opens Field Manual with 6 categories
- Locked entries show "???"
- Always-available entries are readable
- No "Lessons" button in toolbar
- Game plays through decisions normally, wiki entries unlock on decision

### Step 3.9: Commit

```bash
git add -A && git commit -m "feat: replace lessons with expanded wiki field manual (ROC-1 complete)"
```

---

## ✅ Checkpoint: Wiki Merge Complete (ROC-1)

Verify:
- [ ] LessonJournal.tsx deleted
- [ ] lessonTracker.ts deleted
- [ ] WikiPanel shows 6 categories with entries
- [ ] Locked entries display as redacted (???)
- [ ] Making a decision unlocks the corresponding tactics_learned entry
- [ ] Wiki unlock persists across page reloads via metaProgress
- [ ] `lessonUnlocked` renamed to `wikiUnlocks` everywhere
- [ ] `lessonsUnlocked` renamed to `wikiUnlocked` everywhere
- [ ] All tests pass
- [ ] No "Lessons" button in toolbar

---

## Task 4: Roster Notes (ROC-2)

> Add free-text notes per soldier in the RosterPanel. Notes persist in metaProgress across runs.

**Files:**
- Modify: `normandy-1944/src/components/RosterPanel.tsx` (add note textarea + icon)
- Modify: `normandy-1944/src/components/GameScreen.tsx` (pass rosterNotes to RosterPanel)
- Modify: `normandy-1944/src/styles/game.css` (note styles)
- Create: `normandy-1944/tests/engine/rosterNotes.test.ts` (integration test for note persistence)

### Step 4.1: Write failing test for roster note persistence

Create `normandy-1944/tests/engine/rosterNotes.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { loadMeta, setRosterNote, resetMeta } from "../../src/engine/metaProgress.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("roster notes via metaProgress", () => {
  it("saves and loads a note for a soldier", () => {
    setRosterNote("henderson", "Solid leader, keeps everyone calm");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Solid leader, keeps everyone calm");
  });

  it("persists across separate loadMeta calls", () => {
    setRosterNote("malone", "Good in a fight");
    const meta1 = loadMeta();
    expect(meta1.rosterNotes["malone"]).toBe("Good in a fight");
    const meta2 = loadMeta();
    expect(meta2.rosterNotes["malone"]).toBe("Good in a fight");
  });

  it("overwrites existing note", () => {
    setRosterNote("henderson", "First impression");
    setRosterNote("henderson", "Updated after combat");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Updated after combat");
  });

  it("supports notes for multiple soldiers", () => {
    setRosterNote("henderson", "Leader");
    setRosterNote("malone", "Fighter");
    setRosterNote("rivera", "Medic");
    const meta = loadMeta();
    expect(Object.keys(meta.rosterNotes)).toHaveLength(3);
  });

  it("notes survive meta reset cycle (new run)", () => {
    setRosterNote("henderson", "Persists");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Persists");
  });
});
```

### Step 4.2: Run test to verify it passes

Run: `cd normandy-1944 && npx vitest run tests/engine/rosterNotes.test.ts`
Expected: PASS (the metaProgress functions were implemented in Task 1)

### Step 4.3: Update RosterPanel.tsx

Rewrite `normandy-1944/src/components/RosterPanel.tsx` to add note functionality:

**New props:**
```typescript
interface RosterPanelProps {
  roster: Soldier[];
  rosterNotes: Record<string, string>;
  onNoteChange: (soldierId: string, note: string) => void;
  onClose: () => void;
}
```

**Key changes:**
- Each soldier card gets a note toggle icon (pencil/note icon using text: "✎")
- When icon is clicked, a textarea expands below that soldier's info
- Textarea value comes from `rosterNotes[soldier.id]` (default empty string)
- On change, call `onNoteChange(soldier.id, newValue)`
- If a note exists (non-empty), the icon renders with a highlighted class
- Use local state `expandedId: string | null` to track which soldier's note is open

**Component structure:**
```tsx
import { useState, useCallback, useRef } from "react";
import type { Soldier } from "../types/index.ts";

interface RosterPanelProps {
  roster: Soldier[];
  rosterNotes: Record<string, string>;
  onNoteChange: (soldierId: string, note: string) => void;
  onClose: () => void;
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ");
}

export default function RosterPanel({
  roster,
  rosterNotes,
  onNoteChange,
  onClose,
}: RosterPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleNoteChange = useCallback(
    (soldierId: string, value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onNoteChange(soldierId, value);
      }, 500);
    },
    [onNoteChange]
  );

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-panel" data-testid="roster-panel" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <span className="overlay-title">Platoon Roster</span>
          <button className="overlay-close" onClick={onClose}>ESC</button>
        </div>

        {roster.length === 0 ? (
          <p className="wiki-empty">No soldiers rallied yet. You are alone in the dark.</p>
        ) : (
          <div className="roster-list">
            {roster.map(s => {
              const hasNote = !!(rosterNotes[s.id] && rosterNotes[s.id].trim());
              const isExpanded = expandedId === s.id;
              return (
                <div key={s.id} className="roster-soldier-card">
                  <div className="roster-soldier">
                    <span className="roster-soldier__rank">{s.rank}</span>
                    <span className="roster-soldier__name">
                      {s.name}{s.nickname ? ` "${s.nickname}"` : ""}
                    </span>
                    <span className="roster-soldier__role">{formatRole(s.role)}</span>
                    <span className={`roster-soldier__status roster-soldier__status--${s.status}`}>
                      {s.status}
                    </span>
                    <button
                      className={`roster-note-toggle ${hasNote ? "roster-note-toggle--active" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      title={hasNote ? "Edit note" : "Add note"}
                    >
                      ✎
                    </button>
                  </div>
                  {isExpanded && (
                    <textarea
                      className="roster-note-input"
                      defaultValue={rosterNotes[s.id] ?? ""}
                      onChange={e => handleNoteChange(s.id, e.target.value)}
                      placeholder="Personal observations..."
                      rows={3}
                      autoFocus
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 4.4: Wire RosterPanel in GameScreen

In `normandy-1944/src/components/GameScreen.tsx`, update the RosterPanel rendering:

```tsx
{overlay === "roster" && (
  <RosterPanel
    roster={gameState.roster}
    rosterNotes={meta.rosterNotes}
    onNoteChange={(soldierId, note) => {
      setRosterNote(soldierId, note);
    }}
    onClose={() => setOverlay(null)}
  />
)}
```

Add import: `import { setRosterNote } from "../engine/metaProgress.ts"` (may already be partially imported from Task 1).

### Step 4.5: Add roster note CSS

Add to `normandy-1944/src/styles/game.css` after the existing roster styles:

```css
/* ─── Roster Notes ──────────────────────────────────────────────── */

.roster-soldier-card {
  display: flex;
  flex-direction: column;
}

.roster-note-toggle {
  font-size: 0.8rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 0.3rem;
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.roster-note-toggle:hover {
  color: var(--accent-gold);
}

.roster-note-toggle--active {
  color: var(--accent-gold-dim);
}

.roster-note-input {
  width: 100%;
  min-height: 3rem;
  font-family: var(--font-narrative);
  font-size: 0.85rem;
  font-style: italic;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-top: none;
  padding: 0.5rem 0.6rem;
  resize: vertical;
  box-sizing: border-box;
  margin-bottom: 0.25rem;
}

.roster-note-input:focus {
  outline: none;
  border-color: var(--accent-gold-dim);
}

.roster-note-input::placeholder {
  color: var(--text-muted);
}
```

### Step 4.6: Run full test suite

Run: `cd normandy-1944 && npx vitest run`
Expected: ALL PASS

### Step 4.7: Manual verification

- Open Roster panel
- Click pencil icon on a soldier → textarea expands
- Type a note → wait 500ms → reload page → reopen roster → note persists
- Soldiers with notes show highlighted pencil icon
- Note persists after game restart (new game from menu)

### Step 4.8: Commit

```bash
git add -A && git commit -m "feat: add free-text roster notes with meta-persistence (ROC-2)"
```

---

## ✅ Checkpoint: Roster Notes Complete (ROC-2)

Verify:
- [ ] Each soldier card has a note toggle icon
- [ ] Clicking icon expands a textarea
- [ ] Notes save to metaProgress on keystroke (debounced 500ms)
- [ ] Notes persist across page reloads
- [ ] Notes persist across new game starts (meta-progression)
- [ ] Soldiers with notes show highlighted icon
- [ ] All tests pass
- [ ] Roster display (rank, name, role, status) unchanged

---

## Task 5: Interludes (ROC-3, Part A — Data & Prompt)

> Add Interlude type to the data model. Create the prompt builder function and narrative service method. No UI yet.

**Files:**
- Modify: `normandy-1944/src/types/index.ts` (add Interlude interface, add to Scenario)
- Modify: `normandy-1944/src/services/promptBuilder.ts` (add `buildInterludePrompt`)
- Modify: `normandy-1944/src/services/narrativeService.ts` (add `narrateInterlude` method)
- Create: `normandy-1944/tests/services/interludePrompt.test.ts`

### Step 5.1: Add Interlude type

In `normandy-1944/src/types/index.ts`, add after the Scenario section:

```typescript
// ─── Interludes ───────────────────────────────────────────────────

export interface Interlude {
  type: "movement" | "rest" | "transition";
  beat: string;
  context?: string;
  objectiveReminder?: string;
}
```

Add `interlude?: Interlude` to the `Scenario` interface:

```typescript
export interface Scenario {
  id: string;
  act: 1 | 2 | 3;
  timeCost: number;
  narrative: string;
  narrativeAlt?: Record<string, string>;
  combatScene?: boolean;
  secondInCommandComments?: Record<string, string>;
  decisions: Decision[];
  rally?: RallyEvent;
  achievesMilestone?: string;
  sceneContext?: string;
  prepActions?: PrepAction[];
  balanceEnvelopeOverride?: BalanceEnvelope;
  interlude?: Interlude;
}
```

Also add `"interlude"` to the `NarrativeRequest.type` union:
```typescript
export interface NarrativeRequest {
  type: "scene" | "outcome" | "rally" | "death" | "epilogue" | "secondInCommand" | "interlude";
  // ... rest unchanged
}
```

### Step 5.2: Add buildInterludePrompt to promptBuilder.ts

In `normandy-1944/src/services/promptBuilder.ts`, add a new interface and function:

```typescript
export interface InterludePromptInput {
  beat: string;
  context?: string;
  objectiveReminder?: string;
  previousOutcomeText: string;
  previousOutcomeContext?: string;
  nextSceneContext: string;
  nextSceneNarrative: string;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  interludeType: "movement" | "rest" | "transition";
}

export function buildInterludePrompt(input: InterludePromptInput): PromptPair {
  const system = `[ROLE]
You are the narrator of a WWII tactical text game set during D-Day. You are writing a TRANSITION MOMENT — a brief, atmospheric bridge between two scenes.

[TONE GUIDE]
${TONE_GUIDE}

[GAME STATE]
${formatGameState(input.gameState)}

[ACTIVE ROSTER]
${formatRoster(input.roster)}
${formatRelationships(input.relationships)}

[WHAT JUST HAPPENED]
${input.previousOutcomeText}${input.previousOutcomeContext ? `\nContext: ${input.previousOutcomeContext}` : ""}

[TRANSITION BEAT — authored direction]
Type: ${input.interludeType}
${input.beat}${input.context ? `\nTone: ${input.context}` : ""}

[WHAT'S COMING NEXT]
${input.nextSceneContext || input.nextSceneNarrative}

[INSTRUCTIONS]
Write 2-4 sentences of transitional narration. This is a BREATHING MOMENT between scenes.
- Reference what just happened (backward anchor)
- Follow the authored beat direction
- Hint at what's coming (forward anchor) without spoiling specifics
- Include soldier banter, movement details, or atmosphere as appropriate
- The interlude type guides the feeling: "movement" = marching/advancing, "rest" = brief pause, "transition" = shift in situation
- Do not reference game mechanics
- Maximum 80 words.`;

  const userMessage = `Write the transition narration following the beat: "${input.beat}"`;

  return { system, userMessage };
}
```

### Step 5.3: Add narrateInterlude to NarrativeService

In `normandy-1944/src/services/narrativeService.ts`:

1. Add import for `buildInterludePrompt` and its input type
2. Add method to the `NarrativeService` class:

```typescript
async narrateInterlude(input: {
  beat: string;
  context?: string;
  objectiveReminder?: string;
  previousOutcomeText: string;
  previousOutcomeContext?: string;
  nextSceneContext: string;
  nextSceneNarrative: string;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  interludeType: "movement" | "rest" | "transition";
  onChunk?: (text: string) => void;
}): Promise<string> {
  if (this.mode !== "llm") {
    return input.beat;
  }

  try {
    const prompt = buildInterludePrompt(input);
    const text = await this.callLLM(prompt.system, prompt.userMessage, 200, input.onChunk);
    return text || input.beat;
  } catch {
    return input.beat;
  }
}
```

### Step 5.4: Write interlude prompt test

Create `normandy-1944/tests/services/interludePrompt.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildInterludePrompt } from "../../src/services/promptBuilder.ts";
import type { GameState } from "../../src/types/index.ts";
import { createInitialState } from "../../src/engine/gameState.ts";

describe("buildInterludePrompt", () => {
  const baseInput = {
    beat: "The platoon moves in wedge formation toward the church.",
    context: "tense, they just lost a man",
    objectiveReminder: "Secure the crossroads before 0600",
    previousOutcomeText: "The patrol passed without seeing you.",
    previousOutcomeContext: "Stealth success, no contact.",
    nextSceneContext: "The church looms ahead. Stone walls, dark windows.",
    nextSceneNarrative: "The church steeple rises from the bocage.",
    gameState: createInitialState(),
    roster: [],
    relationships: [],
    interludeType: "movement" as const,
  };

  it("returns system and userMessage", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toBeTruthy();
    expect(result.userMessage).toBeTruthy();
  });

  it("includes the beat in the prompt", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("wedge formation");
  });

  it("includes previous outcome context", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("patrol passed");
  });

  it("includes next scene context", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("church looms");
  });

  it("includes interlude type", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("movement");
  });

  it("includes tone context when provided", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("tense, they just lost a man");
  });
});
```

### Step 5.5: Run tests

Run: `cd normandy-1944 && npx vitest run tests/services/interludePrompt.test.ts`
Expected: ALL PASS

### Step 5.6: Commit

```bash
git add -A && git commit -m "feat: add interlude data model and prompt builder (ROC-3 data layer)"
```

---

## ✅ Checkpoint: Interlude Data Layer Complete

Verify:
- [ ] Interlude interface defined in types
- [ ] Scenario type has optional `interlude` field
- [ ] `buildInterludePrompt()` generates correct prompt structure
- [ ] `narrateInterlude()` method on NarrativeService works (returns beat text in hardcoded mode)
- [ ] Interlude prompt tests pass
- [ ] Full test suite passes

---

## Task 6: Interludes — UI & Game Flow (ROC-3, Part B)

> Create the InterludeScreen component and wire it into the scene transition flow in GameScreen.

**Files:**
- Create: `normandy-1944/src/components/InterludeScreen.tsx`
- Modify: `normandy-1944/src/components/GameScreen.tsx` (add interlude step between outcome and next scene)
- Modify: `normandy-1944/src/styles/game.css` (interlude styles)

### Step 6.1: Create InterludeScreen.tsx

Create `normandy-1944/src/components/InterludeScreen.tsx`:

```tsx
import StreamingText from "./StreamingText";

interface InterludeScreenProps {
  beatText: string;
  narrativeText: string | null;
  objectiveReminder?: string;
  isStreaming: boolean;
  onContinue: () => void;
}

export default function InterludeScreen({
  beatText,
  narrativeText,
  objectiveReminder,
  isStreaming,
  onContinue,
}: InterludeScreenProps) {
  const displayText = narrativeText ?? beatText;

  return (
    <div className="interlude-screen">
      <div className="interlude-content">
        <div className="interlude-beat">
          {beatText}
        </div>
        {narrativeText && (
          <div className="interlude-narrative">
            {isStreaming ? (
              <StreamingText text={displayText} />
            ) : (
              displayText
            )}
          </div>
        )}
        {objectiveReminder && (
          <div className="interlude-objective">
            <span className="interlude-objective__label">Objective:</span>
            {" "}{objectiveReminder}
          </div>
        )}
      </div>
      <div className="interlude-action">
        <button
          className="btn btn--primary interlude-continue"
          onClick={onContinue}
          disabled={isStreaming}
        >
          {isStreaming ? "..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
```

### Step 6.2: Wire interlude into GameScreen transition flow

In `normandy-1944/src/components/GameScreen.tsx`:

1. Add import: `import InterludeScreen from "./InterludeScreen"`
2. Add state: `const [showInterlude, setShowInterlude] = useState(false)`
3. Add state: `const [interludeNarrative, setInterludeNarrative] = useState<string | null>(null)`
4. Add state: `const [interludeStreaming, setInterludeStreaming] = useState(false)`

5. Modify `handleContinue` — when the player clicks "Continue" after seeing the outcome:
   - If the **next scene** has an `interlude` field, show the interlude screen instead of immediately transitioning
   - Generate interlude narrative via `narrativeService.narrateInterlude()`
   - Set `showInterlude = true`

6. Add a new `handleInterludeContinue` function that:
   - Sets `showInterlude = false`
   - Proceeds with the existing scene transition logic (the code currently in `handleContinue` that sets `gameState`, generates scene narrative, etc.)

7. In the render, add interlude rendering:
   ```tsx
   {showInterlude && pendingTransition && pendingTransition.nextScene.interlude && (
     <InterludeScreen
       beatText={pendingTransition.nextScene.interlude.beat}
       narrativeText={interludeNarrative}
       objectiveReminder={pendingTransition.nextScene.interlude.objectiveReminder}
       isStreaming={interludeStreaming}
       onContinue={handleInterludeContinue}
     />
   )}
   ```

**Flow change:**
```
Before: Outcome → [Continue] → Next Scene
After:  Outcome → [Continue] → Interlude (if present) → [Continue] → Next Scene
```

### Step 6.3: Add interlude CSS

Add to `normandy-1944/src/styles/game.css`:

```css
/* ─── Interlude Screen ──────────────────────────────────────────── */

.interlude-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
  padding: 2rem 0;
}

.interlude-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.interlude-beat {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.6rem 0.8rem;
  border-left: 2px solid var(--text-muted);
  font-style: italic;
}

.interlude-narrative {
  font-family: var(--font-narrative);
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.interlude-objective {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-gold);
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--accent-gold-dim);
  background: rgba(196, 164, 78, 0.04);
}

.interlude-objective__label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
}

.interlude-action {
  padding: 2rem 0 1rem;
  text-align: center;
}

.interlude-continue {
  font-size: 1rem;
  padding: 0.8rem 2.5rem;
}
```

### Step 6.4: Author interlude data for Act 1 scenes

Add `interlude` fields to scenario files where transitions benefit from breathing room. At minimum, add interludes to:
- `scene02_finding_north.ts` (movement from flooded field)
- `scene04_the_sergeant.ts` (rest after first rally)
- `scene06_the_farmhouse.ts` (transition approaching structure)

Example for scene02:
```typescript
interlude: {
  type: "movement",
  beat: "You wade through the flooded field toward higher ground. The water thins, then gives way to mud, then firm earth.",
  context: "relief mixed with disorientation, alone in the dark",
  objectiveReminder: "Find your men. Rally at the nearest landmark.",
},
```

### Step 6.5: Run full test suite

Run: `cd normandy-1944 && npx vitest run`
Expected: ALL PASS

### Step 6.6: Manual verification

- Play through scene 1 → make decision → see outcome → click Continue
- If next scene has interlude: see interlude screen with beat text, narrative (if LLM active), objective reminder
- Click Continue on interlude → next scene loads normally
- If next scene has NO interlude: direct transition (like today)
- Spacebar should also work for Continue (stretch goal, not required)

### Step 6.7: Commit

```bash
git add -A && git commit -m "feat: add interlude scenes between transitions (ROC-3 complete)"
```

---

## ✅ Checkpoint: Interludes Complete (ROC-3)

Verify:
- [ ] InterludeScreen component renders beat, narrative, objective
- [ ] Interludes appear between scene transitions when `interlude` field is present
- [ ] Scenes without interludes transition directly (no regression)
- [ ] LLM mode: narrative service generates atmospheric bridge text
- [ ] Hardcoded mode: beat text displays solo
- [ ] All tests pass
- [ ] Game flow is: Scene → Decision → Outcome → Interlude (if present) → Next Scene

---

## Final Verification

Run the complete test suite:
```bash
cd normandy-1944 && npx vitest run
```

Manual smoke test:
1. Start new game → plays normally
2. Make a decision → wiki entry unlocks → check wiki
3. Open roster → add note to a soldier → reload → note persists
4. Play through to a scene with interlude → see transition moment
5. Reset progress from menu → meta is cleared
6. Legacy migration: set old `normandy1944_lessons` key manually → start game → verify entries migrated

All features are independent after the meta-progression foundation. If any feature is blocked, the others can still ship.
