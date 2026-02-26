# Normandy 1944 — Game Specification Document

This is the single source of truth for all autonomous agents. If something is not specified here, agents make the simplest reasonable choice and log it in `docs/DECISIONS.md`.

---

## 1. Setting & Premise

- **Unit**: 2nd Platoon, Easy Company, 506th Parachute Infantry Regiment, 101st Airborne Division
- **Date**: Night of June 5-6, 1944 through evening of June 6
- **Location**: Drop Zone C, near Sainte-Marie-du-Mont, Normandy, France
- **Player Role**: Captain commanding the platoon
- **Timeline**: 24 hours of in-game time across 3 acts

## 2. Battle Orders (OPORD)

Before the drop, every man in the 101st was briefed on Operation Albany. The player receives their **Battle Orders** at game start — a timed sequence of objectives with specific deadlines. This is how real military operations work: every unit knows what must happen, where, and by when.

### The Orders

The player sees this at game start (styled as a military briefing document). It's accessible at any time via the Orders button.

```
OPERATION ALBANY — 506th PIR, 2nd PLATOON, EASY COMPANY
CLASSIFICATION: SECRET
DATE: 5 JUNE 1944

MISSION: Secure causeway exit at Sainte-Marie-du-Mont to enable
linkup with seaborne forces landing Utah Beach at H-Hour.

TIMELINE:
  0100 — Drop on DZ C. Rally at assembly area grid ref 387291.
  0400 — Assembly complete. Move to objective area.
  0600 — H-HOUR. Beach landings begin. Secure crossroads NLT 0900.
  0900 — Crossroads SECURED. Establish defensive perimeter.
         Prepare for enemy counterattack. Expect probing attacks
         throughout the day. Fortify position.
  1200 — Resupply expected from beach elements. Ensure position
         is secure for supply delivery.
  1800 — Relief expected from 4th Infantry Division elements.
         Maintain position until contact with relief force.
  0100 — End of operational period.

EXECUTION:
  Phase 1 (0100-0600): Rally, recon, move to objective.
  Phase 2 (0600-0900): Assault and secure crossroads.
  Phase 3 (0900-0100): Hold, fortify, and defend until relief.

NOTE: If primary objective cannot be secured, establish
blocking position on nearest defensible terrain and
deny enemy use of causeway.

COMMANDER'S INTENT: Speed is critical. Every hour of delay
gives the enemy time to organize. Strike while they are
confused. The men landing on that beach are counting on us.
```

### How Time Milestones Work

The battle orders define WHEN things should happen. The game does NOT remind the player. There are no pop-ups saying "you're behind schedule." The clock is always visible in the status bar. The orders are always accessible. The player does the math.

```typescript
interface BattleOrders {
  milestones: Milestone[];
}

interface Milestone {
  id: string;                    // e.g. "rally_complete"
  time: string;                  // e.g. "0400"
  description: string;           // e.g. "Assembly complete"
  status: "pending" | "achieved" | "missed";
}
```

**What happens when you miss a milestone**: The game doesn't tell you. You simply arrive at a situation that's harder than it should be. If the crossroads should be secured by 0800 but you arrive at 1000, the enemy readiness is 20 points higher than if you'd been on time. The resupply at 1200 still arrives at 1200 — whether you're set up to receive it or not. The relief at 1800 still comes at 1800 — they don't wait for you to be ready.

**What happens when you're ahead of schedule**: Again, the game doesn't tell you. If you secure the crossroads at 0630 instead of 0800, you have 90 minutes before resupply arrives. A smart player uses that time: set up defensive positions, scout the perimeter, redistribute ammo, treat wounded. A reckless player pushes on unnecessarily. The game just lets the clock tick.

### The Tension Triangle

Three forces constantly pull against each other:

```
        Battle Orders (time milestones)
              "You need to BE THERE by 0800"
                    /              \
                   /                \
                  /                  \
  Enemy Readiness                    Resource Gathering
  "Every minute you                  "You need more men
   wait, they get                     and ammo to survive
   stronger"                          the assault"
```

- Rush to meet the timeline → you're undermanned and under-equipped
- Gather resources → you miss milestones and face a harder enemy
- Try to balance → requires real tactical judgment about what's "enough"

The game never resolves this tension for you. It just presents the clock, the orders, the readiness indicator, and your men count. YOU decide.

### Design Philosophy: No Hand-Holding on Time

The game DOES NOT:
- Show countdown timers to milestones
- Flash warnings when you're behind schedule
- Suggest what to do with spare time
- Tell you "objective complete, next objective in 2 hours"

The game DOES:
- Show the clock (always visible in status bar)
- Let you open your battle orders at any time
- Let you check enemy readiness (the status bar shows CONFUSED/ALERTED/etc.)
- Present decisions that take time (and show how much time they take)

A player who checks their orders, watches the clock, and plans accordingly will succeed. A player who ignores the orders and wanders will miss milestones, face a fortified enemy, and die wondering why.

### Pixel Map (Future Enhancement — Phase 9)

The battle orders reference grid coordinates and terrain. In the final polish phase, a pixel-art tactical map will be generated showing:
- Drop zone, rally point, objective, defensive positions
- Terrain features (hedgerows, flooded fields, roads, buildings)
- Player's current approximate position
- Known enemy positions (from intel)

This is a cosmetic enhancement. The game is fully playable without it. Note in UI: `data-testid="orders-btn"` opens the orders panel, `data-testid="orders-panel"` is the orders overlay.

## 2b. Three-Act Structure

### Act 1 — The Drop (0100-0600) — 5 hours

**You start completely alone.** The drop goes wrong — flak scatters the sticks, wind carries you off the DZ. You land hard in a flooded Norman field, waist-deep in cold water. You cut yourself free from the chute, wade to solid ground, and stand in absolute darkness. Distant gunfire. The drone of planes fading. Silence.

The first scenes are not action — they're **military problem-solving under stress**. You have to:
- Assess your situation. Check your gear: what do you have, what did you lose in the drop?
- Orient yourself. Do you have a compass? Can you find the North Star through the cloud cover? Can you identify terrain features — a church steeple, the shape of a hedgerow line, the sound of water?
- Determine your position. The briefing maps showed DZ C near Sainte-Marie-du-Mont. Are those flooded fields from the Douve River? Is that church steeple to the east the right one?
- Decide on a direction and start moving. Through hedgerows, over stone walls, across muddy fields. Every sound could be a German patrol or a lost paratrooper.

Then comes the first human contact. You hear movement. The trained response: use your cricket clicker. One click-clack. Pause. Two click-clacks in response means friendly. No response or a shouted "Wer da?" means you're in trouble. Or maybe: use the verbal challenge — "Flash." The correct response is "Thunder." A wrong response, or silence, and you have a decision to make.

Finding your men is not Hollywood rescue sequences. It's quiet recognition signals in the dark. A scared private crouching behind a wall who nearly shoots you before you get the challenge out. Two NCOs who landed together and have been waiting, not knowing which direction to move. A small group from another company who are just as lost. Each encounter is tense, procedural, and realistic — recognition signals, quick whispered briefings, checking equipment, assessing the man's state.

The real danger is getting lost, walking into a German position by accident, making noise at the wrong time, or spending too long searching and running out of darkness. The enemy is mostly confused too — they don't know what's happening any more than you do. The danger isn't trained sentries waiting for you. It's stumbling into a startled German who panics and fires, lighting up your position.

**Themes**: Disorientation, navigation in darkness, military procedures (recognition signals, rally procedures), building a unit from nothing, the loneliness of command, the real difficulty of night movement in unfamiliar terrain.

**Milestone pressure**: Orders say rally by 0400, at objective area by 0600. Every scene you spend searching for men or orienting yourself pushes you closer to dawn.

**Win condition**: Reach the rally point near Sainte-Marie-du-Mont with at least 6 men alive before 0600.

**Fail conditions**: Captain KIA, all men KIA/missing, or failure to reach rally point by 0600.

**10 scenes**: Scenes 1-3 solo (landing/assessment, orientation/navigation, first contact — friend or foe). Scenes 4-6 squad building (recognition encounters, small groups, equipment check). Scenes 7-10 movement to rally (route decisions, obstacle crossing, German patrol avoidance, arrival).

### Act 2 — The Assault (0600-0900) — 3 hours

Dawn. H-Hour. Beach landings begin. Your platoon must assault a fortified crossroads controlling a causeway exit from Utah Beach. This is pure offensive combat — reconnaissance, approach, fire and maneuver, building clearing, securing the position. It's intense, fast, and violent. The crossroads must be taken by 0800 per orders, but you might not make it.

**Themes**: Reconnaissance, fire and maneuver, building clearing, coordinated assault, combined arms, paying the cost.

**Milestone pressure**: Crossroads must be secured by 0800 for causeway linkup. Every minute past 0800 means the beach forces are stuck and the enemy is reinforcing.

**Win condition**: Secure the crossroads. Earlier is better — the time you save becomes preparation time in Act 3.

**Fail conditions**: Captain KIA, platoon combat-ineffective (fewer than 4 men able to fight).

**10 scenes**: Scenes 1-2 approach and reconnaissance. Scenes 3-5 the assault (multiple possible approaches). Scenes 6-8 clearing and securing. Scenes 9-10 initial consolidation.

### Act 3 — The Hold (0900-0100+) — 16 hours

This is the longest act and the most complex. You've taken the crossroads (or a defensible position if you failed). Now you must prepare for the German counterattack — and you don't know when it's coming.

**The act has two phases, but the player doesn't know when the transition happens.**

**Phase 3A — Preparation (variable length)**

After securing the objective, you have time. How much time? The game doesn't tell you. Your orders say resupply at 1200 and relief at 1800, but the German counterattack could come at any hour. The player must decide how to use every minute.

Preparation decisions (each costs time):
- **Defensive positions**: Set up fields of fire, dig foxholes, place the BAR and MG in covering positions, identify fallback positions
- **Scouts and listening posts**: Send men out to watch for enemy movement. Costs men at the perimeter but gives early warning.
- **Redistribute ammo**: Pool and rebalance ammunition across the platoon
- **Medical station**: Set up an aid station, plan evacuation routes for wounded
- **Find more stragglers**: Send patrols to find more scattered paratroopers (gain men but costs time and risks contact)
- **Rest and eat**: Let exhausted men sleep in shifts (restores morale but costs time)
- **Fortify positions**: Use materials from buildings, sandbags, whatever you can find (reduces casualties during counterattack)
- **Radio contact**: If you have a radio, coordinate with other units, learn about beach progress, request support
- **Brief your NCOs**: Gather squad leaders, assign sectors, establish rally points (improves morale and effectiveness)

Every preparation action costs time. The clock ticks. Readiness ticks. And at some point — maybe you've done 3 things, maybe 8 — the counterattack hits.

**The game never says "you have X hours to prepare." It just keeps offering preparation decisions until the counterattack triggers.**

The counterattack trigger is based on enemy readiness + time:
```typescript
function shouldCounterattackTrigger(state: GameState): boolean {
  // Base trigger time: 1600 (4 PM)
  // Modified by readiness: higher readiness = earlier attack
  // Modified by your preparation: listening posts give warning
  const baseHour = 16;
  const readinessModifier = Math.floor(state.readiness / 25); // 0-4 hours earlier
  const triggerHour = baseHour - readinessModifier;

  // The attack happens when the clock reaches the trigger hour
  // Player never sees this calculation
  return state.time.hour >= triggerHour;
}
```

If enemy readiness is low (you were quiet, fast): counterattack at 1600, giving you ~7 hours to prepare.
If readiness is high (you were loud, slow): counterattack as early as 1200, giving you only ~3 hours.

**Phase 3B — The Counterattack**

The Germans probe your position. How well you prepared determines everything:
- Did you set up fields of fire? Your MG and BAR are in the right place.
- Did you set listening posts? You get early warning — "Sir, movement to the east, 200 meters."
- Did you dig in? Reduced casualties from mortar fire.
- Did you redistribute ammo? You don't run dry mid-fight.
- Did you set up a medical station? Wounded get treated faster.
- Did you brief your NCOs? They execute the defense plan without needing orders for every movement.

If you didn't prepare — because you wasted time, or because the counterattack came early — your men are scattered. Three men are still out on a supply run. The BAR is in the wrong position. Nobody has a sector assignment. It's chaos.

**Themes**: Time management under uncertainty, preparation vs. perfection, defensive warfare, ammunition discipline, leadership under pressure, the fog of war.

**Milestone pressure**: Resupply at 1200 (arrives to your position — if your position is secure). Relief at 1800 (4th Infantry Division elements — may or may not actually arrive. Radio provides updates if you have one).

**Win condition**: Hold through the counterattack with position intact. Rating:
- Hold with < 3 casualties during defense = excellent
- Hold with any force = good
- Hold but position partially overrun = partial (survive but costly)

**Fail conditions**: Position overrun, Captain KIA.

**10 scenes**: Scenes 1-6 are preparation decisions (flexible order, player chooses priority). Scenes 7-10 are the counterattack (triggered when the clock + readiness says it's time). The number of preparation scenes the player completes before the counterattack depends on how fast they work and when the attack triggers.

## 3. Game State Model

The game state is the single object that tracks everything. All systems read from it, all outcomes write to it.

```typescript
interface GameState {
  // --- Core Resources (the 5 numbers that matter) ---
  men: number;             // 0-18, active fighters. You start at 0 (alone).
  ammo: number;            // 0-100 percentage. Represents overall combat sustainability.
  morale: number;          // 0-100. Affects what your men will do.
  readiness: number;       // 0-100. Enemy alertness. Starts at 10.
  time: GameTime;          // The clock. Always ticking.

  // --- Derived from core resources ---
  capabilities: PlatoonCapabilities;  // recalculated after every state change

  // --- Intel & Equipment (boolean flags, not numbers) ---
  intel: IntelFlags;

  // --- Roster (flavor + capability source, not directly used by engine) ---
  roster: Soldier[];
  secondInCommand: SecondInCommand | null;  // null when solo, assigned on first NCO rally

  // --- Battle Orders ---
  milestones: Milestone[];            // timed objectives from the OPORD

  // --- Progression ---
  lessonsUnlocked: string[];          // persists in localStorage across runs
  scenesVisited: string[];            // tracks path through current run
  currentScene: string;               // current scene ID

  // --- Game phase ---
  phase: "solo" | "squad" | "platoon";  // determines which rules apply
  act: 1 | 2 | 3;
}
```

### The 5 Core Numbers

These are the only numbers the player needs to track. Everything else derives from them.

| Resource | Range | What It Represents | How It Changes |
|---|---|---|---|
| **Men** | 0-18 | Active fighters under your command | Find stragglers (+), casualties (-) |
| **Ammo** | 0-100 | Overall combat sustainability as % | Firefights (-), finding supply drops/soldiers (+) |
| **Morale** | 0-100 | Willingness to follow orders and fight | Good leadership (+), casualties/bad decisions (-) |
| **Readiness** | 0-100 | How organized the enemy is | Time passing (+), noise/combat (+), stealth has no effect |
| **Time** | 0100-0100 | Hours and minutes, 24-hour cycle | Every action costs time |

### Game Phases

The game shifts between three phases based on your men count. Each phase uses different rules in the outcome engine.

```typescript
type GamePhase = "solo" | "squad" | "platoon";

function getPhase(men: number): GamePhase {
  if (men <= 1) return "solo";      // just you, or you + 1 man
  if (men <= 5) return "squad";     // small group, limited tactics
  return "platoon";                  // full tactical options available
}
```

| Phase | Men | Available Tactics | Feel |
|---|---|---|---|
| **Solo** (0-1) | Just you (+ maybe 1 buddy) | Stealth, knife combat, evasion, observation. No fire-and-maneuver. No suppressive fire. | Survival horror. Every sound matters. |
| **Squad** (2-5) | Small group | Basic fire and movement, simple ambushes, can clear a single room. No sustained firefights. | Tense, resource-scarce, every man counts. |
| **Platoon** (6-18) | Full tactical unit | Fire and maneuver, suppressive fire, flanking, coordinated assaults, defensive positions. | Tactical command. You're a leader now. |

### Platoon Capabilities

Derived automatically from the roster. The outcome engine checks these, not individual soldiers.

```typescript
interface PlatoonCapabilities {
  canSuppress: boolean;    // true if roster includes BAR_gunner or MG_gunner
  canTreatWounded: boolean; // true if roster includes medic
  hasRadio: boolean;        // true if roster includes radioman
  hasNCO: boolean;          // true if roster includes NCO or platoon_sergeant
  hasExplosives: boolean;   // true if ammo allows (gammon bombs, etc.)
  canScout: boolean;        // always true if men >= 2 (can send someone ahead)
}

function deriveCapabilities(roster: Soldier[], ammo: number): PlatoonCapabilities {
  const roles = roster.filter(s => s.status === "active").map(s => s.role);
  return {
    canSuppress: roles.includes("BAR_gunner") || roles.includes("MG_gunner"),
    canTreatWounded: roles.includes("medic"),
    hasRadio: roles.includes("radioman"),
    hasNCO: roles.includes("NCO") || roles.includes("platoon_sergeant"),
    hasExplosives: ammo > 10, // simplified: if you have ammo, you have some explosives
    canScout: roster.filter(s => s.status === "active").length >= 2,
  };
}
```

### Soldier Roster: Characters, Not Numbers

Every soldier is a person. They have names, histories, personalities, and hidden traits that reveal themselves during gameplay. The same 18 characters appear every run — you learn who they are through experience.

```typescript
interface Soldier {
  id: string;
  name: string;
  nickname?: string;           // some have nicknames, e.g. "Jimmy", "Doc", "Big Red"
  rank: "Pvt" | "PFC" | "Cpl" | "Sgt" | "SSgt";
  role: SoldierRole;
  status: "active" | "wounded" | "KIA" | "missing";
  age: number;
  hometown: string;            // e.g. "Scranton, Pennsylvania"
  background: string;          // one sentence: "Former high school football star" or "Quiet kid from a dairy farm"
  traits: SoldierTrait[];      // 2-3 traits that affect gameplay
}

type SoldierRole =
  | "rifleman"
  | "BAR_gunner"
  | "MG_gunner"
  | "NCO"
  | "medic"
  | "radioman"
  | "platoon_sergeant";

type SoldierTrait =
  | "steady"         // performs consistently, no surprises, reliable under fire
  | "brave"          // +morale to nearby men, volunteers for dangerous tasks
  | "coward"         // may freeze or refuse orders under low morale
  | "hothead"        // aggressive, effective in assaults but may act recklessly
  | "sharpshooter"   // improved outcome on engagement decisions
  | "green"          // untested, may panic in first combat, improves after surviving
  | "veteran"        // calm under fire, stabilizes morale of others
  | "scrounger"      // finds extra ammo/supplies during rally events
  | "medic_instinct" // even non-medics with this trait can provide basic aid
  | "natural_leader" // if promoted to 2IC, counts as "veteran" not "green"
  | "loyal"          // never breaks, even at zero morale — goes down fighting
  | "unlucky"        // slightly higher chance of being a casualty (the player will learn this)
  | "lucky"          // slightly lower chance of being a casualty
  | "quiet"          // better at stealth missions, worse at rallying morale
  | "loud_mouth"     // worse at stealth but great at keeping spirits up
  | "resourceful";   // improvises solutions — occasionally unlocks bonus decision options
```

### How Traits Affect Gameplay

Traits create small but meaningful modifiers and trigger special narrative events:

**In the outcome engine:**
- `sharpshooter` in the platoon: +3 to effective score on engagement decisions
- `veteran` present: -2 to morale loss on failure outcomes (steadies the men)
- `coward` present + morale < 30: chance of a special event where he freezes or runs (costs you an extra man effectively)
- `hothead` present on assault decisions: +3 to score, but +2 readiness (he's loud)

**In narrative events (triggered by specific scenes):**
- `green` soldiers may panic in their first combat scene — a special narrative beat where they freeze and someone has to snap them out of it
- `brave` soldiers may volunteer for dangerous tasks — unlocking a bonus decision option ("Private Kowalski volunteers to scout ahead")
- `resourceful` soldiers may find something useful — "Doc Rivera rigs a makeshift stretcher from parachute cord"

**The key design principle**: Traits are NOT shown as stats on a character sheet. The player discovers them through gameplay. First run: "Why did Private Ellis freeze during the ambush?" Second run: "Oh, Ellis is green — he always freezes his first fight. I need to protect him early." Third run: "Ellis survived his first fight, now he's solid." That's emergent character knowledge.

### The 18 Soldiers of 2nd Platoon

These are fixed across all playthroughs. The player will get to know them.

**1. SSgt. Bill Henderson** — "Top" — Platoon Sergeant (your 2IC)
- 28, from Scranton, Pennsylvania. Former factory foreman. Oldest man in the platoon. Calm, experienced, the glue that holds the unit together.
- Traits: `veteran`, `steady`
- *The player's anchor. Losing Henderson hurts mechanically AND emotionally.*

**2. Sgt. Frank "Red" Malone** — Squad Leader
- 24, from South Boston, Massachusetts. Ex-boxer, built like a fire hydrant. Leads from the front, takes no shit.
- Traits: `brave`, `hothead`
- *Aggressive, effective, but his temper can cause problems. A fan favorite.*

**3. Sgt. Eddie Park** — Squad Leader
- 23, from San Francisco, California. Korean-American, had to fight twice as hard for his rank. Quiet, methodical, deadly.
- Traits: `steady`, `sharpshooter`
- *The reliable one. Never flashy, never fails.*

**4. Cpl. Ray "Doc" Rivera** — Medic
- 22, from San Antonio, Texas. Wanted to be a doctor. Gentle hands, steel nerves under fire. The men would die for him — and he'd die trying to save them.
- Traits: `brave`, `steady`
- *Losing Doc is devastating. Not just mechanically (canTreatWounded) but because everyone loves Doc.*

**5. Cpl. Walt Kowalski** — BAR Gunner
- 21, from Detroit, Michigan. Polish-American, built like an ox. Carries the BAR like other men carry rifles. Quiet until the trigger pulls.
- Traits: `loyal`, `steady`
- *Your suppressive fire. Losing him means losing canSuppress. The player will protect Kowalski at all costs.*

**6. Cpl. Tommy Davis** — Radioman
- 20, from Nashville, Tennessee. Former telegraph operator. Funny, keeps the men laughing. Carries 30 pounds of radio on top of his gear without complaining.
- Traits: `loud_mouth`, `lucky`
- *Comic relief, but also your lifeline to the outside world. Losing the radio hurts.*

**7. PFC James "Jimmy" Doyle** — Rifleman
- 19, from Boise, Idaho. Farm kid, youngest in the platoon. Eager, scared, trying to prove himself.
- Traits: `green`, `brave`
- *The kid everyone wants to protect. His first combat is always rough (green), but if he survives it, he becomes reliable. Emotional gut-punch if he dies.*

**8. PFC Charlie Webb** — Rifleman
- 21, from Atlanta, Georgia. Smooth talker, always has a cigarette. Looks lazy but has the best eyes in the platoon.
- Traits: `sharpshooter`, `scrounger`
- *The useful one. Finds extra ammo, picks off enemies. Surprisingly valuable.*

**9. PFC Harold "Harry" Ellis** — Rifleman
- 20, from Philadelphia, Pennsylvania. Nervous, intellectual, reads books in his foxhole. Joined because he felt he had to.
- Traits: `green`, `quiet`
- *Will panic in his first fight. But quiet means he's good at stealth missions. An acquired taste.*

**10. PFC Leon Washington** — Rifleman
- 22, from Chicago, Illinois. Street-smart, tough, grew up hard. Doesn't scare easy.
- Traits: `veteran`, `resourceful`
- *Despite being a PFC, he's seen more real danger than most of the NCOs. Stabilizes morale. Surprise MVP.*

**11. PFC Vincent "Vinnie" Caruso** — Rifleman
- 20, from Brooklyn, New York. Loud, brash, talks constantly. Drives the sergeants crazy but the privates love him.
- Traits: `loud_mouth`, `brave`
- *Good for morale, bad for stealth. The player will learn to keep Vinnie away from silent operations.*

**12. Pvt. Robert "Bobby" Mitchell** — Rifleman
- 19, from small-town Oklahoma. Quiet, polite, writes letters to his mother every day. Dead shot with a rifle.
- Traits: `sharpshooter`, `quiet`
- *The sniper. Devastating in the right situation, invisible otherwise. The player will grow to value his silence.*

**13. Pvt. Thomas "Big Tom" Novak** — Assistant BAR / Rifleman
- 23, from Pittsburgh, Pennsylvania. 6'4", former steelworker. Carries ammunition for Kowalski. Simple, dependable, strong as an ox.
- Traits: `loyal`, `steady`
- *The mule. Carries gear, never complains. You realize how much you need him when he's gone.*

**14. Pvt. Eugene "Gene" Sullivan** — Rifleman
- 20, from Worcester, Massachusetts. Irish-Catholic, prays before every mission. Superstitious but dependable.
- Traits: `steady`, `lucky`
- *The lucky one. Somehow dodges bullets. The player will notice over multiple runs.*

**15. Pvt. Arthur "Art" Bergman** — Rifleman
- 21, from Milwaukee, Wisconsin. German-American, sensitive about it. Speaks some German, which could be useful.
- Traits: `resourceful`, `quiet`
- *His German can unlock unique decision options (interrogating prisoners, reading signs). A hidden gem.*

**16. Pvt. Floyd Jenkins** — Rifleman
- 22, from rural Mississippi. Former hunting guide. Knows the outdoors better than anyone. Excellent tracker.
- Traits: `sharpshooter`, `scrounger`
- *The woodsman. Best man for point on a patrol. The player will learn to put Jenkins out front.*

**17. Pvt. Daniel "Danny" Herrera** — Rifleman
- 19, from Albuquerque, New Mexico. Fast runner, former track star. Skinny, wiry, never stops moving.
- Traits: `brave`, `green`
- *The runner. Fast, willing, but untested. Good for carrying messages, risky in sustained combat.*

**18. Pvt. Curtis "Curt" Palmer** — Rifleman
- 20, from Dayton, Ohio. The complainer. Bitches about everything — the food, the weather, the officers. But when the bullets fly, he fights.
- Traits: `coward`, `unlucky`
- *The one the player learns to dread. He freezes under fire, he draws bad luck. But his epilogue, if he survives, is the most moving of all — because survival changes him. The player who keeps Palmer alive through the whole campaign feels like they saved a real person.*

### How Characters Are Encountered

Characters always appear in the same rally events, in the same order. This means:
- Run 1: "I found some guy named Henderson." Run 3: "Henderson! My platoon sergeant! Thank God."
- The player builds relationships with characters across runs
- Knowing who you'll find and when lets you plan: "I know Kowalski is at the farmhouse — I need to go there for the BAR"

### Trait Discovery

Traits are never shown as labels. They manifest as narrative events and outcome modifiers. The player figures them out:
- "Why does Ellis always freeze?" → he's green
- "Webb always finds extra ammo" → he's a scrounger
- "Palmer panicked again" → he's a coward
- "Sullivan somehow survived that? Again?" → he's lucky

After multiple playthroughs, the player has a mental model of each character's strengths and weaknesses. This IS the roguelike progression — not stat upgrades, but player knowledge of their people.

### Trait Effects on Casualty Assignment

Traits modify the vulnerability weights in the casualty assignment system:
- `lucky`: vulnerability weight × 0.7 (less likely to be hit)
- `unlucky`: vulnerability weight × 1.4 (more likely to be hit)
- `brave`: vulnerability weight × 1.2 (puts himself in danger)
- `coward`: vulnerability weight × 0.8 (hangs back — survives more but contributes less)

### Intel Flags

Simple booleans. No arrays of scene IDs — that's engine complexity for little gameplay value.

```typescript
interface IntelFlags {
  hasMap: boolean;          // can navigate accurately, see scene connections
  hasCompass: boolean;      // basic orientation, less lost in the dark
  scoutedObjective: boolean; // scouted the Act 2 objective (crossroads)
  knowsMGPosition: boolean;  // intel on a specific MG nest
  knowsPatrolRoute: boolean; // intel on German patrol patterns
  friendlyContact: boolean;  // in radio contact with other US units
}
```

New intel flags can be added by content authors, but they're always simple booleans with descriptive names.

### Starting State

```typescript
const STARTING_STATE: GameState = {
  men: 0,
  ammo: 5,              // pistol + knife + a few grenades. Barely anything.
  morale: 40,           // alone, terrified, but trained
  readiness: 10,        // Germans confused by scattered drops
  time: { hour: 1, minute: 15 },
  capabilities: {       // all false when solo
    canSuppress: false,
    canTreatWounded: false,
    hasRadio: false,
    hasNCO: false,
    hasExplosives: true, // you have 2 grenades
    canScout: false,
  },
  intel: {
    hasMap: false,       // lost in the drop
    hasCompass: false,    // 50/50 dice roll at game start
    scoutedObjective: false,
    knowsMGPosition: false,
    knowsPatrolRoute: false,
    friendlyContact: false,
  },
  roster: [],            // empty — you're alone
  secondInCommand: null, // no 2IC until you find your platoon sergeant
  lessonsUnlocked: [],   // loaded from localStorage
  scenesVisited: [],
  currentScene: "act1_landing",
  phase: "solo",
  act: 1,
};
```

### Finding Soldiers: The Rally Mechanic

When you find a soldier or group, a `RallyEvent` modifies the game state:

```typescript
interface RallyEvent {
  soldiers: Soldier[];    // who you found
  ammoGain: number;       // +0 to +15 per soldier (they bring their gear)
  moraleGain: number;     // +3 to +8 (safety in numbers)
  narrative: string;      // "You find PFC Miller tangled in his chute..."
}
```

After a rally event, `men` increases, `ammo` increases, `capabilities` is recalculated from the updated roster, and `phase` may shift (solo → squad → platoon).

### The Second-in-Command (2IC)

Your platoon sergeant is your most important soldier. He's experienced, competent, and not afraid to speak his mind. He provides contextual commentary before you make decisions — a living, breathing advisor.

```typescript
interface SecondInCommand {
  soldier: Soldier;                // references a roster entry
  competence: "veteran" | "green"; // veteran gives good advice, green gives bad
  alive: boolean;
}
```

**What the 2IC says**: Before each decision, the 2IC can display a comment based on current game state. These are NOT the game telling you what to do — they're a character giving in-universe military advice.

```typescript
interface SecondInCommandComment {
  trigger: CommentTrigger;         // when this comment fires
  text: string;                    // what the 2IC says
}

type CommentTrigger =
  | { type: "low_ammo"; threshold: number }         // "Sir, we're running low"
  | { type: "low_morale"; threshold: number }        // "The men are shaky, Captain"
  | { type: "low_men"; threshold: number }            // "We don't have the numbers for this"
  | { type: "high_readiness"; threshold: number }     // "They're dug in. This won't be easy"
  | { type: "time_pressure"; milestone: string }      // "We need to be at the crossroads by 0800"
  | { type: "time_surplus" }                          // "We've got some time. Might be worth scouting"
  | { type: "bad_decision"; tier: "suicidal" | "reckless" }  // reacts to what you're about to do
  | { type: "before_decision"; decisionId: string };  // specific reaction to a specific choice
```

**Examples of veteran 2IC commentary**:
- (low ammo) *"Captain, we're burning through ammo. Might want to think about conserving for the objective."*
- (time pressure) *"Sir, it's 0730. Orders say crossroads by 0800. We need to move."*
- (bad decision) *"With all due respect, sir — open ground, MG position, and you want us to charge? That's suicide."*
- (time surplus) *"We're ahead of schedule. Could use the time to scout the approach."*
- (low men) *"We're down to eight effectives. Not enough for a proper assault. Maybe we find another way."*

**The 2IC death consequence**: Your starting platoon sergeant is a "veteran" — competent, experienced, gives sound tactical advice. If he dies, you promote the next available NCO. But they're "green" — they give unreliable or obvious advice, miss important observations, or say nothing useful at all.

**Examples of green 2IC commentary**:
- (low ammo) *"Uh... we don't have a lot of bullets, sir."* (obvious, unhelpful)
- (time pressure) *silence* (doesn't know the orders well enough to track time)
- (bad decision) *"Yes sir, whatever you say."* (won't push back on bad calls)
- (time surplus) *"What do we do now, sir?"* (no initiative, no suggestions)

This creates a strong incentive to keep your platoon sergeant alive — not just because you need NCOs, but because losing him makes every decision harder. The game gets lonelier without a competent advisor.

**UI**: The 2IC comment appears above the decisions panel, styled as dialogue. `data-testid="second-in-command-comment"`.

### Captain Position: Lead or Command

Before combat decisions (not all decisions — only those tagged `combatDecision: true`), the player chooses where they position themselves:

```typescript
type CaptainPosition = "front" | "middle" | "rear";
```

| Position | Effect | Risk |
|---|---|---|
| **Front** | +5 to effective score (you see everything, orders are immediate). +5 morale (men respect a leader who leads from the front). | You're in the kill zone. If casualties occur, ~15% chance one of them is you (game over). |
| **Middle** | No modifier. Balanced risk and command presence. | ~5% chance of captain casualty when casualties occur. |
| **Rear** | -5 to effective score (orders are delayed, you can't see details). -5 morale (men notice their captain isn't up front). | ~1% chance of captain casualty. Only stray rounds or mortars. |

This is a real trade-off commanders face. George Winters (Band of Brothers) led from the front at Brécourt Manor — it's why the assault succeeded and why he nearly died doing it.

```typescript
function getCaptainCasualtyChance(position: CaptainPosition): number {
  switch (position) {
    case "front": return 0.15;
    case "middle": return 0.05;
    case "rear": return 0.01;
  }
}
```

When casualties are applied, the engine rolls for the captain separately using this probability. If the captain is hit, game over. The player never knows exactly when this will happen — only that leading from the front is risky.

A player who always stays in the rear will survive longer but lead a less effective platoon with lower morale. A player who always leads from the front will be highly effective but is gambling with game-over every engagement. The optimal play is situational — lead from front when the stakes demand it, stay back when the risk isn't worth it.

### Casualty Assignment: Who Dies?

When an outcome says `menLost: 2`, the engine picks WHO is lost from the roster. This is not purely random — position and role affect probability.

```typescript
function assignCasualties(
  roster: Soldier[],
  menLost: number,
  captainPosition: CaptainPosition
): { casualties: Soldier[]; captainHit: boolean } {
  const active = roster.filter(s => s.status === "active");
  const casualties: Soldier[] = [];
  let captainHit = false;

  // Roll for captain first
  if (menLost > 0 && Math.random() < getCaptainCasualtyChance(captainPosition)) {
    captainHit = true;
  }

  // Assign remaining casualties by role vulnerability
  // Frontline roles die first, specialists are somewhat protected
  const vulnerability: Record<SoldierRole, number> = {
    rifleman: 10,          // most exposed, most likely to die
    BAR_gunner: 8,         // exposed because they're firing
    MG_gunner: 7,          // in position but a target
    NCO: 5,                // up front leading but somewhat protected
    platoon_sergeant: 4,   // 2IC, near captain, somewhat protected
    radioman: 3,           // usually behind the firing line
    medic: 2,              // rear, treating wounded
  };

  // Weighted random selection from active soldiers
  for (let i = 0; i < menLost && active.length > 0; i++) {
    const selected = weightedRandom(active, s => vulnerability[s.role]);
    selected.status = Math.random() < 0.6 ? "KIA" : "wounded";
    casualties.push(selected);
    active.splice(active.indexOf(selected), 1);
  }

  return { casualties, captainHit };
}
```

**Key consequences of this system**:
- Losing your BAR gunner means `canSuppress` becomes false — no more suppressive fire
- Losing your medic means `canTreatWounded` becomes false — wounded stay wounded
- Losing your platoon sergeant means the 2IC is replaced by a green NCO (or nobody)
- Losing your radioman means `hasRadio` becomes false — no more calling for info
- Losing YOU (captain casualty) means game over, regardless of how well the platoon was doing

The player doesn't choose who dies. War doesn't let you choose. But the player's decisions about formation, approach route, and captain position all influence the probabilities. A leader who scouts first, suppresses before moving, and stays in the middle position will lose fewer key personnel than one who charges blindly from the front.

### Act Transitions

State carries over exactly between acts. No resupply. No reset. The men you lost, the ammo you spent, the morale hits you took — all of it follows you. The only change is the `act` field and the `currentScene` pointer.

Transition happens automatically when the win condition for the current act is met. If you finish Act 1 with 14 men and 60% ammo, that's exactly what you start Act 2 with.

## 4. Enemy Readiness Clock

The Germans are initially confused by the scattered airborne drops. But every minute that passes, they get more organized. This creates the central tension of the game: **time spent gathering resources makes the enemy stronger.**

Readiness is `state.readiness` (0-100, starts at 10). The alert status label is derived:

```typescript
function getAlertStatus(readiness: number): string {
  if (readiness < 25) return "CONFUSED";
  if (readiness < 50) return "ALERTED";
  if (readiness < 75) return "ORGANIZED";
  return "FORTIFIED";
}
```

### How Readiness Increases

Two mechanisms:

1. **Passive (time)**: Every scene's `timeCost` advances the clock. Readiness increases by `+1 per 10 minutes` automatically when the engine processes a scene transition.

2. **Active (combat/detection)**: Each decision's outcome includes a `readinessChange` field (set by the content author). Combat outcomes typically add +5 to +15. Stealth outcomes add 0. A failed stealth attempt or alarm adds more.

### Alert Status Effects

| Status | Readiness | Effect on Outcome Engine | Narrative Effect |
|---|---|---|---|
| CONFUSED | 0-24 | No modifier | Small patrols, drowsy sentries, easy ambushes |
| ALERTED | 25-49 | -5 to effective score | Larger patrols, sentries challenge sounds, some MG positions manned |
| ORGANIZED | 50-74 | -12 to effective score | Defensive positions fully manned, coordinated patrols, mortar fire |
| FORTIFIED | 75-100 | -20 to effective score | Pre-registered fire zones, overlapping MGs, wire, mines |

These modifiers are already coded into the `calculateEffectiveScore` function in Section 6.

### The Core Trade-off

Every minute searching for supply containers, rallying extra men, or scouting is a minute the enemy uses to prepare. Finding one more soldier and a BAR might not matter if the enemy has had time to set up interlocking fields of fire. But attacking with too few men is also suicide. The player must constantly weigh: **do I have enough now, or do I need more and accept a harder fight?**

### Historical Basis

On D-Day, the 101st Airborne's scattered drops initially confused the German defenders. Units that assembled quickly and struck within the first 2-3 hours achieved their objectives against disorganized resistance. Units that took longer faced increasingly coordinated defense. By dawn, the window of confusion was closing.

## 5. Equipment & Terminology Wiki

The game includes an in-game wiki accessible at any time. When the game mentions equipment, tactics, or military terminology, the player can look it up. This is distinct from the Lessons Learned journal — the wiki is reference material available from the start, not earned through play.

```typescript
interface WikiEntry {
  id: string;               // e.g. "gammon_bomb"
  term: string;             // e.g. "Gammon Bomb"
  category: WikiCategory;
  shortDescription: string; // one line, shown in tooltips
  fullDescription: string;  // 3-6 sentences, shown in wiki page
  tacticalNote?: string;    // how it matters in gameplay terms
}

type WikiCategory =
  | "weapon_us"
  | "weapon_german"
  | "equipment"
  | "tactic"
  | "unit"
  | "terrain"
  | "vehicle";
```

### Wiki Design Rules

- Every piece of equipment mentioned in the game has a wiki entry
- Every tactical concept referenced in decisions has a wiki entry
- Terms in narrative text and decision descriptions are linkable (rendered as underlined text that opens the wiki on click)
- Wiki entries are factual and concise — like a field manual, not an encyclopedia
- Wiki is always available, even on first playthrough (this is reference, not progression)

### Example Entries

**Gammon Bomb**: British-designed anti-tank grenade widely used by Airborne forces. A cloth bag filled with C-2 plastic explosive with an impact fuse. Effective against vehicles, fortified positions, and building walls. Can be thrown ~30 meters. The blast is devastating in enclosed spaces. Unlike fragmentation grenades, the Gammon bomb produces concussive force rather than shrapnel.

**MG-42**: German general-purpose machine gun. Rate of fire: 1,200 rounds per minute — so fast the individual shots blur into a continuous ripping sound. Effective range: 1,000+ meters. A single MG-42 in a prepared position dominates open ground. Cannot be engaged frontally — must be suppressed and flanked, or avoided entirely.

**Cricket Clicker**: Small brass signaling device issued to 101st Airborne paratroopers for D-Day. One click-clack to challenge, two click-clacks to reply. Used to identify friendlies in the dark without shouting. Replaced the verbal challenge/password system for the initial drop.

### UI Integration

- `data-testid="wiki-btn"` — open wiki button (always visible in header)
- `data-testid="wiki-panel"` — wiki overlay panel
- `data-testid="wiki-term-{id}"` — clickable inline term in narrative text
- Wiki terms in narrative are rendered with a subtle underline/highlight to indicate they're clickable

## 6. Outcome Engine

The outcome engine is a single pipeline: **Decision → Modifiers → Effective Score → Outcome Range → Dice Roll → Result**. Every system feeds into it.

### Step 1: Base Tactical Quality

Set by the content author per decision. Uses a simple 5-tier system (not raw numbers) to reduce author error:

```typescript
type TacticalTier = "suicidal" | "reckless" | "mediocre" | "sound" | "excellent";

const TIER_BASE_SCORES: Record<TacticalTier, number> = {
  suicidal: 5,     // charging MG nests, walking lit roads at night
  reckless: 25,    // reasonable idea, terrible execution
  mediocre: 45,    // acceptable but missing key tactical elements
  sound: 70,       // solid tactics, proper procedures
  excellent: 90,   // textbook execution, creative adaptation
};
```

Content authors set a tier, not a number. This prevents agonizing over "is this a 67 or a 72?"

### Step 2: State Modifiers

All 5 core resources modify the base score. Each modifier is bounded and predictable.

```typescript
function calculateEffectiveScore(
  tier: TacticalTier,
  state: GameState,
  decision: Decision
): number {
  let score = TIER_BASE_SCORES[tier];

  // --- Morale: -15 to +5 ---
  if (state.morale < 20) score -= 15;       // men are breaking
  else if (state.morale < 40) score -= 10;  // shaky, hesitant
  else if (state.morale < 60) score -= 0;   // functional
  else if (state.morale < 80) score += 0;   // solid
  else score += 5;                           // aggressive, confident

  // --- Enemy Readiness: 0 to -20 ---
  if (state.readiness >= 75) score -= 20;    // fortified: everything is harder
  else if (state.readiness >= 50) score -= 12; // organized
  else if (state.readiness >= 25) score -= 5;  // alerted
  // confused (< 25): no penalty

  // --- Manning: -15 to +5 ---
  if (decision.minMen && state.men < decision.minMen) {
    score -= 15;  // undermanned for this action
  } else if (state.phase === "platoon" && state.men >= 12) {
    score += 5;   // strength in numbers
  }

  // --- Ammo: -10 to 0 ---
  if (state.ammo < 10) score -= 10;   // nearly dry, can't sustain fire
  else if (state.ammo < 30) score -= 5; // running low

  // --- Capabilities: -10 to +10 ---
  if (decision.requiresCapability) {
    const has = state.capabilities[decision.requiresCapability];
    if (has) score += 5;    // right tool for the job
    else score -= 10;       // attempting without proper capability
  }

  // --- Intel: 0 to +10 ---
  if (decision.benefitsFromIntel) {
    const has = state.intel[decision.benefitsFromIntel];
    if (has) score += 10;   // you know what you're walking into
  }

  // --- Phase check: penalty for platoon-level tactics in solo/squad ---
  if (decision.requiresPhase) {
    const phaseOrder = { solo: 0, squad: 1, platoon: 2 };
    if (phaseOrder[state.phase] < phaseOrder[decision.requiresPhase]) {
      score -= 25; // trying to do platoon tactics with a squad
    }
  }

  return Math.max(0, Math.min(100, score));
}
```

### Modifier Summary Table

| Modifier | Source | Range | When It Matters |
|---|---|---|---|
| Morale | `state.morale` | -15 to +5 | Low morale makes everything worse |
| Enemy Readiness | `state.readiness` | -20 to 0 | Higher readiness = harder fights |
| Manning | `state.men` vs `decision.minMen` | -15 to +5 | Undermanned operations fail |
| Ammo | `state.ammo` | -10 to 0 | Can't fight without ammo |
| Capability | `state.capabilities` | -10 to +5 | Right tools matter |
| Intel | `state.intel` | 0 to +10 | Knowledge saves lives |
| Phase mismatch | `state.phase` vs `decision.requiresPhase` | -25 to 0 | Can't flank with 2 men |

**Maximum possible swing**: -110 to +40. A "sound" decision (base 70) can range from 0 to 100 after modifiers. State matters enormously.

### Step 3: Outcome Range (Preparation → Luck Window)

```typescript
interface OutcomeRange { floor: number; ceiling: number; }

function getOutcomeRange(effectiveScore: number): OutcomeRange {
  // Continuous function: higher score = narrower range near the top
  const floor = Math.max(0, effectiveScore - 20);
  const ceiling = Math.min(100, effectiveScore + 15);
  return { floor, ceiling };
}
```

This replaces the stepped lookup table with a smooth function. An effective score of 80 gives range [60, 95]. An effective score of 20 gives range [0, 35]. The floor is always 20 below, the ceiling 15 above. This means:
- Good preparation: narrow range, consistently good outcomes
- Bad preparation: narrow range, consistently bad outcomes
- The "luck window" is always 35 points wide — the dice just pick where you land within it

### Step 4: Dice Roll

```typescript
function rollOutcome(range: OutcomeRange, seed?: number): number {
  const roll = seed !== undefined
    ? seededRandom(seed)           // deterministic for testing
    : Math.random();               // true random for gameplay
  return Math.round(range.floor + roll * (range.ceiling - range.floor));
}
```

### Step 5: Outcome Interpretation

The final score maps to one of 3 result tiers (not 6 — simpler for content authors):

```typescript
type OutcomeTier = "success" | "partial" | "failure";

function getOutcomeTier(score: number): OutcomeTier {
  if (score >= 60) return "success";
  if (score >= 30) return "partial";
  return "failure";
}
```

| Tier | Score | What Happens |
|---|---|---|
| **Success** (60-100) | Objective achieved. 0-1 casualties. Morale steady or up. |
| **Partial** (30-59) | Objective partially achieved or achieved at cost. 1-3 casualties. Morale drops. |
| **Failure** (0-29) | Objective failed. Heavy casualties or captain KIA. Morale crash. May be game over. |

### Step 6: Scene Transition & State Update

After the outcome is resolved, the engine processes a full state update:

```typescript
function processSceneTransition(
  state: GameState,
  scene: Scenario,
  outcome: OutcomeNarrative,
  captainPosition: CaptainPosition  // chosen by player for combat scenes
): GameState {
  const newState = { ...state };

  // 1. Assign casualties (WHO dies, including captain risk)
  if (outcome.menLost > 0) {
    const { casualties, captainHit } = assignCasualties(
      newState.roster, outcome.menLost, captainPosition
    );
    if (captainHit) return GAME_OVER; // captain KIA

    // Check if 2IC was killed — promote replacement
    if (casualties.some(s => s.id === newState.secondInCommand?.soldier.id)) {
      newState.secondInCommand = promoteNew2IC(newState.roster);
    }
  }

  // 2. Apply resource changes
  newState.men = Math.max(0, state.men - outcome.menLost);
  newState.ammo = Math.max(0, state.ammo - outcome.ammoSpent);
  newState.morale = clamp(state.morale + outcome.moraleChange, 0, 100);
  newState.readiness = clamp(state.readiness + outcome.readinessChange, 0, 100);

  // 3. Captain position modifiers (already applied in outcome engine,
  //    but morale impact applied here)
  if (captainPosition === "front") newState.morale = clamp(newState.morale + 5, 0, 100);
  if (captainPosition === "rear") newState.morale = clamp(newState.morale - 5, 0, 100);

  // 4. Advance time
  newState.time = advanceTime(state.time, scene.timeCost);

  // 5. Passive readiness increase from time passing
  newState.readiness = clamp(newState.readiness + Math.floor(scene.timeCost / 10), 0, 100);

  // 6. Update phase based on new men count
  newState.phase = getPhase(newState.men);

  // 7. Recalculate capabilities from updated roster
  newState.capabilities = deriveCapabilities(newState.roster, newState.ammo);

  // 8. Process rally event if present
  if (scene.rally) { /* add soldiers, ammo, morale, maybe a new 2IC */ }

  // 9. Silently check milestones
  newState.milestones = checkMilestones(newState.milestones, newState);

  // 10. Check game-over conditions (no men left, time expired)

  return newState;
}
```

Milestone checking is silent — the engine updates milestone status but never notifies the player. The player checks their orders to see if they're on track.

```typescript
function checkMilestones(milestones: Milestone[], state: GameState): Milestone[] {
  return milestones.map(m => {
    if (m.status !== "pending") return m;

    const milestoneTime = parseTime(m.time);
    const currentTime = state.time;

    // If current time has passed the milestone and it's not achieved, mark missed
    if (isAfter(currentTime, milestoneTime) && m.status === "pending") {
      return { ...m, status: "missed" };
    }

    return m;
  });
}
```

Milestones can be marked "achieved" by specific scenes (e.g., when you reach the rally point, the "rally_complete" milestone is achieved). Achieved milestones show differently in the orders panel — but only if the player checks.

### How All Systems Feed Each Other

```
  ┌──────────────┐   ┌─────────────┐
  │ BATTLE ORDERS │   │     2IC     │ ← comments on state + decisions
  │ (milestones)  │   │  (advisor)  │ ← veteran: good advice / green: bad
  └──────┬───────┘   └──────┬──────┘
         │ time pressure     │ contextual commentary
         ▼                   ▼
  Time passes ──────────► Readiness increases (+1/10min)
       │                        │
       ▼                        ▼
  Find soldiers ──► Men ──► Phase shifts (solo→squad→platoon)
       │              │         │
       ▼              ▼         ▼
  Ammo gained    Capabilities  Available decisions change
       │              │         │
       ▼              ▼         ▼
  ┌─────────────────────────────────────────────────┐
  │              OUTCOME ENGINE                     │
  │  tier + morale + readiness + manning            │
  │  + ammo + capability + intel + phase            │
  │  + captain position (front/middle/rear)         │
  │  = effective score → range → dice → result      │
  └─────────────────────────────────────────────────┘
       │         │         │         │
       ▼         ▼         ▼         ▼
  Casualties   Morale    Ammo     Readiness
  (who dies?) (±)       (-)      (+noise)
       │         │         │         │
       ▼         ▼         ▼         ▼
  Captain     Roster    Lesson    Milestone
  risk roll   updated  unlocked   checked
       │
       ▼
  2IC killed? → promote green replacement
```

Every system connects. Nothing is orphaned. The content author sets a tier, writes 2IC comments, and tags decisions; the engine handles all math, casualty assignment, and state updates.

## 7. Scenario JSON Schema

Simplified to ~10 fields per decision (down from ~25). The engine handles math; content handles narrative.

```typescript
interface Scenario {
  id: string;                    // e.g. "act1_landing"
  act: 1 | 2 | 3;
  timeCost: number;              // minutes this scene takes (advances the clock)
  narrative: string;             // the scene description shown to the player
  narrativeAlt?: Record<string, string>;  // alternate text keyed by intel flag name
  combatScene?: boolean;         // if true, player chooses captain position before deciding
  secondInCommandComments?: Record<string, string>;  // keyed by decision ID, 2IC reacts
  decisions: Decision[];
  rally?: RallyEvent;            // if this scene includes finding soldiers
  achievesMilestone?: string;    // milestone ID marked "achieved" when entering this scene
}

interface Decision {
  id: string;                    // e.g. "knife_sentry"
  text: string;                  // what the player sees as the choice
  tier: TacticalTier;            // "suicidal" | "reckless" | "mediocre" | "sound" | "excellent"

  // --- Optional tags (the engine checks these against state) ---
  minMen?: number;               // minimum men required to attempt
  requiresPhase?: GamePhase;     // "solo" | "squad" | "platoon"
  requiresCapability?: keyof PlatoonCapabilities;  // e.g. "canSuppress"
  benefitsFromIntel?: keyof IntelFlags;            // e.g. "knowsMGPosition"
  visibleIf?: VisibilityCondition;  // when to show this option

  // --- Outcome (3 tiers, simple fields) ---
  outcome: OutcomeTemplate;
}

interface VisibilityCondition {
  hasLesson?: string;            // requires this lesson from a previous run
  hasIntel?: string;             // requires this intel flag
  minMen?: number;               // requires this many men
  phase?: GamePhase;             // requires this game phase
}

interface OutcomeTemplate {
  success: OutcomeNarrative;     // shown when outcome tier = "success"
  partial: OutcomeNarrative;     // shown when outcome tier = "partial"
  failure: OutcomeNarrative;     // shown when outcome tier = "failure"
  fatal?: boolean;               // if true, failure = Captain KIA = game over
  lessonUnlocked: string;        // lesson ID (always unlocked, win or lose)
  nextScene: string;             // where to go next (same for all tiers)
  nextSceneOnFailure?: string;   // optional alternate path on failure (rare)
}

interface OutcomeNarrative {
  text: string;                  // what happened
  menLost: number;               // 0, 1, 2, 3... (exact number, not a range)
  ammoSpent: number;             // 0-20 (percentage points lost)
  moraleChange: number;          // -30 to +15
  readinessChange: number;       // 0 to +15 (combat noise, alarms)
  intelGained?: keyof IntelFlags; // optional intel flag set to true
}

interface RallyEvent {
  soldiers: Soldier[];           // who you found
  ammoGain: number;              // +5 to +15
  moraleGain: number;            // +3 to +8
  narrative: string;             // "PFC Miller, tangled in his chute..."
}
```

### Key Simplifications

1. **One `nextScene` per decision**, not three. Most decisions lead to the same place regardless of outcome — the difference is the state you arrive in. Only use `nextSceneOnFailure` for major story branches (max 2-3 per act).

2. **Exact casualty numbers**, not ranges. `menLost: 2` means 2 men are lost. The engine picks which soldiers from the roster. Simple, deterministic, easy to validate.

3. **Tier instead of raw number**. Content authors pick from 5 tiers. The engine converts to a score and applies modifiers.

4. **State changes are explicit per outcome tier.** Each outcome says exactly what happens to ammo, morale, and readiness. No hidden calculations.

5. **Readiness changes are on the outcome**, not a separate system. Combat increases readiness (noise). Stealth doesn't. This is set per outcome, not globally.

### Content Scope

- **Act 1**: 10 scenes. Scenes 1-3 solo (landing, knife fight, navigation). Scenes 4-6 squad building (finding soldiers, first patrol). Scenes 7-10 platoon movement (route to rally, obstacles).
- **Act 2**: 10 scenes. Scenes 1-2 recon/approach. Scenes 3-5 the assault. Scenes 6-8 clearing/securing. Scenes 9-10 initial consolidation.
- **Act 3**: 10 scenes. Scenes 1-6 preparation (flexible order — player chooses priority; counterattack can interrupt as early as scene 4). Scenes 7-10 the counterattack itself. The engine determines how many preparation scenes the player gets before the counterattack triggers based on time + readiness.
- **Each scene**: 3-5 decision options
- **Each option**: Success, partial, and failure narratives with explicit state changes
- **Total lessons**: ~30 across all acts

### Content Validation Rules (automated tests check these)

1. Every `nextScene` and `nextSceneOnFailure` must point to a valid scene ID in the same act
2. Every scene must be reachable from the act's starting scene
3. No scene can be a dead end (must have at least one decision with a `nextScene`)
4. Every `lessonUnlocked` must match a lesson ID in the lessons file
5. `menLost` on any outcome must not exceed the `minMen` of the decision (can't lose more men than are involved)
6. Solo-phase scenes (Act 1, scenes 1-3) must not have decisions with `requiresPhase: "platoon"`
7. Every `requiresCapability` and `benefitsFromIntel` must be valid keys on their respective interfaces

## 8. Lessons Learned System

```typescript
interface Lesson {
  id: string;                    // e.g. "mg42_kill_zones"
  category: LessonCategory;
  title: string;                 // e.g. "Machine Gun Kill Zones"
  content: string;               // 2-4 sentences of real tactical knowledge
  unlockedBy: string[];          // decision IDs that can unlock this lesson
  enablesOptions?: string[];     // decision IDs that become visible once this lesson is known
}

type LessonCategory =
  | "movement_navigation"
  | "engagement"
  | "defense"
  | "leadership"
  | "intel_recon";
```

### Lesson Design Rules

- Lessons are real military knowledge, not game tips
- Written in the voice of an after-action report or field manual
- Each lesson should make the player genuinely smarter about the tactical situation
- Some lessons unlock new decision options on subsequent playthroughs (the `visibleIf.hasLesson` mechanism)
- A player with all lessons unlocked and understood should achieve 80% win rate

### Persistence

Lessons are stored in `localStorage` under the key `normandy1944_lessons`. Format: `string[]` of lesson IDs. Cleared only by explicit player action (a "Reset Progress" button in the main menu).

## 9. Achievement System

Achievements persist in `localStorage` across all playthroughs. They reward specific playstyles, milestones, and discoveries — giving reasons to replay beyond just winning.

```typescript
interface Achievement {
  id: string;
  title: string;           // short name shown in achievement popup
  description: string;     // one sentence explaining what you did
  icon: string;            // emoji or simple symbol
  rarity: "common" | "uncommon" | "rare" | "legendary";
  condition: AchievementCondition;
}

type AchievementCondition =
  | { type: "game_complete" }                           // finished the 24 hours
  | { type: "game_complete_no_casualties" }             // perfect run
  | { type: "game_over"; cause: string }                // died in a specific way
  | { type: "captain_position_streak"; position: CaptainPosition; count: number }
  | { type: "all_lessons_unlocked" }
  | { type: "men_count"; threshold: number; comparison: "gte" | "lte" }
  | { type: "milestone_all_on_time" }                   // every milestone hit
  | { type: "readiness_threshold"; max: number }        // kept enemy below threshold at end
  | { type: "specific_decision"; decisionId: string }   // made a particular choice
  | { type: "playthroughs"; count: number };             // played N times
```

### Achievement Examples

**Common:**
- **First Drop** — Complete your first playthrough (win or lose)
- **Lessons of War** — Unlock your first lesson
- **Rally Point** — Find and rally 10 or more men in Act 1

**Uncommon:**
- **On Schedule** — Complete every battle order milestone on time
- **Conservation** — Finish the game with ammo above 40%
- **Ghost** — Complete Act 1 without raising enemy readiness above 25
- **Knife in the Dark** — Win the first solo knife fight

**Rare:**
- **Band of Brothers** — Complete the full 24 hours with 15+ men surviving
- **Lead from the Front** — Choose "front" position in every combat scene and survive
- **Tactical Genius** — Complete the game on first playthrough (no lessons)
- **No Man Left Behind** — Complete the game with zero KIA (wounded allowed)

**Legendary:**
- **Perfect Captain** — Complete the game with zero KIA, all milestones on time, enemy readiness never above 50, morale never below 50
- **Armchair General** — Complete the game always choosing "rear" position (low morale run — extremely difficult)
- **Scholar of War** — Unlock every single lesson across all playthroughs
- **Immortal** — Complete 10 full playthroughs

### UI

Achievements pop up as a small notification when unlocked (doesn't interrupt gameplay). Full achievement gallery accessible from the main menu. `data-testid="achievement-popup"` for the notification, `data-testid="achievement-gallery"` for the full list.

### Persistence

Stored in `localStorage` under `normandy1944_achievements`. Format: `string[]` of achievement IDs.

## 10. Epilogue & Credits

Every playthrough ends with an epilogue — whether you won or lost. This is what makes the player care about their soldiers as people, not just numbers.

### How It Works

When the game ends (victory or game over), the screen fades to a "After the War" epilogue. Each soldier in your roster gets a short paragraph describing what happened to them after D-Day. Their fate depends on their status at game end.

```typescript
interface SoldierEpilogue {
  soldierId: string;
  status: "active" | "wounded" | "KIA" | "missing";
  epilogue: string;    // generated from templates based on status
}

interface EpilogueTemplate {
  active: string[];     // pool of "survived the war" epilogues
  wounded: string[];    // pool of "evacuated/recovered" epilogues
  KIA: string[];        // pool of "killed in action" epilogues
  missing: string[];    // pool of "captured/POW" epilogues
}
```

### Epilogue Examples by Status

**Active (survived the battle)**:
> *Sergeant Bill Henderson survived the war. He was promoted to First Sergeant after Bastogne and received the Bronze Star. After V-E Day, he returned to Scranton, Pennsylvania, married his high school sweetheart Margaret, and ran a plumbing supply company until his retirement in 1982. He never talked about the war. He died in 2001, age 78.*

**Wounded (evacuated)**:
> *PFC Tommy Kowalski was evacuated to a field hospital in England after taking shrapnel in his left leg at the crossroads. He spent four months in recovery and was sent home in October 1944. He walked with a limp for the rest of his life. He became a schoolteacher in Detroit and coached the junior varsity football team for thirty years. He died in 2003, age 81.*

**KIA (killed in action)**:
> *Private First Class James "Jimmy" Doyle was killed in action near Sainte-Marie-du-Mont on June 6, 1944. He was nineteen years old. He is buried at the Normandy American Cemetery in Colleville-sur-Mer, France. Plot F, Row 12, Grave 7. His mother received a Gold Star and his posthumous Purple Heart. She never remarried.*

**Missing (captured / POW)**:
> *Corporal Ray Stanton was captured by elements of the 6th Fallschirmjäger Regiment on the morning of June 6. He spent eleven months in Stalag VII-A near Moosburg, Bavaria. He was liberated by the 14th Armored Division in April 1945, weighing 112 pounds. He returned to Kansas City and never spoke about the camp. He died in 1989, age 67.*

### Epilogue for the Captain

If you survived:
> *Captain [player's implied character] led 2nd Platoon through 24 hours of combat in Normandy. [X] of his [Y] men survived the day. He went on to fight through Carentan, Operation Market Garden, and the Battle of the Bulge. He was one of the few who served from D-Day to V-E Day without serious wound. He returned to [hometown] and [postwar life]. He carried the names of the men he lost for the rest of his life.*

If you died:
> *Captain [character] was killed in action near Sainte-Marie-du-Mont on June 6, 1944. Command of the platoon passed to [2IC name], who [continued / was also killed]. [X] of the original [Y] men survived the day. The Captain's family received his Silver Star posthumously.*

### Game Over is Not the End

Even on game over, the epilogue plays. Your men don't all die just because you died — some are captured, some escape, some are wounded and evacuated. The game over screen shows:
1. How you died (the death narrative)
2. What happened to your platoon after your death (the 2IC took over, or they scattered)
3. Individual epilogues for every soldier in your roster

This is powerful for the roguelike loop: you die, but then you see that PFC Kowalski survived as a POW and came home. Next run, when you see Kowalski's name in your roster, you care. You want to keep him alive this time.

### Credits

After the epilogues, a brief credits screen:
- "Based on the actions of the 101st Airborne Division, June 6, 1944"
- "In memory of the men who fought and died in Normandy"
- Run statistics: time played, decisions made, men rallied, men lost, lessons learned
- Achievement unlocks from this run

### UI

- `data-testid="epilogue-screen"` — the full epilogue view
- `data-testid="epilogue-soldier-{id}"` — individual soldier epilogue
- `data-testid="credits-screen"` — credits and run statistics
- `data-testid="run-statistics"` — stats summary

## 11. UI Specification

### Visual Style

- **Theme**: Dark, muted military tones. Dark olive/brown background, cream/parchment text.
- **Typography**: Monospace for status panel (like a military teletype). Serif for narrative text (like a war diary). Sans-serif for UI chrome (buttons, menus).
- **No images required for v1.** Pure text with strong typography. Scene illustrations added in Phase 9.

### Layout

```
+-------------------------------------------------------+
|  NORMANDY 1944             [Wiki] [Lessons] [Menu]    |
+-------------------------------------------------------+
|                                                        |
|  [STATUS BAR — the 5 core numbers]                     |
|  Men: 0    Ammo: ░░░░░ 5%   Morale: ██░░░ 40         |
|  Enemy: CONFUSED             0215 hrs                  |
|                                                        |
+-------------------------------------------------------+
|                                                        |
|  [NARRATIVE PANEL - scrollable]                        |
|                                                        |
|  You hit the ground hard. The chute tangles in a       |
|  hedgerow and you cut yourself free, dropping six      |
|  feet into a muddy drainage ditch. Silence. Then       |
|  distant gunfire to the east. You have no idea where   |
|  your stick landed.                                    |
|                                                        |
|  You can hear movement in the field to your north.     |
|  Could be friendlies. Could be a German patrol.        |
|                                                        |
+-------------------------------------------------------+
|                                                        |
|  [DECISIONS]                                           |
|                                                        |
|  > Use your cricket clicker to signal                  |
|  > Call out the challenge word quietly                  |
|  > Stay silent and observe                             |
|  > Move toward the sound with weapon ready             |
|                                                        |
+-------------------------------------------------------+
```

Note: In solo phase, the status bar shows only relevant info (no "Men: 0" — instead show "ALONE"). The full 5-number display appears once you have at least 1 other soldier.

### Browser-Use Interaction Contract

Every interactive element must have a `data-testid` attribute:

| Element | data-testid | Description |
|---|---|---|
| Narrative text | `narrative` | Current scene text |
| Decision button | `decision-{decision.id}` | Clickable choice |
| Men count | `status-men` | e.g. "12/12" |
| Ammo bar | `status-ammo` | Visual + text |
| Morale bar | `status-morale` | Visual + text |
| Time display | `status-time` | e.g. "0215 hrs" |
| Lesson journal button | `lesson-journal-btn` | Opens journal overlay |
| Lesson journal panel | `lesson-journal` | The journal content |
| Game over screen | `game-over` | Shown on death |
| Lesson unlocked text | `lesson-unlocked` | New lesson notification |
| Restart button | `restart-btn` | Starts new run |
| Death narrative | `death-narrative` | How you died |
| Outcome narrative | `outcome-narrative` | Result of last decision |
| Main menu | `main-menu` | Start screen |
| Start game button | `start-game-btn` | Begins a new run |
| Orders button | `orders-btn` | Opens battle orders panel |
| Orders panel | `orders-panel` | OPORD with milestones |
| Wiki button | `wiki-btn` | Opens equipment/terminology wiki |
| Wiki panel | `wiki-panel` | Wiki overlay content |
| Wiki inline term | `wiki-term-{id}` | Clickable term in narrative |
| Enemy readiness | `status-readiness` | Current enemy alert level |
| 2IC comment | `second-in-command-comment` | Sergeant's contextual advice |
| Captain position selector | `captain-position` | Front/middle/rear choice (combat scenes) |
| Roster panel button | `roster-btn` | Opens platoon roster view |
| Roster panel | `roster-panel` | Shows all soldiers with name, rank, role, status |
| Achievement popup | `achievement-popup` | Shows when achievement unlocked |
| Achievement gallery | `achievement-gallery` | Full list from main menu |
| Epilogue screen | `epilogue-screen` | Post-game character epilogues |
| Credits screen | `credits-screen` | Run statistics and credits |
| Debug panel | `debug-panel` | Test mode: seed state, skip scenes |

### Debug Panel (Test Mode Only)

Accessible via URL parameter `?debug=true`. Allows:
- Setting platoon state manually (men count, ammo, morale)
- Jumping to any scene by ID
- Seeding the random number generator (for deterministic test runs)
- Viewing the current game state as JSON
- Pre-loading specific lessons

## 12. Narrative Tone Guide

### Voice

Terse. Military. Present tense. Second person. No flowery language. No melodrama. Facts and sensory details.

### Examples

**Good:**
> You reach the hedgerow. Beyond it, open pasture. Two hundred meters to a stone farmhouse. An MG-42 opens up from the second floor window. The sound is unmistakable — tearing canvas, 1,200 rounds a minute. Your men hit the dirt.

**Bad:**
> You gaze upon the terrifying hedgerow, your heart pounding with the weight of command. The deadly machine gun roars to life like an angry beast, its bullets screaming through the night air.

### Death Narratives

Clinical. Respectful. Not gratuitous. Describe what happened tactically, not graphically.

**Good:**
> The machine gun catches your lead squad in the open. Three men go down in the first burst. The rest are pinned with no cover. You try to rally them but take a round through the shoulder. Then another. You don't hear the third.

**Bad:**
> Blood sprays everywhere as bullets tear through flesh and bone. Your men scream in agony as they're ripped apart by the merciless hail of lead.

## 13. File Ownership Map (Parallel Agent Safety)

During parallel work phases, each agent writes ONLY to its assigned paths:

| Agent Role | Writes To | Never Touches |
|---|---|---|
| Historical Research | `src/research/historical/` | Any other directory |
| Tactics Research | `src/research/tactics/` | Any other directory |
| Equipment Research | `src/research/equipment/` | Any other directory |
| Enemy Research | `src/research/enemy-doctrine/` | Any other directory |
| Engine Developer | `src/engine/`, `src/types/` | `src/components/`, `src/content/` |
| UI Developer | `src/components/`, `src/styles/` | `src/engine/`, `src/content/` |
| Test Developer | `tests/` | `src/` |
| Act 1 Content | `src/content/scenarios/act1/`, `src/content/lessons-act1.json` | Other acts |
| Act 2 Content | `src/content/scenarios/act2/`, `src/content/lessons-act2.json` | Other acts |
| Act 3 Content | `src/content/scenarios/act3/`, `src/content/lessons-act3.json` | Other acts |
| Wiki Content | `src/content/wiki.json` | Everything else |
| Lesson Compiler | `src/content/lessons.json` (merges act lesson files) | Individual act files |

Shared files (`package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`) are only edited during sequential phases, never during parallel work.

## 14. Error Recovery Rules

Agents follow these rules without asking:

1. **Test failure**: Fix the code that fails the test. Tests are correct. If truly unsure, log the issue in `docs/DECISIONS.md` and skip that specific test with a `TODO` comment.
2. **Dev server crash**: Read the error message, fix the cause, restart the server, continue.
3. **TypeScript error**: Fix it. Do not use `@ts-ignore` or `any` as a workaround.
4. **Content validation failure**: The content is wrong, not the validator. Fix the content to match the schema.
5. **Browser-use can't find element**: Check that `data-testid` attributes are present. If missing, add them. If the page hasn't loaded, wait and retry (max 3 retries with 2-second waits).
6. **Git conflict**: Should not happen with file ownership rules. If it does, the most recent change wins.
7. **Ambiguous design decision**: Check this spec. If not covered, choose the simpler option, document in `docs/DECISIONS.md`.

## 15. Git Strategy

- Commit after every completed phase with a descriptive message
- Format: `phase-{N}: {description}` (e.g. `phase-1: complete historical and tactical research`)
- Never ask permission to commit
- Never force push
- Branch: `main` for the vertical slice, feature branches for Acts 2/3

## 16. AI Narrative System

### Overview

The game supports two narrative modes:

- **Hardcoded mode** (default): uses static `text` fields from scene files. No API needed.
- **LLM mode**: when an access code is validated, scene outcomes are narrated dynamically by Claude Sonnet via a Cloudflare Worker proxy. Free-text player actions and personalized epilogues are also enabled.

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│  React App  │────>│ Cloudflare Worker │────>│ Anthropic API │
│  (Vite)     │<────│ (narrative proxy) │<────│ (SSE stream)  │
└─────────────┘     └──────────────────┘     └───────────────┘
                            │
                    ┌───────┴───────┐
                    │ Cloudflare KV │
                    │ (access codes)│
                    └───────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/services/narrativeService.ts` | Client-side service: mode detection, API calls, SSE parsing, fallback chain |
| `src/services/promptBuilder.ts` | Builds system+user prompts for narration, classification, epilogues |
| `src/services/eventLog.ts` | Append-only log of significant playthrough events (feeds epilogues) |
| `src/content/relationships.ts` | Soldier relationship map (feeds prompts and epilogues) |
| `worker/src/index.ts` | Cloudflare Worker: access code validation, Anthropic proxy |
| `src/components/StreamingText.tsx` | Typewriter/streaming text display component |
| `src/components/AccessCodeInput.tsx` | Access code validation form |
| `src/components/FreeTextInput.tsx` | Free-text player action input |

### Content Author Guide

To make a scene LLM-compatible, add two fields:

1. **`sceneContext`** on the `Scenario`: 1-3 sentences describing the tactical situation for the LLM.

```typescript
sceneContext: "Night. Flooded field near DZ. No weapon, no bearings. AA fire along horizon. Alone in enemy territory."
```

2. **`context`** on each `OutcomeNarrative` (success/partial/failure): mechanical description of what happened.

```typescript
context: "Gear check successful. Found pistol, grenades, compass. Morale boost."
```

If `context` is absent on an outcome, the LLM is not called and the hardcoded `text` is shown.

### Free-Text Player Actions

When LLM mode is active, players can type custom actions. The flow:

1. Player types an action (min 5 chars)
2. LLM classifies it against existing decisions → returns `{ matchedDecision, tier, reasoning }`
3. Game engine processes the matched decision normally (same casualties, ammo, morale)
4. LLM narrates the player's specific action with the mechanical outcome

### Epilogue Generation

At game end, each soldier's epilogue is generated from:
- Their status (active/KIA/wounded/missing)
- Their relationships with other soldiers
- Playthrough events they were involved in

In hardcoded mode, default templates are used. In LLM mode, personalized epilogues are generated in parallel.

### Access Codes

Access codes are stored in Cloudflare KV. Each code has:
- `active: boolean`
- `maxUses?: number`
- `currentUses?: number`

### Deployment

1. Create a KV namespace: `wrangler kv namespace create ACCESS_CODES`
2. Update `worker/wrangler.jsonc` with the KV namespace ID
3. Set the API key: `wrangler secret put ANTHROPIC_API_KEY`
4. Deploy: `cd worker && wrangler deploy`
5. Set `VITE_NARRATIVE_API_URL` to the Worker URL

### Cost Estimate

- ~$0.15-0.20 per full playthrough with LLM narration
- Classification adds ~$0.02 per free-text action
- Epilogues add ~$0.05 total (all soldiers in parallel)

## 17. Agent Log Format

Every agent writes a summary to `docs/agent-logs/phase-{N}-{description}.md`:

```markdown
# Phase {N}: {Description}

## What Was Done
- Bullet points of actions taken

## Files Created/Modified
- List of files

## Decisions Made
- Any choices that weren't explicitly in the spec

## Issues Encountered
- Problems and how they were resolved

## Time Taken
- Approximate duration
```
