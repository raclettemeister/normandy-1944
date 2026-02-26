# AI-Driven Narrative Pivot — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded narrative with LLM-generated text, add free-text player actions, dynamic epilogues, and access code gating.

**Architecture:** Cloudflare Worker proxies Claude Sonnet API calls. Client sends game state + context seeds; Worker validates access code, forwards to Anthropic, streams response back. Game engine stays fully deterministic — LLM only generates prose. Fallback chain: LLM → template → hardcoded text.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 4, Cloudflare Workers (Wrangler), Anthropic Claude Sonnet API, Cloudflare KV.

**Research doc:** `docs/plans/2026-02-25-ai-narrative-pivot-research.md` — read Sections 1-12 for full context.

---

## Phase 0: Bug Fixes (prerequisite)

These bugs affect the engine that feeds the narrative layer. Fix first.

---

### Task 0.1: Fix `menLost: -1` pattern in scene03

**Files:**
- Modify: `normandy-1944/src/types/index.ts`
- Modify: `normandy-1944/src/engine/outcomeEngine.ts`
- Modify: `normandy-1944/src/content/scenarios/act1/scene03_first_contact.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write failing test**

In `tests/engine/outcomeEngine.test.ts`, add:

```typescript
describe("processSceneTransition — menGained", () => {
  it("should add soldiers to roster when menGained is set", () => {
    const state = makeState({ men: 1 });
    const scene = makeMinimalScene();
    const outcome: OutcomeNarrative = {
      text: "A stray paratrooper joins you.",
      menLost: 0,
      ammoSpent: 0,
      moraleChange: 5,
      readinessChange: 0,
    };
    // menGained not yet on the type — test should fail to compile or fail at runtime
    const result = processSceneTransition(state, scene, outcome, "middle");
    expect(result.state.men).toBe(1); // no menGained yet, men unchanged
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd normandy-1944 && npx vitest run tests/engine/outcomeEngine.test.ts --reporter=verbose`

**Step 3: Add `menGained` to types**

In `src/types/index.ts`, add to `OutcomeNarrative`:

```typescript
interface OutcomeNarrative {
  text: string;
  menLost: number;
  ammoSpent: number;
  moraleChange: number;
  readinessChange: number;
  intelGained?: keyof IntelFlags;
  menGained?: number;  // NEW: soldiers gained (used with rally-like inline gains)
}
```

**Step 4: Handle `menGained` in outcomeEngine.ts**

In `processSceneTransition()`, after the men subtraction line, add:

```typescript
if (outcome.menGained && outcome.menGained > 0) {
  newState.men = Math.min(18, newState.men + outcome.menGained);
}
```

**Step 5: Fix scene03 — replace `menLost: -1` with proper rally events**

In `scene03_first_contact.ts`, for every outcome that has `menLost: -1`:
- Change `menLost: -1` to `menLost: 0`
- Add a rally event to the scene or use inline `menGained: 1` on the outcome
- The stray paratrooper should be a real soldier from the roster

Since scene03 involves finding a single stray paratrooper, the simplest fix is changing `menLost: -1` to `menLost: 0, menGained: 1` on the relevant outcomes.

**Step 6: Run all tests**

Run: `cd normandy-1944 && npx vitest run --reporter=verbose`
Expected: All pass.

**Step 7: Commit**

```bash
git add -A && git commit -m "fix: replace menLost:-1 hack with menGained field in scene03"
```

---

### Task 0.2: Fix rally always fires in scene04

**Files:**
- Modify: `normandy-1944/src/types/index.ts`
- Modify: `normandy-1944/src/engine/outcomeEngine.ts`
- Modify: `normandy-1944/src/content/scenarios/act1/scene04_the_sergeant.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write failing test**

```typescript
describe("processSceneTransition — skipRally", () => {
  it("should not process rally when outcome has skipRally: true", () => {
    const rallyScene = makeMinimalScene();
    rallyScene.rally = {
      soldiers: [makeSoldier({ id: "henderson", role: "platoon_sergeant" })],
      ammoGain: 10,
      moraleGain: 8,
      narrative: "Henderson appears.",
    };
    const outcome: OutcomeNarrative = {
      text: "You slip away.",
      menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0,
      skipRally: true,
    };
    const state = makeState({ men: 1, ammo: 20, morale: 40 });
    const result = processSceneTransition(state, rallyScene, outcome, "middle");
    expect(result.state.men).toBe(1); // no rally soldiers added
    expect(result.state.ammo).toBe(20); // no ammo gain
  });
});
```

**Step 2: Run test — should fail** (skipRally doesn't exist yet)

**Step 3: Add `skipRally` to OutcomeNarrative type**

```typescript
interface OutcomeNarrative {
  // ... existing fields
  skipRally?: boolean;  // NEW: if true, skip scene-level rally event
}
```

**Step 4: Update `processSceneTransition` to check skipRally**

Change rally processing from:
```typescript
if (scene.rally) { /* process rally */ }
```
To:
```typescript
if (scene.rally && !outcome.skipRally) { /* process rally */ }
```

**Step 5: Fix scene04 decisions**

- `sergeant_avoid`: Add `skipRally: true` to all three outcome tiers
- `sergeant_signal_shot`: Consider partial rally (Henderson only) — for now, add `skipRally: true` to failure tier only

**Step 6: Run all tests**

**Step 7: Commit**

```bash
git commit -m "fix: add skipRally flag to prevent rally on avoid/flee decisions"
```

---

### Task 0.3: Fix scene 6 → nonexistent scene 7

**Files:**
- Create: `normandy-1944/src/content/scenarios/act1/scene07_the_road.ts`
- Modify: `normandy-1944/src/content/scenarios/act1/index.ts`
- Test: `normandy-1944/tests/content/validation.test.ts`

**Step 1: Run content validation to confirm failure**

Run: `cd normandy-1944 && npx vitest run tests/content/validation.test.ts --reporter=verbose`
Expected: Fails on "nextScene references valid scene" for scene06.

**Step 2: Create scene07 — minimal but playable**

Create `src/content/scenarios/act1/scene07_the_road.ts`. This is scene 7 of 10 in Act 1 (movement to rally point). Use the spec for guidance — scenes 7-10 are "route decisions, obstacle crossing, German patrol avoidance, arrival."

Write a minimal scene with 3-4 decisions, proper tiers, and `nextScene` pointing to `"act1_scene08"` (or a terminal scene if we're capping Act 1 here temporarily). For now, make the last scene in Act 1 point to itself or to a victory condition.

Since scenes 08-10 don't exist, make scene07 the Act 1 finale for now. All decisions point to `nextScene: "act1_rally_point"` and create a terminal scene `act1_rally_point` that triggers Act 1 completion.

**Step 3: Register in index.ts**

Add `import './scene07_the_road';` to `src/content/scenarios/act1/index.ts`.

**Step 4: Run content validation**

Expected: All pass (scene06 → scene07 is now valid).

**Step 5: Commit**

```bash
git commit -m "fix: add scene07 to resolve scene06 dead end"
```

---

### Task 0.4: Fix captain position score modifier

**Files:**
- Modify: `normandy-1944/src/engine/outcomeEngine.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write failing test**

```typescript
describe("calculateEffectiveScore — captain position", () => {
  it("should add +5 for front position", () => {
    const state = makeState({ morale: 60 });
    const decision = makeDecision({ tier: "sound" });
    const base = calculateEffectiveScore("sound", state, decision);
    const withFront = calculateEffectiveScore("sound", state, decision, "front");
    expect(withFront).toBe(base + 5);
  });

  it("should subtract -5 for rear position", () => {
    const state = makeState({ morale: 60 });
    const decision = makeDecision({ tier: "sound" });
    const base = calculateEffectiveScore("sound", state, decision);
    const withRear = calculateEffectiveScore("sound", state, decision, "rear");
    expect(withRear).toBe(base - 5);
  });
});
```

**Step 2: Run test — should fail** (calculateEffectiveScore doesn't take captain position)

**Step 3: Add `captainPosition` parameter**

Update `calculateEffectiveScore` signature:

```typescript
function calculateEffectiveScore(
  tier: TacticalTier,
  state: GameState,
  decision: Decision,
  captainPosition?: CaptainPosition  // NEW
): number {
  // ... existing modifiers ...

  // Captain position: +5 front, -5 rear
  if (captainPosition === "front") score += 5;
  if (captainPosition === "rear") score -= 5;

  return Math.max(0, Math.min(100, score));
}
```

**Step 4: Update GameScreen.tsx call site**

Pass `captainPosition` to `calculateEffectiveScore` in `handleDecision`.

**Step 5: Run all tests**

**Step 6: Commit**

```bash
git commit -m "fix: add captain position modifier to effective score calculation"
```

---

### Task 0.5: Add per-decision time costs

**Files:**
- Modify: `normandy-1944/src/types/index.ts`
- Modify: `normandy-1944/src/engine/outcomeEngine.ts`
- Test: `normandy-1944/tests/engine/outcomeEngine.test.ts`

**Step 1: Write failing test**

```typescript
describe("processSceneTransition — per-decision timeCost", () => {
  it("should use outcome timeCost over scene timeCost when present", () => {
    const state = makeState({ time: { hour: 1, minute: 0 } });
    const scene = makeMinimalScene(); // scene.timeCost = 15
    const outcome: OutcomeNarrative = {
      text: "result", menLost: 0, ammoSpent: 0,
      moraleChange: 0, readinessChange: 0,
      timeCost: 30,  // override: 30 min instead of scene's 15
    };
    const result = processSceneTransition(state, scene, outcome, "middle");
    expect(result.state.time).toEqual({ hour: 1, minute: 30 });
  });
});
```

**Step 2: Run test — should fail**

**Step 3: Add optional `timeCost` to OutcomeNarrative**

```typescript
interface OutcomeNarrative {
  // ... existing fields
  timeCost?: number;  // NEW: overrides scene.timeCost if present
}
```

**Step 4: Update processSceneTransition**

Change time advance from:
```typescript
newState.time = advanceTime(state.time, scene.timeCost);
```
To:
```typescript
const effectiveTimeCost = outcome.timeCost ?? scene.timeCost;
newState.time = advanceTime(state.time, effectiveTimeCost);
```

Also update the passive readiness calculation to use `effectiveTimeCost`.

**Step 5: Run all tests**

**Step 6: Commit**

```bash
git commit -m "fix: support per-decision time costs with scene-level fallback"
```

---

## Phase 1: Foundation (types + data)

---

### Task 1.1: Add narrative-related types

**Files:**
- Modify: `normandy-1944/src/types/index.ts`

**Step 1: Add new interfaces**

```typescript
// Context seed fields (added to existing interfaces in Task 0.1-0.5)
// Scenario gets: sceneContext?: string
// OutcomeNarrative gets: context?: string

// Relationship map
interface SoldierRelationship {
  soldierId: string;
  targetId: string;
  type: "protective" | "rivalry" | "brothers" | "depends_on" | "resents";
  detail: string;
}

// Playthrough event log
interface PlaythroughEvent {
  sceneId: string;
  type: "casualty" | "trait_triggered" | "relationship_moment"
      | "close_call" | "brave_act" | "player_action" | "promotion";
  soldierIds: string[];
  description: string;
}

// Narrative service types
type NarrativeMode = "llm" | "template" | "hardcoded";

interface NarrativeRequest {
  type: "scene" | "outcome" | "rally" | "death" | "epilogue" | "secondInCommand";
  sceneContext?: string;
  outcomeContext?: string;
  playerAction?: string;
  gameState: GameState;
  casualties?: Soldier[];
  captainHit?: boolean;
  soldier?: Soldier;           // for epilogue
  events?: PlaythroughEvent[]; // for epilogue
}

interface ClassificationRequest {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
}

interface ClassificationResult {
  matchedDecision: string;
  tier: TacticalTier;
  reasoning: string;
}

// Access code
interface AccessCode {
  code: string;
  createdAt: string;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  label?: string;
}
```

**Step 2: Add `sceneContext` to Scenario and `context` to OutcomeNarrative**

```typescript
interface Scenario {
  // ... all existing fields unchanged
  sceneContext?: string;  // NEW: LLM context seed (replaces narrative for LLM mode)
}

interface OutcomeNarrative {
  // ... all existing fields unchanged
  context?: string;  // NEW: LLM context seed (replaces text for LLM mode)
}
```

**Step 3: Run all tests — should still pass** (new fields are optional)

**Step 4: Commit**

```bash
git commit -m "feat: add types for narrative service, relationships, events, access codes"
```

---

### Task 1.2: Create relationships data

**Files:**
- Create: `normandy-1944/src/content/relationships.ts`
- Test: `normandy-1944/tests/content/relationships.test.ts`

**Step 1: Write test**

```typescript
import { getRelationships, getRelationshipsForSoldier, getActiveRelationships } from '../../src/content/relationships';

describe("relationships", () => {
  it("should return all defined relationships", () => {
    const all = getRelationships();
    expect(all.length).toBeGreaterThanOrEqual(8);
  });

  it("should return relationships for a specific soldier", () => {
    const hendersonRels = getRelationshipsForSoldier("henderson");
    expect(hendersonRels.length).toBeGreaterThanOrEqual(1);
    expect(hendersonRels.some(r => r.targetId === "doyle")).toBe(true);
  });

  it("should filter to active soldiers only", () => {
    const activeSoldierIds = ["henderson", "malone", "doyle"];
    const active = getActiveRelationships(activeSoldierIds);
    // Only relationships where BOTH soldiers are in the active list
    active.forEach(r => {
      expect(activeSoldierIds).toContain(r.soldierId);
      expect(activeSoldierIds).toContain(r.targetId);
    });
  });
});
```

**Step 2: Run test — fails**

**Step 3: Create `src/content/relationships.ts`**

```typescript
import type { SoldierRelationship } from '../types';

const RELATIONSHIPS: SoldierRelationship[] = [
  { soldierId: "henderson", targetId: "doyle", type: "protective",
    detail: "Trained him personally at Toccoa. Promised his mother he'd bring him home." },
  { soldierId: "malone", targetId: "caruso", type: "rivalry",
    detail: "Boston vs. Brooklyn. They argue about everything. Inseparable." },
  { soldierId: "kowalski", targetId: "big_tom", type: "brothers",
    detail: "BAR team. Work as one unit. Big Tom carries Kowalski's extra ammo." },
  { soldierId: "park", targetId: "webb", type: "depends_on",
    detail: "Park uses Webb as his eyes. Webb spots, Park shoots." },
  { soldierId: "rivera", targetId: "everyone", type: "protective",
    detail: "Doc treats everyone. Losing Doc is losing hope." },
  { soldierId: "palmer", targetId: "malone", type: "resents",
    detail: "Malone calls Palmer a coward to his face. Palmer hates him for it." },
  { soldierId: "doyle", targetId: "ellis", type: "brothers",
    detail: "Both green, both scared. They stick together because nobody else will." },
  { soldierId: "washington", targetId: "henderson", type: "rivalry",
    detail: "Washington's seen real danger. Respects Henderson but thinks he's too cautious." },
];

export function getRelationships(): SoldierRelationship[] {
  return RELATIONSHIPS;
}

export function getRelationshipsForSoldier(soldierId: string): SoldierRelationship[] {
  return RELATIONSHIPS.filter(r => r.soldierId === soldierId || r.targetId === soldierId);
}

export function getActiveRelationships(activeSoldierIds: string[]): SoldierRelationship[] {
  return RELATIONSHIPS.filter(r => {
    if (r.targetId === "everyone") return activeSoldierIds.includes(r.soldierId);
    return activeSoldierIds.includes(r.soldierId) && activeSoldierIds.includes(r.targetId);
  });
}
```

**Step 4: Run tests — should pass**

**Step 5: Commit**

```bash
git commit -m "feat: add soldier relationship map with 8 core pairs"
```

---

### Task 1.3: Create event log service

**Files:**
- Create: `normandy-1944/src/services/eventLog.ts`
- Test: `normandy-1944/tests/services/eventLog.test.ts`

**Step 1: Write tests**

```typescript
import { EventLog } from '../../src/services/eventLog';

describe("EventLog", () => {
  it("should append events", () => {
    const log = new EventLog();
    log.append({ sceneId: "act1_landing", type: "casualty",
      soldierIds: ["kowalski"], description: "Kowalski KIA at the bridge" });
    expect(log.getAll()).toHaveLength(1);
  });

  it("should filter events by soldier", () => {
    const log = new EventLog();
    log.append({ sceneId: "s1", type: "casualty",
      soldierIds: ["kowalski"], description: "Kowalski KIA" });
    log.append({ sceneId: "s2", type: "brave_act",
      soldierIds: ["malone"], description: "Malone volunteered" });
    expect(log.getForSoldier("kowalski")).toHaveLength(1);
    expect(log.getForSoldier("malone")).toHaveLength(1);
    expect(log.getForSoldier("henderson")).toHaveLength(0);
  });

  it("should filter events by type", () => {
    const log = new EventLog();
    log.append({ sceneId: "s1", type: "casualty",
      soldierIds: ["kowalski"], description: "KIA" });
    log.append({ sceneId: "s1", type: "trait_triggered",
      soldierIds: ["ellis"], description: "Froze" });
    expect(log.getByType("casualty")).toHaveLength(1);
  });

  it("should serialize to array", () => {
    const log = new EventLog();
    log.append({ sceneId: "s1", type: "casualty",
      soldierIds: ["k"], description: "d" });
    const serialized = log.serialize();
    expect(Array.isArray(serialized)).toBe(true);
    expect(serialized).toHaveLength(1);
  });
});
```

**Step 2: Run tests — fail**

**Step 3: Implement `src/services/eventLog.ts`**

```typescript
import type { PlaythroughEvent } from '../types';

export class EventLog {
  private events: PlaythroughEvent[] = [];

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

  serialize(): PlaythroughEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
```

**Step 4: Run tests — pass**

**Step 5: Commit**

```bash
git commit -m "feat: add playthrough event log for tracking significant game moments"
```

---

## Phase 2: Cloudflare Worker (LLM proxy + access codes)

---

### Task 2.1: Set up Worker project

**Files:**
- Create: `normandy-1944/worker/wrangler.jsonc`
- Create: `normandy-1944/worker/src/index.ts`
- Create: `normandy-1944/worker/package.json`
- Create: `normandy-1944/worker/tsconfig.json`

**Step 1: Initialize worker directory**

```bash
cd normandy-1944 && mkdir -p worker/src
```

**Step 2: Create `worker/package.json`**

```json
{
  "name": "normandy-narrative-worker",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250214.0",
    "wrangler": "^4.0.0",
    "typescript": "^5.9.0"
  }
}
```

**Step 3: Create `worker/wrangler.jsonc`**

```jsonc
{
  "name": "normandy-narrative",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "kv_namespaces": [
    {
      "binding": "ACCESS_CODES",
      "id": "<REPLACE_WITH_KV_NAMESPACE_ID>"
    }
  ],
  // ANTHROPIC_API_KEY set via `wrangler secret put ANTHROPIC_API_KEY`
}
```

**Step 4: Create `worker/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
```

**Step 5: Install dependencies**

```bash
cd normandy-1944/worker && npm install
```

**Step 6: Commit**

```bash
git commit -m "feat: scaffold Cloudflare Worker project for narrative API"
```

---

### Task 2.2: Implement Worker — code validation + LLM proxy

**Files:**
- Create: `normandy-1944/worker/src/index.ts`

**Step 1: Implement the Worker**

```typescript
interface Env {
  ACCESS_CODES: KVNamespace;
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: POST /api/validate-code
    if (url.pathname === "/api/validate-code" && request.method === "POST") {
      return handleValidateCode(request, env, corsHeaders);
    }

    // Route: POST /api/narrative
    if (url.pathname === "/api/narrative" && request.method === "POST") {
      return handleNarrative(request, env, corsHeaders);
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function validateCode(code: string, env: Env): Promise<boolean> {
  const stored = await env.ACCESS_CODES.get(code, "json") as any;
  if (!stored || !stored.active) return false;
  if (stored.maxUses && stored.currentUses >= stored.maxUses) return false;
  return true;
}

async function handleValidateCode(
  request: Request, env: Env, corsHeaders: Record<string, string>
): Promise<Response> {
  const { code } = await request.json() as { code: string };
  const valid = await validateCode(code, env);
  return new Response(JSON.stringify({ valid }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleNarrative(
  request: Request, env: Env, corsHeaders: Record<string, string>
): Promise<Response> {
  // Validate access code from Authorization header
  const code = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!code || !(await validateCode(code, env))) {
    return new Response(JSON.stringify({ error: "Invalid access code" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Forward to Anthropic
  const body = await request.json() as { messages: any[]; system: string; max_tokens?: number };

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: body.max_tokens ?? 300,
      system: body.system,
      messages: body.messages,
      stream: true,
    }),
  });

  // Stream the response back to the client
  return new Response(anthropicResponse.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

**Step 2: Test locally**

```bash
cd normandy-1944/worker && npx wrangler dev
```

Test with curl (will fail without KV and API key, but should start):
```bash
curl -X POST http://localhost:8787/api/validate-code -H "Content-Type: application/json" -d '{"code":"test"}'
```

**Step 3: Commit**

```bash
git commit -m "feat: implement Worker with code validation and Anthropic streaming proxy"
```

---

### Task 2.3: Create `.env.example` and update Vite config

**Files:**
- Create: `normandy-1944/.env.example`
- Modify: `normandy-1944/vite.config.ts` (if needed for env vars)

**Step 1: Create `.env.example`**

```
# Narrative API (Cloudflare Worker URL)
# Leave empty for offline mode (hardcoded text only)
VITE_NARRATIVE_API_URL=

# For local development with direct Anthropic access (optional)
# VITE_ANTHROPIC_API_KEY=
```

**Step 2: Create `.env.local` (gitignored)**

```
VITE_NARRATIVE_API_URL=http://localhost:8787
```

**Step 3: Commit**

```bash
git commit -m "feat: add .env.example for narrative API configuration"
```

---

## Phase 3: Narrative Service + Prompt Builder

---

### Task 3.1: Create prompt builder

**Files:**
- Create: `normandy-1944/src/services/promptBuilder.ts`
- Test: `normandy-1944/tests/services/promptBuilder.test.ts`

**Step 1: Write tests**

```typescript
import { buildNarrationPrompt, buildClassificationPrompt, buildEpiloguePrompt } from '../../src/services/promptBuilder';

describe("buildNarrationPrompt", () => {
  it("should include scene context", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Night landing. Flooded field.",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.system).toContain("Night landing");
    expect(prompt.system).toContain("terse");  // tone guide
  });

  it("should include active roster with traits", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ name: "Henderson", traits: ["veteran", "steady"] })],
      relationships: [],
    });
    expect(prompt.system).toContain("Henderson");
    expect(prompt.system).toContain("veteran");
  });

  it("should include relationships for active soldiers", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      gameState: makeMinimalGameState(),
      roster: [
        makeSoldier({ id: "henderson", name: "Henderson" }),
        makeSoldier({ id: "doyle", name: "Doyle" }),
      ],
      relationships: [{
        soldierId: "henderson", targetId: "doyle",
        type: "protective", detail: "Trained him personally.",
      }],
    });
    expect(prompt.system).toContain("protective");
    expect(prompt.system).toContain("Trained him personally");
  });

  it("should include outcome context and casualties", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      outcomeContext: "Ambush successful. One German escaped.",
      casualties: [makeSoldier({ name: "Doyle", status: "wounded" })],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.userMessage).toContain("Ambush successful");
    expect(prompt.userMessage).toContain("Doyle");
    expect(prompt.userMessage).toContain("wounded");
  });

  it("should include player action when provided", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      playerAction: "I throw my helmet as a decoy",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.userMessage).toContain("throw my helmet");
  });
});

describe("buildClassificationPrompt", () => {
  it("should list all available decisions", () => {
    const prompt = buildClassificationPrompt({
      sceneContext: "German patrol at bridge.",
      decisions: [
        makeDecision({ id: "ambush", text: "Set up ambush", tier: "excellent" }),
        makeDecision({ id: "charge", text: "Charge", tier: "suicidal" }),
      ],
      playerText: "I crawl through the ditch",
      gameState: makeMinimalGameState(),
    });
    expect(prompt.userMessage).toContain("ambush");
    expect(prompt.userMessage).toContain("charge");
    expect(prompt.userMessage).toContain("crawl through the ditch");
  });

  it("should request JSON response format", () => {
    const prompt = buildClassificationPrompt({
      sceneContext: "Bridge.",
      decisions: [],
      playerText: "test",
      gameState: makeMinimalGameState(),
    });
    expect(prompt.system).toContain("JSON");
  });
});

describe("buildEpiloguePrompt", () => {
  it("should include soldier details and events", () => {
    const prompt = buildEpiloguePrompt({
      soldier: makeSoldier({ name: "Doyle", status: "active", hometown: "Boise, Idaho" }),
      events: [{ sceneId: "s1", type: "trait_triggered",
        soldierIds: ["doyle"], description: "Froze during first combat" }],
      relationships: [{ soldierId: "henderson", targetId: "doyle",
        type: "protective", detail: "Trained him" }],
      allSoldierStatuses: [{ id: "henderson", status: "active" }],
    });
    expect(prompt.userMessage).toContain("Doyle");
    expect(prompt.userMessage).toContain("Boise");
    expect(prompt.userMessage).toContain("Froze during first combat");
    expect(prompt.userMessage).toContain("protective");
  });
});
```

**Step 2: Run tests — fail**

**Step 3: Implement `src/services/promptBuilder.ts`**

Build each prompt type using the templates from the research doc Section 6. The function returns `{ system: string, userMessage: string }` for each prompt type. Include:
- Tone guide (terse, military, present tense, second person)
- Game state formatting
- Roster formatting with traits and statuses
- Relationship formatting (only active pairs)
- Casualty descriptions
- Player action inclusion
- Word limits in instructions

Reference the research doc Section 6 for exact prompt templates.

**Step 4: Run tests — pass**

**Step 5: Commit**

```bash
git commit -m "feat: implement prompt builder for narration, classification, and epilogues"
```

---

### Task 3.2: Create narrative service

**Files:**
- Create: `normandy-1944/src/services/narrativeService.ts`
- Test: `normandy-1944/tests/services/narrativeService.test.ts`

**Step 1: Write tests**

Test the service with a mock fetch (don't hit real API in tests):

```typescript
import { NarrativeService } from '../../src/services/narrativeService';

describe("NarrativeService", () => {
  describe("mode detection", () => {
    it("should use hardcoded mode when no API URL configured", () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      expect(service.getMode()).toBe("hardcoded");
    });

    it("should use llm mode when API URL and code are configured", () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "TEST-CODE"
      });
      expect(service.getMode()).toBe("llm");
    });
  });

  describe("generateOutcomeNarrative", () => {
    it("should return hardcoded text when in hardcoded mode", async () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      const result = await service.generateOutcomeNarrative({
        outcomeText: "You succeed.",
        outcomeContext: "Ambush worked.",
        sceneContext: "Bridge.",
        gameState: makeMinimalGameState(),
        roster: [],
        relationships: [],
      });
      expect(result).toBe("You succeed."); // falls back to hardcoded text
    });
  });

  describe("classifyPlayerAction", () => {
    it("should reject empty input", async () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "CODE"
      });
      const result = await service.classifyPlayerAction({
        sceneContext: "Bridge.", decisions: [], playerText: "",
        gameState: makeMinimalGameState(),
      });
      expect(result).toBeNull(); // rejected
    });
  });
});
```

**Step 2: Run tests — fail**

**Step 3: Implement `src/services/narrativeService.ts`**

The service handles:
- Mode detection (LLM / template / hardcoded)
- `generateOutcomeNarrative()` — calls LLM or returns fallback
- `generateSceneNarrative()` — calls LLM or returns fallback
- `classifyPlayerAction()` — calls LLM, parses JSON, validates
- `generateEpilogue()` — calls LLM for one soldier
- `generateEpilogues()` — parallelizes epilogue calls for all soldiers
- Streaming support via callback: `onChunk: (text: string) => void`
- Error handling and fallback at every step

Key implementation details:
- Uses `fetch()` to call the Worker
- Parses SSE stream from Anthropic (via Worker proxy)
- Access code in `Authorization: Bearer <code>` header
- Classification response parsed as JSON with validation

**Step 4: Run tests — pass**

**Step 5: Commit**

```bash
git commit -m "feat: implement narrative service with LLM, template, and hardcoded fallback"
```

---

## Phase 4: UI Components

---

### Task 4.1: Create StreamingText component

**Files:**
- Create: `normandy-1944/src/components/StreamingText.tsx`
- Modify: `normandy-1944/src/styles/game.css`

**Step 1: Implement component**

```tsx
import { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  streaming: boolean;
  className?: string;
  onComplete?: () => void;
}

export function StreamingText({ text, streaming, className, onComplete }: StreamingTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!streaming) {
      setDisplayedLength(text.length);
      return;
    }

    setDisplayedLength(0);
    intervalRef.current = setInterval(() => {
      setDisplayedLength(prev => {
        if (prev >= text.length) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 20); // ~50 chars/second typewriter speed

    return () => clearInterval(intervalRef.current);
  }, [text, streaming]);

  const displayed = streaming ? text.slice(0, displayedLength) : text;
  const showCursor = streaming && displayedLength < text.length;

  return (
    <div className={className}>
      {displayed}
      {showCursor && <span className="streaming-cursor">▌</span>}
    </div>
  );
}
```

**Step 2: Add CSS for streaming cursor**

In `src/styles/game.css`:

```css
.streaming-cursor {
  animation: blink 0.8s step-end infinite;
  color: var(--accent-gold);
}

@keyframes blink {
  50% { opacity: 0; }
}
```

**Step 3: Commit**

```bash
git commit -m "feat: add StreamingText component with typewriter effect"
```

---

### Task 4.2: Create AccessCodeInput component

**Files:**
- Create: `normandy-1944/src/components/AccessCodeInput.tsx`
- Modify: `normandy-1944/src/styles/game.css`

**Step 1: Implement component**

```tsx
import { useState } from 'react';

interface AccessCodeInputProps {
  onCodeValidated: (code: string) => void;
  onSkip: () => void;
  apiUrl: string;
}

export function AccessCodeInput({ onCodeValidated, onSkip, apiUrl }: AccessCodeInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setValidating(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/api/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (data.valid) {
        sessionStorage.setItem('normandy_access_code', code.trim().toUpperCase());
        onCodeValidated(code.trim().toUpperCase());
      } else {
        setError('Invalid code. Check your code and try again.');
      }
    } catch {
      setError('Could not validate code. Playing in offline mode.');
      onSkip();
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="access-code-input" data-testid="access-code-input">
      <form onSubmit={handleSubmit}>
        <label htmlFor="access-code">Access Code</label>
        <input
          id="access-code"
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="NORMANDY-XXXX-XXXX"
          disabled={validating}
          autoComplete="off"
          data-testid="access-code-field"
        />
        <button type="submit" disabled={validating || !code.trim()} data-testid="access-code-submit">
          {validating ? 'Validating...' : 'Enter'}
        </button>
      </form>
      {error && <p className="access-code-error">{error}</p>}
      <button className="access-code-skip" onClick={onSkip} data-testid="access-code-skip">
        Play without code (demo mode)
      </button>
    </div>
  );
}
```

**Step 2: Add CSS styling** (military theme, consistent with existing UI)

**Step 3: Commit**

```bash
git commit -m "feat: add AccessCodeInput component for LLM access gating"
```

---

### Task 4.3: Create FreeTextInput component

**Files:**
- Create: `normandy-1944/src/components/FreeTextInput.tsx`

**Step 1: Implement component**

```tsx
import { useState } from 'react';

interface FreeTextInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function FreeTextInput({ onSubmit, disabled, placeholder }: FreeTextInputProps) {
  const [text, setText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) return;
    onSubmit(trimmed);
    setText('');
  }

  return (
    <form className="free-text-input" onSubmit={handleSubmit} data-testid="free-text-input">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder ?? "Or describe what you do..."}
        disabled={disabled}
        rows={2}
        maxLength={300}
        data-testid="free-text-field"
      />
      <button type="submit" disabled={disabled || text.trim().length < 5} data-testid="free-text-submit">
        Do it
      </button>
    </form>
  );
}
```

**Step 2: Add CSS styling**

**Step 3: Commit**

```bash
git commit -m "feat: add FreeTextInput component for player-written actions"
```

---

## Phase 5: GameScreen Integration

---

### Task 5.1: Wire narrative service into MainMenu + App

**Files:**
- Modify: `normandy-1944/src/App.tsx`
- Modify: `normandy-1944/src/components/MainMenu.tsx`

**Step 1: Add access code flow to App**

Add state for `accessCode` and `narrativeService`. On app load:
1. Check `sessionStorage` for existing code
2. If no code and API URL configured, show `AccessCodeInput` on MainMenu
3. Create `NarrativeService` instance with code + API URL
4. Pass service to `GameScreen`

**Step 2: Update MainMenu**

Add `AccessCodeInput` component. Show it before the "Begin Operation" button if no code is set and API URL is configured. Show "AI Enhanced" badge when code is valid. Show "Demo Mode" when no code.

**Step 3: Test manually** — dev server should start, MainMenu should render with code input

**Step 4: Commit**

```bash
git commit -m "feat: wire access code flow into App and MainMenu"
```

---

### Task 5.2: Wire narrative service into GameScreen

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`
- Modify: `normandy-1944/src/components/NarrativePanel.tsx`
- Modify: `normandy-1944/src/components/DecisionPanel.tsx`

**Step 1: Add narrative service to GameScreen**

Accept `narrativeService` as a prop. Add state:
- `narrativeLoading: boolean`
- `streamedNarrative: string`
- `streamedOutcome: string`
- `eventLog: EventLog` (instance)

**Step 2: Modify `handleDecision`**

After step 6 (processSceneTransition), instead of `setOutcomeText(outcome.text)`:

```typescript
if (narrativeService.getMode() === "llm" && outcome.context) {
  setNarrativeLoading(true);
  const generated = await narrativeService.generateOutcomeNarrative({
    outcomeText: outcome.text,
    outcomeContext: outcome.context,
    sceneContext: scene.sceneContext,
    gameState: newState,
    roster: newState.roster.filter(s => s.status === "active"),
    relationships: getActiveRelationships(activeIds),
    casualties: result.casualties,
    playerAction: undefined,
    onChunk: (chunk) => setStreamedOutcome(prev => prev + chunk),
  });
  setNarrativeLoading(false);
  setOutcomeText(generated);
} else {
  setOutcomeText(outcome.text);
}
```

**Step 3: Update NarrativePanel**

Replace static text divs with `StreamingText` component when in LLM mode.

**Step 4: Log events to EventLog**

After processing casualties, trait triggers, etc., append to `eventLog`.

**Step 5: Test** — play through with hardcoded mode, verify nothing breaks

**Step 6: Commit**

```bash
git commit -m "feat: integrate narrative service into GameScreen with streaming and fallback"
```

---

### Task 5.3: Add free-text action flow

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`
- Modify: `normandy-1944/src/components/DecisionPanel.tsx`

**Step 1: Add FreeTextInput to DecisionPanel**

Show `FreeTextInput` below decision buttons when `narrativeService.getMode() === "llm"`. Pass `onSubmit` callback.

**Step 2: Implement `handleFreeTextAction` in GameScreen**

```typescript
async function handleFreeTextAction(playerText: string) {
  setProcessing(true);

  // Step 1: Classify
  const classification = await narrativeService.classifyPlayerAction({
    sceneContext: scene.sceneContext ?? scene.narrative,
    decisions: availableDecisions,
    playerText,
    gameState,
  });

  if (!classification) {
    // Classification failed — show error, let player pick hardcoded option
    setProcessing(false);
    return;
  }

  // Step 2: Find matched decision and process through engine
  const matchedDecision = availableDecisions.find(d => d.id === classification.matchedDecision)
    ?? availableDecisions[0]; // fallback to first option
  
  // Run through normal engine pipeline with the matched decision
  const effectiveScore = calculateEffectiveScore(classification.tier, gameState, matchedDecision, captainPosition);
  const range = getOutcomeRange(effectiveScore);
  const roll = rollOutcome(range);
  const tier = getOutcomeTier(roll);
  const outcome = matchedDecision.outcome[tier];

  // Step 3: Process state transition (same as normal)
  const result = processSceneTransition(gameState, scene, outcome, captainPosition);
  
  // Step 4: Generate narrative with player's action
  const narrated = await narrativeService.generateOutcomeNarrative({
    outcomeText: outcome.text,
    outcomeContext: outcome.context ?? `Player action: ${playerText}. Result: ${tier}.`,
    sceneContext: scene.sceneContext ?? scene.narrative,
    gameState: result.state,
    roster: result.state.roster.filter(s => s.status === "active"),
    relationships: getActiveRelationships(activeIds),
    casualties: result.casualties,
    playerAction: playerText,
    onChunk: (chunk) => setStreamedOutcome(prev => prev + chunk),
  });

  // Log the player action event
  eventLog.append({
    sceneId: scene.id, type: "player_action",
    soldierIds: [], description: `Player: "${playerText}"`,
  });

  setOutcomeText(narrated);
  setGameState(result.state);
  setProcessing(false);
}
```

**Step 3: Test** — verify free-text input appears only in LLM mode, hardcoded decisions still work

**Step 4: Commit**

```bash
git commit -m "feat: add free-text player actions with classification and custom narration"
```

---

## Phase 6: Epilogues + Event Recording

---

### Task 6.1: Wire event logging into scene transitions

**Files:**
- Modify: `normandy-1944/src/components/GameScreen.tsx`

**Step 1: After processing each scene transition, log relevant events**

In `handleDecision` (and `handleFreeTextAction`), after `processSceneTransition`:

```typescript
// Log casualties
for (const c of result.casualties) {
  eventLog.append({
    sceneId: scene.id, type: "casualty",
    soldierIds: [c.id],
    description: `${c.name} ${c.status} during ${scene.id}`,
  });
  // Check relationships for the casualty
  const rels = getRelationshipsForSoldier(c.id);
  for (const rel of rels) {
    const partnerId = rel.soldierId === c.id ? rel.targetId : rel.soldierId;
    const partner = result.state.roster.find(s => s.id === partnerId && s.status === "active");
    if (partner) {
      eventLog.append({
        sceneId: scene.id, type: "relationship_moment",
        soldierIds: [partnerId, c.id],
        description: `${partner.name} reacts to ${c.name}'s ${c.status} (${rel.type}: ${rel.detail})`,
      });
    }
  }
}

// Log captain close calls
if (result.captainCloseCall) {
  eventLog.append({
    sceneId: scene.id, type: "close_call",
    soldierIds: [], description: "Captain narrowly avoided being hit",
  });
}

// Log 2IC promotions
if (result.newSecondInCommand) {
  eventLog.append({
    sceneId: scene.id, type: "promotion",
    soldierIds: [result.newSecondInCommand.soldier.id],
    description: `${result.newSecondInCommand.soldier.name} promoted to 2IC`,
  });
}
```

**Step 2: Pass eventLog to onGameOver and onVictory callbacks**

The App needs the event log to generate epilogues.

**Step 3: Commit**

```bash
git commit -m "feat: record playthrough events for casualties, relationships, promotions"
```

---

### Task 6.2: Upgrade EpilogueScreen with LLM-generated epilogues

**Files:**
- Modify: `normandy-1944/src/components/EpilogueScreen.tsx`

**Step 1: Accept narrativeService and eventLog as props**

**Step 2: Generate epilogues on mount**

When the component mounts:
1. If LLM mode: call `narrativeService.generateEpilogues()` for all roster soldiers in parallel
2. Display each epilogue as it arrives (streaming per soldier)
3. If hardcoded mode: use existing template-based epilogues as fallback

```typescript
useEffect(() => {
  if (narrativeService.getMode() === "llm") {
    generateAllEpilogues();
  }
}, []);

async function generateAllEpilogues() {
  const promises = roster.map(async (soldier) => {
    const events = eventLog.getForSoldier(soldier.id);
    const rels = getRelationshipsForSoldier(soldier.id);
    const epilogue = await narrativeService.generateEpilogue({
      soldier,
      events,
      relationships: rels,
      allSoldierStatuses: roster.map(s => ({ id: s.id, status: s.status })),
    });
    setEpilogues(prev => ({ ...prev, [soldier.id]: epilogue }));
  });
  await Promise.all(promises);
}
```

**Step 3: Render epilogues with StreamingText**

Each soldier's epilogue appears as it's generated. KIA epilogues tend to be shorter (arrive first), survivors are longer.

**Step 4: Commit**

```bash
git commit -m "feat: upgrade EpilogueScreen with LLM-generated per-soldier epilogues"
```

---

## Phase 7: Scene Migration (first scene only)

---

### Task 7.1: Add context seeds to scene01

**Files:**
- Modify: `normandy-1944/src/content/scenarios/act1/scene01_landing.ts`

**Step 1: Add `sceneContext` to the scene**

```typescript
sceneContext: "Night landing. Alone in flooded Norman field, waist-deep in cold water. Parachute tangled in hedgerow behind you. Distant gunfire east, planes fading. Equipment possibly lost in the drop. Must assess situation.",
```

**Step 2: Add `context` to each outcome (alongside existing `text`)**

For each decision's outcomes, add a short context seed. Example for `landing_check_gear`, success:

```typescript
success: {
  text: "You work your pockets methodically...", // existing, kept as fallback
  context: "Methodical gear check. Found: pistol, two grenades, cricket clicker, compass. Hands numb but disciplined. Training kicks in.",
  menLost: 0, ammoSpent: 0, moraleChange: 5, readinessChange: 0,
},
```

**Step 3: Run all tests — should pass** (text still present, context is optional)

**Step 4: Commit**

```bash
git commit -m "feat: add context seeds to scene01 for LLM narrative generation"
```

---

### Task 7.2: Test end-to-end with LLM

**Prerequisite:** Worker deployed or running locally, access code created in KV.

**Step 1: Start dev server**

```bash
cd normandy-1944 && npm run dev
```

**Step 2: Start Worker locally**

```bash
cd normandy-1944/worker && npx wrangler dev
```

**Step 3: Play scene01 with a valid access code**

- Enter code on main menu
- Play through scene01
- Verify: narrative is LLM-generated (different from hardcoded text)
- Verify: streaming typewriter effect works
- Verify: outcome text references game state

**Step 4: Test free-text action**

- Type a custom action in the free-text input
- Verify: classification maps to a reasonable decision
- Verify: narrative describes the player's custom action

**Step 5: Test fallback**

- Stop the Worker
- Play scene01 again
- Verify: hardcoded text appears (no error, no blank screen)

**Step 6: Commit any fixes**

```bash
git commit -m "test: verify end-to-end LLM narrative generation on scene01"
```

---

## Phase 8: Remaining Scene Migration

---

### Task 8.1-8.5: Add context seeds to scenes 02-06

One task per scene. Same pattern as Task 7.1:
1. Add `sceneContext` to the scene
2. Add `context` to each outcome
3. Keep existing `text` as fallback
4. Run tests
5. Commit per scene

---

## Phase 9: Polish + Deploy

---

### Task 9.1: Deploy Worker to Cloudflare

**Step 1: Create KV namespace**

```bash
cd normandy-1944/worker && npx wrangler kv namespace create ACCESS_CODES
```

Update `wrangler.jsonc` with the returned namespace ID.

**Step 2: Set Anthropic API key**

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

**Step 3: Deploy**

```bash
npx wrangler deploy
```

**Step 4: Create first access code**

```bash
npx wrangler kv key put --binding=ACCESS_CODES "NORMANDY-FIRST-CODE" '{"active":true,"currentUses":0,"label":"owner"}'
```

**Step 5: Update `.env.production` with Worker URL**

```
VITE_NARRATIVE_API_URL=https://normandy-narrative.<your-subdomain>.workers.dev
```

**Step 6: Build and deploy game**

```bash
cd normandy-1944 && npm run build
```

**Step 7: Commit**

```bash
git commit -m "deploy: Worker live, first access code created"
```

---

### Task 9.2: Update GAME_SPEC.md with narrative system documentation

**Files:**
- Modify: `normandy-1944/docs/GAME_SPEC.md`

Add a new section documenting:
- The narrative service architecture
- How context seeds work
- The free-text action system
- The access code system
- The epilogue event log

---

## Dependency Graph

```
Phase 0 (bugs)
    ↓
Phase 1 (types + data) ←→ Phase 2 (Worker) [parallel]
    ↓                         ↓
Phase 3 (narrative service + prompt builder)
    ↓
Phase 4 (UI components) [can overlap with Phase 3]
    ↓
Phase 5 (GameScreen integration)
    ↓
Phase 6 (epilogues + events)
    ↓
Phase 7 (scene01 migration + e2e test)
    ↓
Phase 8 (remaining scenes)
    ↓
Phase 9 (deploy + docs)
```

Phases 1 and 2 can run in parallel. Phase 4 can overlap with Phase 3. Everything else is sequential.

---

## Estimated Effort

| Phase | Tasks | Estimate |
|---|---|---|
| Phase 0: Bug fixes | 5 tasks | 45 min |
| Phase 1: Foundation | 3 tasks | 30 min |
| Phase 2: Worker | 3 tasks | 30 min |
| Phase 3: Services | 2 tasks | 60 min |
| Phase 4: UI components | 3 tasks | 30 min |
| Phase 5: Integration | 3 tasks | 60 min |
| Phase 6: Epilogues | 2 tasks | 30 min |
| Phase 7: Scene migration + e2e | 2 tasks | 30 min |
| Phase 8: Remaining scenes | 5 tasks | 45 min |
| Phase 9: Deploy + docs | 2 tasks | 30 min |
| **Total** | **30 tasks** | **~6 hours** |
