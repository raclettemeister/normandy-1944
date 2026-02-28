# Normandy 1944 — Full Game Design (v2)

**Date:** 2026-02-28  
**Status:** Approved  
**Supersedes:** Original GAME_SPEC.md design assumptions (tone, decision-first gameplay, Hemingway voice)  
**Scope:** Complete game redesign for autonomous agent implementation

---

## 1. Game Identity

A text-based tactical roguelike where you command a WWII airborne platoon through 24 hours of D-Day. The game is played primarily through **free-text prompting** — you type orders as if you're actually talking to your soldiers. The roguelike loop is player knowledge: learning who your 18 soldiers are, what they're good at, how they work together, and what tactics work.

### What this game is NOT

- Not a choose-your-own-adventure with buttons (buttons exist as Easy mode scaffolding)
- Not a literary fiction experience (story is a vehicle for gameplay)
- Not a historical simulation (authentic feel, not simulation accuracy)
- Not a puzzle with one right answer (multiple good approaches, the fun is figuring them out)

### The story

Classic 101st Airborne. Band of Brothers territory. The night drop, the scattered sticks, the rally, the assault, the hold. No twists. No plot surprises. The surprises come from gameplay consequences. Every player should feel like they're playing through a well-told war story they already half-know.

The story is a FRAME for the gameplay, not the game itself.

---

## 2. Tone Guide

This replaces the original spec's "terse, military, Hemingway" directive.

> Write like you're telling a friend what happened. Keep it vivid and direct.
>
> **DO:** Short sentences. Concrete details. You can feel the cold, hear the gunfire, sense the fear. Use "your guys" not "your men." Use "about two football fields" not "approximately 200 meters." Military terms are used naturally — if a term appears, context explains it.
>
> **DON'T:** No flowery language. No metaphors. No inner monologue. No melodrama. No "the weight of command settled on his shoulders." No Hemingway impression. No trying to be literary.
>
> **Voice:** Second person, present tense. "You're crouched behind the wall. Henderson taps your shoulder."
>
> **Death:** Clinical, respectful. "The burst catches Rivera in the chest. He goes down." Not graphic, not glorified.
>
> **Humor:** Soldiers' humor — dark, understated, human. Caruso cracks wise. Davis makes radio jokes. Palmer complains.

### The "Never Confuse" Rule

Every piece of text the player reads must answer: Where am I? What's happening? What can I do? If any of those are unclear, the text has failed. The player should feel the game is HARD because the tactical situation is hard — never because the story is unclear.

### LLM Tone Constraint

The tone guide doubles as a guardrail for LLM output. When the system prompt says "write like Hemingway," the LLM tries to be literary and gets weird. When it says "write like you're telling a friend what happened, keep it simple and vivid," the LLM stays grounded.

---

## 3. Core Gameplay Loop

### The loop in one sentence

You type orders → the DM evaluates your tactics AND your personnel assignments → things happen → you learn from the consequences → next run you're smarter.

### Difficulty Modes

| Mode | Input | What's evaluated | Who it's for |
|---|---|---|---|
| **Easy** | Click predefined decisions | Tactical tier only (set by content) | First-timers, casual |
| **Medium** | Click decisions OR type orders. Reveal tokens show hidden decisions. | Tactical tier + basic personnel | Learning the system |
| **Hardcore** | Type only. No predefined decisions visible. | Full evaluation: tactics + role + trait + relationships | The real game |

Easy mode is NOT dumbed down — same situations, same consequences. The decisions just pre-solve the "what to type" problem.

**Hardcore mode is the design target. Every other system exists to support it. All AI review and testing must focus on making Hardcore work.**

### The Prompting Experience (Hardcore)

Each scene presents:

1. **Situation briefing** — Where you are, what you see/hear, what's happening. Clear, vivid, never ambiguous.
2. **Roster status** — Who's with you, their state, their roles. Always visible.
3. **2IC speaks** — Henderson (or replacement) gives his read on the situation.
4. **You type orders** — Free text. "Henderson, take first squad left through the ditch. Kowalski, BAR on that wall covering them. Webb, with me — we go right through the orchard."
5. **DM evaluates** — Returns tactical tier + personnel assignment quality + consequences.
6. **Briefing phase** — Team reacts. Henderson raises concerns. Soldiers show personality (brave = eager, green = nervous, coward = hesitates). You can **revise** or **execute**.
7. **Execution** — Narrative plays out. Resources change. Casualties weighted toward poorly-assigned soldiers.
8. **Consequences land** — Sent the MG gunner to scout? He's dead. No more suppressive fire. For the rest of the game.

### The Knowledge Roguelike

What the player learns across runs:

- **Run 1:** "Who are these people? Why did Ellis freeze?"
- **Run 2:** "Oh, Ellis is green. He always freezes his first fight. Protect him early."
- **Run 3:** "If I send Webb to scout, he finds extra ammo — he's a scrounger."
- **Run 4:** "Kowalski and Novak work better together. Splitting them hurts."
- **Run 5:** "Securing the crossroads by 0700 gives three extra hours to prepare."

None of this is ever told to the player. They discover it through play. That IS the game.

---

## 4. DM Layer & Personnel Evaluation

The heart of the game. The DM receives the player's free-text order and evaluates it on two axes.

### Axis 1: Tactical Quality (existing, enhanced)

The 6-tier system:

| Tier | Base Score | Example |
|---|---|---|
| suicidal | 5 | Charge MG nest across open ground |
| reckless | 25 | Fire without a plan, rush without recon |
| mediocre | 45 | Acceptable but missing key elements |
| sound | 70 | Solid tactics, proper procedures |
| excellent | 90 | Textbook execution, creative adaptation |
| masterful | 105 | Correct tactics + perfect personnel + contingencies + intel used |

"Masterful" is new — reserved for orders that demonstrate tactical mastery AND perfect personnel management.

### Axis 2: Personnel Assignment Quality (NEW)

The DM evaluates WHO the player assigned to WHAT:

- **Specificity:** Did the player name soldiers? "Send someone to scout" (vague, random assignment) vs. "Send Webb to scout the treeline" (specific, evaluated for fitness).
- **Role fitness:** Is the soldier's role appropriate? Kowalski (BAR) on suppression = correct. Kowalski on scouting = wrong.
- **Trait fitness:** Do the soldier's traits match the task? Webb (quiet + sharpshooter) scouting = excellent. Caruso (loud_mouth) scouting = poor.
- **Relationship awareness:** Are buddy pairs together? Kowalski + Novak = bonus. Splitting them = penalty.
- **Risk management:** Is the player protecting key personnel? Rivera (only medic) on point = dangerous. Rivera behind the line treating wounded = correct.

### DM Return Structure

```typescript
interface DMEvaluation {
  tacticalTier: TacticalTier;
  tacticalReasoning: string;
  personnelScore: number;            // 0-100
  assignments: PersonnelAssignment[];
  assignmentIssues: string[];        // "You sent your only medic on point"
  assignmentBonuses: string[];       // "Good call putting Webb on scout"
  matchedDecisionId: string;
  matchConfidence: number;
  soldierReactions: SoldierReaction[];
  secondInCommandReaction: string;
  vulnerablePersonnel: string[];
  capabilityRisks: string[];
}

interface PersonnelAssignment {
  soldierId: string;
  assignedTask: string;
  fitScore: number;                  // 0-100
  reasoning: string;
}
```

### Personnel Score Effects

| Score | Effect |
|---|---|
| 0-20 (terrible) | +2 casualties, wrong soldiers at risk, capability loss likely |
| 21-40 (poor) | +1 casualty, random assignment of unnamed soldiers |
| 41-60 (adequate) | No modifier |
| 61-80 (good) | -1 casualty minimum, named soldiers perform well |
| 81-100 (excellent) | -1 casualty, morale bonus, relationship moments trigger |

### Vagueness Penalty

Vague orders ("attack the position") → DM assigns soldiers randomly → mismatches likely → consequences.

Specific orders ("Henderson takes Alpha left, Kowalski suppresses from the wall, Park leads Bravo right through the ditch, Doc stays back with wounded") → every assignment evaluated → good assignments rewarded.

### Fallback Chain

The DM must never break the Hardcore experience:

1. LLM returns valid JSON → use it
2. LLM returns malformed JSON → extract tier from reasoning text, use baseline personnel score
3. LLM fails entirely → match against closest predefined decision, personnel score = 50
4. NEVER fall through to Easy mode decision selection

---

## 5. Event Log & Context Preservation

Solves the #1 AI failure mode: losing context across scenes.

### The Event Log as Narrative Thread

Every LLM call receives the full event log. It must be:

- **Factually accurate** — mirrors game state exactly
- **Narratively readable** — LLM can build on it naturally
- **Compact** — under ~500 tokens even late-game
- **Personnel-aware** — tracks who did what, who's hurt, what capabilities remain

### Event Types

```typescript
type GameEvent =
  | { type: "scene_complete"; sceneId: string; summary: string; timeCost: number }
  | { type: "decision_made"; prompt: string; tier: TacticalTier; personnelScore: number }
  | { type: "casualty"; soldierId: string; name: string; cause: string; status: "KIA" | "wounded" }
  | { type: "rally"; soldiers: string[]; description: string }
  | { type: "capability_change"; capability: string; gained: boolean; reason: string }
  | { type: "intel_gained"; flag: string; source: string }
  | { type: "trait_triggered"; soldierId: string; trait: string; effect: string }
  | { type: "relationship_moment"; soldiers: string[]; type: string; description: string }
  | { type: "assignment_consequence"; soldierId: string; task: string; outcome: string }
  | { type: "milestone_status"; milestoneId: string; status: "achieved" | "missed" }
  | { type: "resource_snapshot"; men: number; ammo: number; morale: number; readiness: number; time: string }
```

### Context Builder Output

Before every LLM call, compiled into structured text:

```
SITUATION LOG:
- 0115: Landed in flooded field. Found compass and pistol.
- 0130: Navigated by Polaris. Reached solid ground.
- 0145: First contact — cricket clicker. Picked up a straggler from 502nd.
- 0200: Found Henderson, Malone, Doyle behind stone wall. Henderson is now 2IC.
- 0220: German patrol at bridge — L-ambush, captured map documents. Readiness +10.
- 0240: Farmhouse — stacked and cleared. Found Rivera (medic) + Kowalski (BAR).

CURRENT PLATOON STATE:
- 7 active: Henderson (2IC/PSG), Malone (NCO), Doyle (rifleman-green), Rivera (medic), Kowalski (BAR), [straggler] (rifleman)
- Capabilities: canSuppress ✓, canTreatWounded ✓, canScout ✓, hasNCO ✓
- Ammo: 35%, Morale: 62, Readiness: 28 (ALERTED), Time: 0240

PERSONNEL NOTES:
- Doyle is green — hasn't seen combat yet. Will freeze on first contact.
- Henderson gives reliable advice (veteran 2IC).
- Kowalski and Novak not yet reunited.
- Rivera is the only medic — losing him ends medical capability.
```

### Resource Tracking Realism

- **Ammo:** Suppressive fire (BAR/MG) burns more than aimed fire. Tracked per engagement.
- **Time:** Every action has real cost (moving through bocage: 20 min, setting ambush: 10 min, clearing building: 15 min).
- **Personnel damage:** Not just "2 casualties" — specific details: "Malone took shrapnel in arm (wounded), Doyle froze during firefight (green trait triggered)."
- **Capability tracking:** "Lost Rivera → canTreatWounded now FALSE. Wounded deteriorate."

### Platoon Capability Audit

Before each scene:

```typescript
interface PlatoonAudit {
  currentCapabilities: PlatoonCapabilities;
  criticalRisks: string[];
  personnelGaps: string[];
  relationshipStatus: string[];
  effectiveStrength: number;
}
```

Feeds into DM evaluation and scene narrative. Missing medic → "Nobody's checked on Webb's wound since the bridge."

---

## 6. Three-Act Structure

### Act 1 — The Drop (0100-0600, 10 scenes)

**Arc:** Alone → first contact → build a squad → move to rally point.
**Player learning:** Character discovery.

| # | Scene | Situation | Player learns |
|---|---|---|---|
| 1 | The Landing | Flooded field, tangled chute, alone | Basic mechanics: check gear, orient |
| 2 | Finding North | Bocage in the dark, need a direction | Navigation, equipment use |
| 3 | First Contact | Silhouette — friend or enemy? | Recognition procedures (clicker, Flash/Thunder) |
| 4 | The Straggler | Scared private from another unit | Leadership: calming someone, first follower |
| 5 | The Sergeant | Henderson, Malone, Doyle behind a wall | Squad forming. NCO, hothead, green kid |
| 6 | The Patrol | German patrol at a bridge with intel | First tactical decision with a team |
| 7 | The Farmhouse | Stone building, 506th gear on porch | Building clearing. Rivera (medic) + Kowalski (BAR) |
| 8 | The Crossroad | Wire across road, fresh tire tracks | Route choice: safe/slow vs fast/exposed |
| 9 | The Minefield | Flooded pasture — mines? | Risk assessment. Losses hurt because you know them now |
| 10 | The Rally Point | American voices, challenge/response | Arrival. Milestone. Pick up remaining soldiers |

**Design rules:**
- Scenes 1-3: Solo. No personnel management. Learn the world.
- Scenes 4-5: First followers. Learn names, roles, basic traits.
- Scenes 6-8: Squad gameplay. First personnel assignments in prompts.
- Scenes 9-10: Full squad movement. Consequences stack.
- Every scene introduces at least one new game concept.
- Characters are FOUND naturally, not listed in a menu.

### Act 2 — The Assault (0600-0900, 10 scenes)

**Arc:** Approach → recon → assault → clear → secure crossroads.
**Player learning:** Tactical mastery. Fire and maneuver. Right people, right job.

| # | Scene | Situation | Player learns |
|---|---|---|---|
| 1 | Dawn | H-Hour. Beach landings in distance. Brief your team. | Assigning squads, sectors, roles |
| 2 | The Approach | Moving toward crossroads through bocage | Patrol formation, point man, movement discipline |
| 3 | The Observation Post | Hill overlooking objective | Recon. Intel flags determine everything. |
| 4 | The MG Nest | MG-42 covering the approach | Suppression + flanking. THE core lesson. |
| 5 | The Assault | Coordinated attack on crossroads | Full platoon tactics: base of fire, assault element |
| 6 | The Building | Clearing main building at crossroads | Room clearing. Close quarters. |
| 7 | The Cellar | Basement — POWs? Civilians? Cache? | Decision under pressure |
| 8 | The Counterfire | Enemy mortar fire on your position | React under fire. Move wounded. Discipline. |
| 9 | Securing the Position | You have the crossroads — hold it | Immediate defensive setup. Fields of fire. |
| 10 | First Light | Position secured, dawn fully up | Assessment. Who lived? What do you have? |

**Design rules:**
- Full platoon gameplay throughout. Personnel management is central.
- Every scene rewards specific soldier assignments.
- Scenes 4-6: poor personnel management KILLS people visibly.
- Scenes 9-10: transition to defensive thinking, foreshadowing Act 3.

### Act 3 — The Hold (0900-0100+, 10 scenes)

**Arc:** Prepare → wait → counterattack → hold → relief.
**Player learning:** Time management under uncertainty. Defensive warfare.

| # | Scene | Situation | Player learns |
|---|---|---|---|
| 1 | Taking Stock | You hold the crossroads. What do you have? | Resource assessment |
| 2-7 | Preparation | FLEXIBLE ORDER — player chooses priority | Time vs preparation trade-off |
| 8 | The Counterattack Begins | German probing attack | Everything prepared matters NOW |
| 9 | The Main Assault | Full German counterattack | Hold or break |
| 10 | Relief | 4th Infantry arrives (or doesn't) | Resolution. Epilogue. |

**Preparation scenes (2-7) — new engine mechanic:**

Available as a MENU, not a sequence. Player picks which to do. Each costs time. Counterattack interrupts.

| Prep | Effect | Time |
|---|---|---|
| Defensive Positions | Dig foxholes, set fields of fire, place BAR/MG | 90 min |
| Listening Posts | Scouts watch approaches | 60 min |
| Redistribute Ammo | Pool and rebalance | 30 min |
| Medical Station | Aid station, evacuation plan | 45 min |
| Find Stragglers | Patrol for more paratroopers | 60 min |
| Rest and Brief | Sleep shifts, brief NCOs on sectors | 45 min |

**Counterattack trigger:**
```typescript
function shouldCounterattackTrigger(state: GameState): boolean {
  const baseHour = 16;
  const readinessModifier = Math.floor(state.readiness / 25);
  const triggerHour = baseHour - readinessModifier;
  return state.time.hour >= triggerHour;
}
```

**Design rules:**
- Prep scenes are prompting-heavy: "Kowalski, BAR covering east approach from behind that wall. Novak, you're ammo carrier — stay close."
- Missing a prep action has VISIBLE consequences during counterattack.
- The counterattack tests everything.

---

## 7. Engine Upgrades Required

### 7A. Enhanced DM Layer

Upgrade from current tier-only evaluation to full `DMEvaluation` response (Section 4). New `buildDMEvaluationPrompt()` includes roster, relationships, capabilities, event log. Robust fallback chain (valid JSON → regex extraction → decision matching → mediocre baseline). Never falls through to Easy mode.

### 7B. Preparation Phase Engine

New `PreparationPhase` mode. Menu of available preps, tracks completed preps, checks counterattack trigger after each completion. Prep effects modify counterattack scene outcome calculations.

```typescript
interface PreparationPhase {
  availablePreps: PrepScene[];
  completedPreps: string[];
  counterattackTriggered: boolean;
  totalTimePreparing: number;
}

interface PrepEffects {
  casualtyReduction?: number;
  earlyWarning?: boolean;
  ammoRedistributed?: boolean;
  medicalReady?: boolean;
  moraleBonus?: number;
  additionalMen?: number;
}
```

### 7C. Event Log Narrative System

Upgrade from append-only array to full context system. `buildContextSummary()` compiles log into LLM-readable text. `runPlatoonAudit()` checks capabilities, risks, relationships. Compression: older events get 1 line, recent events get 3-4. Stays under 500 tokens.

---

## 8. Content Pipeline

### Step 1: Research (parallel agents)

| Document | Content |
|---|---|
| `docs/research/historical.md` | Real 101st D-Day operations, timelines, terrain, specific battles |
| `docs/research/tactics.md` | Small-unit tactics, fire and maneuver, building clearing, defensive prep |
| `docs/research/personnel.md` | Role functions, trait-task mapping, relationship dynamics |

### Step 2: Scene Briefs (sequential, reviewed by human)

30 briefs, one per scene. Each specifies:
- Tactical situation
- What's tactically correct/wrong (with tiers)
- Personnel assignment opportunities (who's ideal, who's wrong)
- Key state changes per outcome tier
- Tone notes

**Human reviews and annotates all 30 briefs before content writing begins.**

### Step 3: Content Writing (sequential per act)

Scene files written from approved briefs. Each includes: narrative text, decision options (Easy mode), outcome templates, personnel assignment hooks, 2IC comments, prep actions, rally events, interludes.

### Step 4: DM Prompt Testing

Per scene: 5 sample Hardcore prompts (vague to masterful). Verify DM evaluation consistency, personnel assessment correctness, sensible consequences.

---

## 9. Verification Framework

Two gates per act. Both must pass before next act begins.

### Gate 1: Structural Verification (automated Vitest)

| Check | Verifies |
|---|---|
| Schema compliance | Every scene matches Scenario interface |
| Scene graph connectivity | All scenes reachable, no dead ends, no orphans |
| Decision completeness | Every decision has success/partial/failure with state changes |
| Balance envelope | Resource changes within bounds per tier |
| Capability references | All requiresCapability/benefitsFromIntel are valid fields |
| Personnel hooks | Every scene has 2+ decisions benefiting from specific assignments |
| Rally consistency | Rally soldiers exist in roster, IDs unique, gains within bounds |
| Timeline math | Cumulative timeCost within act budget |
| Milestone alignment | Milestone-achieving scenes exist and are reachable |
| Interlude presence | Every scene has transition text |
| 2IC coverage | Every scene has Henderson comment + green 2IC fallback |
| Tone compliance | No banned patterns (metaphors, melodrama, past tense, flowery language) |

### Gate 2: Playthrough Verification (agent-driven)

| Run type | Strategy | Checks |
|---|---|---|
| Optimal | Best decisions, correct personnel | Can you win? Balance achievable? |
| Worst-case | Worst decisions, bad personnel | Ends appropriately? No softlocks? |
| Speed run | Minimize time | Timeline works if rushing? |
| Resource-starved | Minimal starting resources | Still playable from bad state? |
| Hardcore prompt | 5+ free-text orders per scene | DM evaluates consistently? |
| Personnel test | Deliberately misassign soldiers | Consequences appropriate? |
| Context continuity | Check every LLM response | AI remembers what happened? |

Failure criteria: any state contradiction, DM inconsistency, or tone violation blocks the act.

---

## 10. Agent Execution Model

### Phase 1 — Clean + Architecture (parallel)

| Agent | Task | Deliverable |
|---|---|---|
| Cleanup | Fix TS error, merge branches, lint clean | Green baseline: build + tests + lint pass |
| Engine | Preparation phase, enhanced DM, enhanced event log, platoon audit | Engine upgrades with tests |
| Prompt | Rewrite prompt builder: new tone, roster injection, context builder | Updated promptBuilder.ts with tests |
| Verification | Structural validators, playthrough simulator, DM test harness | Test framework ready |

### Phase 2 — Research (parallel)

| Agent | Task | Deliverable |
|---|---|---|
| Historical | Real 101st operations | `docs/research/historical.md` |
| Tactical | Small-unit tactics | `docs/research/tactics.md` |
| Personnel | Roles, traits, relationships | `docs/research/personnel.md` |

### Phase 3 — Scene Briefs (sequential, human-reviewed)

| Agent | Task | Deliverable |
|---|---|---|
| Brief | 30 scene briefs from research | `docs/briefs/act{N}_scene{M}.md` |

**HUMAN REVIEW GATE.** Annotate briefs. Revise. Repeat until approved.

### Phase 4 — Content + Verification (sequential per act)

For each act (1, 2, 3):

1. Content agent writes 10 scene files from approved briefs
2. Gate 1: structural tests (all must pass)
3. Gate 2: playthrough verification (7+ run types, all must pass)
4. Fix all issues, re-run gates

### Phase 5 — Integration

| Agent | Task |
|---|---|
| Integration | Cross-act full campaign testing (5+ runs) |
| Browser | Playwright tests: all scenes, all modes, UI state |
| Balance | Difficulty curve check, resource balance across paths |

### File Ownership

| Agent | Writes to | Never touches |
|---|---|---|
| Engine | `src/engine/`, `src/types/` | `src/content/`, `src/components/` |
| Prompt | `src/services/` | `src/engine/`, `src/content/` |
| Content (per act) | `src/content/scenarios/act{N}/` | Other acts, engine, services |
| Verification | `tests/` | `src/` |
| Browser | `tests/browser/` | `src/` |
| Research | `docs/research/` | Everything else |
| Brief | `docs/briefs/` | Everything else |

---

## 11. Key Design Principles (Summary)

1. **Prompting is the game.** Multiple-choice is scaffolding. Hardcore mode is the design target.
2. **Personnel management through language.** The player learns WHO to assign to WHAT through consequences.
3. **Never confuse.** The story is simple, classic, clear. Difficulty comes from tactics, not narration.
4. **Young-people-friendly tone.** Vivid and direct. Not literary. Not Hemingway.
5. **The LLM must remember.** Event log as narrative thread in every prompt. No context loss.
6. **Full depth evaluation.** Role + trait + relationship assessment on every prompted order.
7. **Sequential verification.** Each act passes two gates before the next begins.
8. **Classic story, deep gameplay.** 101st Airborne, Band of Brothers energy. The story everyone half-knows, told well and played deeply.

---

## 12. Language

English first for all content. French translation as a separate final phase after the full game is verified.

---

## Appendix: What This Document Replaces

This design doc supersedes the following assumptions from the original `GAME_SPEC.md`:

| Original assumption | New design |
|---|---|
| Hemingway tone | Young-people-friendly, vivid and direct |
| Decision-first gameplay | Prompting-first gameplay |
| 5-tier tactical system | 6-tier (added "masterful") |
| Tactical quality only | Tactical + personnel assignment evaluation |
| Linear scene chains | Linear (Acts 1-2) + preparation menu (Act 3) |
| DM returns tier only | DM returns full evaluation with personnel assignments |
| Event log for epilogues | Event log as narrative thread for all LLM calls |
| 7 existing Act 1 scenes | Full rewrite of all 30 scenes |
| French + English simultaneous | English first, French as final layer |

The original GAME_SPEC.md remains valid for: game state model, 5 resource system, outcome engine math, soldier roster, battle orders, achievement system, epilogue system, wiki system, meta-progression, and the Cloudflare Worker architecture.
