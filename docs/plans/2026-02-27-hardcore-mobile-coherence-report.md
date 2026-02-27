# Hardcore Mobile Coherence Report (AI Narrator Flow)

**Date:** 2026-02-27  
**Tester:** AI Cloud Agent  
**Branch:** `cursor/mobile-gameplay-coherence-40dd`

## Scope

- Hardcore gameplay coherence under free-text DM flow
- Mobile UI guardrails for touch targets and Hardcore plan UX
- Last playable stretch walkthrough ("last act" currently available in repo = Act 1 through Scene 07)

## Important Environment Note

The deployed build and local default config currently have `VITE_NARRATIVE_API_URL=""`, so no live external LLM endpoint is available in this environment.  
To still validate Hardcore coherence end-to-end, the run used the in-repo DM/outcome pipeline with deterministic AI-style evaluations (same mechanics path used by Hardcore mode in `GameScreen`).

---

## Bug Fixes Applied Before Demo

### 1) Midnight milestone coherence bug (fixed)

**Issue:** `end_operational_period` could be marked missed immediately due same-day time comparison.  
**Fix:** Added day-aware milestone timing:

- `GameState.day` added and tracked during time wrap
- `Milestone.dayOffset` added (`end_operational_period` uses `dayOffset: 1`)
- `checkMilestones` now compares absolute timeline minutes (`day * 1440 + hh:mm`)
- Added regression tests to lock behavior

**Outcome:** No early false "missed" milestone during Hardcore run.

### 2) Mobile regression coverage gap (fixed)

**Issue:** No automated test coverage for Hardcore mobile guardrails.  
**Fix:** Added `tests/integration/mobileHardcoreUi.test.ts`:

- Asserts Hardcore PlanPhase keeps free-text planning and hides reveal/decision shortcuts
- Asserts MainMenu Hardcore option renders structured name+description
- Asserts mobile CSS keeps 44px touch targets on key controls

---

## Verification Results

- ✅ `npm test` passed
- ✅ **18/18** test files
- ✅ **296/296** tests
- ✅ Hardcore deterministic stress demo script executed:
  - `npx tsx scripts/hardcoreStressDemo.ts`

---

## Live-Style Hardcore Demo Transcript (Fun Prompt Stress)

### Demo setup

- Mode: Hardcore
- Prompt style: creative/free-text with tactical constraints
- Execution path: DM-style free-text -> balance envelope -> outcome engine -> scene transition

### Scene-by-scene

1. **act1_landing**
   - Prompt: "I cut free first, whisper a gear roll call, and use AA arcs plus the steeple silhouette to set a calm northbound bearing before I move."
   - Result: `masterful`, roll 82, **success**
   - State: men 0, ammo 5, morale 39, readiness 12, time 0130

2. **act1_finding_north**
   - Prompt: "I pace by compass checks and hedgerow counting, marking turns with shallow knife cuts so we do not loop in the bocage."
   - Result: `excellent`, roll 61, **success**
   - State: men 0, ammo 12, morale 38, readiness 15, time 0150

3. **act1_first_contact**
   - Prompt: "One click challenge only. If response is wrong, fallback to Flash/Thunder. Weapon low but ready. Fold any friendly into rear security immediately."
   - Result: `excellent`, roll 78, **success**
   - State: men 0, ammo 13, morale 38, readiness 21, time 0205

4. **act1_the_sergeant**
   - Prompt: "Use clicker from hard cover, confirm voices, then quietly consolidate under Henderson with sectors and noise discipline."
   - Result: `masterful`, roll 71, **success**
   - State: men 3, ammo 24, morale 41, readiness 22, time 0220

5. **act1_the_patrol** *(Fun Prompt stress case)*
   - Prompt: **"Operation Midnight Accordion"** — Malone left through canal, Henderson base fire, trigger L-ambush when Feldwebel hunches over papers, no heroics.
   - Result: `masterful`, roll 89, **success**
   - State: men 3, ammo 31, morale 43, readiness 32, time 0240

6. **act1_the_farmhouse**
   - Prompt: "Porch clicker first. No grenades until positive ID. Then controlled stack clear and immediate med/ammo triage inside."
   - Result: `excellent`, roll 69, **success**
   - State: men 5, ammo 49, morale 47, readiness 33, time 0255

7. **act1_scene07** *(last playable scene / walkthrough endpoint)*
   - Prompt: "Send paired scouts with hand signals, cross in bounds only after wire is confirmed cold, keep everyone below hedge line to avoid silhouette."
   - Result: `excellent`, roll 69, **success**
   - State: men 5, ammo 49, morale 48, readiness 35, time 0315
   - Next scene reference: `act2_scene01` (not yet authored in repo)

---

## Last-Act Walkthrough Coherence Verdict

For the currently authored campaign slice (Act 1 -> Scene 07), Hardcore free-text flow is coherent and fun:

- No decision buttons/reveal shortcuts used in Hardcore
- Tactical prompts map cleanly into consistent state evolution
- "Fun prompt" remained thematic and did not break tone
- Final approach scene remains internally consistent with prior prep choices
- Milestone state stayed coherent (no false misses)

---

## Recommended Next Step

If you want a true external LLM "live" Hardcore demo (instead of deterministic in-repo DM harness), set a reachable `VITE_NARRATIVE_API_URL` and access code in this environment, then rerun:

```bash
npx tsx scripts/hardcoreStressDemo.ts
npm test
```

and additionally run an interactive browser pass against that configured endpoint.
