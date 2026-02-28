# Full Game Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the full game redesign (v2) — enhanced DM layer with personnel evaluation, event log narrative system, preparation phase engine, new tone guide, 30 scenes across 3 acts, and structural + playthrough verification.

**Architecture:** Five-phase pipeline: (1) engine upgrades + cleanup, (2) research documents, (3) scene briefs with human review, (4) content writing + verification per act, (5) integration testing. Phases 1-2 can run in parallel. Phases 3-5 are sequential with human gates.

**Tech Stack:** TypeScript, React, Vitest, Vite, Cloudflare Workers (optional)

---

## Phase 1: Engine Upgrades + Cleanup

### Task 1.1: Fix Pre-existing Build Error

**Files:**
- Modify: `src/components/GameScreen.tsx:335` (unused variable `outcome`)

**Step 1: Identify the unused variable**

Run: `npx tsc -b 2>&1 | head -20`
Expected: Error about unused variable `outcome` in GameScreen.tsx

**Step 2: Fix the unused variable**

Either prefix with underscore (`_outcome`) or remove the binding if the value isn't used downstream. Read lines ~330-340 of GameScreen.tsx to determine which fix is correct.

**Step 3: Verify build passes**

Run: `npm run build`
Expected: PASS (exit 0)

**Step 4: Run tests to confirm no regression**

Run: `npm test`
Expected: All ~250 tests pass

**Step 5: Commit**

```bash
git add src/components/GameScreen.tsx
git commit -m "fix: remove unused variable to unblock tsc build"
```

---

### Task 1.2: Upgrade Type System — Enhanced DMEvaluation + GameEvent

The design doc (Section 4) adds personnel evaluation to the DM return. The design doc (Section 5) adds a richer event log with typed events. Both need new types.

**Files:**
- Modify: `src/types/index.ts`
- Test: `tests/engine/types.test.ts` (create)

**Step 1: Write the failing test**

Create `tests/engine/types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type {
  EnhancedDMEvaluation,
  PersonnelAssignment,
  GameEvent,
  PlatoonAudit,
  PrepEffects,
  PreparationPhase,
} from "../../src/types/index.ts";

describe("Enhanced type definitions exist", () => {
  it("EnhancedDMEvaluation has personnelScore field", () => {
    const eval_: EnhancedDMEvaluation = {
      tier: "sound",
      reasoning: "test",
      narrative: "test",
      matchedDecisionId: "d1",
      matchConfidence: 0.9,
      tacticalReasoning: "solid plan",
      personnelScore: 75,
      assignments: [],
      assignmentIssues: [],
      assignmentBonuses: [],
      soldierReactions: [],
      secondInCommandReaction: "good plan",
      vulnerablePersonnel: [],
      capabilityRisks: [],
      planSummary: "test",
    };
    expect(eval_.personnelScore).toBe(75);
  });

  it("PersonnelAssignment has fitScore", () => {
    const assignment: PersonnelAssignment = {
      soldierId: "henderson",
      assignedTask: "point man",
      fitScore: 80,
      reasoning: "veteran NCO",
    };
    expect(assignment.fitScore).toBe(80);
  });

  it("GameEvent covers all event types from design doc", () => {
    const events: GameEvent[] = [
      { type: "scene_complete", sceneId: "act1_landing", summary: "landed safely", timeCost: 15, timestamp: "0115" },
      { type: "decision_made", sceneId: "act1_landing", prompt: "check gear", tier: "excellent", personnelScore: 0, timestamp: "0115" },
      { type: "casualty", sceneId: "act1_patrol", soldierId: "doyle", name: "Doyle", cause: "gunshot", status: "wounded", timestamp: "0220" },
      { type: "rally", sceneId: "act1_sergeant", soldiers: ["henderson"], description: "found Henderson", timestamp: "0200" },
      { type: "capability_change", sceneId: "act1_farmhouse", capability: "canTreatWounded", gained: true, reason: "Rivera joined", timestamp: "0240" },
      { type: "intel_gained", sceneId: "act1_patrol", flag: "hasMap", source: "captured documents", timestamp: "0220" },
      { type: "trait_triggered", sceneId: "act1_patrol", soldierId: "doyle", trait: "green", effect: "froze", timestamp: "0220" },
      { type: "relationship_moment", sceneId: "act1_patrol", soldiers: ["kowalski", "novak"], momentType: "brothers", description: "covered each other", timestamp: "0220" },
      { type: "assignment_consequence", sceneId: "act1_patrol", soldierId: "rivera", task: "point", outcome: "medic at risk", timestamp: "0220" },
      { type: "resource_snapshot", sceneId: "act1_patrol", men: 12, ammo: 65, morale: 70, readiness: 28, time: "0240", timestamp: "0240" },
    ];
    expect(events).toHaveLength(10);
  });

  it("PlatoonAudit has required fields", () => {
    const audit: PlatoonAudit = {
      currentCapabilities: {
        canSuppress: true,
        canTreatWounded: true,
        hasRadio: false,
        hasNCO: true,
        hasExplosives: false,
        canScout: true,
      },
      criticalRisks: ["only one medic"],
      personnelGaps: ["no radioman"],
      relationshipStatus: ["kowalski-novak brothers"],
      effectiveStrength: 12,
    };
    expect(audit.effectiveStrength).toBe(12);
  });

  it("PreparationPhase tracks prep state", () => {
    const phase: PreparationPhase = {
      availablePreps: [],
      completedPreps: ["defensive_positions"],
      counterattackTriggered: false,
      totalTimePreparing: 90,
    };
    expect(phase.counterattackTriggered).toBe(false);
  });

  it("PrepEffects modifies counterattack outcomes", () => {
    const effects: PrepEffects = {
      casualtyReduction: 2,
      earlyWarning: true,
      ammoRedistributed: true,
      medicalReady: true,
      moraleBonus: 10,
      additionalMen: 3,
    };
    expect(effects.casualtyReduction).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/types.test.ts`
Expected: FAIL — types don't exist yet

**Step 3: Add the new types to `src/types/index.ts`**

Append these types after the existing `DMEvaluation` interface (~line 169):

```typescript
// ─── Enhanced DM Evaluation (v2 design) ───────────────────────────

export interface PersonnelAssignment {
  soldierId: string;
  assignedTask: string;
  fitScore: number;
  reasoning: string;
}

export interface EnhancedDMEvaluation {
  tier: TacticalTier;
  reasoning: string;
  narrative: string;
  fatal?: boolean;
  intelGained?: keyof IntelFlags;
  tacticalReasoning: string;
  personnelScore: number;
  assignments: PersonnelAssignment[];
  assignmentIssues: string[];
  assignmentBonuses: string[];
  matchedDecisionId: string;
  matchConfidence: number;
  soldierReactions: SoldierReaction[];
  secondInCommandReaction: string;
  vulnerablePersonnel: string[];
  capabilityRisks: string[];
  planSummary: string;
}

// ─── Game Events (v2 narrative thread) ────────────────────────────

export type GameEvent =
  | { type: "scene_complete"; sceneId: string; summary: string; timeCost: number; timestamp: string }
  | { type: "decision_made"; sceneId: string; prompt: string; tier: TacticalTier; personnelScore: number; timestamp: string }
  | { type: "casualty"; sceneId: string; soldierId: string; name: string; cause: string; status: "KIA" | "wounded"; timestamp: string }
  | { type: "rally"; sceneId: string; soldiers: string[]; description: string; timestamp: string }
  | { type: "capability_change"; sceneId: string; capability: string; gained: boolean; reason: string; timestamp: string }
  | { type: "intel_gained"; sceneId: string; flag: string; source: string; timestamp: string }
  | { type: "trait_triggered"; sceneId: string; soldierId: string; trait: string; effect: string; timestamp: string }
  | { type: "relationship_moment"; sceneId: string; soldiers: string[]; momentType: string; description: string; timestamp: string }
  | { type: "assignment_consequence"; sceneId: string; soldierId: string; task: string; outcome: string; timestamp: string }
  | { type: "resource_snapshot"; sceneId: string; men: number; ammo: number; morale: number; readiness: number; time: string; timestamp: string };

// ─── Platoon Audit ────────────────────────────────────────────────

export interface PlatoonAudit {
  currentCapabilities: PlatoonCapabilities;
  criticalRisks: string[];
  personnelGaps: string[];
  relationshipStatus: string[];
  effectiveStrength: number;
}

// ─── Preparation Phase (Act 3) ────────────────────────────────────

export interface PrepScene {
  id: string;
  label: string;
  description: string;
  timeCost: number;
  effect: PrepEffects;
}

export interface PreparationPhase {
  availablePreps: PrepScene[];
  completedPreps: string[];
  counterattackTriggered: boolean;
  totalTimePreparing: number;
}

export interface PrepEffects {
  casualtyReduction?: number;
  earlyWarning?: boolean;
  ammoRedistributed?: boolean;
  medicalReady?: boolean;
  moraleBonus?: number;
  additionalMen?: number;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/engine/types.test.ts`
Expected: PASS

**Step 5: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + new)

**Step 6: Commit**

```bash
git add src/types/index.ts tests/engine/types.test.ts
git commit -m "feat: add enhanced DM evaluation, game events, platoon audit, and prep phase types"
```

---

### Task 1.3: Upgrade Event Log — Context Builder + Compression

The current `EventLog` (35 lines) is a bare append-only array. The v2 design (Section 5) requires `buildContextSummary()` that compiles events into LLM-readable text, and `runPlatoonAudit()` that checks capabilities, risks, relationships. Compression: older events get 1 line, recent events get 3-4 lines. Must stay under ~500 tokens.

**Files:**
- Modify: `src/services/eventLog.ts`
- Test: `tests/services/eventLog.test.ts` (already exists — extend)

**Step 1: Write failing tests**

Add to `tests/services/eventLog.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { EventLog } from "../../src/services/eventLog.ts";
import type { GameEvent, PlatoonAudit, GameState } from "../../src/types/index.ts";

describe("EventLog v2", () => {
  it("buildContextSummary returns formatted situation log", () => {
    const log = new EventLog();
    log.appendGameEvent({
      type: "scene_complete",
      sceneId: "act1_landing",
      summary: "Landed in flooded field",
      timeCost: 15,
      timestamp: "0115",
    });
    log.appendGameEvent({
      type: "rally",
      sceneId: "act1_sergeant",
      soldiers: ["henderson"],
      description: "Found Henderson behind stone wall",
      timestamp: "0200",
    });

    const summary = log.buildContextSummary();
    expect(summary).toContain("SITUATION LOG:");
    expect(summary).toContain("0115");
    expect(summary).toContain("Landed in flooded field");
    expect(summary).toContain("0200");
    expect(summary).toContain("Henderson");
  });

  it("compresses old events and keeps recent events detailed", () => {
    const log = new EventLog();
    for (let i = 0; i < 20; i++) {
      log.appendGameEvent({
        type: "scene_complete",
        sceneId: `scene_${i}`,
        summary: `Scene ${i} completed with details about what happened in this specific scene`,
        timeCost: 15,
        timestamp: `${String(Math.floor(i / 4) + 1).padStart(2, "0")}${String((i % 4) * 15).padStart(2, "0")}`,
      });
    }
    const summary = log.buildContextSummary();
    // Recent events should be more detailed than older ones
    expect(summary.length).toBeLessThan(3000);
  });

  it("runPlatoonAudit returns capabilities and risks", () => {
    const log = new EventLog();
    const mockState: Partial<GameState> = {
      roster: [
        { id: "henderson", name: "Henderson", role: "platoon_sergeant", status: "active", rank: "SSgt", age: 28, hometown: "Scranton", background: "test", traits: ["veteran"] },
        { id: "rivera", name: "Rivera", role: "medic", status: "active", rank: "Cpl", age: 22, hometown: "San Antonio", background: "test", traits: ["brave"] },
      ],
      capabilities: {
        canSuppress: false,
        canTreatWounded: true,
        hasRadio: false,
        hasNCO: true,
        hasExplosives: false,
        canScout: true,
      },
      men: 2,
      ammo: 35,
      morale: 62,
    };

    const audit = log.runPlatoonAudit(mockState as GameState, []);
    expect(audit.currentCapabilities.canTreatWounded).toBe(true);
    expect(audit.effectiveStrength).toBe(2);
    expect(audit.criticalRisks).toContain("No suppressive fire capability");
    expect(audit.personnelGaps).toContain("No radioman");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/eventLog.test.ts`
Expected: FAIL — `appendGameEvent`, `buildContextSummary`, `runPlatoonAudit` don't exist

**Step 3: Implement the upgraded EventLog**

Rewrite `src/services/eventLog.ts` to add `GameEvent` support alongside existing `PlaythroughEvent`:

```typescript
import type { PlaythroughEvent, GameEvent, PlatoonAudit, GameState, SoldierRelationship } from '../types';

const MAX_SUMMARY_EVENTS = 30;
const RECENT_THRESHOLD = 8;

export class EventLog {
  private events: PlaythroughEvent[] = [];
  private gameEvents: GameEvent[] = [];

  // --- Existing PlaythroughEvent API (unchanged) ---

  append(event: PlaythroughEvent): void {
    this.events.push(event);
  }

  getAll(): PlaythroughEvent[] {
    return [...this.events];
  }

  getForSoldier(soldierId: string): PlaythroughEvent[] {
    return this.events.filter(e => e.soldierIds.includes(soldierId));
  }

  getByType(type: PlaythroughEvent["type"]): PlaythroughEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getRecentForDM(count: number): PlaythroughEvent[] {
    const start = Math.max(0, this.events.length - count);
    return this.events.slice(start);
  }

  serialize(): PlaythroughEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    this.gameEvents = [];
  }

  // --- New GameEvent API (v2 design) ---

  appendGameEvent(event: GameEvent): void {
    this.gameEvents.push(event);
  }

  getAllGameEvents(): GameEvent[] {
    return [...this.gameEvents];
  }

  buildContextSummary(): string {
    if (this.gameEvents.length === 0) return "SITUATION LOG:\n- No events yet.";

    const lines: string[] = [];
    const total = this.gameEvents.length;
    const recentStart = Math.max(0, total - RECENT_THRESHOLD);

    for (let i = 0; i < Math.min(total, MAX_SUMMARY_EVENTS); i++) {
      const event = this.gameEvents[i];
      const isRecent = i >= recentStart;
      lines.push(isRecent ? this.formatEventDetailed(event) : this.formatEventCompressed(event));
    }

    return `SITUATION LOG:\n${lines.map(l => `- ${l}`).join("\n")}`;
  }

  runPlatoonAudit(state: GameState, relationships: SoldierRelationship[]): PlatoonAudit {
    const caps = state.capabilities;
    const active = state.roster.filter(s => s.status === "active");
    const roles = new Set(active.map(s => s.role));

    const criticalRisks: string[] = [];
    if (!caps.canSuppress) criticalRisks.push("No suppressive fire capability");
    if (!caps.canTreatWounded) criticalRisks.push("No medical capability — wounded will deteriorate");
    if (!caps.hasNCO) criticalRisks.push("No NCO — leadership gap");
    if (state.ammo < 20) criticalRisks.push("Critically low ammunition");
    if (state.morale < 30) criticalRisks.push("Dangerously low morale");

    const personnelGaps: string[] = [];
    if (!roles.has("medic")) personnelGaps.push("No medic");
    if (!roles.has("radioman")) personnelGaps.push("No radioman");
    if (!roles.has("BAR_gunner") && !roles.has("MG_gunner")) personnelGaps.push("No automatic weapons");

    const relationshipStatus = relationships
      .filter(r => {
        const s1 = active.find(s => s.id === r.soldierId);
        const s2 = active.find(s => s.id === r.targetId);
        return s1 && s2;
      })
      .map(r => `${r.soldierId}-${r.targetId} (${r.type})`);

    return {
      currentCapabilities: { ...caps },
      criticalRisks,
      personnelGaps,
      relationshipStatus,
      effectiveStrength: active.length,
    };
  }

  private formatEventDetailed(event: GameEvent): string {
    switch (event.type) {
      case "scene_complete":
        return `${event.timestamp}: ${event.summary}`;
      case "decision_made":
        return `${event.timestamp}: Decision — ${event.prompt} (${event.tier}, personnel: ${event.personnelScore})`;
      case "casualty":
        return `${event.timestamp}: ${event.name} ${event.status} — ${event.cause}`;
      case "rally":
        return `${event.timestamp}: Rally — ${event.description}`;
      case "capability_change":
        return `${event.timestamp}: ${event.gained ? "Gained" : "Lost"} ${event.capability} — ${event.reason}`;
      case "intel_gained":
        return `${event.timestamp}: Intel — ${event.source}`;
      case "trait_triggered":
        return `${event.timestamp}: ${event.soldierId} trait ${event.trait} — ${event.effect}`;
      case "relationship_moment":
        return `${event.timestamp}: ${event.soldiers.join("+")} — ${event.description}`;
      case "assignment_consequence":
        return `${event.timestamp}: ${event.soldierId} assigned ${event.task} — ${event.outcome}`;
      case "resource_snapshot":
        return `${event.timestamp}: Men:${event.men} Ammo:${event.ammo}% Morale:${event.morale} Readiness:${event.readiness}`;
    }
  }

  private formatEventCompressed(event: GameEvent): string {
    switch (event.type) {
      case "scene_complete":
        return `${event.timestamp}: ${event.summary}`;
      case "casualty":
        return `${event.timestamp}: ${event.name} ${event.status}`;
      case "rally":
        return `${event.timestamp}: Rally — ${event.soldiers.join(", ")}`;
      default:
        return this.formatEventDetailed(event);
    }
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/services/eventLog.test.ts`
Expected: PASS (both old and new tests)

**Step 5: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/services/eventLog.ts tests/services/eventLog.test.ts
git commit -m "feat: upgrade EventLog with context builder, compression, and platoon audit"
```

---

### Task 1.4: Enhanced DM Layer — Personnel Evaluation

Upgrade `DMLayer` to evaluate WHO the player assigned to WHAT (Section 4). The enhanced DM prompt includes roster, relationships, capabilities, and recent events. Adds personnel score to the evaluation. Robust fallback chain: valid JSON → regex extraction → decision matching → mediocre baseline.

**Files:**
- Modify: `src/services/dmLayer.ts`
- Modify: `src/services/promptBuilder.ts`
- Test: `tests/services/dmLayer.test.ts` (extend)

**Step 1: Write failing tests for the enhanced DM layer**

Add tests to `tests/services/dmLayer.test.ts` for:
- `evaluatePrompt` returns `EnhancedDMEvaluation` with `personnelScore`
- Fallback chain: malformed JSON → regex extraction
- Fallback chain: total failure → mediocre baseline with personnelScore 50
- Vague orders get personnelScore 20-40
- Specific named-soldier orders get personnelScore 60-80+

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/services/dmLayer.test.ts`
Expected: FAIL

**Step 3: Update the DM evaluation prompt in `promptBuilder.ts`**

Update `buildDMEvaluationPrompt()` to:
- Include the new personnel evaluation instructions in the system prompt
- Add `[PERSONNEL EVALUATION]` section explaining role fitness, trait fitness, relationship awareness
- Update the JSON output format to include `personnelScore`, `assignments`, `assignmentIssues`, `assignmentBonuses`, `vulnerablePersonnel`, `capabilityRisks`
- Update `TONE_GUIDE` constant to match the v2 tone (replace old Hemingway directive)

**Step 4: Update `dmLayer.ts` to parse enhanced response**

Add:
- `parseEnhancedResponse()` that returns `EnhancedDMEvaluation`
- Fallback chain: try JSON.parse → try regex extraction of tier → fall back to mediocre baseline
- `evaluatePromptEnhanced()` method that returns `EnhancedDMEvaluation`
- Keep existing `evaluatePrompt()` for backward compatibility

**Step 5: Run tests**

Run: `npx vitest run tests/services/dmLayer.test.ts`
Expected: PASS

**Step 6: Run full suite**

Run: `npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/services/dmLayer.ts src/services/promptBuilder.ts tests/services/dmLayer.test.ts
git commit -m "feat: enhanced DM layer with personnel evaluation and fallback chain"
```

---

### Task 1.5: Update Tone Guide in Prompt Builder

Replace the old `TONE_GUIDE` constant in `promptBuilder.ts` with the v2 tone (Section 2 of design doc). This affects all LLM prompts.

**Files:**
- Modify: `src/services/promptBuilder.ts` (line 52, the `TONE_GUIDE` constant)
- Test: `tests/services/promptBuilder.test.ts` (extend)

**Step 1: Write a test that the tone guide matches v2**

```typescript
it("TONE_GUIDE uses v2 conversational style, not Hemingway", () => {
  const prompt = buildNarrationPrompt(minimalInput, "en");
  expect(prompt.system).not.toContain("Hemingway");
  expect(prompt.system).not.toContain("Ambrose");
  expect(prompt.system).toContain("telling a friend what happened");
  expect(prompt.system).toContain("vivid and direct");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/services/promptBuilder.test.ts`
Expected: FAIL — current tone guide mentions Ambrose

**Step 3: Replace the TONE_GUIDE constant**

In `src/services/promptBuilder.ts`, replace the `TONE_GUIDE` constant (line 52):

```typescript
const TONE_GUIDE = `Write like you're telling a friend what happened. Keep it vivid and direct.

DO: Short sentences. Concrete details. You can feel the cold, hear the gunfire, sense the fear. Use "your guys" not "your men." Use "about two football fields" not "approximately 200 meters." Military terms are used naturally — if a term appears, context explains it.

DON'T: No flowery language. No metaphors. No inner monologue. No melodrama. No "the weight of command settled on his shoulders." No Hemingway impression. No trying to be literary.

VOICE: Second person, present tense. "You're crouched behind the wall. Henderson taps your shoulder."

DEATH: Clinical, respectful. "The burst catches Rivera in the chest. He goes down." Not graphic, not glorified.

HUMOR: Soldiers' humor — dark, understated, human.`;
```

**Step 4: Run tests**

Run: `npx vitest run tests/services/promptBuilder.test.ts`
Expected: PASS

**Step 5: Run full suite**

Run: `npm test`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/services/promptBuilder.ts tests/services/promptBuilder.test.ts
git commit -m "feat: replace Hemingway tone guide with v2 conversational style"
```

---

### Task 1.6: Preparation Phase Engine

New engine module for Act 3's preparation menu. Player picks which prep actions to do, each costs time. Counterattack interrupts when trigger fires.

**Files:**
- Create: `src/engine/preparationPhase.ts`
- Test: `tests/engine/preparationPhase.test.ts` (create)

**Step 1: Write failing tests**

Create `tests/engine/preparationPhase.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  createPreparationPhase,
  completePrep,
  getAvailablePreps,
  calculatePrepEffects,
} from "../../src/engine/preparationPhase.ts";
import type { GameState } from "../../src/types/index.ts";

describe("Preparation Phase Engine", () => {
  it("createPreparationPhase returns all 6 default preps", () => {
    const phase = createPreparationPhase();
    expect(phase.availablePreps).toHaveLength(6);
    expect(phase.completedPreps).toEqual([]);
    expect(phase.counterattackTriggered).toBe(false);
    expect(phase.totalTimePreparing).toBe(0);
  });

  it("completePrep marks prep as done and adds time", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    expect(phase.completedPreps).toContain("defensive_positions");
    expect(phase.totalTimePreparing).toBe(90);
  });

  it("completePrep ignores already-completed preps", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    phase = completePrep(phase, "defensive_positions");
    expect(phase.completedPreps.filter(p => p === "defensive_positions")).toHaveLength(1);
    expect(phase.totalTimePreparing).toBe(90);
  });

  it("getAvailablePreps excludes completed preps", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    const available = getAvailablePreps(phase);
    expect(available.find(p => p.id === "defensive_positions")).toBeUndefined();
    expect(available).toHaveLength(5);
  });

  it("calculatePrepEffects aggregates all completed prep effects", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    phase = completePrep(phase, "listening_posts");
    phase = completePrep(phase, "redistribute_ammo");
    const effects = calculatePrepEffects(phase);
    expect(effects.casualtyReduction).toBeGreaterThan(0);
    expect(effects.earlyWarning).toBe(true);
    expect(effects.ammoRedistributed).toBe(true);
  });

  it("preps have correct time costs from design doc", () => {
    const phase = createPreparationPhase();
    const preps = phase.availablePreps;
    const defensive = preps.find(p => p.id === "defensive_positions");
    const listening = preps.find(p => p.id === "listening_posts");
    const ammo = preps.find(p => p.id === "redistribute_ammo");
    const medical = preps.find(p => p.id === "medical_station");
    const stragglers = preps.find(p => p.id === "find_stragglers");
    const rest = preps.find(p => p.id === "rest_and_brief");

    expect(defensive?.timeCost).toBe(90);
    expect(listening?.timeCost).toBe(60);
    expect(ammo?.timeCost).toBe(30);
    expect(medical?.timeCost).toBe(45);
    expect(stragglers?.timeCost).toBe(60);
    expect(rest?.timeCost).toBe(45);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/engine/preparationPhase.test.ts`
Expected: FAIL — module doesn't exist

**Step 3: Implement `src/engine/preparationPhase.ts`**

```typescript
import type { PreparationPhase, PrepScene, PrepEffects } from "../types/index.ts";

const DEFAULT_PREPS: PrepScene[] = [
  {
    id: "defensive_positions",
    label: "Defensive Positions",
    description: "Dig foxholes, set fields of fire, place BAR/MG",
    timeCost: 90,
    effect: { casualtyReduction: 2, moraleBonus: 5 },
  },
  {
    id: "listening_posts",
    label: "Listening Posts",
    description: "Scouts watch approaches",
    timeCost: 60,
    effect: { earlyWarning: true },
  },
  {
    id: "redistribute_ammo",
    label: "Redistribute Ammo",
    description: "Pool and rebalance ammunition",
    timeCost: 30,
    effect: { ammoRedistributed: true },
  },
  {
    id: "medical_station",
    label: "Medical Station",
    description: "Aid station, evacuation plan",
    timeCost: 45,
    effect: { medicalReady: true },
  },
  {
    id: "find_stragglers",
    label: "Find Stragglers",
    description: "Patrol for more paratroopers",
    timeCost: 60,
    effect: { additionalMen: 3 },
  },
  {
    id: "rest_and_brief",
    label: "Rest and Brief",
    description: "Sleep shifts, brief NCOs on sectors",
    timeCost: 45,
    effect: { moraleBonus: 10 },
  },
];

export function createPreparationPhase(): PreparationPhase {
  return {
    availablePreps: DEFAULT_PREPS.map(p => ({ ...p })),
    completedPreps: [],
    counterattackTriggered: false,
    totalTimePreparing: 0,
  };
}

export function completePrep(phase: PreparationPhase, prepId: string): PreparationPhase {
  if (phase.completedPreps.includes(prepId)) return phase;

  const prep = phase.availablePreps.find(p => p.id === prepId);
  if (!prep) return phase;

  return {
    ...phase,
    completedPreps: [...phase.completedPreps, prepId],
    totalTimePreparing: phase.totalTimePreparing + prep.timeCost,
  };
}

export function getAvailablePreps(phase: PreparationPhase): PrepScene[] {
  return phase.availablePreps.filter(p => !phase.completedPreps.includes(p.id));
}

export function calculatePrepEffects(phase: PreparationPhase): PrepEffects {
  const effects: PrepEffects = {};

  for (const prepId of phase.completedPreps) {
    const prep = phase.availablePreps.find(p => p.id === prepId);
    if (!prep) continue;
    const e = prep.effect;

    if (e.casualtyReduction) effects.casualtyReduction = (effects.casualtyReduction ?? 0) + e.casualtyReduction;
    if (e.earlyWarning) effects.earlyWarning = true;
    if (e.ammoRedistributed) effects.ammoRedistributed = true;
    if (e.medicalReady) effects.medicalReady = true;
    if (e.moraleBonus) effects.moraleBonus = (effects.moraleBonus ?? 0) + e.moraleBonus;
    if (e.additionalMen) effects.additionalMen = (effects.additionalMen ?? 0) + e.additionalMen;
  }

  return effects;
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/engine/preparationPhase.test.ts`
Expected: PASS

**Step 5: Full suite**

Run: `npm test`
Expected: All tests pass

**Step 6: Commit**

```bash
git add src/engine/preparationPhase.ts tests/engine/preparationPhase.test.ts
git commit -m "feat: add preparation phase engine for Act 3 menu-based prep system"
```

---

### Task 1.7: Extend Content Validation for v2 Requirements

Add new validation rules from Section 9 of the design doc: personnel hooks (2+ decisions benefiting from specific assignments), interlude presence, 2IC coverage, tone compliance.

**Files:**
- Modify: `tests/content/validation.test.ts`

**Step 1: Add new validation rules**

Add these validator functions and corresponding tests to `tests/content/validation.test.ts`:

- **Rule 8: Personnel hooks** — every scene has 2+ decisions where personnel assignment matters (has `requiresCapability`, `benefitsFromIntel`, `requiresPhase`, or `minMen`)
- **Rule 9: Interlude presence** — every scene has an `interlude` field
- **Rule 10: 2IC coverage** — every scene has `secondInCommandComments` with at least one entry
- **Rule 11: Tone compliance** — no banned patterns in narrative text (check for past tense "he was", metaphors, flowery adjectives)

**Step 2: Run tests**

Run: `npx vitest run tests/content/validation.test.ts`
Expected: New rules pass for test fixtures

**Step 3: Commit**

```bash
git add tests/content/validation.test.ts
git commit -m "feat: add v2 validation rules — personnel hooks, interludes, 2IC, tone"
```

---

## Phase 2: Research Documents

> **Note:** This phase can run in parallel with Phase 1. These are documentation tasks, not code changes.

### Task 2.1: Historical Research

**Files:**
- Create: `docs/research/historical.md`

Research and document real 101st Airborne D-Day operations: timeline, terrain, specific battles, unit composition, what happened hour by hour on June 5-6, 1944. Focus on facts that inform the 30 scenes.

**Commit:**
```bash
git add docs/research/historical.md
git commit -m "docs: add historical research — 101st Airborne D-Day operations"
```

### Task 2.2: Tactical Research

**Files:**
- Create: `docs/research/tactics.md`

Research small-unit tactics: fire and maneuver, building clearing procedures, defensive preparation, patrol formations, ambush techniques, aid station setup. Focus on WWII-era procedures that map to the game's decision space.

**Commit:**
```bash
git add docs/research/tactics.md
git commit -m "docs: add tactical research — small-unit WWII procedures"
```

### Task 2.3: Personnel Research

**Files:**
- Create: `docs/research/personnel.md`

Document the 18-soldier roster in detail: role functions (what a BAR gunner actually does), trait-task mapping (which traits help/hurt which tasks), relationship dynamics (who works well together, who doesn't). Create the mapping tables that content writers use.

Reference existing roster at `src/engine/roster.ts` and relationships at `src/content/relationships.ts`.

**Commit:**
```bash
git add docs/research/personnel.md
git commit -m "docs: add personnel research — roles, traits, relationships"
```

---

## Phase 3: Scene Briefs (Human-Reviewed)

> **HUMAN REVIEW GATE.** All 30 briefs must be annotated and approved before Phase 4 begins.

### Task 3.1: Write Act 1 Scene Briefs (10 briefs)

**Files:**
- Create: `docs/briefs/act1_scene01.md` through `docs/briefs/act1_scene10.md`

For each scene from the design doc (Section 6, Act 1 table), write a brief containing:
- Tactical situation (terrain, threats, time of day, weather)
- What's tactically correct/wrong per tier (suicidal through masterful)
- Personnel assignment opportunities (who's ideal for what, who's wrong)
- Key state changes per outcome tier (men, ammo, morale, readiness, time)
- Rally soldiers for this scene (reference roster IDs from `src/engine/roster.ts`)
- 2IC comments (Henderson or replacement)
- Tone notes
- Scene transition (what comes before/after)

Use the design doc Section 6 Act 1 table as the source of truth:

| # | Scene Name | Key Design Notes |
|---|---|---|
| 1 | The Landing | Solo. Gear check, orientation. Already implemented. |
| 2 | Finding North | Solo. Navigation. Already implemented. |
| 3 | First Contact | Solo. Friend or enemy identification. Already implemented. |
| 4 | The Straggler | NEW. Scared private from another unit. First follower. |
| 5 | The Sergeant | Henderson, Malone, Doyle. Already implemented (as scene04). |
| 6 | The Patrol | German patrol at bridge. Already implemented (as scene05). |
| 7 | The Farmhouse | Rivera + Kowalski. Already implemented (as scene06). |
| 8 | The Crossroad | NEW. Wire across road, fresh tire tracks. Route choice. |
| 9 | The Minefield | NEW. Flooded pasture — mines? Risk assessment. |
| 10 | The Rally Point | Already partially implemented (as scene07). American voices, challenge/response. |

Note: Existing 7 scenes need briefs too — these inform the rewrite to match v2 tone and personnel hooks.

**Commit:**
```bash
git add docs/briefs/act1_*.md
git commit -m "docs: Act 1 scene briefs (10 scenes) — ready for human review"
```

### Task 3.2: Write Act 2 Scene Briefs (10 briefs)

**Files:**
- Create: `docs/briefs/act2_scene01.md` through `docs/briefs/act2_scene10.md`

Use the design doc Section 6 Act 2 table. All 10 scenes are new content.

**Commit:**
```bash
git add docs/briefs/act2_*.md
git commit -m "docs: Act 2 scene briefs (10 scenes) — ready for human review"
```

### Task 3.3: Write Act 3 Scene Briefs (10 briefs)

**Files:**
- Create: `docs/briefs/act3_scene01.md` through `docs/briefs/act3_scene10.md`

Use the design doc Section 6 Act 3 table. Includes the preparation menu scenes (2-7) and counterattack trigger mechanics.

**Commit:**
```bash
git add docs/briefs/act3_*.md
git commit -m "docs: Act 3 scene briefs (10 scenes) — ready for human review"
```

---

## Phase 4: Content Writing + Verification (Per Act)

> **Sequential per act.** Each act passes two gates before the next begins.

### Task 4.1: Rewrite Act 1 Scenes from Approved Briefs

**Files:**
- Modify: `src/content/scenarios/act1/scene01_landing.ts` through `scene07_the_road.ts`
- Create: `src/content/scenarios/act1/scene04_the_straggler.ts` (NEW — currently missing)
- Create: `src/content/scenarios/act1/scene08_the_crossroad.ts` (NEW)
- Create: `src/content/scenarios/act1/scene09_the_minefield.ts` (NEW)
- Modify: `src/content/scenarios/act1/index.ts` (register new scenes)

Current Act 1 has 7 scenes but the v2 design calls for 10. Mapping:

| v2 # | v2 Name | Current File | Action |
|---|---|---|---|
| 1 | The Landing | `scene01_landing.ts` | Rewrite for v2 tone |
| 2 | Finding North | `scene02_finding_north.ts` | Rewrite for v2 tone |
| 3 | First Contact | `scene03_first_contact.ts` | Rewrite for v2 tone |
| 4 | The Straggler | — | **CREATE** |
| 5 | The Sergeant | `scene04_the_sergeant.ts` → rename to `scene05_the_sergeant.ts` | Rewrite + renumber |
| 6 | The Patrol | `scene05_the_patrol.ts` → rename to `scene06_the_patrol.ts` | Rewrite + renumber |
| 7 | The Farmhouse | `scene06_the_farmhouse.ts` → rename to `scene07_the_farmhouse.ts` | Rewrite + renumber |
| 8 | The Crossroad | — | **CREATE** |
| 9 | The Minefield | — | **CREATE** |
| 10 | The Rally Point | `scene07_the_road.ts` → rename to `scene10_rally_point.ts` | Rewrite + renumber |

For each scene file:
- Match approved brief exactly
- v2 tone (no Hemingway, vivid and direct)
- Add personnel hooks (2+ decisions benefiting from specific assignments)
- Add `interlude` field
- Add `secondInCommandComments` with Henderson + green fallback
- Ensure `sceneContext` answers: Where am I? What's happening? What can I do?
- All `nextScene` references updated for new scene IDs

**Important:** Scene IDs must be updated consistently. Use pattern `act1_scene{NN}_{name}`:
- `act1_scene01_landing`
- `act1_scene02_finding_north`
- `act1_scene03_first_contact`
- `act1_scene04_straggler`
- `act1_scene05_sergeant`
- `act1_scene06_patrol`
- `act1_scene07_farmhouse`
- `act1_scene08_crossroad`
- `act1_scene09_minefield`
- `act1_scene10_rally_point`

**Step 1: Create new scene files from approved briefs**

**Step 2: Rewrite existing scenes for v2 tone + personnel hooks**

**Step 3: Update `src/content/scenarios/act1/index.ts`**

**Step 4: Update all `nextScene` references across Act 1**

**Step 5: Run validation**

Run: `npx vitest run tests/content/validation.test.ts`
Expected: All Act 1 validation rules pass

**Step 6: Run full suite**

Run: `npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/content/scenarios/act1/
git commit -m "feat: Act 1 complete — 10 scenes with v2 tone and personnel hooks"
```

### Task 4.2: Act 1 Gate 1 — Structural Verification

Run the full structural test suite against Act 1:

- Schema compliance: every scene matches Scenario interface
- Scene graph connectivity: all 10 scenes reachable from `act1_scene01_landing`, no dead ends
- Decision completeness: every decision has success/partial/failure with state changes
- Balance envelope: resource changes within bounds per tier
- Capability references: all `requiresCapability`/`benefitsFromIntel` are valid keys
- Personnel hooks: every scene has 2+ decisions benefiting from specific assignments
- Rally consistency: rally soldiers exist in roster, IDs unique
- Timeline math: cumulative `timeCost` within Act 1 budget (0100-0600 = 300 min)
- Interlude presence
- 2IC coverage
- Tone compliance (no banned patterns)

Fix all failures, re-run until clean.

### Task 4.3: Act 1 Gate 2 — Playthrough Verification

Run at least 5 playthrough simulations:

1. **Optimal run** — best decisions, correct personnel
2. **Worst-case run** — worst decisions, bad personnel
3. **Speed run** — minimize time spent
4. **Hardcore prompt run** — 5+ free-text orders evaluated by DM layer
5. **Personnel test** — deliberately misassign soldiers

For each run, verify: no state contradictions, no softlocks, DM evaluates consistently, narrative tone matches v2.

### Task 4.4: Write Act 2 Scenes from Approved Briefs

**Files:**
- Create: `src/content/scenarios/act2/scene01_dawn.ts` through `scene10_first_light.ts`
- Create: `src/content/scenarios/act2/index.ts`

Same process as Task 4.1, using Act 2 briefs. Scene IDs: `act2_scene{NN}_{name}`.

Act 2 scenes from design doc:

| # | Scene | File |
|---|---|---|
| 1 | Dawn | `scene01_dawn.ts` |
| 2 | The Approach | `scene02_the_approach.ts` |
| 3 | The Observation Post | `scene03_observation_post.ts` |
| 4 | The MG Nest | `scene04_mg_nest.ts` |
| 5 | The Assault | `scene05_the_assault.ts` |
| 6 | The Building | `scene06_the_building.ts` |
| 7 | The Cellar | `scene07_the_cellar.ts` |
| 8 | The Counterfire | `scene08_counterfire.ts` |
| 9 | Securing the Position | `scene09_securing.ts` |
| 10 | First Light | `scene10_first_light.ts` |

**Commit:**
```bash
git add src/content/scenarios/act2/
git commit -m "feat: Act 2 complete — 10 scenes, full platoon gameplay"
```

### Task 4.5: Act 2 Gates (1 + 2)

Same process as Tasks 4.2 and 4.3, targeting Act 2.

### Task 4.6: Write Act 3 Scenes from Approved Briefs

**Files:**
- Create: `src/content/scenarios/act3/scene01_taking_stock.ts` through `scene10_relief.ts`
- Create: `src/content/scenarios/act3/index.ts`

Act 3 has the preparation menu (scenes 2-7 are **not sequential** — they're a menu). The `PreparationPhase` engine (Task 1.6) handles this. Scene files for prep actions reference `PrepScene` types.

| # | Scene | File |
|---|---|---|
| 1 | Taking Stock | `scene01_taking_stock.ts` |
| 2-7 | Preparation (menu) | `scene02_preparation.ts` (single file with 6 prep scenes) |
| 8 | The Counterattack Begins | `scene08_counterattack_begins.ts` |
| 9 | The Main Assault | `scene09_main_assault.ts` |
| 10 | Relief | `scene10_relief.ts` |

**Commit:**
```bash
git add src/content/scenarios/act3/
git commit -m "feat: Act 3 complete — prep menu, counterattack, relief"
```

### Task 4.7: Act 3 Gates (1 + 2)

Same process, plus specific checks:
- Preparation menu: all 6 preps accessible, time costs correct, counterattack triggers appropriately
- Missing prep consequences visible during counterattack scenes
- Counterattack trigger function works with various readiness values

---

## Phase 5: Integration

### Task 5.1: Cross-Act Campaign Testing

Run 5+ full campaign playthroughs (Act 1 → Act 2 → Act 3):

1. **Optimal campaign** — best decisions throughout
2. **Struggling campaign** — mediocre decisions, accumulating losses
3. **Disaster campaign** — worst decisions, heavy casualties
4. **Hardcore campaign** — free-text prompts only
5. **Context continuity test** — verify event log narrative thread persists across all 30 scenes

Verify:
- State carries over correctly between acts
- Event log stays under 500 tokens even at scene 30
- Platoon audit correctly reflects cumulative state
- No softlocks at any point
- Scene transitions are smooth (interludes work)

### Task 5.2: Update GameScreen Component for v2 Flow

**Files:**
- Modify: `src/components/GameScreen.tsx`
- Modify: `src/components/PrepPhase.tsx`

Ensure the React components support:
- Act transitions (1 → 2 → 3) with state carryover
- Preparation menu mode for Act 3 (scene 2-7)
- Enhanced DM evaluation display (personnel score, assignment feedback)
- Event log context builder feeding into narrative requests

### Task 5.3: Balance Pass

Review resource curves across all 30 scenes:
- Ammo: does it drain appropriately? Is suppressive fire more costly?
- Time: do all actions have realistic costs? Does the timeline math work?
- Morale: does it swing appropriately with victories/losses?
- Readiness: does enemy alertness escalate correctly?
- Casualties: weighted toward poorly-assigned soldiers?

---

## File Ownership Summary

| Agent/Task | Writes to | Never touches |
|---|---|---|
| Phase 1 (Engine) | `src/engine/`, `src/types/`, `src/services/` | `src/content/`, `src/components/` |
| Phase 2 (Research) | `docs/research/` | Everything else |
| Phase 3 (Briefs) | `docs/briefs/` | Everything else |
| Phase 4 (Content) | `src/content/scenarios/act{N}/` | Other acts, engine, services |
| Phase 4 (Validation) | `tests/` | `src/` |
| Phase 5 (Integration) | `src/components/`, `tests/integration/` | `src/engine/`, `src/content/` |

---

## Decision Log

| Decision | Rationale |
|---|---|
| Keep existing `DMEvaluation` alongside `EnhancedDMEvaluation` | Backward compatibility — existing hardcoded mode still uses simple evaluation |
| Keep existing `PlaythroughEvent` alongside `GameEvent` | Existing epilogue system depends on PlaythroughEvent; migrate later |
| Rename scene files to match v2 numbering | v2 inserts scene 4 (Straggler) between First Contact and The Sergeant |
| Single `scene02_preparation.ts` for Act 3 menu | 6 prep scenes share the same engine; one file with conditional content |
| English-first content | Design doc Section 12: French translation is a separate final phase |

---

## Estimated Effort

| Phase | Tasks | Est. time |
|---|---|---|
| Phase 1: Engine | 7 tasks | 3-5 hours |
| Phase 2: Research | 3 tasks | 2-3 hours |
| Phase 3: Briefs | 3 tasks + human review | 4-6 hours (+ review time) |
| Phase 4: Content | 7 tasks (3 acts × write + gates) | 15-20 hours |
| Phase 5: Integration | 3 tasks | 3-5 hours |
| **Total** | **23 tasks** | **27-39 hours** |
