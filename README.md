# Normandy 1944

A text-based tactical roguelike set during the D-Day airborne operations. You command 2nd Platoon, Easy Company, 506th Parachute Infantry Regiment, 101st Airborne Division — dropped into occupied France on the night of June 5-6, 1944.

## The Game

You start alone in a flooded Norman field at 0115 hours. Your stick was scattered by flak. Your rifle is at the bottom of a ditch. You have a pistol, two grenades, and a cricket clicker.

Your mission: rally your men, navigate to the objective, and survive.

**Every decision costs time. Every minute makes the enemy stronger.**

### Core Mechanics

- **5 resources** — Men, Ammo, Morale, Enemy Readiness, Time
- **Outcome engine** — Tactical quality + state modifiers + dice = results
- **Battle Orders** — Timed objectives from the OPORD. The game doesn't remind you. The clock is always visible. You do the math.
- **18 named soldiers** — Each with traits, personalities, backstories. You learn who they are across playthroughs.
- **Lessons Learned** — Real tactical knowledge unlocked through play, persisting across runs. The roguelike progression is player knowledge, not stat upgrades.

### Current State (Demo)

Act 1, Scenes 1-6: The Drop. Landing, orientation, first contact, rallying your platoon sergeant, a German patrol encounter, and a farmhouse clearing.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Building

```bash
npm run build
```

Output goes to `dist/`.

## Tech Stack

- React 19 + TypeScript
- Vite
- Zero external game dependencies — pure state machine driven by JSON scenario data

## License

All rights reserved.
