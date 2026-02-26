# Scene 2: Finding North

## Metadata
- **Scene ID**: `act1_finding_north`
- **Act**: 1
- **Time**: ~01:30 (depends on Scene 1)
- **timeCost**: 15-30 minutes (varies by decision)
- **Phase**: solo (men=0)
- **combatScene**: false
- **Next scene**: `act1_first_contact`

## State Entering
- men: 0, ammo: 5, morale: 33-47 (depends on Scene 1)
- readiness: 10-13 (depends on Scene 1)
- time: ~01:30
- phase: "solo"
- intel.hasCompass: true ONLY if player chose "check gear" in Scene 1 and got success/partial

## Narrative

You're on solid ground now. A hedgerow-lined field, Norman bocage country. The hedgerows are 6-foot walls of earth, roots, and brush — you can't see through them, can't see over them. Every field is a box. The briefing maps showed DZ C near Sainte-Marie-du-Mont, but DZ C could be anywhere within a 10-mile radius given how scattered the drop was. You need to figure out where you are and which direction to move.

**narrativeAlt** (if hasCompass): "You pull out your compass. The luminous dial settles. North. Now — where is the assembly area relative to north?"

**narrativeAlt** (if NOT hasCompass): "No compass. No stars visible through the cloud cover. The hedgerows block your view in every direction. You need another way to find north."

**Sensory details**: Wet grass underfoot. The smell of cow manure and hedgerow blossoms. Distant rumble that could be surf, could be bombing. An owl. The feel of cold mud on your hands.

## Decisions

### 1. "Use your compass and match terrain features to the briefing maps"
- **id**: `north_compass_terrain`
- **tier**: `excellent`
- **visibleIf**: { hasIntel: "hasCompass" } — ONLY available if player has compass
- **Rationale**: Compass + terrain association = you can fix your position. The gold standard of land navigation.
- **timeCost override**: 15 minutes
- **outcome.success**: "Compass bearing: north is that way. The church steeple you spotted earlier is northeast. Cross-reference with the briefing map you memorized — that's Sainte-Marie-du-Mont. You're southwest of the DZ, maybe two klicks. You know exactly where to go." moraleChange: +5, readinessChange: 0, ammoSpent: 0, menLost: 0, intelGained: "hasMap", nextScene: "act1_first_contact"
- **outcome.partial**: "Compass gives you north. But the terrain doesn't match what you remember from the briefing. Either the map was wrong or you're further off the DZ than you thought. You have a direction, not a position." moraleChange: +2, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.failure**: "Compass works, but you can't match anything to the briefing maps. These hedgerows all look identical. You have north — that's something — but you're guessing at everything else." moraleChange: 0, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **lessonUnlocked**: `dead_reckoning`

### 2. "Look for the North Star — Polaris should be visible between clouds"
- **id**: `north_stars`
- **tier**: `sound`
- **Rationale**: Correct technique without instruments. Takes longer because you need a gap in cloud cover.
- **timeCost override**: 20 minutes
- **outcome.success**: "You watch the sky. A gap in the clouds — there. The Big Dipper, pointer stars leading to Polaris. North. You wait for another gap to confirm. Yes. You have a bearing. Now you can move with purpose." moraleChange: +3, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.partial**: "Cloud cover is thick. You catch a glimpse — maybe Polaris, maybe not. You pick a direction based on your best guess. Seventy percent sure. Good enough to start moving." moraleChange: +1, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.failure**: "The clouds won't break. You stare at the sky for twenty minutes and see nothing. Your neck aches. You're no closer to knowing where you are." moraleChange: -2, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **lessonUnlocked**: `dead_reckoning`

### 3. "Head toward the sound of gunfire — that's where the action is"
- **id**: `north_follow_gunfire`
- **tier**: `mediocre`
- **Rationale**: Sound travels strangely at night. The gunfire could be from any direction. Moving toward combat without knowing where you are is risky.
- **timeCost override**: 15 minutes
- **outcome.success**: "You pick the loudest direction and start moving. Luck is with you — after 15 minutes of hedgerow climbing, you spot a road sign. You can't read it in the dark, but the road gives you a line of travel." moraleChange: -2, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.partial**: "You move toward the shooting. The sound bounces off the hedgerows — left, right, behind you. After 15 minutes you're not sure you've gone in a straight line. The gunfire has stopped. Now what?" moraleChange: -4, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.failure**: "You follow the noise. It leads you to the edge of a village — and you can see German helmets in the firelight. You freeze, back away slowly, and circle around. You've just walked 15 minutes in the wrong direction." moraleChange: -6, readinessChange: +5, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **lessonUnlocked**: `dead_reckoning`

### 4. "Pick a direction and start walking — standing still is dying"
- **id**: `north_just_walk`
- **tier**: `reckless`
- **Rationale**: Moving without orientation is how you walk into a German position or circle back to where you started. Time pressure is real, but blind movement wastes more time than it saves.
- **timeCost override**: 25 minutes
- **outcome.success**: "You pick what feels like the right direction and push through a hedgerow. Then another. Then another. Every field looks the same. After 25 minutes of stumbling, you find a dirt track. At least you can follow something now." moraleChange: -3, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.partial**: "You walk. And walk. Hedgerow, field, hedgerow, field. You're not sure you haven't turned in a circle. 25 minutes gone. Your boots are soaked. You're exhausted and no closer to knowing where you are." moraleChange: -5, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **outcome.failure**: "You blunder through the bocage for 25 minutes. You trip over a stone wall, rip your trousers, and land in a cow field. When you get up, you hear German voices somewhere close. You flatten yourself against the hedgerow and wait until they pass. You've wandered right past a German position." moraleChange: -8, readinessChange: +5, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **lessonUnlocked**: `dead_reckoning`

### 5. "Search the area for supply bundles — parachutes should be visible"
- **id**: `north_search_supplies`
- **tier**: `sound`
- **Rationale**: Supply canisters were dropped with the paratroopers. Finding one means ammo, possibly weapons. But searching takes time and you're moving around making noise.
- **timeCost override**: 30 minutes
- **outcome.success**: "You move carefully through the fields, looking for the white silk of equipment parachutes. There — caught in a tree. You pull the canister down. Rifle ammunition, a few K-rations, and two extra bandoliers. Your ammo situation just improved dramatically." moraleChange: +2, readinessChange: +3, ammoSpent: 0, menLost: 0, **ammoGain: +10**, nextScene: "act1_first_contact"
- **outcome.partial**: "You search for 30 minutes. You find a parachute — but it's just a personal equipment bundle, mostly clothing and a broken radio. One box of .30 cal ammo. Better than nothing." moraleChange: 0, readinessChange: +3, ammoSpent: 0, menLost: 0, **ammoGain: +5**, nextScene: "act1_first_contact"
- **outcome.failure**: "Thirty minutes of searching in the dark. You find nothing. The supply bundles could be anywhere in a square mile. You've used up time, made noise moving through the hedgerows, and have nothing to show for it." moraleChange: -4, readinessChange: +4, ammoSpent: 0, menLost: 0, nextScene: "act1_first_contact"
- **lessonUnlocked**: `supply_discipline`

## Design Notes for Agent

- The compass decision (Decision 1) is ONLY visible if the player has hasCompass intel from Scene 1. Use `visibleIf: { hasIntel: "hasCompass" }`. Without it, the player's best option is stars (Decision 2) which costs 5 extra minutes.
- Decision 5 (search for supplies) is the **key time-vs-resources trade-off**. +10 ammo is massive (doubles starting ammo) but 30 minutes and +3 readiness is a real cost. This ammo will matter in Scene 5.
- All decisions advance to the same next scene. The difference is: time spent, intel gained, ammo gained, morale/readiness changes.
- The narrativeAlt must branch on hasCompass. This is the first scene where prior decisions visibly matter.
- Keep the compass option and non-compass options at similar text length so having the compass doesn't make the "right answer" visually obvious.
- ammoGain on Decision 5 is a SPECIAL field — the agent should handle this as a custom state change in the outcome, not a standard OutcomeNarrative field. Suggest adding it as a note in the narrative or as extra state logic.
