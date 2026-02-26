# Difficulty Pivot — Brainstorming Session Notes

**Date**: 2026-02-25 (started), 2026-02-26 (completed)  
**Status**: COMPLETED — superseded by `2026-02-26-difficulty-and-dm-layer-design.md`  
**Next step**: Review design doc, annotate, then implementation planning

---

## The Pivot (confirmed decisions)

The game's core identity shifts: **playing by prompt IS the game**. Multiple choice options are the easy mode, not the default.

### Three Difficulty Levels

| Difficulty | Choices visible | Prompt input | 2IC hints | Budget tokens |
|---|---|---|---|---|
| **Easy** | All 3-5 choices every scene | Available (optional) | Full comments (as designed today) | N/A |
| **Medium** | Hidden by default | Primary input method | Vague/realistic observations | 5 "reveal choices" tokens per game (number TBD for balance) |
| **Hardcore** | Never shown | Only input method | Vague/realistic observations | 0 |

### Key Decisions Made

1. **The game engine doesn't change.** Same scenes, same decisions, same outcome engine, same classification system. Difficulty is purely a UI layer — hide the choices, show only the prompt input.

2. **Budget system for medium difficulty.** Player gets N tokens (placeholder: 5) to "reveal choices" at any scene. They decide when to spend them. Unspent tokens carry forward. The number will be tuned for balance later.

3. **2IC is vague/realistic, not directional.** Henderson reports what he SEES, not what you should DO. He's a good NCO, not a commander. The army chose YOU to lead.
   - Veteran Henderson: Good observations — "Sir, I count two MG positions, both covering the road. Dead ground along the drainage ditch to the east."
   - Green replacement: Bad/incomplete observations — "There's... a lot of them, sir."
   - He NEVER suggests a course of action. He gives you intel. You synthesize it into a prompt.

4. **Losing Henderson is devastating on hardcore.** Your only source of situational intel degrades. Worse intel → worse prompts → worse outcomes. This is organic difficulty scaling.

5. **Lessons Learned become the primary progression mechanic.** They need to be extensive enough to serve as an in-game field manual. On hardcore, your lessons journal + Henderson's observations are your ONLY guidance for writing good prompts.

---

## Open Questions (where we left off)

### Q3: Lessons Learned — presentation and depth (ANSWERED)
- **A dedicated tab** (like Orders, Wiki, Roster) — always accessible during gameplay
- **Clickable lessons** — list view, tap to expand individual lesson
- **Military academy style** — written like field manual entries, training doctrine, after-action reports. Not game tips. Real tactical education.
- Depth TBD — but clearly longer than the current 2-4 sentences. Needs to be substantial enough that a player can read a lesson, close the tab, and write a good prompt based on what they learned.
- Contextual surfacing (auto-highlighting relevant lessons) — NOT YET DECIDED, ask next session

### Q4: Classification feedback
- When the player writes a prompt on medium/hardcore, should they get any feedback on HOW their prompt was classified?
- E.g., after submitting: "Your action was interpreted as a flanking maneuver (sound tactics)" — or is that too meta/game-breaking?
- Or does the player only learn from the OUTCOME whether their prompt was good?

### Q5: Onboarding for prompt-based play
- A player who picks "hardcore" on their first game will be completely lost. Is that intentional?
- Should the game recommend starting on easy? Or is the expectation that hardcore players already know the system?
- Should there be a tutorial or "first scene on easy" mechanic?

### Q6: The LLM classification becomes load-bearing
- In the original design, free-text was optional (most players pick choices). Now it's the PRIMARY input on medium/hardcore.
- Classification accuracy becomes critical — a misclassified prompt is a bad experience.
- Does the classification need to be more sophisticated? (e.g., allow the LLM to blend two decisions, or create a custom tier)

---

## What Doesn't Change

- All existing game engine code
- All existing scene files and content
- The outcome engine, casualty system, roster, etc.
- The Cloudflare Worker proxy architecture
- The access code system
- Achievements, epilogues, wiki

## What Changes

- `DecisionPanel.tsx` — hides choices based on difficulty, shows prompt input as primary
- `MainMenu.tsx` — difficulty selection screen
- `GameState` — add `difficulty` field and `revealTokensRemaining`
- `LessonJournal.tsx` — expanded lesson content, possibly contextual surfacing
- `scenarioLoader.ts` — 2IC comments reworked to be observational, not tactical
- Lesson content — needs to be 3-5x longer and more actionable
- Scene files — 2IC comments rewritten to be observational
- New: prompt input as the default UI element on medium/hardcore

---

## Reference Documents

- `docs/GAME_SPEC.md` — full game specification (unchanged by this pivot)
- `docs/plans/2026-02-25-ai-narrative-pivot-research.md` — LLM architecture research (still valid, classification system becomes primary)
