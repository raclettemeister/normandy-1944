# Playthrough Verification — 2026-02-27 (Post-fix)

Mode traced: **hardcoded fallback mode** (`VITE_NARRATIVE_API_URL` unset).

Deterministic full Act 1 path (all 7 scenes):

1. `act1_landing` → `landing_check_gear`
2. `act1_finding_north` → `north_compass_terrain`
3. `act1_first_contact` → `contact_click_once`
4. `act1_the_sergeant` → `sergeant_clicker`
5. `act1_the_patrol` → `patrol_l_ambush`
6. `act1_the_farmhouse` → `farmhouse_stack_clear`
7. `act1_scene07` → `road_scouts_forward`

Result: coherent 7-scene run, no unresolved narrative/mechanics contradictions on this path.

---

## Scene 1 → 2 transition

- Outcome deltas: men `+0`, ammo `+0`, morale `+5`, readiness `+1`, time `+15m`
- State after: `men 0, ammo 5, morale 45, readiness 11, time 0130`
- Next scene setup: orientation under darkness after gear check (consistent)

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 2 → 3 transition

- Compass continuity fixed: Scene 2 now uses compass-aware fallback (`narrativeAlt.hasCompass`) when intel is present.
- Outcome deltas: men `+0`, ammo `+0`, morale `+5`, readiness `+2`, time `+20m`
- State after: `men 0, ammo 5, morale 50, readiness 13, time 0150`

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 3 → 4 transition

- `menGained` now creates an attached trooper in roster (`attached_1`), so men count and character presence are aligned.
- Outcome deltas: men `+1`, ammo `+0`, morale `+5`, readiness `+1`, time `+15m`
- State after: `men 1, roster [attached_1], time 0205`
- Interlude bridge now exists into Scene 4 (movement/tension beat).

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 4 → 5 transition

- Rally logic remains coherent on this branch: attached trooper + Henderson/Malone/Doyle = `men 4`.
- Outcome deltas: men `+3`, ammo `+10`, morale `+16`, readiness `+1`, time `+15m`
- State after: `men 4, ammo 15, morale 71, readiness 15, time 0220`
- Interlude bridge into Scene 5 now present (shift from rally to patrol action).

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 5 → 6 transition

- Ammo semantics fixed: ambush now spends ammo (`ammoSpent: 8`), no inverted gain.
- Outcome deltas: men `+0`, ammo `-8`, morale `+8`, readiness `+7`, time `+20m`
- State after: `men 4, ammo 7, morale 79, readiness 22, time 0240`
- Narrative and mechanics now match (successful ambush at real ammo cost).

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 6 → 7 transition

- Ammo semantics fixed in farmhouse outcomes (`ammoSpent` positive for expenditure).
- Outcome deltas (including rally): men `+2`, ammo `+13` (spend 2, then rally +15), morale `+12`, readiness `+3`, time `+15m`
- State after: `men 6, ammo 20, morale 91, readiness 25, time 0255`
- Interlude bridge into final road scene now present.

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Scene 7 → Act end transition

- Outcome deltas: men `+0`, ammo `+0`, morale `+8`, readiness `+2`, time `+20m`
- State after: `men 6, ammo 20, morale 99, readiness 27, time 0315`
- Milestone `rally_complete` achieved; Act 1 endpoint reached cleanly in this build.

| §1 | §2 | §3 | §4 | §5 | §6 | §7 |
|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS | PASS | PASS | PASS |

---

## Verification gate

- **0 FAIL across all 7 scenes and all 7 SPEC sections in this traced run.**
- Regression check: `npm test` passes (**287/287**).

