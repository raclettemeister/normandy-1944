# Hardcore Real Browser Demo (Mobile Viewport)

**Date:** 2026-02-27  
**Runner:** `scripts/hardcoreBrowserDemo.ts`  
**Browser:** Playwright Chromium  
**Viewport:** 390x844 (mobile-style)

## What changed to make this possible

1. Added **offline AI narrator mode** (`template`) so Hardcore can run without external `VITE_NARRATIVE_API_URL`.
2. Enabled Medium/Hardcore menu buttons whenever narrator mode is not hardcoded.
3. Added local heuristic DM evaluator (`TemplateDMLayer`) for free-text Hardcore planning.
4. Added browser demo automation script that:
   - boots local Vite server
   - opens real Chromium browser
   - plays Hardcore scenes with creative prompts
   - captures screenshots and transcript markdown

## Command used

```bash
npx tsx scripts/hardcoreBrowserDemo.ts
```

## Transcript (from live browser run)

### 1) Landing
- Prompt: gear roll-call + AA arcs + steeple orientation
- Status after step: `MEN ALONE | AMMO 5% | MORALE 40 | ENEMY CONFUSED (10) | 0115 hrs`

### 2) Finding North
- Prompt: compass pacing + hedgerow count markers
- Status after step: `MEN ALONE | AMMO 5% | MORALE 36 | ENEMY CONFUSED (12) | 0130 hrs`

### 3) First Contact
- Prompt: strict clicker challenge + Flash/Thunder fallback
- Status after step: `MEN ALONE | AMMO 8% | MORALE 33 | ENEMY CONFUSED (15) | 0150 hrs`

### 4) The Sergeant
- Prompt: clicker from cover + Henderson-led consolidation
- Status after step: `MEN ALONE | AMMO 10% | MORALE 30 | ENEMY CONFUSED (20) | 0205 hrs`

### 5) The Patrol (Fun Prompt)
- Prompt: **Operation Midnight Accordion** (canal flank + base fire + L-ambush trigger)
- Status after step: `MEN 3 | AMMO 21% | MORALE 32 | ENEMY CONFUSED (22) | 0225 hrs`

### 6) The Farmhouse
- Prompt: porch clicker first, no grenades before positive ID
- Status after step: `MEN 3 | AMMO 23% | MORALE 39 | ENEMY ALERTED (37) | 0250 hrs`

### 7) The Road
- Prompt: paired scouts, bound crossing after wire confirmation
- Terminal state reached: **epilogue** (Act 2 scene target is not authored yet)

## Output artifacts

The run writes local artifacts to:

- `artifacts/hardcore-browser-demo/report.md`
- `artifacts/hardcore-browser-demo/step-01.png` … `step-07.png`

These are generated runtime artifacts and are not required for repository source correctness.
