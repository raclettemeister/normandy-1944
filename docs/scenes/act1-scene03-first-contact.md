# Scene 3: First Contact

## Metadata
- **Scene ID**: `act1_first_contact`
- **Act**: 1
- **Time**: ~01:45-02:00 (depends on prior scenes)
- **timeCost**: 15 minutes
- **Phase**: solo (men=0)
- **combatScene**: false (recognition, not combat)
- **Next scene**: `act1_the_sergeant`

## State Entering
- men: 0, ammo: 5-15 (depends on supply search), morale: 25-50, readiness: 10-18
- phase: "solo"
- Possible intel: hasCompass, hasMap (both from earlier scenes)

## Narrative

You're moving through a hedgerow gap when you hear it. Footsteps. Close — maybe 20 meters ahead. A figure, darker than the darkness around it. Standing still. You can't see a uniform. You can't see a weapon. They haven't seen you yet. Your hand goes to your pistol. Your other hand touches the cricket clicker in your breast pocket. You remember the briefing — there's a recognition procedure, a way to identify friendlies in the dark. But what exactly was it?

**Design principle**: The narrative does NOT remind the player what the clicker procedure is. It just says "there's a recognition procedure." A player who knows it (from the wiki, from a previous run, from the lesson journal) will pick the right option. A first-time player has to guess.

**Sensory details**: The crunch of gravel under a boot. The figure's breathing. The weight of the clicker in your pocket — small, brass, cold.

## Decisions

### 1. "Click the cricket once and wait"
- **id**: `contact_click_once`
- **tier**: `excellent`
- **Rationale**: CORRECT procedure. One click-clack to challenge. Wait for two click-clacks in response.
- **outcome.success**: "One click-clack. Silence. Then — click-clack, click-clack. Two responses. The figure steps forward. An American. PFC from the 502nd, dropped way off target. He's shaking but armed. 'Jesus, am I glad to see someone,' he whispers." moraleChange: +5, readinessChange: 0, ammoSpent: 0, menLost: 0, **men: +1 (stray paratrooper joins as temporary rifleman)**, nextScene: "act1_the_sergeant"
- **outcome.partial**: "One click-clack. A long pause. Then two clicks — hesitant, fumbling. An American, badly shaken. He can barely hold his clicker. He's from the 501st, separated from his stick. He's not much use, but he's a body." moraleChange: +3, readinessChange: 0, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.failure**: "One click-clack. Nothing. The figure bolts, crashing through the hedgerow. American — you catch a glimpse of a 101st patch as he runs. Too panicked to respond properly. He's gone." moraleChange: -1, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 2. "Click twice and wait for one click"
- **id**: `contact_click_twice`
- **tier**: `reckless`
- **Rationale**: REVERSED. Two clicks is the RESPONSE, not the challenge. The figure has no idea what you're doing.
- **outcome.success**: "Click-clack, click-clack. The figure freezes. That's not the challenge — it's the response. He doesn't know what to do. After a tense 30 seconds, he whispers '...Flash?' You respond 'Thunder.' He's American. But you both just stood there confused for half a minute in the open." moraleChange: -2, readinessChange: +2, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.partial**: "Click-clack, click-clack. Silence. The figure backs away slowly. You hear him scrambling through the hedgerow. Gone. You used the wrong sequence — he didn't trust it." moraleChange: -4, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "Click-clack, click-clack. The figure panics. A shot cracks the air — muzzle flash blinding in the dark. The bullet snaps past your ear. You hit the dirt. By the time you look up, he's gone. An American just shot at you because you gave the wrong signal." moraleChange: -6, readinessChange: +6, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 3. "Click three times rapidly"
- **id**: `contact_click_three`
- **tier**: `suicidal`
- **Rationale**: Not a signal at all. Just noise. The figure interprets it as a threat.
- **outcome.success**: "Three rapid clicks. The figure drops flat. You hear the bolt of a rifle being worked. 'WHO'S THERE?' An American voice. Terrified. You call out 'Flash!' and he responds 'Thunder' — but he almost shot you. Your heart is pounding." moraleChange: -5, readinessChange: +5, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.partial**: "Three clicks. A burst of rifle fire — the figure empties his clip in your general direction. You press yourself into the dirt. Bullets thud into the hedgerow above you. When it stops, you hear running. He's gone. German or American, you'll never know." moraleChange: -8, readinessChange: +8, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "Three clicks. The figure fires. Something slams into the ground next to your face — dirt and rock spray into your eyes. You roll behind the hedgerow, half-blind. When you can see again, you're alone. But everyone within 500 meters heard those shots." moraleChange: -10, readinessChange: +10, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`
- **fatal**: true (failure outcome can end the game — the shot hits you)

### 4. "Whisper 'Flash'"
- **id**: `contact_flash`
- **tier**: `sound`
- **Rationale**: Correct verbal challenge. "Flash" is the challenge, "Thunder" is the response. Works, but voice carries further than the clicker.
- **outcome.success**: "'Flash.' A beat. Then: 'Thunder.' Relief floods through you. An American, PFC from the 506th — your own regiment. He was crouched behind a wall, too scared to move. He's yours now." moraleChange: +4, readinessChange: +2, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.partial**: "'Flash.' Silence. Then, quietly: '...Thunder?' Uncertain. He stumbles toward you. An American, disoriented, possibly concussed from a hard landing. He'll slow you down but he's an extra pair of eyes." moraleChange: +2, readinessChange: +2, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.failure**: "'Flash.' No response. The figure doesn't move. You say it again: 'Flash.' Still nothing. Then the figure turns and walks away. Not running — walking. Calm. Maybe German. Maybe a shell-shocked American who doesn't remember the code. Your voice hung in the night air for two exchanges. You need to move." moraleChange: -2, readinessChange: +4, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 5. "Whisper 'Thunder'"
- **id**: `contact_thunder`
- **tier**: `reckless`
- **Rationale**: REVERSED. "Thunder" is the RESPONSE, not the challenge. Saying the response first is like answering a question nobody asked.
- **outcome.success**: "'Thunder.' The figure cocks his head. That's the response, not the challenge. He whispers back: 'Flash?' You hesitate — then respond 'Thunder' again. He figured it out. Comes over shaking his head. 'You got it backwards, buddy.'" moraleChange: -1, readinessChange: +3, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.partial**: "'Thunder.' Nothing. The figure steps back. Wrong word first — he doesn't trust you. Standoff in the dark for two full minutes before he whispers 'Flash?' and you realize your mistake. By then, you've both been standing in the open far too long." moraleChange: -3, readinessChange: +4, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "'Thunder.' The figure freezes. Says nothing. Then disappears into the hedgerow. You hear him running. He thinks you're German — because what American says the response first?" moraleChange: -5, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 6. "Yell 'FLASH!'"
- **id**: `contact_yell_flash`
- **tier**: `reckless`
- **Rationale**: Correct word, insane volume. Every German within 200 meters hears you.
- **outcome.success**: "'FLASH!' Your voice cracks the silence. 'THUNDER!' The figure shouts back — then catches himself. 'Jesus Christ, keep your voice down!' An American. He's yours, but every ear in the area just turned your direction." moraleChange: +1, readinessChange: +8, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.partial**: "'FLASH!' The word echoes off the hedgerows. The figure drops flat. In the distance, you hear a German voice shout something. The figure crawls toward you: 'Are you trying to get us killed?'" moraleChange: -3, readinessChange: +10, ammoSpent: 0, menLost: 0, **men: +1**, nextScene: "act1_the_sergeant"
- **outcome.failure**: "'FLASH!' Silence. Then a German Schmeisser opens up from somewhere to your left. The figure scatters. You hit the ground. Bullets snap overhead. By the time it stops, you're alone and the Germans know exactly where you are." moraleChange: -8, readinessChange: +12, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 7. "Draw your pistol and fire"
- **id**: `contact_shoot`
- **tier**: `suicidal`
- **Rationale**: Shoot first, identify never. You're more likely to kill a friendly than an enemy.
- **outcome.success**: "You fire. The figure drops. You rush forward — and see the screaming eagle patch on his shoulder. 101st Airborne. American. You just shot one of your own. He's alive — the round hit his canteen. But the look in his eyes as he stares up at you will stay with you forever." moraleChange: -10, readinessChange: +8, ammoSpent: -2, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.partial**: "You fire. Miss. The figure fires back — both of you shooting blind. You hear him scream 'FLASH! FLASH! FLASH!' American. You stop shooting. He stops shooting. You find each other, hands shaking. You almost killed each other." moraleChange: -8, readinessChange: +10, ammoSpent: -3, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "You fire. The figure crumples. You rush forward. Screaming eagle patch. 101st. American. He's not moving. You killed him. One of your own men, alone in the dark, and you shot him dead." moraleChange: -15, readinessChange: +10, ammoSpent: -2, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `identify_before_engaging`
- **fatal**: true (on failure, the morale and psychological impact is devastating — and the gunfire draws enemy attention)

### 8. "Freeze — don't move, don't breathe"
- **id**: `contact_freeze`
- **tier**: `mediocre`
- **Rationale**: Safe but passive. The figure walks away. You lose a potential ally.
- **outcome.success**: "You hold your breath. The figure stands there for an eternity — then moves on, disappearing into the hedgerow. Safe. But whoever that was, they could have been an ally. And now they're gone." moraleChange: -2, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.partial**: "You freeze. The figure turns toward you — did he hear something? Your heart hammers. Then he turns away and leaves. You exhale. You're safe, but alone." moraleChange: -3, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "You try to stay still but your boot shifts on gravel. The figure spins. A tense second — then he runs. Gone. And you're still standing in the dark, alone, heart pounding." moraleChange: -4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

### 9. "Crawl backward slowly — get out of here"
- **id**: `contact_retreat`
- **tier**: `mediocre`
- **Rationale**: Retreat from an unknown contact. Safe but you lose whatever opportunity this was.
- **outcome.success**: "You ease backward, one hand behind you feeling for the hedgerow gap. Slow. Silent. The figure never notices. You slip away into the dark. Alive, but still completely alone." moraleChange: -3, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.partial**: "You back up. A branch snaps under your knee. The figure turns — but you're already through the hedgerow gap. You hear him whisper something, but you're gone." moraleChange: -4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **outcome.failure**: "You crawl backward and your canteen clanks against your pistol. The figure drops to a knee — you hear a rifle bolt. You freeze. After a minute that feels like an hour, the figure moves away. You're shaking." moraleChange: -5, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_sergeant"
- **lessonUnlocked**: `recognition_signals`

## Design Notes for Agent

- **CRITICAL**: Decision text must NOT reveal the correct procedure. "Click once and wait" and "Click twice and wait for one" must sound equally plausible. Do NOT add helpful hints like "standard procedure" or "as briefed."
- The correct options are: Decision 1 (click once, wait for two) and Decision 4 (whisper "Flash"). Everything else is wrong to varying degrees.
- A first-time player has a ~2-in-9 chance of picking correctly. This IS intentional. The game is designed to teach through failure.
- The lesson "recognition_signals" unlocks on ANY choice — but its content tells you the right answer for next time.
- The stray paratrooper gained from correct signals is NOT from the player's platoon roster. He's a generic PFC from another regiment. He counts as +1 man but doesn't appear in the roster as a named character. He's just "a body."
- men+1 gain only happens on success/partial for the correct decisions (1, 2 if lucky, 4, 5 if lucky, 6 if lucky). Wrong signals, shooting, freezing, and retreating gain no man.
- Keep the decision text SHORT and similarly formatted. No decision should be longer than the others — length reveals quality.
