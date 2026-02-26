# Stress Report: Hardcore Difficulty — Storyline Playthrough

**Date**: February 26, 2026
**Tester**: AI Agent (Claude)
**Build**: Local dev (Vite 7.3.1, port 5176)
**Mode**: Hardcore difficulty, AI Narration (access code: NORMANDY-2024)
**Playthroughs**: 2 (one deliberate death via suicidal input, one extended through Scene 2)
**Method**: Systematic debugging — code analysis + live browser testing
**Test suite**: 288/288 tests passing before testing

---

## Summary

The hardcore mode is **functional and produces exceptional DM-generated narrative**. The core loop works: free-text prompt → DM evaluation → briefing → execution → next scene. Zero JavaScript errors across both playthroughs. The DM handles tactical input, absurd input, and adversarial input correctly.

However, there are **two critical code bugs** (one could break hardcore entirely on DM failure), **three medium issues** (UX gaps that weaken the hardcore experience), and **two design-level concerns** that should be evaluated before going live.

---

## CRITICAL BUGS

### HC-1: forcedEasyMode Overrides Hardcore on DM Failure

**Severity**: Critical
**Location**: `src/components/GameScreen.tsx:444-449` and `469-473`

**Description**: When the DM Layer is unavailable (no LLM connection) or returns a malformed/null evaluation, the handler sets `forcedEasyMode = true`. Line 807 then passes `difficulty="easy"` to `PlanPhase`:

```807:807:src/components/GameScreen.tsx
difficulty={forcedEasyMode ? "easy" : difficulty}
```

In PlanPhase, `difficulty === "easy"` causes `showDecisions = true` (line 45) and `showPromptInput = false` (line 55). This means:
- All predefined decision buttons appear
- The free-text prompt input disappears
- The hardcore contract is completely broken

**Root cause**: The fallback logic in `handleSubmitPrompt` doesn't distinguish between difficulty levels. It applies the same "show decisions" fallback to all three modes.

```437:491:src/components/GameScreen.tsx
// Lines 444-449:
if (!dmLayer) {
  setFallbackMessage("Fall back on training, Captain.");
  setForcedEasyMode(true);  // ← breaks hardcore
  setCurrentPhase("plan");
  setProcessing(false);
  return;
}
// Lines 469-473:
if (!evaluation) {
  setFallbackMessage("Fall back on training, Captain.");
  setForcedEasyMode(true);  // ← breaks hardcore
  setProcessing(false);
  return;
}
```

**Steps to reproduce**: Disconnect from the API mid-game in hardcore mode, or trigger a malformed LLM response. The plan phase will show all decision buttons.

**Not reproduced live** — the DM was responsive during testing. Confirmed through code analysis only.

**Fix options**:
1. Guard the override: `difficulty={forcedEasyMode && difficulty !== "hardcore" ? "easy" : difficulty}`
2. In hardcore, show an error + retry instead of falling back to decisions: "Comms down, Captain. Try again." with a retry button and the prompt preserved.

**Recommendation**: Option 2. Hardcore should never show decisions, period. Show an error, let the player retry. If the DM is persistently down, offer to restart at the main menu — but never reveal decisions.

---

### HC-2: BriefingPhase Hardcodes "Henderson:" Regardless of Actual 2IC

**Severity**: Critical (becomes critical when Henderson dies, which is common in extended playthroughs)
**Location**: `src/components/BriefingPhase.tsx:49`

**Description**: The briefing phase always renders the 2IC reaction with the label "Henderson:" — even if Henderson has been killed and replaced by another soldier via `promoteToSecondInCommand`.

```47:52:src/components/BriefingPhase.tsx
{hasSecondInCommand && secondInCommandReaction && (
  <div className="briefing-reaction briefing-reaction--2ic">
    <span className="briefing-reaction__speaker">Henderson:</span>
    <span className="briefing-reaction__text">{secondInCommandReaction}</span>
  </div>
)}
```

Additionally, the DM prompt (`promptBuilder.ts:313`) instructs the LLM to generate "Henderson's in-character reaction" — even when the 2IC is someone else.

**Impact**: After Henderson dies (common in combat scenes 5+), the briefing shows a dead man's name speaking. The DM also generates text in Henderson's voice for a character who's no longer alive. This breaks immersion and creates narrative contradictions.

**Root cause**: The component and the DM prompt both hardcode "Henderson" instead of reading the current 2IC identity from game state.

**Fix**: Pass `secondInCommand` from `gameState` to BriefingPhase. Use `secondInCommand.soldier.name` for the speaker label. Update the DM prompt to use the current 2IC name and competence level.

---

## MEDIUM BUGS

### HC-3: No Outcome Narrative Streaming in DM Path

**Severity**: Medium (UX quality gap)
**Location**: `src/components/GameScreen.tsx` — `handleBriefingCommit` (lines 505-664) vs `handleDecision` (lines 281-308)

**Description**: In easy mode (button click), the outcome narrative streams with a typewriter effect via `narrativeService.generateOutcomeNarrative()`. In hardcore mode (DM evaluation), the outcome text appears **instantly** — `setOutcomeText(dmEvaluation.narrative)` on line 623 sets it all at once with no streaming.

**Pattern comparison**:
- `handleDecision` (line 281-308): Checks for LLM mode → calls `generateOutcomeNarrative` with `onChunk` streaming → sets `isStreaming = true` → typewriter effect
- `handleBriefingCommit` (line 623): `setOutcomeText(dmEvaluation.narrative)` — no streaming, no onChunk, isStreaming stays false

**Impact**: Hardcore outcomes appear as a block of text instantly, while easy mode gets the immersive streaming reveal. The typewriter effect is one of the strongest atmospheric elements — losing it in the mode where immersion matters most is a UX regression.

**Fix options**:
1. Simulate streaming for DM narratives (reveal characters/words progressively on the client side)
2. Pass the DM narrative through `generateOutcomeNarrative` for expansion + streaming (adds LLM cost but richer outcomes)
3. Accept it as intentional (DM wrote the narrative already, no re-narration)

**Recommendation**: Option 1. Client-side streaming simulation. Zero LLM cost, preserves the atmospheric typewriter effect. The DM narrative is already good — just reveal it progressively.

---

### HC-4: Empty Briefing Phase in Solo Scenes (Scenes 1-4)

**Severity**: Medium (design gap, not a code bug)
**Location**: `src/components/BriefingPhase.tsx:29-63`

**Description**: In solo scenes (scenes 1-4), the player is ALONE — no soldiers, no 2IC. The BriefingPhase correctly shows "Your Assessment" instead of "Team Briefing" and correctly hides the reactions section (`hasReactions` is false). But this means the briefing phase shows **only**:
- Your orders echoed back
- "Revise Plan" and "Execute" buttons

There is **zero feedback** on plan quality. The design document says "Henderson's reaction serves as indirect tier feedback" — but in solo scenes, there IS no Henderson. The player must decide whether to execute based on seeing their own words echoed back, with no external signal.

**Live observation**: Tested on Scene 1 (Landing). After submitting a detailed tactical plan, the "Your Assessment" section showed only my orders text with Revise/Execute buttons. No indication whether the plan was brilliant or terrible.

**Impact**: In hardcore, the first 4 scenes are a blind experience. The player writes orders into a void and gets no signal until they see the outcome. This is arguably brutal in a good way (it's hardcore) — but it's worth deciding intentionally rather than leaving it as an accidental gap.

**Fix options**:
1. Accept as design (hardcore is meant to be unforgiving, solo means solo)
2. Add a brief self-assessment line from the DM: "Your instincts say this feels right." / "Something about this plan gnaws at you." — subtle tier-calibrated feedback even when alone
3. Show the DM's `reasoning` field in the briefing (currently available in `dmEvaluation.reasoning` but never displayed)

**Recommendation**: Option 2 or 3. Even solo officers have instincts. A single-sentence internal monologue would give the player just enough signal without breaking hardcore purity.

---

### HC-5: DM Fatal Flag Narrative Contradiction

**Severity**: Medium (narrative inconsistency)
**Location**: DM prompt system → `promptBuilder.ts:246-252` and `GameScreen.tsx:518-528`

**Description**: Tested with suicidal input "I shoot myself with my pistol." The DM returned `fatal: true` but generated a narrative where the character **survives**: "You draw your M1911 and press the barrel to your temple. The cold metal trembles against your skin. Your finger finds the trigger. This is not the way a paratrooper dies. This is not the way any soldier dies. You lower the weapon, hands shaking."

The game engine checks `dmEvaluation.fatal` and triggers "KILLED IN ACTION" — but the narrative says you lived.

**Root cause**: The DM prompt's adversarial rules say "Deliberate team-kill or betrayal → fatal: true. Game over." Self-harm falls into a gray area. The DM produced a creative, nuanced narrative (character stops themselves) that contradicts the mechanical fatal flag.

**Impact**: The death screen shows "KILLED IN ACTION" with text that says you survived. Player sees a contradiction.

**Fix**: Add explicit guidance to the DM prompt for self-harm scenarios: "If fatal: true, the narrative MUST describe the fatal outcome. Do not write a survival narrative with fatal: true."

---

## OBSERVATIONS (Not Bugs)

### Scenes 1-4 Have No prepActions — Hardcore Player Gets No Intel

Scenes 1-4 have no `prepActions` arrays. Only scenes 5 (The Patrol) and 6 (The Farmhouse) have prep actions. This means in hardcore mode, for the first 4 scenes the player goes directly from reading the situation narrative to writing orders — with no way to ask questions or gather additional intel.

This is partially by design (you're alone, there's nobody to ask). But it means the hardcore player's only source of information is the ~80-word scene narrative. The DM prompt includes anchor decisions for calibration, but the player can't see those.

**Not a bug** — a content gap. Future scenes should all have prepActions if they have any element the player could investigate. Even solo scenes could have internal monologue prep actions: "Think about what you learned in training" → triggers a tactical memory relevant to the scene.

### DM Narrative Quality: Exceptional

- Scene 1 (gear check): "Systematic pat-down reveals your .45 secure, two fragmentation grenades intact, compass functional. The AA tracers paint northeast — church steeple stands black against the gun flashes two clicks north." — Military-precise, situationally aware, references the player's plan.
- Scene 2 (AI-generated scene narrative): Rich atmospheric text about bocage country, hedgerows, artillery rumble.
- Suicidal input: The DM generated a powerful, in-character narrative (despite the fatal flag issue).

### State Management: Correct

- Morale, ammo, readiness, time all update correctly between scenes
- Difficulty is correctly set to "hardcore" and persists
- No reveal tokens shown in UI (correct — hardcore has 0)
- Phase transitions work: situation → plan → briefing → execution → Continue → interlude → next scene

### Interludes: Working

- AI-generated interlude text between scenes is atmospheric and well-connected to previous/next scenes
- Beat text, objective reminder, and Continue button all render correctly

### Console: Zero Errors

No JavaScript errors, unhandled exceptions, or warnings across both playthroughs. Only standard Vite HMR logs, React DevTools suggestion, and i18next informational message.

### Pre-existing Bug (from Medium QA Report)

BUG-2 (button text concatenation) is still present on the main menu. Difficulty buttons display "HardcoreNo decisions. No tokens. Lead or die." without spacing between name and description. This is a CSS issue, not hardcore-specific.

---

## TEST SCENARIOS EXECUTED

| # | Scene | Input Type | Orders Given | Expected Behavior | Actual Behavior | Result |
|---|-------|-----------|-------------|-------------------|-----------------|--------|
| 1 | Landing | Tactical | "Cut parachute lines, check gear, orient north" | DM rates well, positive narrative | Excellent narrative, gear found, orientation gained | PASS |
| 2 | Landing | Suicidal | "I shoot myself with my pistol" | Fatal → Game Over | Fatal triggered, but narrative contradicts death | PARTIAL (HC-5) |
| 3 | Finding North | Tactical | "Check gear, orient using AA fire, look for landmarks" | Sound plan, advance normally | Good narrative, morale stable, scene transitions | PASS |
| 4 | All | Briefing solo | (any orders) | Some feedback on plan quality | Empty briefing — only orders echoed back | PARTIAL (HC-4) |
| 5 | All | Phase flow | situation → plan → briefing → execute | Correct phase progression | Correct | PASS |
| 6 | Menu | DM failure | (not tested — DM was online) | Should NOT show decisions in hardcore | Code analysis: forcedEasyMode overrides hardcore | FAIL (HC-1) |
| 7 | All | Streaming | Execute orders | Typewriter effect on outcome | Instant text block — no streaming | PARTIAL (HC-3) |
| 8 | Menu | Button text | View difficulty buttons | Properly spaced text | Text concatenated | KNOWN (BUG-2) |

---

## PRIORITY RECOMMENDATIONS

1. **FIX HC-1 immediately** — forcedEasyMode overriding hardcore is the single most critical bug. If the DM fails even once, hardcore turns into easy mode. The fix is a one-line guard OR a dedicated retry flow for hardcore.

2. **FIX HC-2 before Henderson can die** — BriefingPhase + DM prompt both hardcode "Henderson." This becomes critical the moment the player reaches combat scenes where Henderson can be killed. Fix the component AND the prompt.

3. **FIX HC-5 (DM prompt)** — Add explicit guidance that `fatal: true` narratives must describe fatal outcomes. One line in the prompt.

4. **Consider HC-3 (streaming)** — Client-side streaming simulation for DM narratives would significantly improve hardcore atmosphere. Low effort, high impact.

5. **Consider HC-4 (solo briefing)** — Decide intentionally whether solo scenes should have zero feedback. If the answer is "yes, that's hardcore," document it. If "no," add a self-assessment line.

---

## INVESTIGATION METHOD

### Phase 1: Root Cause Investigation
- Read all critical files: `GameScreen.tsx` (878 lines), `PlanPhase.tsx`, `BriefingPhase.tsx`, `FreeTextInput.tsx`, `dmLayer.ts`, `promptBuilder.ts`, `outcomeEngine.ts`, `balanceEnvelope.ts`
- Traced the complete code path for hardcore: MainMenu → GameScreen (difficulty prop) → createInitialStateWithDifficulty → situation → plan (PlanPhase with difficulty="hardcore") → handleSubmitPrompt → DMLayer.evaluatePrompt → briefing → handleBriefingCommit → processSceneTransition
- Compared against easy and medium code paths to identify divergences
- Ran full test suite (288/288 passing)
- Checked all 7 scene files for prepActions availability and nextScene routing

### Phase 2: Pattern Analysis
- Compared `handleDecision` (easy mode path) vs `handleBriefingCommit` (DM path) line by line
- Identified streaming gap (handleDecision streams, handleBriefingCommit doesn't)
- Identified fallback gap (forcedEasyMode applies to all difficulties)
- Verified PlanPhase correctly hides decisions/tokens for hardcore when difficulty isn't overridden

### Phase 3: Live Testing
- Two full playthroughs in hardcore mode via browser automation
- Tested tactical input (Scene 1) → successful DM evaluation
- Tested suicidal input (Scene 2) → fatal flag + narrative contradiction
- Verified state management across scene transitions
- Verified interlude rendering
- Verified zero console errors

### Evidence Sources
- Code: `GameScreen.tsx:444-449, 469-473, 505-664, 807`
- Code: `BriefingPhase.tsx:49`
- Code: `PlanPhase.tsx:45-55`
- Code: `promptBuilder.ts:313`
- Screenshots: 7 screenshots captured across both playthroughs
- Console: Zero JS errors
