# Mobile Responsive Design — Surgical CSS Fixes

**Date**: 2026-02-26
**Goal**: Prevent clipping on phone screens. Everything visible, everything tappable. No content pushed off-screen or unreachable.
**Scope**: CSS-only changes in `src/styles/game.css`, targeting the existing `@media (max-width: 600px)` breakpoint. No component changes.
**Approach**: Approach A (surgical fixes) — chosen over component adjustments or full responsive overhaul because the goal is "nothing broken" rather than a mobile redesign.

## 1. Viewport & Full-Height Containers

`min-height: 100vh` on `.app`, `.main-menu`, `.game-screen`, `.death-report` causes bottom clipping on mobile browsers where 100vh includes the URL bar area.

**Fix**: Add `min-height: 100dvh` with `100vh` fallback. `dvh` (dynamic viewport height) adjusts for browser chrome.

**Affected selectors**: `.app`, `.main-menu`, `.game-screen`, `.death-report`

## 2. Overlay Panels

`.overlay-backdrop` padding of `2rem` wastes ~128px on a 375px phone. Inner panel padding and nested max-heights (wiki `max-height: 24rem`, `min-height: 20rem`) create scroll-within-scroll or clip content.

**Fixes** (mobile only):
- `.overlay-backdrop` padding → `0.5rem`
- `.overlay-panel` max-height → `95vh`, max-width → `100%`
- `.wiki-panel` max-width → remove
- `.wiki-entries` max-height → remove (use overlay scroll)
- `.wiki-layout` min-height → remove

## 3. Roster Rows

`.roster-soldier` is a single flex row: rank (min-width 2.5rem) + name (flex 1) + role + status (min-width 4rem). On ~340px content width, text clips or overflows.

**Fix** (mobile only): Wrap roster rows into two lines.
- Line 1: rank + name (left), status (right)
- Line 2: role (full width, smaller)

Done via `flex-wrap: wrap` on `.roster-soldier` and `width: 100%` on `.roster-soldier__role`.

## 4. Milestone Rows

`.milestone` flex row: time (min-width 3.5rem) + description (flex 1) + status. Description gets squeezed on narrow screens.

**Fix** (mobile only): Allow wrap. Safety net — won't trigger on most content, but prevents clipping when it does.

## 5. Status Panel

5+ items (Men, Ammo, Morale, Readiness, Time) with progress bars in a flex-wrap row. Individual items could exceed container width.

**Fixes** (mobile only):
- Progress bar width → `40px` (from 50px)
- `overflow-x: auto` on `.status-panel` as defensive safety net

## 6. Achievement Popup

`position: fixed; top: 1rem; right: 1rem; max-width: 320px` — edge-to-edge on 320px phones.

**Fix** (mobile only): Replace right-anchored positioning with `left: 0.5rem; right: 0.5rem`, remove max-width. Guarantees fit on any phone.

## 7. Touch Targets

Several buttons below 44px minimum: toolbar buttons (~28px), captain position options, wiki category buttons, overlay close button.

**Fix** (mobile only): `min-height: 44px` on:
- `.toolbar .btn`
- `.captain-position__option`
- `.wiki-category-btn`
- `.overlay-close`
- `.decision-btn`

## Verification

After implementation, test on:
- iPhone SE (375×667) — smallest common phone
- iPhone 14/15 (390×844) — standard modern phone
- Galaxy S-series (360×800) — common Android

Check each screen: Main Menu, Game Screen (all phases), overlays (Orders, Roster, Wiki), Death Report, Epilogue. Confirm no horizontal overflow, no content below fold that can't be scrolled to, all buttons tappable.
