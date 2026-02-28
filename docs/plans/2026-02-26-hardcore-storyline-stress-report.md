# Hardcore AI Prompt Stress Report + Storyline Clarity Audit

**Date:** 2026-02-26  
**Mode requested:** Hardcore with AI access code `NORMANDY-2024`  
**Narrative endpoint used:** `https://normandy-narrative.old-morning-a434.workers.dev`

---

## 1) Goal

Stress-test the game in hardcore mode with personal prompting (including chaotic prompts), try to win, and determine whether the storyline is clear or confusing.

---

## 2) Environment checks

- Access code validation succeeds:
  - `POST /api/validate-code` → `{"valid":true}`
- Local test baseline is healthy:
  - `npm test` → **250 passed**

---

## 3) Critical runtime finding: DM JSON parse failure in hardcore flow

### Repro

Using the real endpoint with `DMLayer.evaluatePrompt(...)` on Scene 1 prompts:

- Tactical prompt: parse error → `NULL`
- Absurd prompt: parse error → `NULL`
- Violent prompt: parse error → `NULL`

Observed summary:

`DM parse summary: ok=0 fail=3`

### Why this matters

In the actual game UI flow, when DM evaluation returns `null`, the code falls back to easy-mode decisions for that scene (`fallbackMessage: "Fall back on training, Captain."` + forced easy display).  
So in current live behavior, hardcore personal prompting is effectively degraded immediately.

### Root cause signal

Model outputs are frequently non-JSON or malformed JSON despite JSON instructions (control chars, free text, broken object fragments).

---

## 4) Stress campaign execution (personal prompting)

Because the strict JSON DM response path failed repeatedly, I used a robust fallback harness to continue stress validation:

- same Worker endpoint + access code
- same scene data + same outcome engine
- per-scene prompt submitted in hardcore context
- tactical tier classified via strict one-word output (`suicidal|reckless|mediocre|sound|excellent|masterful`)
- deterministic seeded rolls for reproducible comparisons

### Run set

1. **A_TACTICAL_WIN_ATTEMPT** (serious command prompts)
2. **B_ABSURD_CHAOS** (pizza, mooing, theatrical nonsense)
3. **C_TYPOS_AND_CONTRADICTIONS** (misspellings + contradictory orders)
4. **D_SUICIDAL_BETRAYAL** (loud/self-destructive behavior)

### Results snapshot

| Run | End State |
|---|---|
| A_TACTICAL_WIN_ATTEMPT | Reached scene chain end (missing next scene), men 5, ammo 46, morale 48, readiness 42 |
| B_ABSURD_CHAOS | Reached scene chain end, men 2, morale 28, readiness 72 |
| C_TYPOS_AND_CONTRADICTIONS | Captain hit during patrol phase |
| D_SUICIDAL_BETRAYAL | All men down during patrol phase |

### Prompt robustness observations

- Tactical prompts were consistently rated around `sound/excellent`.
- Absurd and self-destructive prompts trended `suicidal/reckless` as expected.
- Typo-heavy prompts did not collapse completely but often downgraded quality and increased fatal outcomes.

---

## 5) Storyline continuity audit (clarity/confusion)

## Transition graph check

Implemented path:

`act1_landing -> act1_finding_north -> act1_first_contact -> act1_the_sergeant -> act1_the_patrol -> act1_the_farmhouse -> act1_scene07 -> act2_scene01`

Missing target:

- `act2_scene01` does not exist in current content set.

### Consequence

Campaign ends abruptly after Scene 7 with a pseudo-victory/missing-scene terminal behavior.  
So the **entire storyline is not currently present in executable content**.

---

## 6) Confusion points (severity-ranked)

## Critical

1. **Hardcore DM path breaks into fallback easy mode**
   - DM structured response parsing fails with real model output.
   - Core “prompting is gameplay” promise is unreliable.

2. **Storyline truncates after Act 1 Scene 7**
   - Scene points to missing `act2_scene01`.
   - Narrative arc feels unfinished/incomplete.

## Major

3. **Rally timing/narrative coherence risk remains in UI path**
   - `GameScreen` can surface scene rally narrative text before the corresponding state transition processing.
   - Can produce “characters are here in text, not yet in state” confusion.

4. **Scene 4 documents engine requirements that are not implemented**
   - Partial rally behavior variants
   - Per-decision time-cost overrides
   - Persistent captain wound flag
   - These mismatches can create expectation vs behavior drift.

5. **`menGained` logic can create ghost manpower**
   - Men count may increase without corresponding roster soldier objects.
   - Can desync narrative intuition from roster/capability reality.

## Minor

6. **2IC labeling can be misleading**
   - Briefing UI uses “Henderson:” label style even if command passed to replacement NCO.

---

## 7) Direct answer to “is storyline confusing?”

**Current verdict:** **Partially clear, but not fully coherent end-to-end.**

- Act 1 scene writing is strong and mostly understandable.
- But full storyline continuity is currently confusing because playable content stops early and key systems (hardcore DM path) degrade unexpectedly.

---

## 8) Recommended priority fixes

1. **Harden DM response parsing**
   - Add tolerant parser/extractor for JSON blocks.
   - Retry with “repair” pass when malformed.
   - Keep hardcore path from instant fallback.

2. **Complete/bridge missing Act 2 entry scene**
   - Add `act2_scene01` or temporary explicit “Act 1 complete” transition card.

3. **Align rally narrative timing with state updates**
   - Only display rally narrative once rally state has been applied, or apply rally on scene entry consistently.

4. **Implement or remove Scene 4 engine-note promises**
   - Avoid hidden behavior contracts in content that engine does not enforce.

