# AI-Driven Narrative Pivot — Design Document

**Date**: 2026-02-25
**Status**: Approved direction, pending full brainstorm + implementation plan
**Context**: This document captures a design pivot discovered during a brainstorming session about using Cursor Background Agents. The next session should start with the brainstorming skill and use this document as the foundation.

---

## 1. The Pivot

The normandy-1944 game was originally designed with **hardcoded narrative text** — every scene, outcome, and character reaction written by hand in scene files. This works for a small number of scenes but breaks down because:

- **Combinatorial explosion**: 18 soldiers × 3 outcome tiers × personal relationships = hundreds of narrative variants nobody will write
- **State blindness**: Hardcoded text can't reference who actually died, what traits triggered, or what the game state is. This produces inconsistencies like "one of your men died" when the captain died.
- **Rigidity**: Every new scene requires writing ~15 narrative blocks (5 decisions × 3 tiers). Content creation is the bottleneck.

**The pivot**: Replace hardcoded narrative prose with **LLM-generated text at runtime**. The game engine remains fully deterministic — it decides WHAT happens (casualties, state changes, outcome tiers). The LLM decides HOW to describe it, informed by the full game state, soldier roster, relationships, and tone guide.

## 2. What This Enables

### Dynamic character reactions
When Kowalski (BAR gunner) dies, the narrative doesn't say "you lose a man." It says Big Tom picks up the BAR without a word — because the relationship map knows they're a team. Henderson's voice changes when Doyle (the kid he trained) goes down. Malone goes quiet when Caruso (his Brooklyn rival/friend) is hit.

### State-aware narrative
- The LLM knows exactly who died (from the casualty assignment system)
- It knows the traits of living soldiers (coward Palmer freezing, green Ellis panicking)
- It knows the time, the readiness level, the morale — and weaves them in
- It knows what the 2IC would say based on veteran vs. green competence

### Emergent storytelling
Same scenario, different roster state = completely different narrative. The player's story is unique to their playthrough in a way hardcoded text can never achieve. This is the roguelike loop amplified — not just "I know Ellis freezes" but "this time Henderson wasn't there to steady him, and it went differently."

### Reduced content authoring
Scene files go from ~500 words of prose per outcome to a ~50-word context seed. The LLM expands it. Content authors focus on game design (decisions, tiers, state changes, branching) not copywriting.

## 3. Architecture

### Three layers (bottom two exist, top one is new)

```
┌─────────────────────────────────────────────┐
│  NARRATIVE LAYER (new)                      │
│  LLM generates text from state + context    │
│  • Scene narrative                          │
│  • Outcome descriptions                     │
│  • 2IC commentary                           │
│  • Soldier reactions (via relationships)    │
│  • Death reports / epilogues                │
├─────────────────────────────────────────────┤
│  GAME ENGINE (exists, unchanged)            │
│  Deterministic: tiers, dice, casualties     │
│  • Who dies (weighted by role + traits)     │
│  • State changes (men, ammo, morale...)     │
│  • Phase transitions                        │
│  • Milestone tracking                       │
├─────────────────────────────────────────────┤
│  CONTENT STRUCTURE (exists, simplified)     │
│  Scene definitions still define:            │
│  • Decisions + tiers + state changes        │
│  • Branching (nextScene)                    │
│  • Rally events                             │
│  But NOT full narrative prose — replaced    │
│  by short context seeds for the LLM        │
└─────────────────────────────────────────────┘
```

### Scene file changes

**Before** (hardcoded prose):
```typescript
{
  narrative: "You hit the ground hard. The chute tangles in a hedgerow...",
  decisions: [{
    id: "use_cricket",
    text: "Use your cricket clicker to signal",
    tier: "sound",
    outcome: {
      success: { text: "Two clicks come back. Friendly...", menLost: 0, ... },
      partial: { text: "Silence. Then movement. Could be...", menLost: 0, ... },
      failure: { text: "A shout in German. You've been...", menLost: 0, ... },
    }
  }]
}
```

**After** (context seeds):
```typescript
{
  sceneContext: "Night landing. Alone in flooded Norman field. Chute tangled in hedgerow. Distant gunfire east. Movement heard to the north — unknown if friend or foe.",
  decisions: [{
    id: "use_cricket",
    text: "Use your cricket clicker to signal",
    tier: "sound",
    outcome: {
      success: { context: "Cricket response received. Friendly contact.", menLost: 0, ... },
      partial: { context: "No response. Ambiguous. Tension.", menLost: 0, ... },
      failure: { context: "German challenge shouted. Position compromised.", menLost: 0, ... },
    }
  }]
}
```

The LLM receives the context seed + game state + roster + relationships + tone guide and generates the full narrative paragraph the player reads.

### Relationship map (new addition to roster)

```typescript
interface SoldierRelationship {
  soldierId: string;
  targetId: string;
  type: "protective" | "rivalry" | "brothers" | "depends_on" | "resents";
  detail: string;  // "Henderson trained Doyle personally at Toccoa"
}
```

Example relationships for the existing 18 soldiers:

| Soldier | → Target | Type | Detail |
|---|---|---|---|
| Henderson | Doyle | protective | Trained him personally. Promised his mother he'd bring him home. |
| Malone | Caruso | rivalry | Boston vs. Brooklyn. They argue about everything. Inseparable. |
| Kowalski | Big Tom | brothers | BAR team. Work as one unit. Big Tom carries Kowalski's extra ammo. |
| Park | Webb | depends_on | Park uses Webb as his eyes. Webb spots, Park shoots. |
| Rivera (Doc) | everyone | protective | Doc treats everyone. Losing Doc is losing hope. |
| Palmer | Malone | resents | Malone calls Palmer a coward to his face. Palmer hates him for it. |
| Doyle | Ellis | brothers | Both green, both scared. They stick together because nobody else will. |
| Washington | Henderson | rivalry | Washington's seen real danger. Respects Henderson but thinks he's too cautious. |

These are fed to the LLM as context. When something happens to a soldier, the LLM naturally references how connected soldiers react.

## 4. LLM Integration (decisions to make in next session)

### Which LLM provider?
Options to evaluate:
- **Cloudflare Workers AI**: Free tier available, runs at the edge, fits the existing Cloudflare infrastructure pattern. Lower model quality but zero cost to start.
- **OpenAI / Anthropic API**: Higher quality narrative but requires API key and costs per request. ~$0.01-0.05 per narrative generation.
- **Local/hybrid**: Pre-generate common narratives, use LLM only for state-dependent variations.

### Latency strategy
Text-based games have natural pacing. The player reads an outcome, then chooses. Generation time (1-3 seconds) could feel intentional — like the narrative is unfolding. But needs testing.

Options:
- **Streaming**: Text appears word by word (typewriter effect). Natural for this genre.
- **Loading state**: Brief "..." while generating, then full text appears.
- **Pre-fetch**: Start generating the next scene's narrative while the player reads the current one.

### System prompt design
The LLM needs a carefully crafted system prompt that includes:
- The tone guide from GAME_SPEC.md Section 12 (terse, military, present tense, second person)
- The current game state (5 core numbers)
- The full active roster with traits and statuses
- The relationship map for active soldiers
- The scene context seed
- The outcome context seed + state changes (who died, ammo spent, etc.)

### Fallback strategy
If the LLM is unavailable (API down, rate limited, no API key):
- Fall back to the existing hardcoded narrative text
- Or fall back to a simple template system: "[Outcome context]. [Casualty names] [status]. [State summary]."

### Cost model
Rough estimate for a full playthrough (30 scenes × ~3 LLM calls per scene):
- ~90 API calls per playthrough
- At ~500 tokens per call: ~45K tokens per playthrough
- At GPT-4o-mini prices: ~$0.005 per playthrough (essentially free)
- At Claude Sonnet prices: ~$0.15 per playthrough (acceptable)

## 5. What Exists Today vs. What Changes

### Unchanged (keep as-is)
- Game engine: outcomeEngine.ts, gameState.ts, battleOrders.ts
- Casualty assignment system (role weighting, trait multipliers, captain risk)
- State model (GameState interface, 5 core numbers, phases)
- Scenario schema structure (decisions, tiers, nextScene branching)
- Achievement system, lesson system, milestone tracking
- UI components (StatusPanel, DecisionPanel, MainMenu, etc.)
- All existing tests

### Modified
- **Scene files** (src/content/scenarios/act1/*): Replace `narrative` and outcome `text` fields with `sceneContext` and outcome `context` seeds. Keep all mechanical fields (menLost, ammoSpent, moraleChange, etc.)
- **Roster** (src/engine/roster.ts or new file): Add relationship map
- **NarrativePanel.tsx**: Instead of displaying static text, calls the narrative service and streams/displays generated text
- **GameScreen.tsx**: Orchestrate LLM calls between engine processing and narrative display
- **DeathReport.tsx / EpilogueScreen.tsx**: Use LLM for personalized death/epilogue text

### New
- **Narrative service** (src/services/narrativeService.ts): Handles LLM API calls, prompt construction, streaming, fallback
- **System prompt builder** (src/services/promptBuilder.ts): Constructs the full LLM prompt from game state + context + tone guide
- **Relationship data** (src/content/relationships.ts): The relationship map for all 18 soldiers
- **Environment config** (.cursor/environment.json): For Background Agent cloud VM setup
- **.env support**: API key for the LLM provider

## 6. Background Agents Workflow

Background Agents are the tool for building and testing this system. The workflow:

### Phase 1: Foundation
Set up `.cursor/environment.json` so Background Agents can run the game in the cloud. Add the LLM API key as a secret in the Cursor website settings.

### Phase 2: Build the narrative service
Launch a Background Agent to build the narrative service layer:
- narrativeService.ts (API calls, streaming, fallback)
- promptBuilder.ts (system prompt construction)
- relationships.ts (relationship map data)
- Integration with GameScreen.tsx

The agent demos the feature by playing a scene and capturing screenshots of generated narrative vs. old hardcoded text.

### Phase 3: Convert scene files
Launch Background Agents (potentially in parallel, one per scene) to convert existing scene files from hardcoded prose to context seeds. Each agent:
- Reads the existing narrative text
- Extracts the essential context (situation, key details)
- Rewrites the scene file with context seeds
- Plays the scene and screenshots the LLM-generated result
- Compares generated text quality to the original

### Phase 4: Playtest loop
Launch playtest agents that play every path and capture screenshots of the generated narrative. You review: Does it sound right? Does it reference the right soldiers? Does it match the tone guide? Iterate on the system prompt based on what you see.

### Phase 5: Polish + remaining content
With the narrative system proven on Act 1, expand to Acts 2-3. Writing new scenes is now faster — you write context seeds and state changes, not prose. Background Agents can help draft the content structure for remaining scenes.

## 7. Known Bugs to Fix First

Before building the narrative layer, these existing bugs should be fixed (they affect the engine that feeds the LLM):

1. **`menLost: -1` pattern** in scene03: Engine doesn't support negative menLost for gaining soldiers. Use rally events instead.
2. **Rally always fires** in scene04: Rally is scene-level but should be conditional on decision. Add skipRally flag or per-decision rally.
3. **Scene 6 → nonexistent scene 7**: All decisions point to act1_scene07 which doesn't exist. Game breaks here.
4. **Captain position score modifier missing**: calculateEffectiveScore doesn't apply +5/-5 for front/rear position. Only morale modifier works.

## 8. Open Questions for Next Session

1. **LLM provider choice**: Cloudflare Workers AI (free, lower quality) vs. OpenAI/Anthropic (paid, higher quality)? Or start with one and make it swappable?
2. **How much to pre-generate vs. generate live?** Could pre-generate common paths and only use live LLM for state-dependent variations.
3. **Caching**: Same state + same context = cache the result? Or always generate fresh for variety?
4. **Player-visible AI**: Should the player know the narrative is AI-generated? Or should it feel seamless?
5. **Relationship depth**: How many relationships per soldier? Should relationships evolve during a playthrough (e.g., two soldiers who survive combat together develop a bond)?
6. **2IC commentary**: Should the 2IC system be fully LLM-driven, or keep the trigger-based system with LLM-generated text?
7. **Wiki integration**: Should clickable wiki terms be detected by the LLM (it marks terms it uses) or by a post-processing step?

## 9. Success Criteria

The AI narrative system is successful when:
- A player can play through a scene and the narrative correctly names soldiers who died
- Soldiers react to each other's deaths based on relationships
- The tone matches the spec (terse, military, present tense, second person, no melodrama)
- Different playthroughs of the same scene produce meaningfully different narrative based on different roster states
- The system is fast enough that it doesn't break game pacing (< 3 seconds per generation)
- Background Agents can build, test, and iterate on this system without manual environment setup
