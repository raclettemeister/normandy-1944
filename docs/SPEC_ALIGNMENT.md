# Spec alignment — playthrough experience

This file defines **what good looks like** for the playthrough experience. AI workers (and reviewers) use it together with playthrough traces in [playthroughs/](playthroughs/) to fix narrative and flow: read a trace, check steps against the criteria below, then change code so the next run passes.

---

## 1. Act 1 tone

**Spec reference:** GAME_SPEC §2b Act 1 — The Drop.

**Intended experience:** First act is disorientation, procedure, building the unit — not action hero.

**Success criteria:**
- Early scenes emphasize navigation, recognition, gear check.
- Narrative never presents the player as invincible.
- First firefight feels consequential, not routine.

---

## 2. Storyline continuity

**Spec reference:** GAME_SPEC §3 (game state, roster), narrative flow.

**Intended experience:** What happened before is reflected in what the game says and does next.

**Success criteria:**
- Scene N+1 narrative and options don't contradict scene N outcome (e.g. men lost, intel gained).
- Recap/context (briefing, interlude) matches last outcome.
- Character mentions (2IC, roster) stay consistent with who's alive/wounded.

---

## 3. Five numbers clarity

**Spec reference:** GAME_SPEC §3 — Game state model, the 5 core numbers.

**Intended experience:** Player always knows men, ammo, morale, readiness, time and why they changed.

**Success criteria:**
- Status panel always visible and correct after each step.
- Outcome text or follow-up explains resource deltas in plain language.
- No "random" swing without narrative or mechanical explanation.

---

## 4. Time & orders

**Spec reference:** GAME_SPEC §2 (Battle Orders), §3 (time), §4 (readiness).

**Intended experience:** Clock and OPORD drive tension; player plans by checking orders and time.

**Success criteria:**
- Time advances sensibly with actions; no jumps without explanation.
- Orders accessible and accurate.
- Being late isn't unexplained "sudden difficulty" — cause is traceable (e.g. readiness, missed milestone).

---

## 5. Narrative ↔ mechanics

**Spec reference:** GAME_SPEC §6 (outcome engine), narrative system.

**Intended experience:** Text matches the outcome (tier, casualties, transition).

**Success criteria:**
- Tone of narrative matches tier (e.g. "sound" ≠ "disaster").
- Casualties and who's hit are reflected in narrative.
- Next scene setup (location, situation) matches transition logic.

---

## 6. Pacing

**Spec reference:** GAME_SPEC tactical cycle (briefing → plan → prep → execution), interludes.

**Intended experience:** Beats have rhythm: situation → plan → prep → execution → consequence, then repeat.

**Success criteria:**
- Phases (briefing / plan / prep / execution) are distinguishable.
- Interludes separate scenes and state "what we're doing next."
- No back-to-back identical phases without clear reason.

---

## 7. LLM fallback

**Spec reference:** GAME_SPEC AI narrative system, fallback behavior.

**Intended experience:** If AI narrative is off or missing, fallback text is consistent and non-broken.

**Success criteria:**
- Fallback exists for every narrative slot.
- Fallback text is coherent with scene and outcome.
- No empty or placeholder text shown to player.
