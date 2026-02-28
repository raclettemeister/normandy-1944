# Playthrough Trace + Spec Alignment — Design

**Goal:** Give batch AI workers enough "food" to fix the broken playthrough experience (narrative + flow tangled) using a structured playthrough trace and a spec-alignment doc, without a full upfront audit.

**Status:** Approved 2026-02-27.

---

## 1. Playthrough trace format

**Purpose:** One human (or one agent) records a single "bad" playthrough so workers have concrete evidence of what went wrong, in order.

**What we capture per step:**

| Field | Description |
|-------|-------------|
| **stepIndex** | 1, 2, 3… (order of events) |
| **sceneId** | e.g. `act1_landing`, `act1_sergeant` |
| **phase** | `solo` \| `squad` \| `platoon` (from game state) |
| **tacticalPhase** | `briefing` \| `plan` \| `prep` \| `execution` \| `interlude` (where in the cycle) |
| **playerAction** | Short summary: which decision was chosen (or "free text plan: …") |
| **outcomeSummary** | One line: what the engine did (e.g. "+2 men, -5 ammo, scene → act1_patrol") |
| **narrativeSnippet** | First ~100 chars of what the player saw (AI or fallback). Empty if N/A. |
| **stateAfter** | Snapshot of the 5 numbers: `{ men, ammo, morale, readiness, time }` |
| **issue** | Optional. If this step felt wrong: "narrative contradicted outcome", "transition felt abrupt", "unclear why we lost men", etc. |

**Format:** JSON file, one object per line (NDJSON) so it's easy to append and parse.

**Location:** `docs/playthroughs/` — e.g. `docs/playthroughs/2026-02-27-bad-run.ndjson` (one "reference bad run" to start).

**Relationship to existing code:** This is a **documentation/audit** artifact. The in-game `EventLog` / `PlaythroughEvent[]` stay as-is (they feed the DM and epilogue). The trace is a separate, hand- or script-generated log of one full run, aimed at diagnosis and alignment with the spec.

**Filling the first trace:** You (or an agent) play once, take notes in a spreadsheet or doc, then convert to NDJSON; or we add a minimal "export trace" that dumps `sceneId`, `outcomeSummary`, `stateAfter` and you add `issue` and `narrativeSnippet` by hand. Design assumes "first trace is manual/semi-manual"; export can be added later.

---

## 2. Spec alignment doc

**Purpose:** For each part of the intended experience (from the spec), we add 1–2 sentences that define "how we tell if we're there." Workers use this to know what "fixed" means and to check their changes against the spec.

**Location:** `docs/SPEC_ALIGNMENT.md` (single file; sections map to GAME_SPEC).

**Structure:** One block per theme. Each block has:
- **Spec reference** — e.g. "GAME_SPEC §2b Act 1", "§3 Game state / 5 core numbers"
- **Intended experience** — 1 sentence from or summarizing the spec
- **Success criteria** — 2–4 concrete, checkable conditions (player or reviewer can verify)

**Sections and criteria:**

| # | Spec area | Intended experience | Success criteria |
|---|-----------|---------------------|-------------------|
| 1 | **Act 1 tone** | First act = disorientation, procedure, building the unit; not action hero. | (1) Early scenes emphasize navigation, recognition, gear check. (2) Narrative never presents the player as invincible. (3) First firefight feels consequential, not routine. |
| 2 | **Storyline continuity** | What happened before is reflected in what the game says and does next. | (1) Scene N+1 narrative and options don't contradict scene N outcome (e.g. men lost, intel gained). (2) Recap/context (briefing, interlude) matches last outcome. (3) Character mentions (2IC, roster) stay consistent with who's alive/wounded. |
| 3 | **Five numbers clarity** | Player always knows men, ammo, morale, readiness, time and why they changed. | (1) Status panel always visible and correct after each step. (2) Outcome text or follow-up explains resource deltas in plain language. (3) No "random" swing without narrative or mechanical explanation. |
| 4 | **Time & orders** | Clock and OPORD drive tension; player plans by checking orders and time. | (1) Time advances sensibly with actions; no jumps without explanation. (2) Orders accessible and accurate. (3) Being late isn't unexplained "sudden difficulty"—cause is traceable (e.g. readiness, missed milestone). |
| 5 | **Narrative ↔ mechanics** | Text matches the outcome (tier, casualties, transition). | (1) Tone of narrative matches tier (e.g. "sound" ≠ "disaster"). (2) Casualties and who's hit are reflected in narrative. (3) Next scene setup (location, situation) matches transition logic. |
| 6 | **Pacing** | Beats have rhythm: situation → plan → prep → execution → consequence, then repeat. | (1) Phases (briefing / plan / prep / execution) are distinguishable. (2) Interludes separate scenes and state "what we're doing next." (3) No back-to-back identical phases without clear reason. |
| 7 | **LLM fallback** | If AI narrative is off or missing, fallback text is consistent and non-broken. | (1) Fallback exists for every narrative slot. (2) Fallback text is coherent with scene and outcome. (3) No empty or placeholder text shown to player. |

**Usage:** Workers doing "narrative consistency" use §2 and §5; "flow/UX" use §3, §4, §6; "AI/fallback" use §7. Everyone can run through a playthrough (or the trace) and tick the criteria.

---

## 3. Where workers find it

**3a) Repo layout**

- **Trace:** `docs/playthroughs/` — one file per reference run. Start with one, e.g. `docs/playthroughs/2026-02-27-bad-run.ndjson`. Optional: `docs/playthroughs/README.md` in 2–3 sentences: "NDJSON, one JSON object per line; each object = one step; see SPEC_ALIGNMENT for how to judge steps."
- **Alignment:** `docs/SPEC_ALIGNMENT.md` — single source of "what good looks like" for the experience.
- **Existing:** `docs/GAME_SPEC.md`, `docs/PROJECT_MAP.md`, `docs/workflows/`, `.cursor/rules/` stay as the main spec and architecture.

**3b) Worker onboarding (single doc)**

Add **`docs/AI_WORKER_BRIEF.md`** (one short doc that points to everything):

- **Goal:** Fix the playthrough experience (narrative + flow); make it consistent, clear, enjoyable; storyline and mechanics aligned.
- **Evidence of the problem:** `docs/playthroughs/` — at least one "bad run" trace with optional `issue` notes per step.
- **Definition of "good":** `docs/SPEC_ALIGNMENT.md` — use its sections as success criteria when changing narrative, flow, or logic.
- **Where things live:** Link to `docs/PROJECT_MAP.md` and `docs/GAME_SPEC.md` (and optionally "Spec §13" / file ownership if present).
- **How to work:** Run the game, change code, then re-check the trace (or a new run) against SPEC_ALIGNMENT; fix one area at a time (narrative vs flow vs fallback) to avoid tangling.

**3c) How trace + alignment are used**

- **Before changing code:** Read the bad-run trace and SPEC_ALIGNMENT; identify which alignment section(s) the trace fails (e.g. §2 storyline, §5 narrative↔mechanics).
- **When making changes:** Target those sections; e.g. "fix so narrative matches outcome" (§5), "fix so state and recap match" (§2).
- **After changes:** Replay (or generate a new trace) and check the same criteria; optional: add a "good run" trace to `docs/playthroughs/` later for regression.

No new folders beyond `docs/playthroughs/` and no change to existing file ownership; workers still respect GAME_SPEC §13 and PROJECT_MAP.
