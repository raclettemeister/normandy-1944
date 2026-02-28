# Playthrough Trace + Spec Alignment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add playthrough trace format, spec alignment doc, and AI worker brief so batch workers have enough context to fix the broken playthrough experience (narrative + flow) using evidence (trace) and success criteria (alignment).

**Architecture:** Docs-only. New dir `docs/playthroughs/` with NDJSON trace format and optional README; new file `docs/SPEC_ALIGNMENT.md` with 7 alignment sections; new file `docs/AI_WORKER_BRIEF.md` that points to trace, alignment, PROJECT_MAP, and GAME_SPEC. No code or test changes.

**Tech Stack:** Markdown, NDJSON (plain text). No runtime dependencies.

---

## Task 1: Create docs/playthroughs directory and README

**Files:**
- Create: `docs/playthroughs/README.md`

**Step 1: Create directory and README**

Create `docs/playthroughs/` and add `README.md` with:

- One line: this folder holds playthrough traces (one file per run).
- Format: NDJSON — one JSON object per line; each object = one step (see design doc for field list).
- How to judge: use `docs/SPEC_ALIGNMENT.md` to check each step against success criteria.
- Optional: "First trace can be manual or semi-manual; add a bad-run file when available."

**Step 2: Verify**

- `docs/playthroughs/README.md` exists and is readable.
- No code or test changes.

**Step 3: Commit**

```bash
git add docs/playthroughs/README.md
git commit -m "docs: add playthroughs folder and trace format README"
```

---

## Task 2: Add SPEC_ALIGNMENT.md

**Files:**
- Create: `docs/SPEC_ALIGNMENT.md`

**Step 1: Create spec alignment doc**

Create `docs/SPEC_ALIGNMENT.md` with a short intro (this file defines "what good looks like" for the playthrough experience; workers use it with the trace to fix narrative and flow). Then add the 7 sections from the design, each with:

- **Spec reference** (e.g. GAME_SPEC §2b Act 1)
- **Intended experience** (1 sentence)
- **Success criteria** (2–4 bullet points)

Sections: (1) Act 1 tone, (2) Storyline continuity, (3) Five numbers clarity, (4) Time & orders, (5) Narrative ↔ mechanics, (6) Pacing, (7) LLM fallback. Copy exact text from the design doc table.

**Step 2: Verify**

- File exists; all 7 sections present; no placeholder "TBD".

**Step 3: Commit**

```bash
git add docs/SPEC_ALIGNMENT.md
git commit -m "docs: add SPEC_ALIGNMENT success criteria for playthrough experience"
```

---

## Task 3: Add AI_WORKER_BRIEF.md

**Files:**
- Create: `docs/AI_WORKER_BRIEF.md`

**Step 1: Create worker brief**

Create `docs/AI_WORKER_BRIEF.md` with:

- **Goal:** Fix playthrough experience (narrative + flow); make it consistent, clear, enjoyable; storyline and mechanics aligned.
- **Evidence of the problem:** Link to `docs/playthroughs/` and explain: at least one "bad run" trace (NDJSON) with optional `issue` per step.
- **Definition of "good":** Link to `docs/SPEC_ALIGNMENT.md`; use its sections as success criteria.
- **Where things live:** Links to `docs/PROJECT_MAP.md`, `docs/GAME_SPEC.md`; mention file ownership in GAME_SPEC §13 if applicable.
- **How to work:** Run the game; change code; re-check trace or a new run against SPEC_ALIGNMENT; fix one area at a time (narrative vs flow vs fallback). Keep it to one short paragraph per bullet.

**Step 2: Verify**

- File exists; all bullets covered; links are relative and valid (same repo).

**Step 3: Commit**

```bash
git add docs/AI_WORKER_BRIEF.md
git commit -m "docs: add AI_WORKER_BRIEF for batch workers fixing playthrough experience"
```

---

## Task 4: Add placeholder trace file (optional)

**Files:**
- Create: `docs/playthroughs/2026-02-27-bad-run.ndjson` (or leave empty / single example line)

**Step 1: Add placeholder or example**

Either:
- Add an empty file, or
- Add one example NDJSON line documenting the schema (e.g. one fake step with all fields from the design: stepIndex, sceneId, phase, tacticalPhase, playerAction, outcomeSummary, narrativeSnippet, stateAfter, issue).

**Step 2: Verify**

- File exists; if non-empty, valid JSON per line.

**Step 3: Commit**

```bash
git add docs/playthroughs/2026-02-27-bad-run.ndjson
git commit -m "docs: add placeholder/example playthrough trace file"
```

---

## Task 5: Link design doc from README or PROJECT_MAP (optional)

**Files:**
- Modify: `docs/PROJECT_MAP.md` or `docs/playthroughs/README.md`

**Step 1: Add pointer to design**

In `docs/playthroughs/README.md`, add a line: "Design: `docs/plans/2026-02-27-playthrough-trace-and-spec-alignment-design.md`."  
Or in `docs/PROJECT_MAP.md`, add a short "Docs for AI workers" subsection linking to `docs/AI_WORKER_BRIEF.md`, `docs/SPEC_ALIGNMENT.md`, and `docs/playthroughs/`.

**Step 2: Verify**

- Link(s) correct and consistent.

**Step 3: Commit**

```bash
git add docs/playthroughs/README.md
git commit -m "docs: link playthroughs to design doc"
```

---

## Execution handoff

Plan complete and saved to `docs/plans/2026-02-27-playthrough-trace-and-spec-alignment-plan.md`.

**Two execution options:**

1. **Subagent-driven (this session)** — I dispatch a fresh subagent per task, you review between tasks, fast iteration.
2. **Parallel session (separate)** — Open a new session with executing-plans and run through the plan with checkpoints.

Which approach?
