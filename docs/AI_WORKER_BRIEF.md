# AI worker brief — fixing the playthrough experience

Short onboarding for batch AI workers (e.g. Background Agents) working on the game. Use this with the spec and trace to fix the broken playthrough without guessing.

---

## Goal

Fix the **playthrough experience** (narrative + flow). Make it consistent, clear, and enjoyable. Align storyline and mechanics so a full run feels coherent — not inconsistent, broken, or unclear.

---

## Evidence of the problem

**[docs/playthroughs/](playthroughs/)** — At least one "bad run" trace lives here (NDJSON: one JSON object per line, one step per object). Each step can include an optional `issue` field (e.g. "narrative contradicted outcome", "transition felt abrupt"). Use the trace to see where the experience breaks and what to fix.

---

## Definition of "good"

**[docs/SPEC_ALIGNMENT.md](SPEC_ALIGNMENT.md)** — This file defines success criteria for the experience (Act 1 tone, storyline continuity, five numbers clarity, time & orders, narrative ↔ mechanics, pacing, LLM fallback). When you change narrative, flow, or logic, re-check a playthrough (or the trace) against these sections; your changes should make the run pass the relevant criteria.

---

## Where things live

- **Architecture & file map:** [docs/PROJECT_MAP.md](PROJECT_MAP.md) — layers, data flow, which files own what.
- **Full game spec:** [docs/GAME_SPEC.md](GAME_SPEC.md) — mechanics, content, UI, AI narrative. Section 13 defines file ownership for parallel agent work; respect it to avoid conflicts.

---

## How to work

1. **Run the game** (and/or read the bad-run trace).
2. **Change code** targeting one area at a time: narrative consistency, flow/UX, or AI/fallback. Don’t mix unrelated fixes in one pass.
3. **Re-check** the trace or a new run against [SPEC_ALIGNMENT.md](SPEC_ALIGNMENT.md). Confirm the steps that were broken now pass the right criteria.
4. Repeat until the experience is coherent and the spec alignment criteria are met.
