# QA Report: Medium Difficulty + AI Narration Playtest

**Date**: February 26, 2026
**Tester**: AI Agent (Claude)
**Build**: Local dev (Vite 7.3.1, port 5174)
**Mode**: Medium difficulty, AI Narration (access code: NORMANDY-2024)
**Playthroughs**: 2 (one death, one extended to Scene 5)

---

## Summary

The game is **playable and impressive** in Medium difficulty with AI narration. The AI narrator produces high-quality, contextually appropriate text. The DM layer correctly handles absurd, suicidal, creative, and tactical inputs. Zero JavaScript errors were observed across both playthroughs.

However, there is **one critical bug** (rally timing) and several minor issues.

---

## CRITICAL BUGS

### BUG-1: Rally Event Timing Mismatch (Rally Narrative Before Game State Update)

**Severity**: Critical
**Location**: `src/engine/outcomeEngine.ts` (lines 302-317) vs `src/components/GameScreen.tsx` (lines 349-364)

**Description**: Rally soldiers appear in narrative text one full scene before they appear in the game state. The rally narrative is generated on scene N entry (`nextScene.rally` in `proceedToNextScene`), but the outcome engine processes rally soldiers on scene N exit (`scene.rally` in `resolveOutcome`).

**Steps to reproduce**:
1. Play through Scenes 1-3 with any orders
2. On Scene 4 entry, the rally narrative shows Henderson, Malone, and Doyle joining
3. Check the roster — still shows "No soldiers rallied yet"
4. The status bar still shows "ALONE"
5. If the player references these soldiers in their Scene 4 orders, the outcome AI correctly says "No Henderson. No Malone" — contradicting the rally text shown moments earlier
6. Only after completing Scene 4 and entering Scene 5 do the soldiers appear in the roster (MEN: 3)

**Impact**: Players see vivid narrative of soldiers arriving, then discover those soldiers don't exist when they try to give them orders. Creates a jarring narrative contradiction where the AI outcome says "you're giving commands to ghosts" right after the rally narrative showed them joining.

**Root cause**: The `proceedToNextScene` function generates rally narrative from `nextScene.rally`, while the `resolveOutcome` function in the outcome engine processes rally state changes from `scene.rally`. These refer to different scenes — rally narrative shows early, state updates late.

**Fix suggestion**: Process the rally in the game state when entering the scene (during `proceedToNextScene`), not when exiting it. Or defer the rally narrative to show after the outcome of the scene where the rally is defined.

---

## MINOR BUGS

### BUG-2: Difficulty Button Text Concatenation

**Severity**: Low (cosmetic)
**Location**: `src/components/MainMenu.tsx`

**Description**: The difficulty buttons display text like "EASYDECISIONS VISIBLE. NO AI REQUIRED." and "MEDIUMWRITE YOUR OWN ORDERS. 5 REVEAL TOKENS." — the difficulty name and description run together without spacing.

**Expected**: The difficulty name should be on its own line or visually separated from the description. This appears to be a CSS issue where the `<span>` elements for name and description are rendered inline without spacing.

### BUG-3: Interlude Text References Characters Not Yet Rallied

**Severity**: Medium (narrative inconsistency, related to BUG-1)
**Location**: Scene transition interludes in scenario files (e.g., `scene04_the_sergeant.ts`)

**Description**: The hardcoded interlude text between Scene 3 and Scene 4 says "HENDERSON POSTS SECURITY WHILE THE NEW ARRIVALS CATCH THEIR BREATH" — but Henderson hasn't been rallied yet. The interlude text assumes soldiers are present when the game state still shows "ALONE."

**Impact**: The interlude text is a static string that doesn't respect the current game state. When the AI narrator expands on this interlude, it further reinforces the false presence of soldiers.

### BUG-4: Predefined Decision Skips Assessment Phase

**Severity**: Low (design inconsistency)
**Location**: `src/components/GameScreen.tsx`

**Description**: In Medium mode, when the player writes free-text orders, they go through the full flow: "Your Plan" → "Evaluating..." → "Your Assessment" → "Revise Plan / Execute". But when the player uses a reveal token and clicks a predefined decision, the assessment/briefing phase is completely skipped — it goes straight to the outcome.

**Impact**: Inconsistent UX. The "Revise Plan" option is only available for free-text input. Players who reveal decisions lose the opportunity to reconsider before executing.

---

## OBSERVATIONS (Not Bugs)

### AI Narrator Quality: Excellent

- **Absurd input handling**: "I want to order a pizza and wait for delivery" → AI wrote "You mutter something about pizza and phones. The black water laps at your chest..." Gracefully converted nonsense into doing nothing.
- **Suicidal input handling**: Correctly resulted in KIA. The death narrative was vivid and appropriate.
- **Creative input handling**: Speaking German to an unknown figure was handled with nuance — the AI adapted the scene perfectly.
- **Game state awareness**: The AI correctly referenced game state (ALONE status) even when the player's orders referenced non-existent soldiers. The "giving commands to ghosts" response was exceptional.

### DM Layer Evaluation: Working Correctly

- The DM correctly classified absurd input as low-tier
- Suicidal actions (screaming, firing in the air) correctly resulted in death
- Smart tactical orders resulted in positive outcomes (morale boost)
- The evaluation pipeline (Evaluating... → assessment → execute) works smoothly

### Resource System: Functioning

- Time advances correctly between scenes (15-20 min per scene)
- Morale responds to action quality (pizza → -7 morale, smart order → +4 morale)
- Enemy readiness increases over time and in response to player actions (speaking German → huge readiness spike from CONFUSED to ALERTED)
- Ammo barely changes in early scenes (expected — solo/small squad)

### UI Elements: Working

- **Orders panel**: Shows battle orders, mission timeline, milestones correctly
- **Roster panel**: Shows empty state correctly when alone, populates after rally
- **Wiki panel**: Categories, unlocked/locked entries, meta-progression across playthroughs all working
- **Reveal tokens**: Correctly decremented (5 → 4), revealed 4 decisions, button disappeared after use
- **Achievement popup**: "Lessons of War" achievement appeared on death screen
- **Streaming text**: AI-generated text streams in smoothly with "..." → "Continue..." transition
- **Status bar**: All resources display correctly with color-coded values

### Console: Zero Errors

No JavaScript errors, warnings, or unhandled exceptions were observed across both playthroughs. Only standard Vite HMR logs and React DevTools suggestion.

### Meta-Progression: Working

- Lessons unlocked in playthrough 1 (Assess Before Acting, Dead Reckoning) carried over to playthrough 2
- Achievement gallery appears on main menu after earning achievements
- Wiki entries persist across runs

---

## TEST SCENARIOS EXECUTED

| # | Input Type | Orders Given | Expected Behavior | Actual Behavior | Result |
|---|-----------|-------------|-------------------|-----------------|--------|
| 1 | Absurd | "Order a pizza, check phone for Uber" | DM should handle gracefully | AI narrated "muttering about pizza" while freezing | PASS |
| 2 | Suicidal | "Fire pistol in air, scream in English" | Should result in death | Correctly killed, vivid death narrative | PASS |
| 3 | Smart tactical | "Cut chute, find rifle, hedgerows, cricket signals" | Should be rated well | Morale boosted, good narrative | PASS |
| 4 | Reveal token | Clicked "Reveal Decisions" | Should show hidden decisions, cost 1 token | 4 decisions revealed, token 5→4 | PASS |
| 5 | Predefined click | "Head toward the gunfire" | Should execute decision | Executed but skipped assessment | PARTIAL |
| 6 | Creative/weird | Speaking German to unknown figure | DM should evaluate creatively | Excellent narrative, enemy readiness spiked | PASS |
| 7 | Orders referencing ghost soldiers | "Tell Henderson to set up perimeter" | Should handle absent soldiers | AI said "giving commands to ghosts" — perfect | PASS |
| 8 | Panel checks | Orders, Roster, Wiki buttons | All should work | All functional, correct data | PASS |

---

## PRIORITY RECOMMENDATIONS

1. **FIX BUG-1 immediately** — rally timing mismatch breaks the core narrative experience in Medium mode. The "giving commands to ghosts" contradiction is the most confusing player experience in the game.
2. **Fix BUG-3** alongside BUG-1 — interlude text should be conditional on game state or the rally should be processed earlier.
3. **Fix BUG-2** — easy CSS fix for button text spacing.
4. **Consider BUG-4** — decide if predefined decisions should also go through the assessment phase for consistency.
