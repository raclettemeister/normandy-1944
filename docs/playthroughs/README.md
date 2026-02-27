# Playthrough traces

This folder holds **playthrough traces** — one file per run (e.g. one "bad run" used as evidence for AI workers).

**Format:** NDJSON — one JSON object per line; each object = one step. Fields: `stepIndex`, `sceneId`, `phase`, `tacticalPhase`, `playerAction`, `outcomeSummary`, `narrativeSnippet`, `stateAfter`, `issue` (see design doc for details).

**How to judge steps:** Use [SPEC_ALIGNMENT.md](../SPEC_ALIGNMENT.md) to check each step against the success criteria.

The first trace can be manual or semi-manual; add a bad-run file when available.

**Design:** [docs/plans/2026-02-27-playthrough-trace-and-spec-alignment-design.md](../plans/2026-02-27-playthrough-trace-and-spec-alignment-design.md)
