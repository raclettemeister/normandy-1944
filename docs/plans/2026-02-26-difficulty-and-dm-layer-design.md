# Difficulty System & DM Layer — Design Document

**Date**: 2026-02-26
**Status**: Approved — ready for implementation planning
**Prerequisite**: Review in editor. Annotate directly if anything needs correction.

---

## 1. Design Summary

The game's core identity shifts: **prompting IS the gameplay**. Multiple choice decisions are the easy mode, not the default. The game rewards creativity, role-playing engagement, and tactical thinking — not memorization of a military database. It should feel like a friendly tabletop RPG with a great DM, not a military exam.

Three difficulty levels control how much scaffolding the player receives. The game engine, scenes, and content are identical across all levels. Difficulty is a pure UI layer: hide the choices, show the prompt input.

A new "DM Layer" evaluates free-text prompts and assigns a tactical tier. A new "masterful" tier sits above "excellent" and is only achievable through free-text prompting — rewarding players who name soldiers, use terrain, coordinate elements, and show genuine engagement with the situation.

The scene flow is redesigned from single-decision to a multi-phase tactical cycle: preparation → plan → team briefing → execution.

---

## 2. Difficulty Levels

Selected at game start. Stored in `GameState.difficulty`. No locks, no prerequisites, no warnings. Sink or swim — knowledge earned through failure IS the roguelike progression.

| | Easy | Medium | Hardcore |
|---|---|---|---|
| **Decision buttons** | All visible, always | Hidden. Player has N "reveal" tokens (default: 5, tunable) | Hidden. Zero tokens. |
| **Free-text input** | Available but optional | Primary input | Only input |
| **2IC behavior** | Same across all levels | Same across all levels | Same across all levels |
| **Lessons tab** | Available | Available — your field manual | Available — your lifeline |
| **Masterful tier** | Not achievable (button ceiling = excellent) | Achievable via prompt | Achievable via prompt |
| **LLM required** | No (fully playable offline) | Yes (falls back to easy if unavailable) | Yes (falls back to easy if unavailable) |

The 2IC does NOT change behavior across difficulty levels. Henderson is Henderson — same observations, same reactions, same personality. The only thing that changes is whether the player sees predefined decision buttons.

### Reveal Tokens (Medium only)

- Start with N tokens (default: 5, tunable for balance)
- At any point during the plan phase, spend one token to reveal all decisions for the current scene
- Once revealed, the player can click a decision OR still write a prompt — their choice
- Token is spent on reveal, no "peek and cancel"
- Unspent tokens carry forward
- Token count visible in UI (small counter near the prompt input)
- At 0 tokens, the reveal button is grayed out — player is on their own
- Tokens are a resource management decision, like ammo

---

## 3. The Tactical Cycle (Scene Flow)

Every scene follows this cycle. Same on all difficulty levels. Same phases, same interactions.

```
PHASE 0: SITUATION
  ↓ (free, no time cost)
PHASE 1: PREPARATION
  ↓ (optional actions, each costs ~5 min)
PHASE 2: PLAN DESIGN
  ↓ (write prompt or pick decision)
PHASE 3: TEAM BRIEFING
  ↓ (team reacts, player can revise or commit)
PHASE 4: EXECUTION
  ↓ (single streamed narrative — no sub-prompts in v2)
OUTCOME
  → state updated, next scene
```

### Phase 0 — Situation

The scene narrative describes what the player sees, hears, and knows. Same as today. No time cost, no interaction.

### Phase 1 — Preparation

Before making a plan, the player can take preparation actions. Each costs ~5 minutes on the clock. The player chooses how many to take (including zero).

Each scene defines 2-4 specific prep actions relevant to that scene. These are not generic — they're authored per scene.

Examples for a farmhouse assault scene:
- "Ask Henderson about the farmhouse" → Henderson describes what he sees (veteran: detailed, green: vague)
- "Check the drainage ditch for cover" → The player learns about dead ground
- "Have Kowalski set up the BAR" → Mechanical readiness bonus
- "Ask Malone his opinion" → Malone gives an in-character tactical read

Each prep action is a short LLM interaction: the player asks, a soldier responds in character based on their traits. On easy mode (offline/no LLM), prep responses are pre-authored strings — same content, no generation.

**The trade-off is the clock.** Zero prep = blind but fast. Four prep actions = 20 minutes burned, but the player has a rich picture. The existing time pressure mechanic (readiness +1 per 10 minutes) bites here. Same tension triangle.

### Phase 2 — Plan Design

Based on what was learned in Phase 1, the player writes their plan.

- On easy mode: predefined decision buttons are visible. Player can click one or write a prompt.
- On medium mode: buttons hidden. Player can spend a reveal token to see them, or write a prompt.
- On hardcore mode: buttons hidden. No tokens. Write a prompt.

The prompt is evaluated by the DM Layer (see Section 4).

### Phase 3 — Team Briefing

After the player submits their plan, the team reacts in character. The DM generates reactions from 2-3 soldiers:

- Henderson always reacts (assessment based on competence level)
- 1-2 soldiers relevant to the plan react based on traits
  - Malone (hothead): "I like it. Aggressive. When do we go?"
  - Park (methodical): "What if the second position has overlapping fire?"
  - Doyle (green): "...yes sir." (scared but willing)

Henderson's reaction serves as **indirect tier feedback**:

| DM tier | Veteran Henderson | Green replacement |
|---|---|---|
| Masterful | "That's a hell of a plan, Captain." | "Okay... yes sir." |
| Excellent/Sound | Nods. Maybe a small practical addition. | "Got it, sir." |
| Mediocre | "Sir... might want to think about that MG angle." | Silence. |
| Reckless | "Captain, I have to say — that's risky." | "Are you sure, sir?" |
| Suicidal | "Sir. I can't let you do that." | "...sir?" |

After seeing reactions, the player can **revise** the plan (rewrite, adjust) or **commit**. One revision loop — after commit, execution begins. No limit on rewrites within the revision loop.

If the player clicked a predefined decision (easy mode or reveal token), the briefing phase is shorter — Henderson gives a quick read, no revision needed.

### Phase 4 — Execution

The plan executes. The DM narrates the outcome as a single streamed narrative (typewriter effect). No sub-prompts in v2 — execution is one continuous piece.

The narrative references specific soldiers, uses the player's plan language, and describes consequences (casualties, terrain changes, enemy reaction). The streamed narrative is the payoff for the tactical cycle.

After execution: state is updated (casualties, ammo, morale, readiness, time), event log entries recorded, next scene loads.

### Sub-prompts during execution — v3 feature

In v3, execution becomes dynamic: the DM narrates moment-by-moment and reactive sub-prompts emerge ("Movement on the right — what do you do?"). These are fast, high-pressure, in-the-heat decisions. Not in v2 scope.

---

## 4. The DM Layer

Sits between the player's prompt and the outcome engine. Evaluates the quality of the player's plan and assigns a tactical tier. Does NOT set outcome values — the engine does that.

### What the DM does

1. Receives: player's prompt + scene context + game state + roster + relationships + player's unlocked lessons
2. Evaluates: tactical coherence, creativity, situation awareness (holistic judgment)
3. Returns: a **tier** (suicidal through masterful) + a one-sentence **reasoning** + a **narrative** describing the outcome + **2IC reaction** + **soldier reactions** for the briefing
4. Does NOT return: menLost, ammoSpent, moraleChange, or any numeric outcome values

### What the engine does

The tier from the DM feeds into the existing outcome pipeline:

```
DM tier → effective score (from TIER_BASE_SCORES)
  → state modifiers (morale, readiness, manning, ammo, capabilities, intel)
  → outcome range → dice roll → outcome tier (success/partial/failure)
  → outcome values from balance envelope
```

The balance envelope (per scene) defines the min/max for each variable at each outcome tier:

```typescript
interface BalanceEnvelope {
  success: { menLost: [0, 1], ammoSpent: [0, 10], moraleChange: [0, 10], readinessChange: [0, 5] };
  partial: { menLost: [1, 3], ammoSpent: [5, 20], moraleChange: [-15, 0], readinessChange: [3, 10] };
  failure: { menLost: [2, 4], ammoSpent: [10, 30], moraleChange: [-25, -5], readinessChange: [5, 15] };
}
```

**Balance envelopes are auto-derived from existing decisions**, not authored separately. If scene 05's existing decisions have menLost ranging from 0 to 3 across all success outcomes, the envelope's success range is `[0, 3]`. A +1 buffer is added for failure (to allow worse-than-authored outcomes for truly bad prompts). Content authors can override with explicit values if needed.

Within the envelope, the engine picks values using the dice roll position (higher roll = better end of range).

### The authority split

| Concern | Who decides | Why |
|---|---|---|
| Quality of the plan (tier) | DM (LLM) | Requires judgment, creativity evaluation |
| Narrative description | DM (LLM) | Creative writing |
| Soldier reactions | DM (LLM) | Character voice |
| Casualties, ammo, morale, readiness | Engine (code) | Balance, determinism, testability |
| Game over (fatal) | DM can flag, engine confirms | Safety valve for insane inputs |
| Captain casualty risk | Engine (existing dice roll) | Already designed, works well |

The LLM never touches game balance numbers. It evaluates and narrates. The engine calculates and enforces.

### The fatal flag

For truly insane inputs ("I shoot my own team," "I surrender and betray everyone"), the DM can return `fatal: true`. The engine treats this as a game-over event. The DM also returns a narrative describing the consequence.

Guidelines in the DM system prompt:
- **Fatal**: Deliberately killing your own men, active betrayal, actions that would obviously end your command
- **Not fatal, but reckless/suicidal tier**: Charging an MG, doing something brave but stupid, taking extreme risks
- **Not fatal, handled in-universe**: Impossible/fantasy inputs ("I cast a fireball") → the narrative acknowledges the attempt makes no sense, maps to mediocre
- **Do nothing**: Time passes, readiness increases, morale drops. Tier = mediocre.

### Anchor decisions

The DM's system prompt includes all existing decisions for the scene as reference points:

```
[ANCHOR DECISIONS — for calibration, not constraint]
These show the SCALE of outcomes for this scene:
- "patrol_l_ambush" (excellent): Coordinated L-ambush → success: 0 casualties, partial: 1, failure: 2
- "patrol_knife" (reckless): Solo knife attack → success: 0, partial: 1, failure: 2 + captain risk
- "patrol_let_pass" (sound): Avoid contact → success: 0, partial: 0, failure: 1

Use these as calibration for what "excellent" vs "reckless" looks like HERE.
A player's plan can match an anchor, blend concepts from multiple anchors,
or be entirely original. Evaluate on its own merits.
```

The anchors help the LLM understand the scene's scale without constraining creativity. A creative plan that doesn't match any anchor is evaluated independently. A plan that closely matches an anchor gets that anchor's tier as a baseline.

---

## 5. The Tier System

Six tiers. The top tier (masterful) is only achievable through free-text prompting.

| Tier | Base Score | Via button? | Via prompt? |
|---|---|---|---|
| Suicidal | 5 | Yes | Yes |
| Reckless | 25 | Yes | Yes |
| Mediocre | 45 | Yes | Yes |
| Sound | 70 | Yes | Yes |
| Excellent | 90 | Yes (ceiling) | Yes |
| **Masterful** | **105** | **No** | **Yes** |

### What earns masterful

The DM system prompt defines masterful as meeting ALL of these:
- The plan is **tactically coherent** — it makes physical and military sense
- The plan is **creative** — it's not a textbook answer, there's something original or clever
- The plan shows **situation awareness** — the player named specific soldiers, referenced their traits/roles, used terrain from the scene, accounted for available equipment
- The plan shows **engagement** — the player is IN the game, leading, not just typing keywords

Example of a masterful prompt:
> "Henderson, take Kowalski and the BAR to the stone wall on the left — suppress that MG. Malone, when they shift fire, your team goes through the drainage ditch behind the barn. I'll be with Malone at the front. Bergman, if anyone surrenders, you talk them down in German."

This uses: coordinated elements, named soldiers with correct roles, specific terrain, captain position commitment, contingency planning using a soldier's unique trait.

### Masterful rewards

Beyond better mechanical outcomes (higher base score → fewer casualties):
- **Special narrative moments**: "Bergman talks the sentry into surrendering — you gain a prisoner and intel." Outcomes that only trigger because the player's plan was specific enough to create them.
- **Hidden intel gains**: The DM can flag `intelGained` when the plan's specificity warrants it.
- **Achievement fuel**: Achievements for masterful actions (e.g., "Tactician" — 5 masterful outcomes in one playthrough).

---

## 6. 2IC & Soldier Interactions

The 2IC system is **identical across all difficulty levels**. Henderson (or his replacement) behaves the same whether the player is on easy, medium, or hardcore.

### Henderson as eyes and ears

Henderson is a good NCO, not a commander. He tells you **what is**, not **what to do**. The army chose the player to lead, not Henderson.

Veteran Henderson:
> "Sir, I count two positions. MG in the farmhouse second floor — good field of fire, maybe 200 meters of open ground. Second position in the treeline to the east, looks like a rifle squad. Dead ground along the drainage ditch on our left — it runs most of the way to the barn. Wind's from the west, so they won't hear us if we stay low."

Green replacement:
> "There's... a machine gun, sir. In the building. And some guys in the trees, I think. I don't know how many."

Same scene, wildly different intel. The veteran gives the player material to build a masterful prompt. The green gives almost nothing. Losing Henderson is devastating on any difficulty — but especially on medium/hardcore where the player can't fall back on predefined decisions.

### Other soldiers in prep phase

During Phase 1 preparation, the player can talk to other soldiers. Each responds in character:

| Soldier | Trait influence | Example response |
|---|---|---|
| Malone (hothead, brave) | Aggressive, wants action | "Let me take my guys around the left, Captain. We hit 'em fast, they won't know what happened." |
| Park (steady, sharpshooter) | Methodical, observant | "I can see movement in the treeline. Want me to watch them for a few minutes? Might learn their pattern." |
| Webb (sharpshooter, scrounger) | Practical, detail-oriented | "There's a low wall about 80 meters out, sir. Good position for me if you want overwatch." |
| Doyle (green, brave) | Nervous but willing | "Whatever you need, sir. I'm... I'm ready." |

These are NOT tactical advice. They're character perspectives. The player synthesizes them into their own plan.

### Green 2IC gives unreliable intel

When Henderson dies and a green replacement takes over, the 2IC's observations become vague, incomplete, or occasionally wrong. The player should eventually learn to discount unreliable reports — not because the game told them, but because outcomes based on bad intel went sideways. This is intentional difficulty scaling through narrative, not numbers.

---

## 7. Lessons Learned (Field Manual)

Lessons shift from 2-4 sentence game tips to a full **field manual** — 150-300 words per lesson, written in military academy doctrine style.

### Format

Each lesson has four parts:

1. **PRINCIPLE**: What the concept is, in plain language
2. **WHAT WORKS**: Tactical approaches that succeed
3. **WHAT DOESN'T WORK**: Common mistakes
4. **FROM THE FIELD**: One-sentence quote from an after-action report (emotional anchor)

### How lessons help prompting

Lessons are **inspiration**, not answers. They give the player tactical vocabulary and ideas so their creativity has material to work with. A lesson about MG kill zones doesn't mean "always flank the MG." It means the player now UNDERSTANDS kill zones and can come up with their OWN creative solution.

Without lessons: "Attack the farmhouse." (mediocre)
With lessons + roster knowledge + Henderson's report: A masterful prompt.

### Contextual surfacing

The lessons tab always shows the full list. At the top, a "RELEVANT TO THIS SITUATION" section highlights 1-3 lessons that apply to the current scene. This uses keyword matching between scene content and lesson topics — not manual tagging. Lower content authoring burden.

### Unlock cadence

~30 lessons across all 3 acts. 3-5 unlocked per playthrough depending on decisions. A player who's done 3-4 playthroughs has most lessons and a deep field manual. First playthrough: raw. Fifth playthrough: trained officer. That IS the roguelike progression.

### Persistence

Stored in `localStorage` under `normandy1944_lessons`. Persists across playthroughs. Cleared only by explicit player action.

---

## 8. Fallback Strategy

The game never breaks. Three scenarios:

### No access code / offline mode
- Difficulty selection hidden — game runs on easy mode only
- All decisions visible, hardcoded narrative text, no prompt input
- The full game as it exists today. Playable, complete, no AI features.
- This is the free demo. "Enter an access code to unlock AI command mode."

### LLM goes down mid-game
- Current scene falls back to easy mode for that scene only
- Decisions appear, player picks one, hardcoded outcome text plays
- In-universe message: "Fall back on training, Captain."
- Next scene tries LLM again. If back, resume normal mode.
- Player's difficulty setting is NOT changed — just this one scene degrades

### LLM returns invalid response
- Client-side validation catches malformed JSON, missing tier, etc.
- Same fallback as above — show decisions for this scene
- Log the error to the Worker for debugging
- Player never sees a broken screen

**The guarantee:** Easy mode works with zero LLM calls, zero network, zero backend. It's a static site. Medium and hardcore enhance it. If the enhancement fails, the player gets easy mode for that moment. The game never stops.

---

## 9. Cross-Scene Memory

The DM needs context beyond the current scene. The event log (already designed in the research doc) is expanded to also record:

- **Player plan summaries**: A one-sentence summary of what the player did each scene (generated by the DM). Included in subsequent DM prompts.
- **Soldier events**: Casualties, wounds, brave acts, trait triggers. Already in the event log design.
- **Player tendencies**: If the player consistently uses Malone on point, the DM can reference it — "Malone's getting tired of being first through the door, Captain."

The DM prompt for each scene includes the last 5-10 events from the log. This gives narrative continuity without an unbounded context window.

---

## 10. Adversarial Input Handling

The DM system prompt includes explicit handling rules:

| Player writes | DM response |
|---|---|
| Deliberate team-kill ("I shoot my own men") | `fatal: true`. Narrative: your men turn on you / you're relieved of command. Game over. |
| Surrender / betray | `fatal: true`. Narrative: captured, court-martial, or shot. Game over. |
| Fantasy / impossible ("I cast a fireball") | Tier: mediocre. Narrative: "You shout something incoherent. Your men stare. Henderson says nothing." The plan doesn't work because it's not real. |
| Do nothing ("I wait") | Tier: mediocre. Time passes, readiness increases, morale drops. Narrative: "Minutes pass. The men look at you. The clock ticks." |
| Vague / lazy ("attack") | Tier: mediocre. Narrative is generic. The DM doesn't reward low-effort prompts. |
| Gibberish / empty | Rejected client-side. "Say again, Captain?" — prompt to retype. |
| Repeating the same plan as last scene | The DM notices (via event log) and may downgrade: "The enemy saw this tactic an hour ago, sir." |

---

## 11. What Changes in the Codebase

### Untouched
- `outcomeEngine.ts` — score calculation, dice rolls, outcome tiers (add masterful constant only)
- `roster.ts` — 18 soldiers, rally events
- `battleOrders.ts` — milestone tracking
- `achievementTracker.ts` / `lessonTracker.ts` — persistence
- All existing engine tests

### Modified

| File | Change |
|---|---|
| `types/index.ts` | Add `difficulty`, `revealTokensRemaining`, `TacticalPhase`, `DMEvaluation`, `BalanceEnvelope`. Add `"masterful"` to `TacticalTier`. |
| `GameScreen.tsx` | Rewrite scene flow for 5-phase tactical cycle |
| `DecisionPanel.tsx` | Hide decisions on medium/hardcore. Show prompt input. Show reveal token button. |
| `NarrativePanel.tsx` | Support streaming text + phase-aware display |
| `StatusPanel.tsx` | Add reveal token counter (medium only) |
| `MainMenu.tsx` | Add difficulty selection, access code input |
| `LessonJournal.tsx` | Redesign: longer entries, clickable expand, contextual surfacing |
| `scenarioLoader.ts` | Auto-derive balance envelopes from decisions. Load prep actions. |
| `gameState.ts` | Add `difficulty`, `revealTokensRemaining`, `currentPhase`. Add masterful to score table. |
| Scene files (act1/*) | Add `prepActions` per scene. Balance envelopes auto-derived. |

### New files

| File | Purpose | ~Lines |
|---|---|---|
| `src/services/dmLayer.ts` | DM evaluation: receives prompt + context, returns tier + narrative + reactions | ~300 |
| `src/services/promptBuilder.ts` | Builds system prompts for each phase (prep, plan eval, briefing, narration, epilogue) | ~500 |
| `src/services/narrativeService.ts` | LLM API calls, SSE streaming, error handling, fallback | ~250 |
| `src/services/eventLog.ts` | Playthrough event log (feeds epilogues + cross-scene memory) | ~100 |
| `src/content/relationships.ts` | Soldier relationship map | ~80 |
| `src/components/PrepPhase.tsx` | Phase 1 UI: prep action buttons, conversation display | ~150 |
| `src/components/PlanPhase.tsx` | Phase 2 UI: prompt input, reveal token, decision buttons | ~120 |
| `src/components/BriefingPhase.tsx` | Phase 3 UI: team reactions, revise/commit | ~120 |
| `src/components/StreamingText.tsx` | Typewriter/streaming text display | ~60 |
| `src/components/AccessCodeInput.tsx` | Access code validation | ~50 |
| `worker/src/index.ts` | Cloudflare Worker: LLM proxy + access code validation | ~150 |
| `tests/services/dmLayer.test.ts` | DM layer tests (mocked LLM) | ~300 |
| `tests/services/promptBuilder.test.ts` | Prompt construction tests | ~250 |

**Estimated new code:** ~2,400 lines (services, components, tests).

---

## 12. Cost Model

Per-scene LLM interactions (medium/hardcore):

| Phase | Calls | ~Tokens per call |
|---|---|---|
| Prep conversations (0-4) | 0-4 | ~300 each |
| Plan evaluation | 1 | ~800 |
| Briefing generation | 1 | ~500 |
| Execution narration | 1 | ~500 |
| **Total per scene** | **3-7** | **~1,800-3,500** |

30 scenes with moderate prep: ~60,000-100,000 tokens per playthrough.
At Claude Sonnet pricing (~$3/M input, ~$15/M output): **~$0.60-1.00 per playthrough**.

Acceptable for the quality delivered. If cost becomes a concern, drop classification calls to Haiku (~10x cheaper) and keep narration on Sonnet.

---

## 13. Roadmap

| Phase | What ships | Depends on |
|---|---|---|
| **v1** | Base game complete. 30 scenes, all engine bugs fixed, easy mode fully playable. Lessons in field manual format. Static site, no LLM. | Nothing |
| **v2** | DM Layer + difficulty system. Tactical cycle (prep → plan → briefing → execution). Masterful tier. Cloudflare Worker + access codes. LLM-generated epilogues. | v1 complete |
| **v3** | Expanded dialogue. Multi-turn prep conversations. Execution sub-prompts (reactive decisions in the heat of action). Richer briefing exchanges. | v2 proven |
| **v4** | Voice input. Speech-to-text for orders (Whisper API, ~$0.006/min, ~$0.30/playthrough). Optional text-to-speech for responses. | v3 stable |

### Critical path

v1 content (24 more scenes + 30 lessons) is the bottleneck. The code changes for v1 are small (bug fixes + scene structure). The content creation is 4-6 weeks. v2 code (DM layer, Worker, tactical cycle UI) is 2-3 weeks but can't start until v1 scenes exist with decisions and outcomes to serve as anchors.

---

## 14. Open Items for Future Design Sessions

- **i18n**: French/English language selection (separate brainstorm session started). DM system prompt needs bilingual support if player prompts in French.
- **Mobile UX**: Typing masterful prompts on a phone is painful. Medium mode with reveal tokens may serve as the "mobile mode" until v4 (voice). Needs design attention.
- **Playtesting**: The DM's tier assignments need validation with real players. Plan a prompt test suite: known-good prompts that should score masterful, edge cases, adversarial inputs.
- **Content pipeline**: 30 scenes + 30 lessons is a large content creation effort. Consider whether LLM can assist with first-draft scene content that a human then refines.

---

## 15. Decisions Log

All decisions made during this brainstorming session:

| # | Decision | Reasoning |
|---|---|---|
| 1 | Three difficulty levels (easy/medium/hardcore) | Difficulty = scaffolding, not challenge mechanics |
| 2 | Budget token system for medium | Player decides when to spend — resource management |
| 3 | 2IC is observational, not directional | Henderson reports what IS, player decides what to DO. Realistic officer/NCO relationship. |
| 4 | 2IC identical across all difficulty levels | Only button visibility changes, not the game's characters |
| 5 | Classification feedback via 2IC reaction (in-universe) | No meta-layer, no fourth-wall break. Henderson's reaction is the signal. |
| 6 | Sink or swim onboarding | No locks, no warnings. Die fast, learn, come back. Knowledge IS progression. |
| 7 | Bounded DM — LLM evaluates, engine enforces balance | LLM assigns tier + narrative. Engine sets outcome values. LLM never touches numbers. |
| 8 | Creativity rewarded — game is a tabletop RPG, not a military exam | The DM rewards clever thinking, not textbook answers. Lessons are inspiration, not solutions. |
| 9 | Masterful tier (prompt-only, above excellent) | The best possible outcomes require genuine engagement — naming soldiers, using terrain, coordinating elements. |
| 10 | Multi-phase tactical cycle | Prep → plan → briefing → execution. Each phase adds depth without adding arbitrary complexity. |
| 11 | Execution sub-prompts are v3, not v2 | Keeps v2 scope manageable. The prep/plan/briefing cycle is already rich. |
| 12 | DM returns tier, not three separate scores | Simpler, more consistent, easier to debug. LLM makes holistic judgment. |
| 13 | Balance envelopes auto-derived from existing decisions | Less content authoring. Envelopes come from the decisions that already exist. |
| 14 | Approach C: DM Layer + Decision Templates as Anchors | Existing decisions become calibration examples for the DM. Creative prompts evaluated independently. |

---

**Open this in your editor and annotate it directly. Even a quick read-through usually catches something.**
