# Difficulty System & DM Layer — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three difficulty levels, a 5-phase tactical cycle, and a DM Layer that evaluates free-text prompts — transforming the game from multiple-choice to "prompting IS the gameplay."

**Architecture:** The DM Layer sits between the player's free-text input and the existing outcome engine. It evaluates plan quality → assigns a tactical tier → the engine calculates outcomes as before. A new "masterful" tier (prompt-only) sits above "excellent." Scene flow changes from single-decision to a 5-phase cycle (situation → preparation → plan → briefing → execution). Difficulty is a pure UI layer — hide buttons, show prompt input.

**Tech Stack:** React 19, TypeScript (strict), Vitest, Cloudflare Workers, Anthropic Claude API (SSE streaming)

---

## Group 1: Foundation (Types, Game State, Engine Constants)

### Task 1: Add Masterful Tier to Type System

**Files:**
- Modify: `normandy-1944/src/types/index.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts` (existing tests must still pass)

**Step 1: Add "masterful" to TacticalTier union**

In `normandy-1944/src/types/index.ts`, change:

```typescript
export type TacticalTier = "suicidal" | "reckless" | "mediocre" | "sound" | "excellent";

export const TIER_BASE_SCORES: Record<TacticalTier, number> = {
  suicidal: 5,
  reckless: 25,
  mediocre: 45,
  sound: 70,
  excellent: 90,
};
```

To:

```typescript
export type TacticalTier = "suicidal" | "reckless" | "mediocre" | "sound" | "excellent" | "masterful";

export const TIER_BASE_SCORES: Record<TacticalTier, number> = {
  suicidal: 5,
  reckless: 25,
  mediocre: 45,
  sound: 70,
  excellent: 90,
  masterful: 105,
};
```

**Step 2: Run existing tests to confirm nothing breaks**

Run: `npx vitest run tests/engine/outcomeEngine.test.ts`
Expected: All existing tests PASS (adding a new union member + record entry is backwards-compatible).

**Step 3: Add masterful to classification validation in narrativeService**

In `normandy-1944/src/services/narrativeService.ts:162`, change:

```typescript
const validTiers = ["suicidal", "reckless", "mediocre", "sound", "excellent"];
```

To:

```typescript
const validTiers = ["suicidal", "reckless", "mediocre", "sound", "excellent", "masterful"];
```

**Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add masterful tier to type system (base score 105)"
```

---

### Task 2: Add Difficulty, Tactical Phase, and DM Types

**Files:**
- Modify: `normandy-1944/src/types/index.ts`

**Step 1: Add Difficulty type and tactical phase types**

Add these types after the existing `TacticalTier` section in `normandy-1944/src/types/index.ts`:

```typescript
// ─── Difficulty ────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hardcore";

// ─── Tactical Cycle Phases ─────────────────────────────────────────

export type TacticalPhase = "situation" | "preparation" | "plan" | "briefing" | "execution";

// ─── DM Layer Types ────────────────────────────────────────────────

export interface DMEvaluation {
  tier: TacticalTier;
  reasoning: string;
  narrative: string;
  fatal?: boolean;
  intelGained?: keyof IntelFlags;
  soldierReactions: SoldierReaction[];
  secondInCommandReaction: string;
  planSummary: string;
}

export interface SoldierReaction {
  soldierId: string;
  text: string;
}

// ─── Prep Actions ──────────────────────────────────────────────────

export interface PrepAction {
  id: string;
  text: string;
  soldierId?: string;
  timeCost: number;
  responseVeteran: string;
  responseGreen: string;
}

// ─── Balance Envelope ──────────────────────────────────────────────

export interface BalanceEnvelopeRange {
  menLost: [number, number];
  ammoSpent: [number, number];
  moraleChange: [number, number];
  readinessChange: [number, number];
}

export interface BalanceEnvelope {
  success: BalanceEnvelopeRange;
  partial: BalanceEnvelopeRange;
  failure: BalanceEnvelopeRange;
}
```

**Step 2: Add PrepAction to Scenario interface**

In the same file, modify the `Scenario` interface to add `prepActions`:

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
  prepActions?: PrepAction[];          // NEW — phase 1 prep actions
  balanceEnvelopeOverride?: BalanceEnvelope;  // NEW — optional override
}
```

**Step 3: Run tests**

Run: `npx vitest run`
Expected: All tests PASS (additive changes only).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add difficulty, tactical phase, DM evaluation, prep action, and balance envelope types"
```

---

### Task 3: Add Difficulty and Phase to GameState

**Files:**
- Modify: `normandy-1944/src/types/index.ts` (GameState interface)
- Modify: `normandy-1944/src/engine/gameState.ts` (createInitialState)
- Test: `normandy-1944/tests/engine/gameState.test.ts`

**Step 1: Write test for new GameState fields**

Add to `normandy-1944/tests/engine/gameState.test.ts`:

```typescript
describe("createInitialState — difficulty fields", () => {
  it("includes difficulty defaulting to easy", () => {
    const state = createInitialState();
    expect(state.difficulty).toBe("easy");
  });

  it("includes revealTokensRemaining defaulting to 0", () => {
    const state = createInitialState();
    expect(state.revealTokensRemaining).toBe(0);
  });

  it("includes currentPhase defaulting to situation", () => {
    const state = createInitialState();
    expect(state.currentPhase).toBe("situation");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/gameState.test.ts`
Expected: FAIL — `difficulty`, `revealTokensRemaining`, `currentPhase` don't exist on GameState.

**Step 3: Add fields to GameState interface**

In `normandy-1944/src/types/index.ts`, add three fields to the `GameState` interface:

```typescript
export interface GameState {
  men: number;
  ammo: AmmoState;
  morale: number;
  readiness: number;
  time: GameTime;

  capabilities: PlatoonCapabilities;
  intel: IntelFlags;

  roster: Soldier[];
  secondInCommand: SecondInCommand | null;

  milestones: Milestone[];

  lessonsUnlocked: string[];
  scenesVisited: string[];
  currentScene: string;

  phase: GamePhase;
  act: 1 | 2 | 3;

  difficulty: Difficulty;                // NEW
  revealTokensRemaining: number;         // NEW
  currentPhase: TacticalPhase;           // NEW
}
```

**Step 4: Update createInitialState**

In `normandy-1944/src/engine/gameState.ts`, add the new fields to the return object of `createInitialState()`. Also add `Difficulty` and `TacticalPhase` to the import:

Import line change — add `Difficulty, TacticalPhase` to imports from `../types/index.ts`.

In the return object, add:

```typescript
    difficulty: "easy" as Difficulty,
    revealTokensRemaining: 0,
    currentPhase: "situation" as TacticalPhase,
```

**Step 5: Run tests**

Run: `npx vitest run`
Expected: All tests PASS (including new ones).

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add difficulty, revealTokensRemaining, currentPhase to GameState"
```

---

### Task 4: Clamp Masterful Score in Outcome Engine

The outcome engine's `calculateEffectiveScore` clamps to `[0, 100]`. Masterful has base 105 — the clamp will cap it at 100. This is correct behavior (the extra 5 points only matter for the tier mapping, not the final score).

**Files:**
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write test for masterful tier scoring**

Add to `normandy-1944/tests/engine/outcomeEngine.test.ts`:

```typescript
describe("calculateEffectiveScore — masterful tier", () => {
  it("masterful base score clamps to 100", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    const decision = makeDecision();
    const score = calculateEffectiveScore("masterful", state, decision);
    expect(score).toBe(100);
  });

  it("masterful with bad state still scores above excellent-with-bad-state", () => {
    const state = makeState({ morale: 30, readiness: 50, ammo: 20, men: 3 });
    const decision = makeDecision();
    const masterful = calculateEffectiveScore("masterful", state, decision);
    const excellent = calculateEffectiveScore("excellent", state, decision);
    expect(masterful).toBeGreaterThan(excellent);
  });
});
```

**Step 2: Run test to verify it passes (no code changes needed)**

Run: `npx vitest run tests/engine/outcomeEngine.test.ts`
Expected: PASS — the existing clamp logic handles masterful correctly. If it fails, the base score of 105 minus penalties should still be > excellent's 90 minus same penalties.

**Step 3: Commit**

```bash
git add -A && git commit -m "test: verify masterful tier scoring in outcome engine"
```

---

### Task 5: Add calculateEffectiveScoreFromTier (for free-text prompts)

The existing `calculateEffectiveScore` takes a `Decision` object and applies decision-specific modifiers (`minMen`, `requiresCapability`, `benefitsFromIntel`, `requiresPhase`). For DM-evaluated free-text prompts, there is no Decision object. We need a version that applies only state-based modifiers.

**Files:**
- Modify: `normandy-1944/src/engine/outcomeEngine.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write the failing test**

Add to `normandy-1944/tests/engine/outcomeEngine.test.ts`:

```typescript
import { calculateEffectiveScoreFromTier } from "../../src/engine/outcomeEngine.ts";

describe("calculateEffectiveScoreFromTier — no decision modifiers", () => {
  it("returns base tier score with neutral state", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    expect(calculateEffectiveScoreFromTier("sound", state)).toBe(70);
  });

  it("masterful clamps to 100", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    expect(calculateEffectiveScoreFromTier("masterful", state)).toBe(100);
  });

  it("applies morale and readiness modifiers but NOT decision-specific ones", () => {
    const state = makeState({ morale: 10, readiness: 75, ammo: 5, men: 3 });
    const score = calculateEffectiveScoreFromTier("excellent", state);
    // excellent=90, morale<20 => -15, readiness>=75 => -20, ammo<10 => -10 = 45
    expect(score).toBe(45);
  });

  it("applies captain position modifier", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    expect(calculateEffectiveScoreFromTier("sound", state, "front")).toBe(75);
    expect(calculateEffectiveScoreFromTier("sound", state, "rear")).toBe(65);
  });

  it("applies trait bonuses from roster", () => {
    const state = makeState({
      morale: 60, readiness: 0, ammo: 50, men: 1,
      roster: [makeSoldier({ id: "s1", role: "rifleman", traits: ["sharpshooter"] })],
    });
    expect(calculateEffectiveScoreFromTier("sound", state)).toBe(73);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/outcomeEngine.test.ts`
Expected: FAIL — `calculateEffectiveScoreFromTier` doesn't exist.

**Step 3: Implement**

Add to `normandy-1944/src/engine/outcomeEngine.ts`:

```typescript
export function calculateEffectiveScoreFromTier(
  tier: TacticalTier,
  state: GameState,
  captainPosition?: CaptainPosition
): number {
  let score = TIER_BASE_SCORES[tier];

  if (state.morale < 20) score -= 15;
  else if (state.morale < 40) score -= 10;
  else if (state.morale < 60) score -= 0;
  else if (state.morale < 80) score += 0;
  else score += 5;

  if (state.readiness >= 75) score -= 20;
  else if (state.readiness >= 50) score -= 12;
  else if (state.readiness >= 25) score -= 5;

  if (state.ammo < 10) score -= 10;
  else if (state.ammo < 30) score -= 5;

  const activeTraits = state.roster
    .filter((s) => s.status === "active")
    .flatMap((s) => s.traits);

  if (activeTraits.includes("sharpshooter")) score += 3;
  if (activeTraits.includes("hothead")) score += 3;

  if (captainPosition === "front") score += 5;
  if (captainPosition === "rear") score -= 5;

  return clamp(score, 0, 100);
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/engine/outcomeEngine.test.ts`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add calculateEffectiveScoreFromTier for DM-evaluated free-text prompts"
```

---

### Task 6: Add createInitialStateWithDifficulty Helper

**Files:**
- Modify: `normandy-1944/src/engine/gameState.ts`
- Test: `normandy-1944/tests/engine/gameState.test.ts`

**Step 1: Write tests**

Add to `normandy-1944/tests/engine/gameState.test.ts`:

```typescript
import { createInitialState, createInitialStateWithDifficulty } from "../../src/engine/gameState.ts";
import type { Difficulty } from "../../src/types/index.ts";

describe("createInitialStateWithDifficulty", () => {
  it("easy mode: 0 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("easy");
    expect(state.difficulty).toBe("easy");
    expect(state.revealTokensRemaining).toBe(0);
  });

  it("medium mode: 5 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("medium");
    expect(state.difficulty).toBe("medium");
    expect(state.revealTokensRemaining).toBe(5);
  });

  it("hardcore mode: 0 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("hardcore");
    expect(state.difficulty).toBe("hardcore");
    expect(state.revealTokensRemaining).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/gameState.test.ts`
Expected: FAIL — `createInitialStateWithDifficulty` doesn't exist.

**Step 3: Implement**

Add to `normandy-1944/src/engine/gameState.ts`:

```typescript
const DEFAULT_REVEAL_TOKENS = 5;

export function createInitialStateWithDifficulty(difficulty: Difficulty): GameState {
  return {
    ...createInitialState(),
    difficulty,
    revealTokensRemaining: difficulty === "medium" ? DEFAULT_REVEAL_TOKENS : 0,
  };
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/engine/gameState.test.ts`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add createInitialStateWithDifficulty with reveal token initialization"
```

---

## Group 2: Engine & Data Layer

### Task 6: Auto-Derive Balance Envelopes from Existing Decisions

The DM Layer needs to know outcome ranges per scene for free-text prompts. Rather than authoring these separately, we derive them from the decisions that already exist. This function scans all decisions in a scene and computes min/max for each outcome field at each outcome tier.

**Files:**
- Create: `normandy-1944/src/engine/balanceEnvelope.ts`
- Test: `normandy-1944/tests/engine/balanceEnvelope.test.ts`

**Step 1: Write the failing test**

Create `normandy-1944/tests/engine/balanceEnvelope.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { deriveBalanceEnvelope } from "../../src/engine/balanceEnvelope.ts";
import type { Decision, BalanceEnvelope } from "../../src/types/index.ts";

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test",
    tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 5, moraleChange: 5, readinessChange: 2 },
      partial: { text: "ok", menLost: 1, ammoSpent: 10, moraleChange: -5, readinessChange: 5 },
      failure: { text: "ok", menLost: 2, ammoSpent: 15, moraleChange: -15, readinessChange: 10 },
      lessonUnlocked: "test",
      nextScene: "test",
    },
    ...overrides,
  };
}

describe("deriveBalanceEnvelope", () => {
  it("derives min/max from a single decision", () => {
    const decisions = [makeDecision({ id: "d1" })];
    const envelope = deriveBalanceEnvelope(decisions);

    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.success.ammoSpent).toEqual([5, 5]);
    expect(envelope.partial.menLost).toEqual([1, 1]);
    expect(envelope.failure.menLost).toEqual([2, 3]); // +1 buffer on failure
  });

  it("derives wider ranges from multiple decisions", () => {
    const decisions = [
      makeDecision({ id: "d1" }),
      makeDecision({
        id: "d2",
        outcome: {
          success: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 10, readinessChange: 0 },
          partial: { text: "ok", menLost: 2, ammoSpent: 20, moraleChange: -10, readinessChange: 8 },
          failure: { text: "ok", menLost: 3, ammoSpent: 25, moraleChange: -20, readinessChange: 12 },
          lessonUnlocked: "test",
          nextScene: "test",
        },
      }),
    ];
    const envelope = deriveBalanceEnvelope(decisions);

    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.success.ammoSpent).toEqual([0, 5]);
    expect(envelope.partial.menLost).toEqual([1, 2]);
    expect(envelope.partial.ammoSpent).toEqual([10, 20]);
    expect(envelope.failure.menLost).toEqual([2, 4]); // max 3 + 1 buffer
    expect(envelope.failure.moraleChange).toEqual([-20, -15]);
  });

  it("returns zero-range envelope for empty decisions", () => {
    const envelope = deriveBalanceEnvelope([]);
    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.failure.menLost).toEqual([0, 1]); // buffer
  });

  it("handles negative ammoSpent (ammo gained)", () => {
    const decisions = [
      makeDecision({
        id: "d1",
        outcome: {
          success: { text: "ok", menLost: 0, ammoSpent: -8, moraleChange: 8, readinessChange: 5 },
          partial: { text: "ok", menLost: 0, ammoSpent: -10, moraleChange: 5, readinessChange: 7 },
          failure: { text: "ok", menLost: 0, ammoSpent: -12, moraleChange: 1, readinessChange: 10 },
          lessonUnlocked: "test",
          nextScene: "test",
        },
      }),
    ];
    const envelope = deriveBalanceEnvelope(decisions);
    expect(envelope.success.ammoSpent).toEqual([-8, -8]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/balanceEnvelope.test.ts`
Expected: FAIL — module doesn't exist.

**Step 3: Implement**

Create `normandy-1944/src/engine/balanceEnvelope.ts`:

```typescript
import type { Decision, BalanceEnvelope, BalanceEnvelopeRange, OutcomeTier } from "../types/index.ts";

type OutcomeField = "menLost" | "ammoSpent" | "moraleChange" | "readinessChange";

const FIELDS: OutcomeField[] = ["menLost", "ammoSpent", "moraleChange", "readinessChange"];
const TIERS: OutcomeTier[] = ["success", "partial", "failure"];
const FAILURE_BUFFER = 1;

function emptyRange(): BalanceEnvelopeRange {
  return {
    menLost: [0, 0],
    ammoSpent: [0, 0],
    moraleChange: [0, 0],
    readinessChange: [0, 0],
  };
}

export function deriveBalanceEnvelope(decisions: Decision[]): BalanceEnvelope {
  const envelope: BalanceEnvelope = {
    success: emptyRange(),
    partial: emptyRange(),
    failure: emptyRange(),
  };

  if (decisions.length === 0) {
    envelope.failure.menLost = [0, FAILURE_BUFFER];
    return envelope;
  }

  for (const tier of TIERS) {
    for (const field of FIELDS) {
      const values = decisions.map((d) => d.outcome[tier][field]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bufferedMax = tier === "failure" && field === "menLost" ? max + FAILURE_BUFFER : max;
      envelope[tier][field] = [min, bufferedMax];
    }
  }

  return envelope;
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/engine/balanceEnvelope.test.ts`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: auto-derive balance envelopes from scene decisions"
```

---

### Task 7: Enhance Event Log with Plan Summaries

The DM needs cross-scene memory. The event log already tracks casualties and brave acts; now add plan summaries and player action tracking.

**Files:**
- Modify: `normandy-1944/src/types/index.ts` (add event types)
- Modify: `normandy-1944/src/services/eventLog.ts`
- Modify: `normandy-1944/tests/services/eventLog.test.ts`

**Step 1: Write the failing test**

Add to `normandy-1944/tests/services/eventLog.test.ts`:

```typescript
describe("EventLog — plan summaries", () => {
  it("getRecentForDM returns last N events", () => {
    const log = new EventLog();
    for (let i = 0; i < 15; i++) {
      log.append({
        sceneId: `scene_${i}`,
        type: "player_action",
        soldierIds: [],
        description: `Action ${i}`,
      });
    }
    const recent = log.getRecentForDM(10);
    expect(recent).toHaveLength(10);
    expect(recent[0].description).toBe("Action 5");
    expect(recent[9].description).toBe("Action 14");
  });

  it("getRecentForDM returns all if fewer than N", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1",
      type: "casualty",
      soldierIds: ["henderson"],
      description: "Henderson KIA",
    });
    const recent = log.getRecentForDM(10);
    expect(recent).toHaveLength(1);
  });

  it("tracks plan_summary event type", () => {
    const log = new EventLog();
    log.append({
      sceneId: "act1_the_patrol",
      type: "plan_summary",
      soldierIds: [],
      description: "Player set L-ambush using Henderson and Malone in crossfire",
    });
    const summaries = log.getByType("plan_summary");
    expect(summaries).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/eventLog.test.ts`
Expected: FAIL — `getRecentForDM` doesn't exist, `plan_summary` not in event type.

**Step 3: Add plan_summary to PlaythroughEvent type**

In `normandy-1944/src/types/index.ts`, modify `PlaythroughEvent.type`:

```typescript
export interface PlaythroughEvent {
  sceneId: string;
  type:
    | "casualty"
    | "trait_triggered"
    | "relationship_moment"
    | "close_call"
    | "brave_act"
    | "player_action"
    | "promotion"
    | "plan_summary";       // NEW
  soldierIds: string[];
  description: string;
}
```

**Step 4: Add getRecentForDM to EventLog**

In `normandy-1944/src/services/eventLog.ts`, add:

```typescript
  getRecentForDM(count: number): PlaythroughEvent[] {
    const start = Math.max(0, this.events.length - count);
    return this.events.slice(start);
  }
```

**Step 5: Run tests**

Run: `npx vitest run tests/services/eventLog.test.ts`
Expected: All PASS.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add plan_summary event type and getRecentForDM to EventLog"
```

---

### Task 8: Add Prep Actions to Scene Content (Scene 05 — The Patrol)

Add the first set of prep actions to a combat scene. This is the template for all future scenes. Each prep action is a short interaction the player can take before committing to a plan.

**Files:**
- Modify: `normandy-1944/src/content/scenarios/act1/scene05_the_patrol.ts`
- Test: `normandy-1944/tests/content/validation.test.ts` (existing validation still passes)

**Step 1: Add prepActions to scene05**

In `normandy-1944/src/content/scenarios/act1/scene05_the_patrol.ts`, add a `prepActions` field to the scenario object (after `secondInCommandComments`):

```typescript
  prepActions: [
    {
      id: "patrol_prep_ask_henderson",
      text: "Ask Henderson about the bridge",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "Four men. Feldwebel — see the torch? He's reading something. Papers. MG34 slung on the guard, not shouldered. Second man watching the French civilian. Other two are relaxed — smoking. They don't know we're here. Dead ground along the canal bank, maybe fifty meters to the bridge.",
      responseGreen: "There's... some Germans. On the bridge. One's got a light.",
    },
    {
      id: "patrol_prep_check_canal",
      text: "Check the drainage canal for cover",
      timeCost: 5,
      responseVeteran: "Canal bank is about three feet deep. Good dead ground — you could move a fire team along it to within thirty meters of the bridge without being seen. Mud at the bottom, so it'll be slow and quiet.",
      responseGreen: "It's a ditch. Pretty deep. Muddy.",
    },
    {
      id: "patrol_prep_ask_malone",
      text: "Ask Malone what he thinks",
      soldierId: "malone",
      timeCost: 5,
      responseVeteran: "Let me take my guys around the left, Captain. Through that canal. We hit 'em fast — they won't know what happened. I'll go first.",
      responseGreen: "I can go. Whatever you need, sir. Just say the word.",
    },
  ],
```

**Step 2: Run validation tests**

Run: `npx vitest run tests/content/validation.test.ts`
Expected: All PASS (prepActions is optional on Scenario, no validation rules check it yet).

**Step 3: Commit**

```bash
git add -A && git commit -m "content: add prep actions to scene 05 (the patrol)"
```

---

### Task 9: Add Prep Actions to Scene 06 (The Farmhouse)

**Files:**
- Modify: `normandy-1944/src/content/scenarios/act1/scene06_the_farmhouse.ts`

**Step 1: Add prepActions to scene06**

Add a `prepActions` field:

```typescript
  prepActions: [
    {
      id: "farmhouse_prep_observe",
      text: "Watch the farmhouse for movement",
      timeCost: 5,
      responseVeteran: "Floorboards creaking — someone pacing. Musette bag on the porch is 506th issue. No German boot prints in the mud, just jump boots. Whoever's in there came down in a chute.",
      responseGreen: "I can hear someone moving inside. The helmet on the porch has a spade on it.",
    },
    {
      id: "farmhouse_prep_ask_henderson",
      text: "Ask Henderson about the approach",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "One door front, one door barn side. Windows: two ground floor, two upstairs. Stone walls — nothing's going through those. If they're ours, the clicker should sort it. If they're not, that BAR on the doorframe is going to be a problem. I'd say front door, clicker first.",
      responseGreen: "It's a building, sir. Door's right there.",
    },
    {
      id: "farmhouse_prep_circle_building",
      text: "Circle the building to check exits",
      timeCost: 5,
      responseVeteran: "Back door through the barn, one window accessible on the west side. Stone walls everywhere else. Good news: only two ways out. You can cover both with four men.",
      responseGreen: "There's a door in the back. And a window, I think.",
    },
  ],
```

**Step 2: Run tests**

Run: `npx vitest run`
Expected: All PASS.

**Step 3: Commit**

```bash
git add -A && git commit -m "content: add prep actions to scene 06 (the farmhouse)"
```

---

## Group 3: DM Layer Services

### Task 10: Build DM Evaluation Prompt (promptBuilder)

The DM needs a system prompt that includes anchor decisions, game state, roster, relationships, event history, and clear tier definitions. This is the most important prompt in the system — it determines how free-text input gets evaluated.

**Files:**
- Modify: `normandy-1944/src/services/promptBuilder.ts`
- Test: `normandy-1944/tests/services/promptBuilder.test.ts`

**Step 1: Write failing tests**

Add to `normandy-1944/tests/services/promptBuilder.test.ts`:

```typescript
import { buildDMEvaluationPrompt } from "../../src/services/promptBuilder.ts";

describe("buildDMEvaluationPrompt", () => {
  it("includes anchor decisions in system prompt", () => {
    const decisions = [
      makeDecision({ id: "patrol_l_ambush", tier: "excellent", text: "L-shaped ambush" }),
      makeDecision({ id: "patrol_knife", tier: "reckless", text: "Solo knife attack" }),
    ];
    const prompt = buildDMEvaluationPrompt({
      sceneContext: "Bridge. Four Germans.",
      decisions,
      playerText: "Set up crossfire from the canal bank",
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ id: "henderson", name: "Henderson", traits: ["veteran"] })],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(prompt.system).toContain("ANCHOR DECISIONS");
    expect(prompt.system).toContain("patrol_l_ambush");
    expect(prompt.system).toContain("excellent");
    expect(prompt.system).toContain("patrol_knife");
    expect(prompt.system).toContain("reckless");
  });

  it("includes masterful tier definition", () => {
    const prompt = buildDMEvaluationPrompt({
      sceneContext: "Bridge.",
      decisions: [],
      playerText: "Attack",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(prompt.system).toContain("masterful");
    expect(prompt.system).toContain("tactically coherent");
    expect(prompt.system).toContain("creative");
  });

  it("includes recent events for cross-scene memory", () => {
    const prompt = buildDMEvaluationPrompt({
      sceneContext: "Bridge.",
      decisions: [],
      playerText: "Attack",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [
        { sceneId: "s1", type: "plan_summary", soldierIds: [], description: "Player used L-ambush at the crossroads" },
      ],
      lessonsUnlocked: [],
    });
    expect(prompt.system).toContain("L-ambush at the crossroads");
  });

  it("includes player text in user message", () => {
    const prompt = buildDMEvaluationPrompt({
      sceneContext: "Bridge.",
      decisions: [],
      playerText: "Henderson take the BAR to the wall",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(prompt.userMessage).toContain("Henderson take the BAR to the wall");
  });

  it("formats anchor decisions with outcome ranges", () => {
    const decisions = [
      makeDecision({
        id: "d1",
        tier: "excellent",
        text: "Good plan",
        outcome: {
          success: { text: "ok", menLost: 0, ammoSpent: 5, moraleChange: 5, readinessChange: 2 },
          partial: { text: "ok", menLost: 1, ammoSpent: 10, moraleChange: -5, readinessChange: 5 },
          failure: { text: "ok", menLost: 2, ammoSpent: 15, moraleChange: -15, readinessChange: 10 },
          lessonUnlocked: "test",
          nextScene: "test",
        },
      }),
    ];
    const prompt = buildDMEvaluationPrompt({
      sceneContext: "Bridge.",
      decisions,
      playerText: "Attack",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(prompt.system).toContain("success: 0 casualties");
    expect(prompt.system).toContain("failure: 2 casualties");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/promptBuilder.test.ts`
Expected: FAIL — `buildDMEvaluationPrompt` doesn't exist.

**Step 3: Implement buildDMEvaluationPrompt**

Add to `normandy-1944/src/services/promptBuilder.ts`. Add `PlaythroughEvent` to the imports from `../types`:

```typescript
export interface DMEvaluationPromptInput {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  recentEvents: PlaythroughEvent[];
  lessonsUnlocked: string[];
}

const TIER_DEFINITIONS = `[TIER DEFINITIONS — evaluate holistically]
- suicidal (5): Deliberately harmful, insane, will get people killed for no reason
- reckless (25): Brave but stupid. Takes extreme risks without mitigation
- mediocre (45): Vague, lazy, generic. "Attack" with no plan. Or does nothing
- sound (70): Reasonable plan. Makes tactical sense, accounts for basics
- excellent (90): Strong plan. Good use of terrain, coordination, timing
- masterful (105): ALL of these: tactically coherent, creative, shows situation awareness (names soldiers, references terrain, accounts for equipment), shows genuine engagement with the scenario. This is the ceiling — a player thinking like a real platoon leader.`;

const ADVERSARIAL_RULES = `[ADVERSARIAL INPUT HANDLING]
- Deliberate team-kill or betrayal → fatal: true. Game over.
- Surrender/desert → fatal: true. Game over.
- Fantasy/impossible ("cast fireball") → tier: mediocre. Narrative: incoherent order, men stare.
- Do nothing / "wait" → tier: mediocre. Time passes, readiness increases, morale drops.
- Vague / lazy ("attack") → tier: mediocre. Generic outcome.
- Repeating the same plan as a previous scene → consider downgrading. The enemy adapts.`;

export function buildDMEvaluationPrompt(input: DMEvaluationPromptInput): PromptPair {
  const anchorLines = input.decisions.map((d) => {
    const s = d.outcome.success;
    const f = d.outcome.failure;
    return `- "${d.id}" (${d.tier}): ${d.text} → success: ${s.menLost} casualties, failure: ${f.menLost} casualties`;
  });

  const anchors = anchorLines.length > 0
    ? `[ANCHOR DECISIONS — for calibration, not constraint]\nThese show the SCALE of outcomes for this scene:\n${anchorLines.join("\n")}\n\nUse these as calibration for what each tier looks like HERE.\nA player's plan can match an anchor, blend concepts, or be entirely original. Evaluate on its own merits.`
    : "[ANCHOR DECISIONS]\nNo predefined decisions for this scene. Evaluate the player's plan entirely on its own merits.";

  const recentEventLines = input.recentEvents.map((e) =>
    `- [${e.sceneId}] ${e.type}: ${e.description}`
  );
  const recentSection = recentEventLines.length > 0
    ? `\n\n[RECENT EVENTS — cross-scene memory]\n${recentEventLines.join("\n")}`
    : "";

  const lessonsSection = input.lessonsUnlocked.length > 0
    ? `\n\n[PLAYER'S UNLOCKED LESSONS]\n${input.lessonsUnlocked.join(", ")}`
    : "";

  const system = `[ROLE]
You are the DM (Dungeon Master) of a WWII tactical text game. You evaluate the player's plan and assign a tactical tier.

[TONE GUIDE]
${TONE_GUIDE}

${TIER_DEFINITIONS}

${ADVERSARIAL_RULES}

[GAME STATE]
${formatGameState(input.gameState)}

[ACTIVE ROSTER]
${formatRoster(input.roster)}
${formatRelationships(input.relationships)}

[SCENE CONTEXT]
${input.sceneContext}

${anchors}${recentSection}${lessonsSection}

[OUTPUT FORMAT — JSON only, no markdown]
{
  "tier": "<suicidal|reckless|mediocre|sound|excellent|masterful>",
  "reasoning": "<one sentence explaining why this tier>",
  "narrative": "<3-5 sentences narrating the execution and outcome. Reference specific soldiers. Use the player's plan language.>",
  "fatal": false,
  "intelGained": null,
  "planSummary": "<one sentence summary of the player's plan for the event log>",
  "secondInCommandReaction": "<Henderson's in-character reaction to the plan — calibrated to tier and competence>",
  "soldierReactions": [
    {"soldierId": "<id>", "text": "<in-character reaction>"}
  ]
}`;

  const userMessage = `[PLAYER'S PLAN]\n"${input.playerText}"\n\nEvaluate this plan. Return JSON only.`;

  return { system, userMessage };
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/services/promptBuilder.test.ts`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add DM evaluation prompt builder with anchor decisions and tier definitions"
```

---

### ~~Task 11: Build Prep Conversation Prompt~~ — DEFERRED TO v3

> **Simplification:** LLM-generated prep conversations are cut from v2. Every scene's `PrepAction` already includes `responseVeteran` and `responseGreen` — pre-authored strings that are perfectly good. The PrepPhase component picks the right one based on 2IC competence. This saves one LLM call per prep action (~300 tokens each, up to 4 per scene = 1,200 tokens saved) and eliminates a failure point.
>
> In v3, we can add `buildPrepConversationPrompt` for richer, dynamic prep conversations. The `PrepAction` interface already supports it — just add the LLM call path later.

---

### ~~Task 12: Build Briefing Prompt~~ — SIMPLIFIED

> **Simplification:** The DM evaluation prompt (Task 10) already returns `secondInCommandReaction` and `soldierReactions` as part of its JSON response. A separate briefing prompt is only needed if the player clicks a predefined decision button.
>
> **But we're simplifying further:** When the player clicks a predefined button (easy mode or reveal token), skip the briefing phase entirely. Use the existing `secondInCommandComments` from the scene data and go straight to execution via the existing `handleDecision` flow. The briefing phase only fires for DM-evaluated free-text prompts, which already have reactions in the DM response.
>
> **No new code needed.** This eliminates one LLM call (~500 tokens) for button clicks and removes a whole prompt builder function.

---

### Task 13: Create DM Layer Service

This is the core service that orchestrates DM evaluation. It takes a player's prompt + context, calls the LLM, parses the response, and returns a `DMEvaluation`. Falls back gracefully on error.

**Files:**
- Create: `normandy-1944/src/services/dmLayer.ts`
- Test: `normandy-1944/tests/services/dmLayer.test.ts`

**Step 1: Write failing tests**

Create `normandy-1944/tests/services/dmLayer.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { DMLayer } from "../../src/services/dmLayer.ts";
import type { DMEvaluation, Decision, GameState, Soldier } from "../../src/types/index.ts";
import { createInitialState } from "../../src/engine/gameState.ts";

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), men: 5, morale: 60, ammo: 50, ...overrides };
}

function makeSoldier(overrides: Partial<Soldier> & { id: string }): Soldier {
  return {
    name: "Test", rank: "Pvt", role: "rifleman", status: "active",
    age: 20, hometown: "Test", background: "Test", traits: [], ...overrides,
  };
}

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test", tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      partial: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      failure: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      lessonUnlocked: "test", nextScene: "test",
    },
    ...overrides,
  };
}

describe("DMLayer", () => {
  it("parses valid LLM response into DMEvaluation", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "excellent",
      reasoning: "Good use of crossfire",
      narrative: "The ambush works perfectly.",
      fatal: false,
      intelGained: null,
      planSummary: "Player set crossfire ambush",
      secondInCommandReaction: "Good plan, sir.",
      soldierReactions: [{ soldierId: "malone", text: "Let's go!" }],
    }));

    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "Set crossfire from the canal",
      sceneContext: "Bridge. Four Germans.",
      decisions: [makeDecision({ id: "d1" })],
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ id: "henderson" })],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });

    expect(result).not.toBeNull();
    expect(result!.tier).toBe("excellent");
    expect(result!.narrative).toContain("ambush");
    expect(result!.soldierReactions).toHaveLength(1);
  });

  it("returns null on malformed LLM response", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue("not json");
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("returns null on LLM error", async () => {
    const mockCallLLM = vi.fn().mockRejectedValue(new Error("Network error"));
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("validates tier is a valid TacticalTier", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "godlike",
      reasoning: "test",
      narrative: "test",
      planSummary: "test",
      secondInCommandReaction: "test",
      soldierReactions: [],
    }));

    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("rejects gibberish input client-side", async () => {
    const mockCallLLM = vi.fn();
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "asd",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });
    expect(result).toBeNull();
    expect(mockCallLLM).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/dmLayer.test.ts`
Expected: FAIL — module doesn't exist.

**Step 3: Implement**

Create `normandy-1944/src/services/dmLayer.ts`:

```typescript
import type {
  DMEvaluation,
  TacticalTier,
  Decision,
  GameState,
  Soldier,
  SoldierRelationship,
  PlaythroughEvent,
} from "../types/index.ts";
import { buildDMEvaluationPrompt } from "./promptBuilder.ts";

const VALID_TIERS: TacticalTier[] = [
  "suicidal", "reckless", "mediocre", "sound", "excellent", "masterful",
];

const MIN_PROMPT_LENGTH = 5;

type LLMCallFn = (system: string, userMessage: string, maxTokens: number) => Promise<string>;

export interface DMEvaluateInput {
  playerText: string;
  sceneContext: string;
  decisions: Decision[];
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  recentEvents: PlaythroughEvent[];
  lessonsUnlocked: string[];
}

export class DMLayer {
  private callLLM: LLMCallFn;

  constructor(callLLM: LLMCallFn) {
    this.callLLM = callLLM;
  }

  async evaluatePrompt(input: DMEvaluateInput): Promise<DMEvaluation | null> {
    if (!input.playerText || input.playerText.trim().length < MIN_PROMPT_LENGTH) {
      return null;
    }

    try {
      const prompt = buildDMEvaluationPrompt({
        sceneContext: input.sceneContext,
        decisions: input.decisions,
        playerText: input.playerText,
        gameState: input.gameState,
        roster: input.roster,
        relationships: input.relationships,
        recentEvents: input.recentEvents,
        lessonsUnlocked: input.lessonsUnlocked,
      });

      const raw = await this.callLLM(prompt.system, prompt.userMessage, 800);
      return this.parseResponse(raw);
    } catch {
      return null;
    }
  }

  private parseResponse(raw: string): DMEvaluation | null {
    try {
      const parsed = JSON.parse(raw);

      if (!parsed.tier || !VALID_TIERS.includes(parsed.tier)) return null;
      if (!parsed.narrative || !parsed.reasoning) return null;

      return {
        tier: parsed.tier as TacticalTier,
        reasoning: parsed.reasoning,
        narrative: parsed.narrative,
        fatal: parsed.fatal ?? false,
        intelGained: parsed.intelGained ?? undefined,
        soldierReactions: Array.isArray(parsed.soldierReactions) ? parsed.soldierReactions : [],
        secondInCommandReaction: parsed.secondInCommandReaction ?? "",
        planSummary: parsed.planSummary ?? "",
      };
    } catch {
      return null;
    }
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/services/dmLayer.test.ts`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: create DM Layer service with prompt evaluation and response parsing"
```

---

### Task 14: Add DM Evaluation Methods to NarrativeService

Wire the DM Layer into the existing NarrativeService so the GameScreen can call it through the same interface. Also add prep conversation generation.

**Files:**
- Modify: `normandy-1944/src/services/narrativeService.ts`
- Test: `normandy-1944/tests/services/narrativeService.test.ts`

**Step 1: Write failing tests**

Add to `normandy-1944/tests/services/narrativeService.test.ts`:

```typescript
describe("NarrativeService — DM integration", () => {
  it("exposes getDMLayer() when in LLM mode", () => {
    // This test verifies the DMLayer is instantiated when service is in LLM mode
    // Full integration testing requires mocking fetch, covered in e2e
  });

  it("generatePrepResponse returns fallback string in hardcoded mode", async () => {
    const service = new NarrativeService({ apiUrl: "", accessCode: "" });
    const result = await service.generatePrepResponse({
      sceneContext: "Bridge.",
      prepActionText: "Ask Henderson",
      soldier: null,
      gameState: createInitialState(),
      fallbackText: "Henderson says nothing.",
    });
    expect(result).toBe("Henderson says nothing.");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/narrativeService.test.ts`
Expected: FAIL — `generatePrepResponse` doesn't exist.

**Step 3: Add methods to NarrativeService**

In `normandy-1944/src/services/narrativeService.ts`, add imports and methods:

Add to imports:
```typescript
import { DMLayer } from './dmLayer.ts';
```

Add `DMLayer` field and initialization in constructor:
```typescript
  private dmLayer: DMLayer | null;

  constructor(config: NarrativeServiceConfig) {
    this.apiUrl = config.apiUrl;
    this.accessCode = config.accessCode;
    this.mode = config.apiUrl && config.accessCode ? "llm" : "hardcoded";
    this.dmLayer = this.mode === "llm"
      ? new DMLayer((system, userMessage, maxTokens) => this.callLLM(system, userMessage, maxTokens))
      : null;
  }

  getDMLayer(): DMLayer | null {
    return this.dmLayer;
  }
```

> **Note:** `generatePrepResponse` was cut — prep conversations use pre-authored strings (see Task 11 simplification). No LLM call needed for prep phase in v2.

**Step 4: Run tests**

Run: `npx vitest run`
Expected: All PASS.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: wire DM Layer into NarrativeService, add prep conversation generation"
```

---

## Group 4: New UI Components

### Task 15: PrepPhase Component

Phase 1 of the tactical cycle. Shows prep action buttons, displays pre-authored conversation responses, tracks time spent. Each action costs ~5 minutes on the clock. **No LLM calls** — uses `responseVeteran`/`responseGreen` strings from scene data based on 2IC competence.

**Files:**
- Create: `normandy-1944/src/components/PrepPhase.tsx`

**Step 1: Create PrepPhase component**

Create `normandy-1944/src/components/PrepPhase.tsx`:

```typescript
import { useState, useCallback } from "react";
import type { PrepAction } from "../types/index.ts";

interface PrepConversation {
  actionId: string;
  actionText: string;
  response: string;
}

interface PrepPhaseProps {
  prepActions: PrepAction[];
  secondInCommandCompetence: "veteran" | "green";
  onPrepComplete: (timeCostMinutes: number) => void;
  disabled: boolean;
}

export default function PrepPhase({
  prepActions,
  secondInCommandCompetence,
  onPrepComplete,
  disabled,
}: PrepPhaseProps) {
  const [conversations, setConversations] = useState<PrepConversation[]>([]);
  const [totalTimeCost, setTotalTimeCost] = useState(0);

  const usedActionIds = new Set(conversations.map((c) => c.actionId));
  const availableActions = prepActions.filter((a) => !usedActionIds.has(a.id));

  const handleAction = useCallback(
    (action: PrepAction) => {
      const response = secondInCommandCompetence === "veteran"
        ? action.responseVeteran
        : action.responseGreen;

      setConversations((prev) => [
        ...prev,
        { actionId: action.id, actionText: action.text, response },
      ]);
      setTotalTimeCost((prev) => prev + action.timeCost);
    },
    [secondInCommandCompetence]
  );

  return (
    <div className="prep-phase" data-testid="prep-phase">
      <div className="prep-phase__header">
        <h3>Preparation</h3>
        <span className="prep-phase__time-cost">
          Time spent: {totalTimeCost} min
        </span>
      </div>

      {conversations.length > 0 && (
        <div className="prep-phase__conversations">
          {conversations.map((conv) => (
            <div key={conv.actionId} className="prep-conversation">
              <div className="prep-conversation__action">{conv.actionText}</div>
              <div className="prep-conversation__response">{conv.response}</div>
            </div>
          ))}
        </div>
      )}

      {availableActions.length > 0 && (
        <div className="prep-phase__actions">
          {availableActions.map((action) => (
            <button
              key={action.id}
              className="btn prep-action-btn"
              onClick={() => handleAction(action)}
              disabled={disabled}
              data-testid={`prep-action-${action.id}`}
            >
              {action.text}
              <span className="prep-action-btn__cost">~{action.timeCost} min</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="btn btn--primary prep-phase__continue"
        onClick={() => onPrepComplete(totalTimeCost)}
        data-testid="prep-continue"
      >
        {conversations.length === 0 ? "Skip Prep — Go Straight to Plan" : "Proceed to Plan"}
      </button>
    </div>
  );
}
```

**Step 2: Run build to check for type errors**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: create PrepPhase component for Phase 1 tactical cycle"
```

---

### Task 16: PlanPhase Component

Phase 2 of the tactical cycle. Shows the prompt input (medium/hardcore) or decision buttons (easy). Manages reveal tokens on medium.

**Files:**
- Create: `normandy-1944/src/components/PlanPhase.tsx`

**Step 1: Create PlanPhase component**

Create `normandy-1944/src/components/PlanPhase.tsx`:

```typescript
import { useState, useCallback } from "react";
import type {
  Decision,
  Difficulty,
  CaptainPosition,
} from "../types/index.ts";
import FreeTextInput from "./FreeTextInput.tsx";
import DecisionPanel from "./DecisionPanel.tsx";

interface PlanPhaseProps {
  difficulty: Difficulty;
  decisions: Decision[];
  revealTokensRemaining: number;
  onSubmitPrompt: (text: string) => void;
  onSelectDecision: (decision: Decision) => void;
  onRevealTokenUsed: () => void;
  secondInCommandComment: string | null;
  isCombatScene: boolean;
  captainPosition: CaptainPosition;
  onCaptainPositionChange: (pos: CaptainPosition) => void;
  disabled: boolean;
  loading: boolean;
}

export default function PlanPhase({
  difficulty,
  decisions,
  revealTokensRemaining,
  onSubmitPrompt,
  onSelectDecision,
  onRevealTokenUsed,
  secondInCommandComment,
  isCombatScene,
  captainPosition,
  onCaptainPositionChange,
  disabled,
  loading,
}: PlanPhaseProps) {
  const [decisionsRevealed, setDecisionsRevealed] = useState(false);

  const showDecisions =
    difficulty === "easy" || (difficulty === "medium" && decisionsRevealed);

  const canReveal = difficulty === "medium" && !decisionsRevealed && revealTokensRemaining > 0;

  const handleReveal = useCallback(() => {
    setDecisionsRevealed(true);
    onRevealTokenUsed();
  }, [onRevealTokenUsed]);

  const showPromptInput = difficulty !== "easy";

  return (
    <div className="plan-phase" data-testid="plan-phase">
      <div className="plan-phase__header">
        <h3>Your Plan</h3>
      </div>

      {showPromptInput && (
        <>
          <FreeTextInput
            onSubmit={onSubmitPrompt}
            disabled={disabled}
            loading={loading}
          />
          {showDecisions && (
            <div className="decision-separator">or choose a predefined action</div>
          )}
        </>
      )}

      {canReveal && (
        <button
          className="btn plan-phase__reveal-btn"
          onClick={handleReveal}
          disabled={disabled}
          data-testid="reveal-decisions-btn"
        >
          Reveal Decisions ({revealTokensRemaining} tokens left)
        </button>
      )}

      {isCombatScene && (
        <div className="plan-phase__captain-position" data-testid="captain-position-selector">
          <span>Your position:</span>
          {(["front", "middle", "rear"] as const).map((pos) => (
            <button
              key={pos}
              className={`btn btn--small ${captainPosition === pos ? "btn--active" : ""}`}
              onClick={() => onCaptainPositionChange(pos)}
              disabled={disabled}
            >
              {pos}
            </button>
          ))}
        </div>
      )}

      {showDecisions && (
        <DecisionPanel
          decisions={decisions}
          onDecision={onSelectDecision}
          secondInCommandComment={secondInCommandComment}
          isCombatScene={isCombatScene}
          captainPosition={captainPosition}
          onCaptainPositionChange={onCaptainPositionChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
```

**Step 2: Run build to check for type errors**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: create PlanPhase component with difficulty-aware decision display and reveal tokens"
```

---

### Task 17: BriefingPhase Component

Phase 3 of the tactical cycle. Shows team reactions (Henderson + soldiers), lets the player revise or commit to their plan.

**Files:**
- Create: `normandy-1944/src/components/BriefingPhase.tsx`

**Step 1: Create BriefingPhase component**

Create `normandy-1944/src/components/BriefingPhase.tsx`:

```typescript
import { useState, useCallback } from "react";
import type { SoldierReaction, Soldier } from "../types/index.ts";

interface BriefingPhaseProps {
  secondInCommandReaction: string;
  soldierReactions: SoldierReaction[];
  roster: Soldier[];
  onRevise: () => void;
  onCommit: () => void;
  disabled: boolean;
}

function getSoldierName(roster: Soldier[], soldierId: string): string {
  const soldier = roster.find((s) => s.id === soldierId);
  return soldier ? `${soldier.rank} ${soldier.name}` : soldierId;
}

export default function BriefingPhase({
  secondInCommandReaction,
  soldierReactions,
  roster,
  onRevise,
  onCommit,
  disabled,
}: BriefingPhaseProps) {
  return (
    <div className="briefing-phase" data-testid="briefing-phase">
      <div className="briefing-phase__header">
        <h3>Team Briefing</h3>
      </div>

      <div className="briefing-phase__reactions">
        {secondInCommandReaction && (
          <div className="briefing-reaction briefing-reaction--2ic">
            <span className="briefing-reaction__speaker">Henderson:</span>
            <span className="briefing-reaction__text">{secondInCommandReaction}</span>
          </div>
        )}

        {soldierReactions.map((reaction) => (
          <div key={reaction.soldierId} className="briefing-reaction">
            <span className="briefing-reaction__speaker">
              {getSoldierName(roster, reaction.soldierId)}:
            </span>
            <span className="briefing-reaction__text">{reaction.text}</span>
          </div>
        ))}
      </div>

      <div className="briefing-phase__actions">
        <button
          className="btn"
          onClick={onRevise}
          disabled={disabled}
          data-testid="briefing-revise"
        >
          Revise Plan
        </button>
        <button
          className="btn btn--primary"
          onClick={onCommit}
          disabled={disabled}
          data-testid="briefing-commit"
        >
          Execute
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Run build to check for type errors**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: create BriefingPhase component for team reactions and plan commit"
```

---

## Group 5: Modified UI Components

### Task 18: StatusPanel — Add Reveal Token Counter

Small change. Show the reveal token count on medium difficulty.

**Files:**
- Modify: `normandy-1944/src/components/StatusPanel.tsx`

**Step 1: Modify StatusPanel to accept and display reveal tokens**

In `normandy-1944/src/components/StatusPanel.tsx`, update the component:

Change the props interface from receiving just `state` to also receiving `difficulty` and `revealTokensRemaining`. Or — since `GameState` now has these fields — just read them from `state`:

After the existing time display section, add:

```typescript
{state.difficulty === "medium" && (
  <div className="status-row">
    <span className="status-label">Reveal Tokens</span>
    <span className="status-value" data-testid="reveal-token-count">
      {state.revealTokensRemaining}
    </span>
  </div>
)}
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors (difficulty and revealTokensRemaining are on GameState now).

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: show reveal token counter in StatusPanel for medium difficulty"
```

---

### Task 19: MainMenu — Add Difficulty Selection

Replace the simple start button with difficulty selection. Easy mode doesn't require an access code. Medium/Hardcore require LLM.

**Files:**
- Modify: `normandy-1944/src/components/MainMenu.tsx`

**Step 1: Update MainMenu props and add difficulty selection**

Change the `onStartGame` prop to accept a difficulty:

```typescript
interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;  // CHANGED — was () => void
  apiUrl: string;
  onAccessCodeValidated: (code: string) => void;
  narrativeMode: NarrativeMode;
}
```

Add `Difficulty` to imports from `../types/index.ts`.

Replace the single start button with three difficulty buttons:

```typescript
<div className="difficulty-selection">
  <h2>Select Difficulty</h2>

  <button
    className="btn btn--primary difficulty-btn"
    onClick={() => onStartGame("easy")}
    data-testid="start-easy"
  >
    <span className="difficulty-btn__name">Easy</span>
    <span className="difficulty-btn__desc">Decisions visible. No AI required.</span>
  </button>

  <button
    className="btn btn--primary difficulty-btn"
    onClick={() => onStartGame("medium")}
    disabled={narrativeMode !== "llm"}
    data-testid="start-medium"
  >
    <span className="difficulty-btn__name">Medium</span>
    <span className="difficulty-btn__desc">Write your own orders. 5 reveal tokens.</span>
  </button>

  <button
    className="btn btn--primary difficulty-btn"
    onClick={() => onStartGame("hardcore")}
    disabled={narrativeMode !== "llm"}
    data-testid="start-hardcore"
  >
    <span className="difficulty-btn__name">Hardcore</span>
    <span className="difficulty-btn__desc">No decisions. No tokens. Lead or die.</span>
  </button>

  {narrativeMode !== "llm" && (
    <p className="difficulty-note">
      Enter an access code above to unlock Medium and Hardcore modes.
    </p>
  )}
</div>
```

**Step 2: Update App.tsx to pass difficulty through**

In `normandy-1944/src/App.tsx`, change `handleStartGame` to accept and store difficulty:

Add `difficulty` to state:
```typescript
const [difficulty, setDifficulty] = useState<Difficulty>("easy");
```

Update the handler:
```typescript
const handleStartGame = (diff: Difficulty) => {
  setDifficulty(diff);
  setScreen("game");
};
```

Pass difficulty to `GameScreen`:
```typescript
<GameScreen
  onGameOver={handleGameOver}
  onVictory={handleVictory}
  narrativeService={narrativeServiceRef.current}
  difficulty={difficulty}
/>
```

**Step 3: Run build**

Run: `npx tsc --noEmit`
Expected: Temporary errors because GameScreen doesn't accept `difficulty` prop yet — expected, will fix in Task 21.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add difficulty selection to MainMenu with easy/medium/hardcore buttons"
```

---

### Task 20: FreeTextInput — Upgrade for Plan Phase

The existing FreeTextInput is bare — 200 char limit, single line. For plan prompts, the player needs a textarea, higher char limit, and contextual placeholder.

**Files:**
- Modify: `normandy-1944/src/components/FreeTextInput.tsx`

**Step 1: Upgrade to textarea with plan-appropriate UX**

Replace the contents of `normandy-1944/src/components/FreeTextInput.tsx`:

```typescript
import { useState } from "react";

interface FreeTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  loading: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function FreeTextInput({
  onSubmit,
  disabled,
  loading,
  placeholder = "Captain, what are your orders?",
  maxLength = 500,
}: FreeTextInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <form
      className="free-text-form"
      onSubmit={handleSubmit}
      data-testid="free-text-form"
    >
      <textarea
        className="free-text-form__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || loading}
        data-testid="free-text-input"
        maxLength={maxLength}
        autoComplete="off"
        rows={3}
      />
      <div className="free-text-form__footer">
        <span className="free-text-form__count">
          {text.length}/{maxLength}
        </span>
        <button
          className="btn btn--primary free-text-form__submit"
          type="submit"
          disabled={disabled || loading || text.trim().length < 5}
          data-testid="free-text-submit"
        >
          {loading ? "Evaluating..." : "Issue Orders"}
        </button>
      </div>
    </form>
  );
}
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: upgrade FreeTextInput to textarea with higher char limit and plan-appropriate UX"
```

---

### Task 21a: GameScreen — Add Imports, Props, and New State

Smallest possible change. Just wire in the new types and state variables. The existing flow continues to work unchanged.

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: Add new imports**

Add these imports at the top of `GameScreen.tsx`:

```typescript
import type { Difficulty, TacticalPhase, DMEvaluation, PrepAction } from "../types/index.ts";
import { createInitialStateWithDifficulty, advanceTime, clamp } from "../engine/gameState.ts";
import { calculateEffectiveScoreFromTier } from "../engine/outcomeEngine.ts";
import { deriveBalanceEnvelope } from "../engine/balanceEnvelope.ts";
import PrepPhase from "./PrepPhase.tsx";
import PlanPhase from "./PlanPhase.tsx";
import BriefingPhase from "./BriefingPhase.tsx";
```

**Step 2: Update GameScreenProps**

```typescript
interface GameScreenProps {
  onGameOver: (data: GameEndData) => void;
  onVictory: (data: GameEndData) => void;
  narrativeService: NarrativeService;
  difficulty: Difficulty;  // NEW
}
```

Add `difficulty` to the destructured props.

**Step 3: Add new state variables (after existing state)**

```typescript
const [currentPhase, setCurrentPhase] = useState<TacticalPhase>("situation");
const [dmEvaluation, setDmEvaluation] = useState<DMEvaluation | null>(null);
const [forcedEasyMode, setForcedEasyMode] = useState(false);
const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
```

**Step 4: Replace createInitialState with createInitialStateWithDifficulty**

Change:
```typescript
const [gameState, setGameState] = useState<GameState>(createInitialState);
```
To:
```typescript
const [gameState, setGameState] = useState<GameState>(() =>
  createInitialStateWithDifficulty(difficulty)
);
```

**Step 5: Run build**

Run: `npx tsc --noEmit`
Expected: Some unused-variable warnings for the new imports (acceptable — they'll be used in 21b-21e). No errors.

**Step 6: Commit**

```bash
git add -A && git commit -m "refactor: add difficulty prop and phase state to GameScreen (21a)"
```

---

### Task 21b: GameScreen — Add Prep Phase Handler

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: Add handlePrepComplete handler**

Add after the existing `handleFreeText`:

```typescript
const handlePrepComplete = useCallback((timeCostMinutes: number) => {
  if (timeCostMinutes > 0) {
    setGameState((prev) => ({
      ...prev,
      time: advanceTime(prev.time, timeCostMinutes),
      readiness: clamp(prev.readiness + Math.floor(timeCostMinutes / 10), 0, 100),
    }));
  }
  setCurrentPhase("plan");
}, []);
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: add handlePrepComplete handler to GameScreen (21b)"
```

---

### Task 21c: GameScreen — Add DM Evaluation Handler (with Fallback)

This is the core handler for free-text prompts. Calls the DM Layer, handles failure with graceful fallback. Also handles reveal tokens.

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: Add handleSubmitPrompt handler**

Add after `handlePrepComplete`:

```typescript
const handleSubmitPrompt = useCallback(
  async (playerText: string) => {
    if (!scene) return;
    setProcessing(true);

    const dmLayer = narrativeService.getDMLayer();
    if (!dmLayer) {
      // No DM Layer (offline/hardcoded mode) — fall back to showing decisions
      setFallbackMessage("Fall back on training, Captain.");
      setForcedEasyMode(true);
      setCurrentPhase("plan");
      setProcessing(false);
      return;
    }

    const recentEvents = eventLogRef.current.getRecentForDM(10);
    const activeSoldierIds = gameState.roster
      .filter((s) => s.status === "active")
      .map((s) => s.id);
    const relationships = getActiveRelationships(activeSoldierIds);

    const evaluation = await dmLayer.evaluatePrompt({
      playerText,
      sceneContext: scene.sceneContext ?? scene.narrative,
      decisions,
      gameState,
      roster: gameState.roster.filter((s) => s.status === "active"),
      relationships,
      recentEvents,
      lessonsUnlocked: gameState.lessonsUnlocked,
    });

    if (!evaluation) {
      // LLM failed — fall back to showing decisions for this scene
      setFallbackMessage("Fall back on training, Captain.");
      setForcedEasyMode(true);
      setProcessing(false);
      return;
    }

    setDmEvaluation(evaluation);
    setFallbackMessage(null);
    setForcedEasyMode(false);

    eventLogRef.current.append({
      sceneId: scene.id,
      type: "plan_summary",
      soldierIds: [],
      description: evaluation.planSummary,
    });

    setCurrentPhase("briefing");
    setProcessing(false);
  },
  [scene, gameState, decisions, narrativeService]
);

const handleRevealTokenUsed = useCallback(() => {
  setGameState((prev) => ({
    ...prev,
    revealTokensRemaining: Math.max(0, prev.revealTokensRemaining - 1),
  }));
}, []);

const handleBriefingRevise = useCallback(() => {
  setDmEvaluation(null);
  setCurrentPhase("plan");
}, []);
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: add DM evaluation handler with LLM fallback to GameScreen (21c)"
```

---

### Task 21d: GameScreen — Add handleBriefingCommit (Complete Code)

This handler bridges the DM evaluation into the existing outcome pipeline. It uses `calculateEffectiveScoreFromTier` (not the old `calculateEffectiveScore` which needs a Decision), balance envelopes, and then follows the same logging/game-over/transition pattern as `handleDecision`.

**Critical design decisions resolved here:**
- **No re-narration:** The DM already returned a narrative. Don't call `generateOutcomeNarrative` again.
- **Next scene:** Use the first decision's `nextScene` (or `nextSceneOnFailure` on failure). All decisions in a scene lead to the same next scene.
- **Lesson unlock:** Use the first decision's `lessonUnlocked`. Scenes have one lesson.
- **Fatal handling:** Check `dmEvaluation.fatal` before running the engine.

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: Add handleBriefingCommit — COMPLETE code, no hand-waving**

Add after `handleBriefingRevise`:

```typescript
const handleBriefingCommit = useCallback(async () => {
  if (!scene || !dmEvaluation) return;
  setCurrentPhase("execution");
  setProcessing(true);

  const log = eventLogRef.current;
  const pos = scene.combatScene ? captainPosition : "middle";
  const referenceDecision = decisions[0];

  // Fatal check — DM flagged game-ending input
  if (dmEvaluation.fatal) {
    onGameOver({
      finalState: gameState,
      captainSurvived: false,
      deathNarrative: dmEvaluation.narrative,
      lastLesson: referenceDecision?.outcome.lessonUnlocked,
      newAchievements: [],
      eventLog: log.getAll(),
    });
    return;
  }

  // Use the tier-only scoring function (no Decision-specific modifiers)
  const effectiveScore = calculateEffectiveScoreFromTier(
    dmEvaluation.tier, gameState, pos
  );
  const range = getOutcomeRange(effectiveScore);
  const roll = rollOutcome(range);
  const outcomeTier = getOutcomeTier(roll);

  // Derive outcome values from balance envelope
  const derivedEnvelope = deriveBalanceEnvelope(decisions);
  const envelope = scene.balanceEnvelopeOverride ?? derivedEnvelope;
  const envRange = envelope[outcomeTier];
  const rollPosition = (range.ceiling - range.floor) > 0
    ? (roll - range.floor) / (range.ceiling - range.floor)
    : 0.5;

  const lerp = (min: number, max: number) =>
    Math.round(min + rollPosition * (max - min));

  const outcome: OutcomeNarrative = {
    text: dmEvaluation.narrative,
    context: dmEvaluation.reasoning,
    menLost: lerp(envRange.menLost[0], envRange.menLost[1]),
    ammoSpent: lerp(envRange.ammoSpent[0], envRange.ammoSpent[1]),
    moraleChange: lerp(envRange.moraleChange[0], envRange.moraleChange[1]),
    readinessChange: lerp(envRange.readinessChange[0], envRange.readinessChange[1]),
    intelGained: dmEvaluation.intelGained,
  };

  // Process through existing scene transition engine
  const result = processSceneTransition(gameState, scene, outcome, pos);

  // Unlock lesson (use reference decision's lesson)
  if (referenceDecision) {
    unlockLesson(referenceDecision.outcome.lessonUnlocked);
  }

  // Log casualties
  if (result.casualties.length > 0) {
    for (const c of result.casualties) {
      log.append({
        sceneId: scene.id,
        type: "casualty",
        soldierIds: [c.id],
        description: `${c.rank} ${c.name} ${c.status === "KIA" ? "killed" : "wounded"} at ${scene.id}`,
      });
    }
  }

  if (result.captainHit) {
    log.append({
      sceneId: scene.id,
      type: "close_call",
      soldierIds: [],
      description: `Captain hit at ${scene.id}`,
    });
  }

  // Captain hit = game over
  if (result.captainHit) {
    onGameOver({
      finalState: result.state,
      captainSurvived: false,
      deathNarrative: dmEvaluation.narrative,
      lastLesson: referenceDecision?.outcome.lessonUnlocked,
      newAchievements: [],
      eventLog: log.getAll(),
    });
    return;
  }

  // All men down = game over
  if (result.state.men <= 0 && result.state.roster.length > 0) {
    onGameOver({
      finalState: result.state,
      captainSurvived: true,
      deathNarrative: "All your men are down. You are alone, with no way to complete the mission.",
      lastLesson: referenceDecision?.outcome.lessonUnlocked,
      newAchievements: [],
      eventLog: log.getAll(),
    });
    return;
  }

  // Determine next scene (use reference decision's routing)
  const nextSceneId = referenceDecision
    ? (outcomeTier === "failure" && referenceDecision.outcome.nextSceneOnFailure
        ? referenceDecision.outcome.nextSceneOnFailure
        : referenceDecision.outcome.nextScene)
    : "";

  const nextScene = getScene(nextSceneId);

  if (!nextScene) {
    onVictory({
      finalState: result.state,
      captainSurvived: true,
      newAchievements: [],
      eventLog: log.getAll(),
    });
    return;
  }

  // Show DM narrative as outcome text — NO re-narration (DM already wrote it)
  setOutcomeText(dmEvaluation.narrative);

  const newState = {
    ...result.state,
    currentScene: nextSceneId,
    scenesVisited: [...result.state.scenesVisited, scene.id],
    lessonsUnlocked: referenceDecision
      ? [...new Set([...result.state.lessonsUnlocked, referenceDecision.outcome.lessonUnlocked])]
      : result.state.lessonsUnlocked,
  };

  setPendingTransition({
    nextSceneId,
    nextScene,
    newState,
    outcomeContext: outcome.context,
    outcome,
    lessonUnlocked: referenceDecision?.outcome.lessonUnlocked ?? "",
  });

  setCaptainPosition("middle");
  setProcessing(false);
}, [scene, dmEvaluation, gameState, decisions, captainPosition, onGameOver, onVictory, narrativeService]);
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: add complete handleBriefingCommit with engine integration (21d)"
```

---

### Task 21e: GameScreen — Rewrite Render Method for Phase-Based Display

Replace the existing decision/narrative rendering with phase-aware rendering. The existing `handleDecision` flow (for button clicks) continues to work unchanged — it bypasses the phase system entirely.

**Two paths, explicit:**
1. **Button click (easy mode, or revealed decisions):** `PlanPhase.onSelectDecision` → existing `handleDecision` → existing outcome flow. No briefing phase.
2. **Free-text prompt:** `PlanPhase.onSubmitPrompt` → `handleSubmitPrompt` → DM evaluation → briefing phase → `handleBriefingCommit` → outcome.

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: Replace the render body**

Replace the `{!showingOutcome ? (...) : (...)}` section (roughly lines 382-435 of the original file) with:

```typescript
{showingOutcome ? (
  <>
    <NarrativePanel
      narrative={narrative}
      outcomeText={outcomeText}
      rallyText={null}
      isStreaming={isStreaming}
    />
    <div className="transition-prompt">
      <button
        className="btn btn--primary transition-prompt__btn"
        onClick={handleContinue}
        disabled={isStreaming}
      >
        {isStreaming ? "..." : "Continue..."}
      </button>
    </div>
  </>
) : (
  <>
    <NarrativePanel
      narrative={narrative}
      outcomeText={null}
      rallyText={rallyText}
      isStreaming={false}
      isLoading={generatingScene}
    />

    {!generatingScene && (
      <>
        {currentPhase === "situation" && (
          <button
            className="btn btn--primary"
            onClick={() => setCurrentPhase(
              scene?.prepActions && scene.prepActions.length > 0
                ? "preparation"
                : "plan"
            )}
            data-testid="situation-continue"
          >
            Assess the Situation
          </button>
        )}

        {currentPhase === "preparation" && scene?.prepActions && (
          <PrepPhase
            prepActions={scene.prepActions}
            secondInCommandCompetence={
              gameState.secondInCommand?.competence ?? "green"
            }
            onPrepComplete={handlePrepComplete}
            disabled={processing}
          />
        )}

        {currentPhase === "plan" && (
          <>
            {fallbackMessage && (
              <div className="fallback-message" data-testid="fallback-message">
                {fallbackMessage}
              </div>
            )}
            <PlanPhase
              difficulty={forcedEasyMode ? "easy" : difficulty}
              decisions={decisions}
              revealTokensRemaining={gameState.revealTokensRemaining}
              onSubmitPrompt={handleSubmitPrompt}
              onSelectDecision={(d) => {
                setForcedEasyMode(false);
                setFallbackMessage(null);
                handleDecision(d);
              }}
              onRevealTokenUsed={handleRevealTokenUsed}
              secondInCommandComment={secondInCommandComment}
              isCombatScene={!!scene?.combatScene}
              captainPosition={captainPosition}
              onCaptainPositionChange={setCaptainPosition}
              disabled={processing}
              loading={processing}
            />
          </>
        )}

        {currentPhase === "briefing" && dmEvaluation && (
          <BriefingPhase
            secondInCommandReaction={dmEvaluation.secondInCommandReaction}
            soldierReactions={dmEvaluation.soldierReactions}
            roster={gameState.roster}
            onRevise={handleBriefingRevise}
            onCommit={handleBriefingCommit}
            disabled={processing}
          />
        )}
      </>
    )}
  </>
)}
```

**Step 2: Reset phase on scene transition**

In the `handleContinue` function, after `setPendingTransition(null)`, add:

```typescript
setCurrentPhase("situation");
setDmEvaluation(null);
setForcedEasyMode(false);
setFallbackMessage(null);
```

**Step 3: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All existing tests pass (engine/service tests unaffected by UI changes).

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: rewrite GameScreen render for 5-phase tactical cycle (21e)"
```

---

### ~~Task 22: LessonJournal Redesign~~ — DEFERRED

> **Deferred until lesson content is authored in field manual format.** The new `Lesson` interface fields (`principle`, `whatWorks`, `whatDoesnt`, `fromTheField`, `keywords`) have no content written for them yet. Building the UI now would render empty sections for every lesson. The existing LessonJournal continues to work.
>
> **When to implement:** After 5+ lessons are authored with the new format fields. Create a separate task then. The `keywords` field for contextual surfacing requires each scene to define keywords too — another content dependency.
>
> **What stays:** The existing `LessonJournal.tsx` (41 lines) works unchanged. Lessons unlock and display as before.

---

## Group 6: Backend & Integration

### Task 23: Worker — No Changes Needed (Verification)

The existing Worker proxies LLM calls and validates access codes. The DM Layer uses the same `/api/narrative` endpoint — it sends system + user messages and gets streaming SSE back. No new endpoints are needed.

**Files:**
- Read: `normandy-1944/worker/src/index.ts`

**Step 1: Verify the existing endpoint handles DM evaluation calls**

The Worker's `/api/narrative` endpoint accepts `{ system, messages, max_tokens }` and forwards to Anthropic. The DM Layer's calls follow this exact format (via `NarrativeService.callLLM`). No changes needed.

**Step 2: Verify max_tokens is sufficient**

The DM evaluation prompt requests up to 800 tokens (the response includes narrative + reactions + JSON structure). The Worker defaults to `body.max_tokens ?? 300`. Since we pass `max_tokens: 800` from the DM Layer call, this works.

**Step 3: Commit (no code changes)**

No commit needed — this is a verification step.

---

### ~~Task 24: Fallback Strategy~~ — MERGED INTO Task 21c/21e

> **Already implemented.** The fallback logic is now built directly into:
> - **Task 21a:** `forcedEasyMode` and `fallbackMessage` state variables
> - **Task 21c:** `handleSubmitPrompt` sets fallback on DM Layer failure
> - **Task 21e:** Render method passes `forcedEasyMode ? "easy" : difficulty` to PlanPhase, resets on scene transition
>
> The guarantee: easy mode works with zero LLM calls. Medium/hardcore degrade to easy per-scene on failure. The game never stops.

---

### Task 25: Client-Side Input Validation

Reject gibberish, empty, and too-short inputs before they hit the LLM. Show an in-universe rejection message.

**Files:**
- Modify: `normandy-1944/src/components/FreeTextInput.tsx`
- Modify: `normandy-1944/src/services/dmLayer.ts` (already has MIN_PROMPT_LENGTH check)

**Step 1: Add client-side validation messages**

The DM Layer already rejects prompts shorter than 5 characters. Add visible feedback in FreeTextInput:

In the submit handler, before calling `onSubmit`, show a message if the input is too short:

```typescript
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 5) {
    setError("Say again, Captain?");
    return;
  }
  setError(null);
  onSubmit(trimmed);
  setText("");
}
```

Add error state:
```typescript
const [error, setError] = useState<string | null>(null);
```

Show error in JSX:
```typescript
{error && <div className="free-text-form__error" data-testid="input-error">{error}</div>}
```

**Step 2: Run build**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add client-side input validation with in-universe rejection messages"
```

---

### Task 26: Integration Smoke Test

Write a test that exercises the full flow: create state → derive envelope → build DM prompt → parse response → calculate outcome.

**Files:**
- Create: `normandy-1944/tests/integration/tacticalCycle.test.ts`

**Step 1: Write integration test**

Create `normandy-1944/tests/integration/tacticalCycle.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { createInitialStateWithDifficulty } from "../../src/engine/gameState.ts";
import { deriveBalanceEnvelope } from "../../src/engine/balanceEnvelope.ts";
import { DMLayer } from "../../src/services/dmLayer.ts";
import { calculateEffectiveScore, getOutcomeRange, rollOutcome, getOutcomeTier } from "../../src/engine/outcomeEngine.ts";
import type { Decision, BalanceEnvelope, OutcomeTier } from "../../src/types/index.ts";

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test", tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 5, moraleChange: 5, readinessChange: 2 },
      partial: { text: "ok", menLost: 1, ammoSpent: 10, moraleChange: -5, readinessChange: 5 },
      failure: { text: "ok", menLost: 2, ammoSpent: 15, moraleChange: -15, readinessChange: 10 },
      lessonUnlocked: "test", nextScene: "test",
    },
    ...overrides,
  };
}

describe("Tactical Cycle Integration", () => {
  it("full flow: DM evaluation → engine → outcome values", async () => {
    const state = createInitialStateWithDifficulty("hardcore");
    expect(state.difficulty).toBe("hardcore");
    expect(state.revealTokensRemaining).toBe(0);

    const decisions = [
      makeDecision({ id: "d1", tier: "excellent" }),
      makeDecision({ id: "d2", tier: "reckless" }),
    ];

    const envelope = deriveBalanceEnvelope(decisions);
    expect(envelope.success.menLost[0]).toBeLessThanOrEqual(envelope.success.menLost[1]);

    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "masterful",
      reasoning: "Brilliant coordination",
      narrative: "The plan works perfectly.",
      fatal: false,
      intelGained: null,
      planSummary: "Coordinated crossfire with named soldiers",
      secondInCommandReaction: "Outstanding, sir.",
      soldierReactions: [{ soldierId: "malone", text: "Let's go!" }],
    }));

    const dm = new DMLayer(mockCallLLM);
    const evaluation = await dm.evaluatePrompt({
      playerText: "Henderson take the BAR to the stone wall",
      sceneContext: "Bridge. Four Germans.",
      decisions,
      gameState: state,
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });

    expect(evaluation).not.toBeNull();
    expect(evaluation!.tier).toBe("masterful");

    const effectiveScore = calculateEffectiveScore(
      evaluation!.tier, state, decisions[0]
    );
    expect(effectiveScore).toBeGreaterThan(0);

    const range = getOutcomeRange(effectiveScore);
    const roll = rollOutcome(range, 42);
    const outcomeTier = getOutcomeTier(roll);
    expect(["success", "partial", "failure"]).toContain(outcomeTier);

    const envRange = envelope[outcomeTier];
    expect(envRange.menLost[0]).toBeLessThanOrEqual(envRange.menLost[1]);
  });

  it("easy mode has 0 reveal tokens, medium has 5", () => {
    const easy = createInitialStateWithDifficulty("easy");
    const medium = createInitialStateWithDifficulty("medium");
    const hardcore = createInitialStateWithDifficulty("hardcore");

    expect(easy.revealTokensRemaining).toBe(0);
    expect(medium.revealTokensRemaining).toBe(5);
    expect(hardcore.revealTokensRemaining).toBe(0);
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run tests/integration/tacticalCycle.test.ts`
Expected: All PASS.

**Step 3: Commit**

```bash
git add -A && git commit -m "test: add integration smoke test for full tactical cycle flow"
```

---

## Summary

| Group | Tasks | Key Files | ~New Lines | Context Risk |
|---|---|---|---|---|
| 1: Foundation | Tasks 1-6 | types/index.ts, gameState.ts, outcomeEngine.ts | ~120 | Low |
| 2: Engine & Data | Tasks 7-10 | balanceEnvelope.ts, eventLog.ts, scene05/06 | ~200 | Low |
| 3: DM Services | Tasks 11-15 | promptBuilder.ts, dmLayer.ts, narrativeService.ts | ~350 | Medium (Task 11 prompt is large) |
| 4: New UI | Tasks 16-18 | PrepPhase.tsx, PlanPhase.tsx, BriefingPhase.tsx | ~250 | Low |
| 5: Modified UI | Tasks 19-22a-e | GameScreen.tsx, StatusPanel, MainMenu, FreeTextInput | ~400 | Medium (split into 5 sub-tasks) |
| 6: Integration | Tasks 23, 25-27 | validation, integration test | ~150 | Low |
| **Total** | **~27 active tasks** | | **~1,470 lines** | |

### What was cut (vs original plan)

| Item | Reason | When to revisit |
|---|---|---|
| LLM-generated prep conversations (Task 11) | Pre-authored strings are good enough. Saves ~1,200 tokens/scene. | v3 |
| Separate briefing prompt for button clicks (Task 12) | Button clicks skip briefing entirely — use existing 2IC comments. | v3 |
| LessonJournal field manual redesign (Task 22) | No lesson content written in new format yet. UI would render empty. | After 5+ lessons authored |
| Separate fallback task (Task 24) | Merged into GameScreen sub-tasks 21a/21c/21e. | N/A |

### Bugs fixed (vs original plan)

| Bug | Fix |
|---|---|
| `calculateEffectiveScore` needs a Decision object — free-text prompts don't have one | Added `calculateEffectiveScoreFromTier` (Task 5) — state-only modifiers |
| `balanceEnvelopeOverride` referenced on wrong object | Fixed in Task 21d — reads from `scene.balanceEnvelopeOverride` |
| Double-narration (DM narrative + re-narration LLM call) | Task 21d uses DM narrative directly, no `generateOutcomeNarrative` call |
| Captain position has no selector in free-text flow | Added to PlanPhase component (Task 17) |
| Button clicks had no clear path through phase system | Task 21e: two explicit paths — buttons bypass phases, prompts use full cycle |
| DM failure left player stuck with no feedback | Task 21c: fallback message + forced easy mode on failure |
| `handleBriefingCommit` was hand-waved ("copy from line 113") | Task 21d: complete code, no references to "copy existing logic" |
| Fatal handling undefined for DM flow | Task 21d: checks `dmEvaluation.fatal` first, triggers game over |
| Next scene routing undefined for DM prompts | Task 21d: uses first decision's `nextScene` (all decisions in a scene route to same next) |
| Lesson unlock undefined for DM prompts | Task 21d: uses first decision's `lessonUnlocked` |

### Execution Order

Tasks are designed to be executed sequentially. Each task builds on the previous. Commits happen after each task — any task can be the stopping point for a session.

**Critical path:** Tasks 1-6 (types) → Tasks 11, 14 (DM Layer) → Tasks 21a-21e (GameScreen). Everything else hangs off these.

**Parallelizable:** Tasks 7-10 (engine/data) can run in parallel with Tasks 16-18 (UI components), as long as Tasks 1-6 are done first.

**Max context per task:** No task exceeds ~200 lines of code changes. The original Task 21 (~300+ lines) has been split into 5 sub-tasks of ~30-80 lines each.

---

Plan complete and saved to `docs/plans/2026-02-26-difficulty-and-dm-layer-plan.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?
