# Scene 1: The Landing

## Metadata
- **Scene ID**: `act1_landing`
- **Act**: 1
- **Time**: 01:15
- **timeCost**: 15 minutes
- **Phase**: solo (men=0)
- **combatScene**: false
- **Next scene**: `act1_finding_north`

## Starting State
- men: 0, ammo: 5, morale: 40, readiness: 10
- time: { hour: 1, minute: 15 }
- phase: "solo"
- No roster, no 2IC, no capabilities except hasExplosives (2 grenades)
- intel: all false (compass may be in your pocket — but you haven't checked)

## Narrative

Terse, military, present tense, second person. Cold, dark, alone.

You're waist-deep in freezing water. Your parachute is a tangled mess behind you, rigging lines wrapped around your legs and equipment. The C-47 engines have faded to nothing. Distant anti-aircraft fire flickers on the horizon — orange flashes, then silence. Your musette bag is soaked. Your rifle is somewhere under the water. You can feel the weight of your pistol on your hip. The darkness is total. No moon. No stars through the cloud cover. You are completely alone in occupied France.

**Sensory details**: Cold water numbing your legs. The smell of wet grass and mud. The sound of water lapping against hedgerow banks. Distant thump of explosions — could be naval bombardment, could be AA guns. The creak of your harness.

**narrativeAlt**: If the player has the lesson "assess_before_acting" from a previous run, add a line: "You remember the last time. Slow down. Think first."

## Decisions

### 1. "Check your gear — pat down every pocket, check each strap"
- **id**: `landing_check_gear`
- **tier**: `excellent`
- **Rationale**: Methodical assessment is what training teaches. 30 seconds of checking saves you hours later.
- **outcome.success**: "You work through your equipment systematically. Pistol — check. Two grenades — check. Cricket clicker in your breast pocket — check. And there — your compass, still in your trouser pocket. The luminous dial glows faintly. You have direction." moraleChange: +5, readinessChange: 0, ammoSpent: 0, menLost: 0, intelGained: "hasCompass", nextScene: "act1_finding_north"
- **outcome.partial**: "You check your pockets but your hands are numb from the cold water. Pistol — yes. Grenades — you can feel two. Your fingers are shaking too hard to find anything smaller. You need to get to dry ground." moraleChange: +2, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.failure**: "You fumble with your gear, fingers useless in the cold. Something falls from your harness into the water — you hear the splash but can't find it in the dark. You need to move before you freeze." moraleChange: -2, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **lessonUnlocked**: `assess_before_acting`

### 2. "Get your bearings — listen, look for any light or landmark"
- **id**: `landing_assess`
- **tier**: `sound`
- **Rationale**: Good instinct. You're orienting before moving. Not as thorough as a full gear check but still composed.
- **outcome.success**: "You force yourself to breathe. Listen. Distant gunfire to the north — or is it east? A church steeple, barely visible against the clouds. The briefing maps mentioned a steeple near the DZ. You have a reference point." moraleChange: +3, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.partial**: "You stop and listen. Explosions, but you can't tell where. The darkness gives you nothing. At least you're thinking clearly." moraleChange: +1, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.failure**: "You try to orient but the sound bounces off the hedgerows. Every direction sounds the same. The cold is getting to you." moraleChange: -1, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **lessonUnlocked**: `assess_before_acting`

### 3. "Get out of this water — move to solid ground now"
- **id**: `landing_move_fast`
- **tier**: `reckless`
- **Rationale**: Feels decisive but it's panic. You splash through water making noise, don't check your gear, don't orient.
- **outcome.success**: "You push through the water toward the nearest bank. Mud sucks at your boots. You haul yourself onto firm ground, dripping, gasping. You're out — but you have no idea which direction you're facing." moraleChange: -1, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.partial**: "You lurch forward. Your boot catches on a submerged fence post and you go face-first into the water. Your pistol is soaked. You drag yourself to the bank coughing." moraleChange: -3, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.failure**: "You thrash toward the bank. Your ankle twists on something under the water — a root, a wire, you can't tell. Pain shoots up your leg. You make it to solid ground but you're limping. And someone might have heard that splashing." moraleChange: -5, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **lessonUnlocked**: `assess_before_acting`

### 4. "Stay still — don't move, don't make a sound"
- **id**: `landing_freeze`
- **tier**: `mediocre`
- **Rationale**: Not wrong, but passive. The water is cold. Every minute you stand here, you lose body heat and time. Waiting achieves nothing.
- **outcome.success**: "You stand motionless. The water numbs your legs. Minutes pass. Nothing happens. The silence is deafening. Eventually you realize nobody is coming to help you — you need to move." moraleChange: -3, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.partial**: "You wait. And wait. The cold creeps up your thighs. Your teeth start chattering — you clamp your jaw shut. Five minutes. Ten. Nothing. You're freezing for no reason." moraleChange: -5, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **outcome.failure**: "You freeze. Literally. Your legs go numb. When you finally try to move, you stumble and splash. The cold has eaten into your muscles. You've wasted time and energy for nothing." moraleChange: -7, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_finding_north"
- **lessonUnlocked**: `assess_before_acting`

## Design Notes for Agent

- This is the FIRST scene. Set the tone: harsh, cold, lonely, military.
- No combat. No other humans. Just you and the dark.
- The "excellent" option (check gear) rewards the player with hasCompass intel — this makes Scene 2 significantly easier.
- The "reckless" option (move fast) punishes with readiness increase (splashing = noise) and no intel gained.
- The "mediocre" option (freeze) punishes with morale loss from cold and wasted time.
- DO NOT make any decision text sound obviously better than others. "Check your gear" and "Get out of this water" should both sound like reasonable first instincts.
- All decisions go to the same nextScene. The difference is state change, not branching.
- Keep narratives SHORT. 2-3 sentences per outcome. Military prose. No adjective stacking.
