# Mobile Responsive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent content clipping on phone screens — all text visible, all buttons tappable, no content pushed off-screen.

**Architecture:** Pure CSS changes in `src/styles/game.css`. All fixes go inside `@media (max-width: 600px)` blocks (or as global fallback-safe changes for viewport units). No component file changes.

**Tech Stack:** Plain CSS, existing media query breakpoint at 600px.

**Design doc:** `docs/plans/2026-02-26-mobile-responsive-design.md`

---

### Task 1: Viewport Height Fix

**Files:**
- Modify: `src/styles/game.css` — selectors `.app`, `.main-menu`, `.game-screen`, `.death-report`

**Step 1: Replace 100vh with 100dvh + fallback**

For each of the four selectors, change `min-height: 100vh` to include the dynamic viewport unit. The `100vh` stays as the first declaration (fallback), and `100dvh` overrides it in supporting browsers.

```css
.app {
  min-height: 100vh;
  min-height: 100dvh;
}
```

Same pattern for `.main-menu`, `.game-screen`, `.death-report`.

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes with no errors.

Open browser dev tools → toggle device toolbar → iPhone SE (375×667). Confirm main menu doesn't have content hidden below the simulated viewport bottom.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: use 100dvh for proper mobile viewport height"
```

---

### Task 2: Overlay Panel Fixes

**Files:**
- Modify: `src/styles/game.css` — the `@media (max-width: 600px)` block at ~line 1129

**Step 1: Add mobile overlay overrides**

Add these rules inside the existing `@media (max-width: 600px)` block (the one at ~line 1129 that already has `.status-panel`, `.toolbar .btn`, etc.):

```css
.overlay-backdrop {
  padding: 0.5rem;
}

.overlay-panel {
  max-height: 95dvh;
  max-width: 100%;
  padding: 1rem;
}

.wiki-panel {
  max-width: 100%;
}

.wiki-layout {
  min-height: auto;
}

.wiki-entries {
  max-height: none;
}
```

Note: `.overlay-panel` already has `max-height: 90vh` and `padding: 1rem` in the existing mobile block. Replace/consolidate — don't duplicate. The new values are `95dvh` and keeping `1rem`.

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

In browser dev tools at 375px width: open any overlay (Orders, Roster, Wiki). Confirm the panel fills nearly the full viewport width and content is scrollable without clipping.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: overlay panels use full width on mobile, remove nested scroll constraints"
```

---

### Task 3: Roster Row Reflow

**Files:**
- Modify: `src/styles/game.css` — add rules inside `@media (max-width: 600px)` block

**Step 1: Add roster mobile reflow**

Add inside the mobile media query:

```css
.roster-soldier {
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  padding: 0.6rem 0;
}

.roster-soldier__role {
  width: 100%;
  order: 3;
  font-size: 0.7rem;
}

.roster-soldier__rank {
  min-width: auto;
}

.roster-soldier__status {
  min-width: auto;
  margin-left: auto;
}
```

This makes rank + name sit on line 1 with status right-aligned, and role drops to line 2 spanning full width.

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

In browser dev tools at 375px: open Roster overlay. Confirm each soldier shows rank + name + status on first line, role on second line. No horizontal overflow.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: roster rows wrap to two lines on mobile to prevent clipping"
```

---

### Task 4: Milestone Row Safety

**Files:**
- Modify: `src/styles/game.css` — add rules inside `@media (max-width: 600px)` block

**Step 1: Add milestone mobile wrap**

Add inside the mobile media query:

```css
.milestone {
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}

.milestone__desc {
  min-width: 0;
}

.milestone__time {
  min-width: auto;
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

In browser dev tools at 375px: open Orders overlay. Confirm milestone text doesn't overflow horizontally.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: milestone rows allow wrapping on mobile"
```

---

### Task 5: Status Panel Defensive Overflow

**Files:**
- Modify: `src/styles/game.css` — modify existing `.status-panel` rule inside `@media (max-width: 600px)` block

**Step 1: Update status panel mobile rule**

The existing mobile block already has:
```css
.status-panel {
  font-size: 0.72rem;
  gap: 0.5rem;
}
```

Update it to:
```css
.status-panel {
  font-size: 0.72rem;
  gap: 0.5rem;
  overflow-x: auto;
}

.progress-bar {
  width: 40px;
}
```

Note: `.progress-bar` already has `width: 50px` in the existing mobile block. Change it to `40px`.

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

In browser dev tools at 375px: confirm status panel items wrap naturally and no content clips.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: status panel scrollable overflow and smaller progress bars on mobile"
```

---

### Task 6: Achievement Popup Positioning

**Files:**
- Modify: `src/styles/game.css` — add rules inside `@media (max-width: 600px)` block

**Step 1: Add achievement popup mobile fix**

Add inside the mobile media query:

```css
.achievement-popup {
  right: 0.5rem;
  left: 0.5rem;
  max-width: none;
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

The achievement popup is triggered by in-game events, so visual verification requires gameplay. The CSS change is straightforward — confirm no build errors.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: achievement popup uses full width on mobile"
```

---

### Task 7: Touch Targets

**Files:**
- Modify: `src/styles/game.css` — add rules inside `@media (max-width: 600px)` block

**Step 1: Add minimum touch target sizes**

Add inside the mobile media query:

```css
.toolbar .btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.captain-position__option {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.wiki-category-btn {
  min-height: 44px;
}

.overlay-close {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.decision-btn {
  min-height: 44px;
}
```

Note: `.toolbar .btn` already has `font-size` and `padding` in the existing mobile block. Add `min-height` and display properties alongside (don't duplicate existing props).

**Step 2: Verify**

Run: `npm run build`
Expected: Build passes.

In browser dev tools at 375px: inspect toolbar buttons and confirm they are at least 44px tall.

**Step 3: Commit**

```bash
git add src/styles/game.css
git commit -m "fix: enforce 44px minimum touch targets on mobile"
```

---

### Task 8: Final Verification

**Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass (CSS changes shouldn't affect tests, but confirm nothing is broken).

**Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no warnings.

**Step 3: Visual spot-check**

In browser dev tools, cycle through these at 375px width:
- Main Menu → start a game
- Game Screen → read narrative, tap decisions
- Open each overlay (Orders, Roster, Wiki) → scroll content, close
- If possible, trigger Death Report

Confirm: no horizontal scrollbar on the page itself, no text cut off, all buttons tappable.

**Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "fix: mobile responsive — prevent clipping on phone screens"
```
