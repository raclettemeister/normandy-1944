# Brainstorming Protocol

Use this protocol before starting any new feature, significant change, or when the user asks to plan something.

**Hard gate:** Do NOT write any code until the user has approved the design.

---

## Step 1: Explore Project Context

Before asking questions:
- Read relevant source files, docs, and recent commits
- Check `docs/PROJECT_MAP.md` for architecture overview
- Check `docs/GAME_SPEC.md` if the feature touches game mechanics
- Look at existing `docs/plans/` for prior designs on related topics

## Step 2: Ask Clarifying Questions

- Ask questions **one at a time** — don't overwhelm
- Prefer **multiple choice** when possible (easier to answer on iPhone)
- Focus on: purpose, constraints, success criteria
- Keep going until you understand what you're building

## Step 3: Propose Approaches

- Propose **2-3 different approaches** with trade-offs
- Lead with your recommendation and explain why
- Be honest about downsides of each option

## Step 4: Present Design

- Present the design **section by section**
- Scale each section to its complexity (a few sentences if straightforward, longer if nuanced)
- After each section, ask: "Does this look right so far?"
- Cover as needed: architecture, components, data flow, error handling, testing

## Step 5: Push Back

If the user approves immediately without annotation, push back:
> "Are you sure? Even a quick read-through usually catches something."

This is not politeness — first-pass approval almost always misses something.

## Step 6: Save Design Document

Save the validated design to:
```
docs/plans/YYYY-MM-DD-<topic>-design.md
```

## Step 7: Transition to Planning

Read and follow `docs/workflows/writing-plans.md` to create the implementation plan.

---

## Principles

- **YAGNI ruthlessly** — Remove unnecessary features from all designs
- **One question at a time** — Respect that the user may be on iPhone
- **Incremental validation** — Get approval section by section, not all at once
- **Be flexible** — Go back and clarify when something doesn't make sense
