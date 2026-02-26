# AI-Driven Narrative Pivot — Research Document

**Date**: 2026-02-25  
**Status**: For review — correct anything wrong before we plan  
**Prerequisite**: Read this fully and annotate inline before we move to the plan

---

## 1. What Exists Today

### Codebase structure

```
normandy-1944/
├── src/
│   ├── types/index.ts           — All TypeScript interfaces
│   ├── engine/
│   │   ├── gameState.ts         — State creation, phase calc, capabilities, rally
│   │   ├── outcomeEngine.ts     — Score calc, dice, casualties, scene transitions
│   │   ├── roster.ts            — 18 soldiers + 8 rally events
│   │   ├── battleOrders.ts      — Milestone tracking
│   │   ├── scenarioLoader.ts    — Scene registry, decision filtering, 2IC comments
│   │   ├── achievementTracker.ts — Achievement persistence
│   │   └── lessonTracker.ts     — Lesson persistence
│   ├── components/
│   │   ├── GameScreen.tsx       — Game loop orchestrator
│   │   ├── NarrativePanel.tsx   — Displays scene + outcome + rally text
│   │   ├── DecisionPanel.tsx    — Decision buttons + 2IC comments + captain position
│   │   ├── StatusPanel.tsx      — 5 core numbers display
│   │   ├── DeathReport.tsx      — Death screen with narrative
│   │   ├── EpilogueScreen.tsx   — Post-game soldier epilogues
│   │   ├── MainMenu.tsx         — Start screen
│   │   ├── OrdersPanel.tsx      — Battle orders overlay
│   │   ├── RosterPanel.tsx      — Soldier roster overlay
│   │   ├── WikiPanel.tsx        — Wiki overlay (placeholder, no content)
│   │   ├── LessonJournal.tsx    — Lessons overlay
│   │   └── AchievementPopup.tsx — Achievement notification
│   ├── content/scenarios/act1/
│   │   ├── index.ts             — Registers all act1 scenes
│   │   ├── scene01_landing.ts
│   │   ├── scene02_finding_north.ts
│   │   ├── scene03_first_contact.ts
│   │   ├── scene04_the_sergeant.ts
│   │   ├── scene05_the_patrol.ts
│   │   └── scene06_the_farmhouse.ts
│   └── styles/game.css          — Full styling
├── tests/
│   ├── engine/gameState.test.ts      — 509 lines, thorough
│   ├── engine/outcomeEngine.test.ts  — 681 lines, thorough
│   └── content/validation.test.ts    — 632 lines, thorough
└── package.json                 — React 19, Vite 7, Vitest 4, TypeScript 5.9
```

### How narrative flows today

```
Scene file (static strings)
    ↓
scenarioLoader.getScene(id) → Scenario object
    ↓
GameScreen.tsx reads:
  • scene.narrative        → NarrativePanel (main text)
  • outcome.text           → NarrativePanel (after decision)
  • scene.rally?.narrative → NarrativePanel (rally text)
  • 2IC comments           → DecisionPanel (above decisions)
    ↓
NarrativePanel renders three <div>s with static strings
  • No streaming
  • No animation
  • No typewriter effect
  • Uses white-space: pre-wrap
```

Every piece of player-facing prose is a hardcoded string in a scene file or the engine. There is zero dynamic text generation.

### Narrative text volume (Act 1)

| Scene | Narrative | Outcomes | Rally/2IC | Total |
|---|---|---|---|---|
| 01 Landing | ~200 words | ~400 words | — | ~600 |
| 02 Finding North | ~150 words | ~500 words | — | ~650 |
| 03 First Contact | ~50 words | ~900 words | — | ~950 |
| 04 The Sergeant | ~100 words | ~800 words | ~100 rally | ~1000 |
| 05 The Patrol | ~200 words | ~1200 words | ~200 2IC | ~1600 |
| 06 The Farmhouse | ~100 words | ~700 words | ~200 rally+2IC | ~1000 |
| **Total** | | | | **~5,800 words** |

6 scenes, 40 decisions, ~5,800 words of hardcoded prose. Extrapolating to 30 scenes: ~29,000 words to write by hand, or ~1,500 context seeds (~50 words each) for the LLM approach.

### NarrativePanel.tsx — current implementation

```tsx
<div className="narrative-panel">
  <div className="narrative-text">{narrative}</div>
  {outcomeText && <div className="outcome-text">{outcomeText}</div>}
  {rallyText && <div className="rally-text">{rallyText}</div>}
</div>
```

Three string props. No async. No loading states. Simple enough to swap for streaming.

### GameScreen.tsx — decision flow

```
handleDecision(decision):
  1. calculateEffectiveScore(tier, state, decision) → score
  2. getOutcomeRange(score) → { floor, ceiling }
  3. rollOutcome(range) → roll
  4. getOutcomeTier(roll) → "success" | "partial" | "failure"
  5. decision.outcome[tier] → OutcomeNarrative { text, menLost, ... }
  6. processSceneTransition(state, scene, outcome, captainPosition) → newState
  7. setOutcomeText(outcome.text)     ← THIS IS WHERE LLM PLUGS IN
  8. setGameState(newState)
  9. Advance to nextScene
```

Step 7 is the key integration point. Instead of `outcome.text`, call the narrative service with outcome context + state + roster.

### 2IC comment system

Two layers:
1. **Scene-specific comments** (keyed by decision ID): `scene.secondInCommandComments["patrol_knife"]` → "That's... optimistic, Captain..."
2. **Trigger-based fallbacks**: `getSecondInCommandComment()` checks state thresholds (low_ammo, low_morale, time_pressure, etc.) and returns veteran or green commentary.

Both are hardcoded strings. The trigger system is well-designed and should be preserved — it determines WHEN the 2IC speaks. The LLM should only change HOW the 2IC says it.

### Deployment

- Static site: Vite build → GitHub Pages (base: `/normandy-1944/`)
- No server, no backend, no Cloudflare Workers
- No `.env` file, no environment variables
- No secrets management
- localStorage for lessons + achievements

---

## 2. Current Bugs (Must Fix Before Narrative Layer)

### Bug 1: `menLost: -1` pattern (scene03)

**Location**: `scene03_first_contact.ts` — 8 occurrences  
**Problem**: Uses `menLost: -1` to represent gaining a stray paratrooper. The engine's `assignCasualties()` function receives `-1` and loops `for (let i = 0; i < menLost; ...)` which means it does nothing (loop doesn't execute). But `processSceneTransition()` then does `newState.men = Math.max(0, state.men - outcome.menLost)` which becomes `state.men - (-1)` = `state.men + 1`. So the men count accidentally works, but no soldier is actually added to the roster. The player gains a phantom man.  
**Fix**: Use rally events for gaining soldiers, or add a `menGained` field.

### Bug 2: Rally always fires (scene04)

**Location**: `outcomeEngine.ts` line ~263, `scene04_the_sergeant.ts`  
**Problem**: `processSceneTransition()` checks `if (scene.rally)` and always processes it. But `sergeant_avoid` should skip the rally (the player chose to slip away). `sergeant_signal_shot` should trigger a partial rally (Henderson only). The engine has no mechanism for per-decision rally control.  
**Fix**: Add `skipRally?: boolean` to `Decision` or `OutcomeNarrative`. Or add `rally` to each outcome instead of the scene level.

### Bug 3: Scene 6 → nonexistent scene 7

**Location**: `scene06_the_farmhouse.ts` — all 7 decisions  
**Problem**: Every `nextScene` points to `"act1_scene07"` which doesn't exist. The game breaks after the farmhouse.  
**Fix**: Create scene 07 (per spec: Act 1 has 10 scenes) or point to a valid scene.

### Bug 4: Captain position score modifier missing

**Location**: `outcomeEngine.ts`  
**Problem**: The spec says front position gives +5 to effective score and rear gives -5. The morale modifier IS applied in `processSceneTransition()` (front +5 morale, rear -5 morale). But the score modifier is NOT applied in `calculateEffectiveScore()`. The captain's position doesn't affect outcome probability — only post-outcome morale.  
**Fix**: Add captain position modifier to `calculateEffectiveScore()`.

### Bug 5 (undocumented): Per-decision time costs not supported

**Location**: `scene04_the_sergeant.ts` comments  
**Problem**: Some decisions should take different amounts of time (sergeant_pebble: 30 min, sergeant_observe: 30 min, sergeant_listen: 20 min). The engine only supports `scene.timeCost` (one value per scene). All decisions in a scene take the same time.  
**Fix**: Add optional `timeCost` to `Decision` or `OutcomeNarrative`, with scene-level as default.

---

## 3. Recommendations on Open Questions

### Q1: LLM Provider

**Context**: The game is a static site on GitHub Pages. LLM calls need a backend to protect API keys. No Cloudflare Workers exist yet.

**Options evaluated**:

| Option | Quality | Cost | Latency | Setup |
|---|---|---|---|---|
| Cloudflare Workers AI (free tier) | Low-medium (Llama models) | Free | ~1-2s | Medium (new Worker) |
| GPT-4o-mini via Cloudflare Worker proxy | High | ~$0.005/playthrough | ~1-3s | Medium (new Worker + OpenAI key) |
| Claude Sonnet via Cloudflare Worker proxy | Excellent | ~$0.15/playthrough | ~2-4s | Medium (new Worker + Anthropic key) |
| Client-side with user-provided key | Varies | User pays | ~1-3s | Low (no backend) |

**Decision**: **Cloudflare Worker as a thin proxy, using Claude Sonnet**. Reasons:
1. Claude Sonnet produces the best prose — terse military tone with emotional depth is exactly its strength
2. Sonnet handles long system prompts well (roster + relationships + tone guide + state = ~800 tokens of context)
3. ~$0.15/playthrough (90 calls × ~500 tokens) is acceptable for the narrative quality gained
4. The Worker holds the API key — no exposure to the client
5. The Worker is ~50 lines of code — minimal surface area
6. Make the provider interface-based so switching models is a config change, not a rewrite
7. The Worker can add rate limiting, caching, and monitoring later

The client calls `POST /api/narrative` with the game state and context. The Worker forwards to Anthropic and streams the response back. That's the entire backend.

### Q2: Pre-generate vs. live generation

**Recommendation**: **Live generation, always**. Reasons:
1. The whole point is state-aware narrative — pre-generation can't account for which soldiers are alive, wounded, or dead
2. 1-3s latency is acceptable for a text game — feels like the narrative is unfolding
3. With streaming (word-by-word), the player starts reading immediately; there's no "blank screen waiting" moment
4. Keep existing hardcoded text as the fallback when the LLM is unavailable

### Q3: Caching

**Recommendation**: **No caching for v1**. Reasons:
1. At $0.005/playthrough, cost is not a concern
2. The same scene with the same state should produce varied narrative — that's the feature
3. Caching adds complexity (what's the cache key? how stale is too stale?)
4. If cost becomes an issue later, add a simple cache keyed on `sceneId + outcomeTier + rosterHash`

### Q4: Player-visible AI

**Recommendation**: **Seamless — don't tell the player**. Reasons:
1. The goal is immersion. Labeling it "AI-generated" breaks the fourth wall
2. If the quality is good enough (and with a strong system prompt, it will be), the player shouldn't notice
3. If the quality ISN'T good enough, the fix is improving the prompt, not disclaiming it
4. The fallback text (existing hardcoded prose) is indistinguishable from LLM text — the player never knows which they're reading

### Q5: Relationship depth

**Recommendation**: **Fixed relationships, 1-2 per soldier, no evolution in v1**. Reasons:
1. The 8 pairs in the design doc cover the emotional core: Henderson↔Doyle (protective), Malone↔Caruso (rivalry), Kowalski↔Big Tom (brothers), Park↔Webb (depends_on), Palmer↔Malone (resents), Doyle↔Ellis (brothers), Washington↔Henderson (rivalry), Rivera↔everyone (protective)
2. Evolving relationships during a playthrough is complex (what triggers evolution? how does the LLM know about it?) and the payoff is low — the game is 30 scenes, not 300
3. The LLM naturally adapts its use of relationships based on who's alive — if Doyle dies, Henderson's reaction is the relationship expressing itself
4. Add evolution as a v2 feature if v1 proves the concept

### Q6: 2IC commentary

**Recommendation**: **Keep trigger system, replace text with LLM generation**. Reasons:
1. The trigger system (low_ammo threshold → "comment about ammo") is game logic — it should stay deterministic
2. The LLM replaces WHAT the 2IC says, not WHEN he says it
3. The veteran/green distinction maps perfectly to two different system prompts: veteran gets a "competent NCO" prompt, green gets an "overwhelmed junior" prompt
4. Scene-specific comments (keyed by decision ID) become scene-specific context seeds: instead of `"That's... optimistic, Captain..."`, the seed is `"2IC reacts to knife attack plan — skeptical of solo approach"`
5. This preserves backward compatibility — if the LLM is down, the trigger system still works with fallback text

### Q7: Wiki term detection

**Recommendation**: **Post-processing, not LLM**. Reasons:
1. The wiki term list is known at build time — it's a finite dictionary
2. A regex/dictionary lookup after LLM generation is deterministic, fast, and testable
3. Asking the LLM to mark terms is unreliable (it may miss terms, hallucinate terms, or break its own markup)
4. Implementation: after receiving LLM text, scan for wiki terms and wrap in `<span data-testid="wiki-term-{id}">` elements
5. This is a pure presentation concern — separate from narrative generation

---

## 4. Architecture Constraints

### The game is a static site — LLM needs a backend

Currently deployed to GitHub Pages. LLM API keys can't live in the client. Two paths:
1. **Cloudflare Worker** (recommended): Thin proxy, ~50 lines, free tier handles the traffic
2. **Optional "bring your own key" mode**: For local dev and users who want to use their own API key

The Worker URL gets injected via an environment variable at build time (`VITE_NARRATIVE_API_URL`). If the variable is empty, the game runs in "offline mode" with existing hardcoded text.

### Scene files need a migration path, not a rewrite

The existing 6 scene files work. Deleting their prose and replacing with context seeds is destructive. Better approach:
1. Add `sceneContext` and outcome `context` fields alongside existing `narrative` and `text` fields
2. The narrative service uses `sceneContext`/`context` when available, falls back to `narrative`/`text`
3. Migrate scenes one at a time — both old and new formats work simultaneously
4. Once all scenes are migrated and validated, remove the old fields

This means the type system supports BOTH formats during migration:

```typescript
interface Scenario {
  // ... existing fields
  narrative: string;           // kept for fallback
  sceneContext?: string;       // new: LLM context seed
}

interface OutcomeNarrative {
  text: string;                // kept for fallback
  context?: string;            // new: LLM context seed
  // ... rest unchanged
}
```

### NarrativePanel needs async + streaming support

Current: renders static strings synchronously.  
Needed: accept a `Promise<string>` or a streaming callback, show loading/typewriter state.

The simplest path:
1. Add a `StreamingText` component that accepts text incrementally
2. NarrativePanel gets a `loading` prop and a `streamedText` prop
3. GameScreen orchestrates: trigger LLM call → set loading → stream text → done

### Tests need updating but shouldn't break

The content validation tests check that every outcome has a `text` field. During migration, both `text` and `context` exist. After migration, the validator should accept either. The engine tests don't touch narrative — they test scores, casualties, and state transitions. They should pass unchanged.

---

## 5. Free-Text Player Actions ("Write Your Own")

### The feature

At every decision point, alongside the hardcoded options, the player sees a text input: **"Or describe what you do..."**

The player types a free-form action in plain English. The LLM reads it, classifies it against the existing decision space, and narrates the result. The game engine uses the SAME outcome mechanics — same tiers, same casualties, same state changes. The player gets the illusion of total freedom, but the game stays balanced.

### How it works

```
Player types: "I throw my helmet into the field to draw fire,
               then crawl through the drainage ditch"

         ↓ LLM Classification Call (~100 tokens, fast)

LLM response: {
  matchedDecision: "patrol_let_pass",   // closest existing decision
  tier: "sound",                         // tactical quality assessment
  reasoning: "Using distraction + concealed movement is tactically sound"
}

         ↓ Engine processes normally

Engine uses outcome template from "patrol_let_pass" → sound tier:
  menLost: 0, ammoSpent: 0, moraleChange: +3, readinessChange: 0

         ↓ LLM Narration Call (~500 tokens, streamed)

"You toss your helmet into the open pasture. A burst of MG fire
 shreds it. While the gunner reloads, you're already in the ditch,
 belly-crawling through six inches of cold water. Henderson follows
 without a word. Thirty meters later, you're past the bridge."
```

### Classification approach

The LLM receives:
1. The scene context (situation, environment, threats)
2. The list of existing decisions with their tiers and IDs
3. The player's free-text input

It returns:
1. **matchedDecision**: which existing decision this most closely resembles (determines state changes)
2. **tier**: the tactical quality (suicidal/reckless/mediocre/sound/excellent)
3. **reasoning**: one sentence explaining the classification (for debugging, not shown to player)

The classification maps to an existing outcome template. This means:
- State changes are always from a designed, balanced outcome
- No risk of the LLM inventing broken state changes
- The content author's balance work is preserved

### Edge cases

| Player writes | Classification | Why |
|---|---|---|
| "I surrender" | suicidal / fatal | Game over — treated like charging an MG |
| "I call in an airstrike" | Maps to best available option, capped by phase | You don't have a radio or air support — the LLM narrates the attempt and failure |
| "I do nothing" | mediocre / freeze | Maps to the "hold still" or "observe" option if one exists |
| Gibberish / empty | Rejected — prompt player to try again | Client-side validation before LLM call |
| Something that matches a hardcoded option exactly | Maps to that option | Classification picks the obvious match |
| Something creative and brilliant | excellent tier, even if no exact match | LLM recognizes good tactics; matched to the best-tier outcome |

### Key design constraints

1. **The LLM classifies, the engine decides consequences.** The LLM never invents menLost or ammoSpent values.
2. **Classification uses a structured JSON response** (not free text) — easy to parse and validate.
3. **If classification fails** (LLM error, timeout, invalid response), show the hardcoded decisions and ask the player to pick one. Never block the game.
4. **The player sees their action narrated** — this is the payoff. Even if mechanically it's the same as a hardcoded option, the narrative describes THEIR action.
5. **2IC can react to free-text actions too** — the LLM generates a 2IC comment based on the player's proposed action + the 2IC's personality (veteran: constructive criticism, green: uncertainty).

### Cost impact

Two LLM calls per free-text action instead of one:
- Classification: ~200 input tokens + ~50 output tokens ≈ negligible
- Narration: same as a normal outcome narration (~500 tokens)

Total cost increase: ~10-15% per playthrough if the player uses free-text for half their decisions. At $0.15/playthrough baseline, this adds ~$0.02. Negligible.

### UI changes needed

1. `DecisionPanel.tsx`: Add a text input below the decision buttons
2. Placeholder text: "Or describe what you do..."
3. Submit button or Enter key to send
4. Loading state while classification + narration runs (~3-5s total)
5. The input is optional — hardcoded decisions always available as the fast path

### New files / changes

| File | Change |
|---|---|
| `src/services/narrativeService.ts` | Add `classifyPlayerAction()` method |
| `src/services/promptBuilder.ts` | Add classification prompt builder |
| `src/components/DecisionPanel.tsx` | Add free-text input + submit |
| `src/components/GameScreen.tsx` | Handle free-text flow (classify → engine → narrate) |

---

## 6. System Prompt Design (Critical)

The system prompt is the most important piece. If it's wrong, the LLM generates bad text regardless of architecture. Two prompt types are needed: one for narration, one for classification.

### Narration Prompt

```
[ROLE]
You are the narrator of a WWII tactical text game set during D-Day.

[TONE GUIDE]
(Section 12 of GAME_SPEC.md — terse, military, present tense, second person, no melodrama)

[GAME STATE]
Men: 8/18, Ammo: 45%, Morale: 62, Enemy: ALERTED, Time: 0345
Phase: squad
Captain position: front

[ACTIVE ROSTER]
- SSgt Henderson (platoon_sergeant, veteran/steady) — your 2IC
- Sgt Malone (NCO, brave/hothead)
- PFC Doyle (rifleman, green/brave) — FIRST COMBAT
- ...

[RELATIONSHIPS]
Henderson is protective of Doyle (trained him personally, promised his mother).
Malone and Caruso are rivals (Boston vs Brooklyn, argue constantly, inseparable).

[SCENE CONTEXT]
{sceneContext from scene file}

[OUTCOME CONTEXT]
Tier: partial success. You caught 3 of 4 Germans but the fourth escaped.
Casualties: PFC Doyle (wounded — shrapnel to leg).
Ammo spent: 15%.
Readiness increased: +10 (gunfire).

[PLAYER ACTION (if free-text)]
The player wrote: "I throw my helmet to draw fire and crawl through the ditch"
Narrate THIS action with the outcome described above.

[INSTRUCTIONS]
Write 2-4 sentences describing this outcome.
Reference specific soldiers by name.
If a soldier was wounded/killed, reference their relationships.
Do not reference game mechanics (scores, percentages, tiers).
Do not use the words "strategic" or "tactical" — use concrete military language.
Maximum 80 words.
```

### Classification Prompt (for free-text actions)

```
[ROLE]
You are a tactical advisor evaluating a player's proposed action in a WWII game.

[SCENE CONTEXT]
{sceneContext — situation, threats, environment}

[AVAILABLE ACTIONS]
1. "patrol_l_ambush" (excellent) — L-shaped ambush from concealed position
2. "patrol_knife" (reckless) — Crawl up and knife the sentry
3. "patrol_let_pass" (sound) — Let the patrol pass, avoid contact
4. "patrol_charge" (suicidal) — Fix bayonets and charge
... (all decisions for this scene with their IDs and tiers)

[PLAYER'S ACTION]
"{player's free-text input}"

[INSTRUCTIONS]
Evaluate the player's proposed action.
Return JSON only:
{
  "matchedDecision": "<id of the closest existing decision>",
  "tier": "<suicidal|reckless|mediocre|sound|excellent>",
  "reasoning": "<one sentence explaining why>"
}
The tier should reflect the tactical quality of the player's plan
given the situation. Match to the existing decision whose outcome
best fits what would happen if the player did this.
```

### Epilogue Prompt (end of game)

```
[ROLE]
You are writing the "After the War" epilogue for soldiers in a WWII game.
Write in past tense, third person. Factual, restrained, moving. Like the
closing text of a documentary — no melodrama, just lives lived.

[SOLDIER]
PFC James "Jimmy" Doyle, age 19, from Boise, Idaho.
Farm kid, youngest in the platoon. Traits: green, brave.
Status at end: active (survived)

[RELATIONSHIPS]
- Henderson was protective of Doyle (trained him personally, promised his mother)
- Doyle and Ellis were brothers in arms (both green, both scared, stuck together)
- Ellis status: KIA (killed at the farmhouse, scene 6)

[PLAYTHROUGH EVENTS]
- Froze during first combat at the bridge (green trait triggered)
- Henderson talked him through it — "Eyes on me, son"
- Survived the farmhouse assault where Ellis was killed beside him
- Fought through the counterattack without freezing (green trait resolved)
- Was never wounded

[INSTRUCTIONS]
Write 3-5 sentences about what happened to this soldier after D-Day.
Reference his relationships — especially if someone close survived or died.
If he was wounded, it should affect his postwar life.
If he lost someone close, it should mark him.
If two close friends both survived, they might stay connected after the war.
Keep it grounded. Real names, real places, real jobs. No Hollywood endings.
Maximum 100 words.
```

**Example output**:
> *Private First Class James Doyle served through Bastogne and into Germany. He never froze again after Normandy. He didn't talk about Ellis — not to anyone, not for thirty years. He went home to Boise, married a girl named Catherine, and ran his father's farm. In 1978, Henderson drove out from Scranton to visit. They sat on the porch and didn't say much. Doyle died in 2011, age 86. His grandson joined the 101st.*

### Playthrough Event Log (feeds the epilogue)

The game needs to record significant events as they happen, so the epilogue prompt has material to work with. This is a simple append-only log.

```typescript
interface PlaythroughEvent {
  sceneId: string;
  type: "casualty" | "trait_triggered" | "relationship_moment"
      | "close_call" | "brave_act" | "player_action" | "promotion";
  soldierIds: string[];
  description: string;  // short, factual: "Henderson wounded saving Doyle"
}
```

**What gets logged** (automatically by the engine + narrative service):

| Trigger | Event type | Example |
|---|---|---|
| Soldier KIA/wounded | `casualty` | "Kowalski KIA at the bridge — MG burst" |
| Green soldier's first combat | `trait_triggered` | "Ellis froze during the farmhouse assault" |
| Coward freezes | `trait_triggered` | "Palmer refused to move under mortar fire" |
| Brave soldier volunteers | `brave_act` | "Malone volunteered to take point" |
| Two related soldiers in same combat | `relationship_moment` | "Big Tom picked up Kowalski's BAR after he fell" |
| Captain nearly hit | `close_call` | "Captain took shrapnel — kept fighting" |
| Player writes a memorable free-text action | `player_action` | "Player threw helmet as decoy to cross the ditch" |
| 2IC killed, replacement promoted | `promotion` | "Malone promoted to 2IC after Henderson KIA" |

**How it's used**: At epilogue time, each soldier's events are filtered from the log and included in their epilogue prompt. The LLM weaves them into a postwar story.

**Key design rules for epilogues**:

1. **If two friends both survive** → their epilogues reference each other. "Malone and Caruso opened a bar in Boston. They still argue about everything."
2. **If one friend dies** → the survivor carries it. "Big Tom never talked about Kowalski. He named his first son Walt."
3. **If a soldier was wounded** → it affects their postwar life. "Walked with a limp. Coached football for thirty years."
4. **If a green soldier resolved their trait** → growth arc. "Never froze again after Normandy."
5. **If a coward survived** → the most moving epilogue. "Palmer came home changed. The boy who froze at every firefight volunteered for Korea in 1950. Nobody could explain it."
6. **KIA epilogues are short and factual**: cemetery plot, posthumous medal, what happened to the family. No elaboration needed — the brevity IS the emotion.

### Key design decisions in the prompts

1. **Word limit**: 40-80 words per narration. Short enough for game pacing, long enough for character detail.
2. **Soldier names**: The narration prompt names every active soldier. The LLM picks who to mention based on context.
3. **Relationships**: Only include relationships where both soldiers are active. Don't mention relationships for dead soldiers unless one just died.
4. **No game mechanics in narration**: The narration LLM never sees scores, percentages, or tier names. It sees narrative context only.
5. **First combat flag**: If a `green` soldier is in their first combat, the prompt says so. This triggers the "freezing/panic" narrative.
6. **Classification is separate from narration**: Two calls, two prompts, two concerns. Classification is fast and structured (JSON). Narration is streamed and creative.
7. **Player action in narration prompt**: When the player writes a free-text action, the narration prompt includes it. The LLM narrates THEIR action, not a generic one.
8. **Epilogues are individually generated**: One LLM call per soldier (parallelized). Each gets their own events, relationships, and status. This produces unique, interconnected stories.
9. **Playthrough event log**: Accumulated during gameplay, consumed at epilogue time. Simple append-only structure — no complex state management.

---

## 7. Fallback Strategy

Three tiers for narrative generation:

1. **LLM available**: Full narrative generation from context seeds
2. **LLM unavailable but context seeds exist**: Template fallback — "[Outcome context]. [Casualty: name status]. [State summary]."
3. **No context seeds (unmigrated scene)**: Use existing hardcoded `narrative`/`text` fields

For free-text actions specifically:

4. **LLM available**: Classification + narration (full feature)
5. **Classification fails**: Show hardcoded decisions, ask player to pick one — "Your radio cuts out. Fall back on training." (in-universe explanation)
6. **LLM unavailable entirely**: Free-text input is hidden; only hardcoded decisions shown

The game NEVER breaks due to LLM failure. Worst case: the player sees the original hardcoded text and picks from hardcoded decisions. Both work today.

---

## 8. Access Code System (Cost Protection)

### The problem

You pay per LLM token. The game is public. Without a gate, anyone who finds the URL can play and generate costs. You need to control who can trigger LLM calls.

### The solution: invite codes

Simple, no-account access control. You generate codes, give them to people you want to play. The code gates LLM access, not the game itself.

```
Player opens game → Main Menu shows "Enter access code" field
  → Player enters code → Code sent to Worker for validation
  → Valid: code stored in sessionStorage, LLM features enabled
  → Invalid: error message, player can retry
  → No code: player can still play in "offline mode" (hardcoded text, no free-text input)
```

### How it works

1. **Codes stored in Cloudflare KV** (key-value store, free tier: 100K reads/day). Each code is a key, the value is metadata:

```typescript
interface AccessCode {
  code: string;           // e.g. "NORMANDY-ALPHA-7X9K"
  createdAt: string;      // ISO date
  maxUses?: number;       // optional cap (null = unlimited)
  currentUses: number;    // incremented per playthrough start
  active: boolean;        // you can revoke codes
  label?: string;         // "friend-julien", "tester-1" — for your tracking
}
```

2. **Validation flow**:
   - Every LLM request from the client includes the code in the `Authorization` header
   - The Worker checks the code against KV before forwarding to Anthropic
   - Invalid/expired/revoked code → 401 → client falls back to offline mode

3. **Code management**: You manage codes via Wrangler CLI:
   - `wrangler kv:key put --binding=ACCESS_CODES "NORMANDY-ALPHA-7X9K" '{"active":true,"maxUses":null,"currentUses":0,"label":"friend"}'`
   - Or we build a tiny admin endpoint on the Worker (password-protected) to create/list/revoke codes from a browser

4. **The game works without a code** — you just don't get the LLM features. Hardcoded text, no free-text input, template epilogues. This means the game is still publicly playable as a demo, but the "full AI experience" requires a code.

### Design decisions

| Decision | Choice | Why |
|---|---|---|
| Gate LLM calls, not the game itself | Yes | Public demo → invite to full experience is a better funnel |
| Per-code usage tracking | Yes | Know which codes are active, how much each costs you |
| Revocable codes | Yes | If someone shares a code publicly, kill it |
| Max uses per code | Optional | Give a tester 10 playthroughs, give a friend unlimited |
| Code format | `NORMANDY-XXXX-XXXX` | Easy to type, easy to share, looks intentional |
| Storage | Cloudflare KV | Free tier, fast, already in the Worker ecosystem |

### Cost monitoring

The Worker can log per-code token usage to KV or a simple analytics endpoint. This lets you see:
- Total tokens consumed per code
- Total tokens consumed per day
- Alert if daily spend exceeds a threshold (e.g., $5/day)

### New files / changes

| File | Change |
|---|---|
| `worker/` | Add code validation middleware, KV binding |
| `src/components/AccessCodeInput.tsx` | Code entry UI on main menu |
| `src/services/narrativeService.ts` | Include code in all LLM request headers |
| `src/App.tsx` or `src/components/MainMenu.tsx` | Code entry flow before game start |

---

## 9. Integration Points Summary (updated)

| What | Where | Current | After |
|---|---|---|---|
| Scene narrative | `NarrativePanel` ← `GameScreen` ← `scene.narrative` | Static string | LLM call with `scene.sceneContext` + state |
| Outcome narrative | `NarrativePanel` ← `GameScreen` ← `outcome.text` | Static string | LLM call with `outcome.context` + state + casualties |
| Free-text action | New text input in `DecisionPanel` | Does not exist | LLM classify → engine → LLM narrate |
| Rally narrative | `NarrativePanel` ← `GameScreen` ← `rally.narrative` | Static string | LLM call with rally context + new soldiers |
| 2IC comments | `DecisionPanel` ← `scenarioLoader` ← comments | Static string | LLM call with trigger type + state (keep trigger logic) |
| Death narrative | `DeathReport` ← `App` ← `GameScreen.onGameOver` | Static string | LLM call with death context + roster |
| Soldier epilogues | `EpilogueScreen` ← `App` ← `GameScreen.onVictory` | Template-based | LLM call per soldier with events + relationships + status |
| Playthrough events | Does not exist | Does not exist | Event log accumulates during gameplay, fed to epilogue prompt |

### Priority order

1. **Outcome narrative** — highest impact, most state-dependent, shown after every decision
2. **Free-text actions** — the killer feature, makes every playthrough unique
3. **Playthrough event log** — must exist before epilogues work; records as you play
4. **Scene narrative** — shown on scene entry, benefits from roster/state awareness
5. **2IC comments** — character-driven, benefits from relationship awareness
6. **Death narrative** — emotional payoff, references specific soldiers
7. **Epilogues** — the emotional payoff of the whole game; uses event log + relationships
8. **Rally narrative** — nice-to-have, existing text is fine

---

## 10. New Files Needed

| File | Purpose | Size estimate |
|---|---|---|
| `src/services/narrativeService.ts` | LLM API calls, streaming, classification, fallback logic | ~250 lines |
| `src/services/promptBuilder.ts` | Constructs narration, classification, and epilogue prompts | ~350 lines |
| `src/services/eventLog.ts` | Playthrough event log — append, filter, serialize | ~80 lines |
| `src/content/relationships.ts` | Relationship map for all 18 soldiers | ~80 lines |
| `src/components/StreamingText.tsx` | Typewriter/streaming text display component | ~60 lines |
| `src/components/FreeTextInput.tsx` | Free-text action input + submit in DecisionPanel | ~80 lines |
| `src/components/AccessCodeInput.tsx` | Code entry UI on main menu | ~50 lines |
| `worker/` (or separate repo) | Cloudflare Worker: LLM proxy + code validation + KV binding | ~150 lines |
| `.env.example` | Documents required environment variables | ~5 lines |
| `tests/services/narrativeService.test.ts` | Tests for narrative service + classification | ~250 lines |
| `tests/services/promptBuilder.test.ts` | Tests for prompt construction (all 3 prompt types) | ~200 lines |
| `tests/services/eventLog.test.ts` | Tests for event logging and filtering | ~100 lines |

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM generates off-tone text | Low-Medium | High | Claude Sonnet + strong system prompt + word limit + tone examples |
| LLM mentions dead soldiers as alive | Low | High | Prompt includes exact roster with statuses |
| Latency breaks pacing | Low | Medium | Streaming (word-by-word) eliminates perceived wait |
| LLM is unavailable | Low | Low | Three-tier fallback (LLM → template → hardcoded); free-text hidden |
| Cost exceeds expectations | Low | Low | Claude Sonnet at ~$0.15/playthrough; drop to Haiku if needed |
| Migration breaks existing scenes | Medium | Medium | Both formats supported simultaneously; existing tests pass |
| Prompt engineering takes longer than expected | Medium | Medium | Start with outcome narrative only; expand incrementally |
| Free-text classification is inaccurate | Medium | Medium | Classification includes all existing decisions as reference; fallback to hardcoded options |
| Player tries to break the game via free-text | Medium | Low | Classification is bounded — worst case maps to "suicidal" tier; LLM can't invent state changes |
| Free-text latency (2 LLM calls) feels slow | Medium | Medium | Classification is fast (~0.5s); narration is streamed; total ~3-5s feels acceptable for a text game |
| Someone shares a code publicly | Medium | Medium | Per-code usage tracking; revocable codes; optional max uses per code |
| Runaway costs from active codes | Low | High | Daily spend cap on the Worker; alert if threshold exceeded; kill codes fast |

---

## 12. What I Might Have Wrong

Things I'm less certain about — correct me if any of these are off:

1. **The Worker proxy assumption**: I'm assuming you want to deploy the LLM proxy as a Cloudflare Worker. If you'd rather use a different backend (Vercel, Railway, etc.), the architecture changes slightly.

2. **Claude Sonnet as the model**: Best prose quality at ~$0.15/playthrough. If cost becomes a concern later, dropping to Haiku or GPT-4o-mini is a config change thanks to the interface-based provider design.

3. **Streaming as the display method**: I'm assuming word-by-word typewriter effect. If you'd prefer "loading → full text appears" (simpler to build), the StreamingText component isn't needed.

4. **One Worker for everything**: I'm putting the narrative API + code validation in one Cloudflare Worker. If the Worker grows too complex, we can split into multiple routes.

5. **Code management via Wrangler CLI**: I'm assuming you're comfortable managing codes from the terminal. If you'd rather have a web UI to create/revoke codes, that's a small admin panel on the Worker — adds ~100 lines but much friendlier.

6. **Offline mode as the no-code experience**: Players without a code still see the game with hardcoded text. If you'd prefer to fully block the game without a code (no demo), that's a one-line change.

---

**Read this. Correct anything I got wrong before we plan.**

If nothing jumps out as wrong, open this file in your editor and annotate it directly — even a quick pass usually catches something.
