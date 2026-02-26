# Scene 5: The Patrol — Combat 101

## Metadata
- **Scene ID**: `act1_the_patrol`
- **Act**: 1
- **Time**: ~03:00
- **timeCost**: 15-35 minutes (varies by decision)
- **Phase**: solo or squad (depends on Scene 4)
- **combatScene**: true (Captain Position choice IF squad phase)
- **Next scene**: `act1_the_farmhouse`

## State Entering
- men: 0-4 (depends on Scenes 3-4), ammo: 3-25, morale: 15-60, readiness: 10-30
- phase: "solo" or "squad"
- Possible intel: hasCompass, hasMap
- 2IC: Henderson (veteran) if Scene 4 rally fired; null otherwise
- Capabilities: if squad, hasNCO and canScout likely true

## Narrative

You spot them before they spot you. Four German soldiers, field-gray uniforms, coal-scuttle helmets. 709th Static Division — garrison troops, not frontline. They're clustered near a stone bridge over a drainage canal. But this isn't a random patrol. A Feldwebel is hunched over papers spread on the bridge wall, comparing them to a map by the light of a shielded torch. One soldier is guarding a French civilian — hands bound, head down. They've been collecting intelligence. If those papers get back to the German command post, they'll piece together where the American drop zones are. Enemy readiness will spike.

You're 40 meters away, in the hedgerow. They haven't seen you. The Feldwebel barks an order — they're getting ready to move.

**narrativeAlt** (if squad phase with Henderson): Henderson crawls up next to you. He studies the scene for ten seconds, then whispers: "Four of them. Papers. That's bad for us if those get through, Captain." He pauses. "But we've got the mission to think about. Your call."

**narrativeAlt** (if solo): You're alone. Four Germans. You have a pistol, a knife, and two grenades. The math isn't good.

**Sensory details**: The reflected torchlight on the canal water. The smell of cigarette smoke. The Feldwebel's voice — confident, unhurried. The French civilian's feet scraping on stone. Frogs in the canal.

## The Stakes

- **Letting them go**: readiness +15. Those papers reach command. Every future combat encounter is harder.
- **Engaging successfully**: Capture papers → `knowsPatrolRoute` intel gain AND readiness -5 (papers never arrive, offsetting some combat noise). Also possible to free the civilian.
- **Engaging badly**: Casualties, ammo spent, readiness up from noise, and you still might not get the papers.

## Decisions

### 1. "Set an L-shaped ambush — two teams, converging fire zones"
- **id**: `patrol_l_ambush`
- **tier**: `excellent`
- **requiresPhase**: `squad`
- **minMen**: 3
- **benefitsFromIntel**: none
- **timeCost**: 30 min (setup time)
- **Rationale**: Textbook ambush doctrine. Two fire teams at 90 degrees. The kill zone is where the fire overlaps. Maximum casualties on the enemy, minimum exposure for your men.
- **2IC comment** (veteran Henderson): "Good position, sir. I'll take the second element. On your signal."
- **2IC comment** (green replacement): "Uh... whatever you say, sir."
- **outcome.success**: "Two elements in position. You wait until the Germans cluster around the Feldwebel. Signal. The night erupts. Converging fire from two angles — they never had a chance. Ten seconds. It's over. Four enemy dead. Zero friendly casualties. You grab the papers from the Feldwebel's body. Patrol routes, defensive positions, unit dispositions. Gold." moraleChange: +8, readinessChange: +5, ammoSpent: -8, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "Ambush fires. Three Germans drop. The fourth runs — Malone chases, fires, drops him 30 meters out. But the return fire nicked Doyle's arm. Not serious, but he's bleeding. You get the papers. The French civilian is shaking but alive." moraleChange: +5, readinessChange: +7, ammoSpent: -10, menLost: 0 (Doyle wounded minor), intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.failure**: "Something goes wrong — Doyle fires early. The Germans scatter before your fire teams converge. A confused firefight in the dark. Two Germans dead, two escaped — running toward the village. You get some papers but they'll report contact. And Doyle won't stop shaking." moraleChange: +1, readinessChange: +12, ammoSpent: -12, menLost: 0, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 2. "Everyone fires from this position — on my mark"
- **id**: `patrol_linear_ambush`
- **tier**: `mediocre`
- **requiresPhase**: `squad`
- **minMen**: 2
- **timeCost**: 25 min
- **Rationale**: One-sided ambush. Functional but messy. No converging fire means some enemies can escape down the far side of the bridge.
- **2IC comment** (veteran Henderson): "One-sided, sir? Better than nothing. But some'll get away down the bridge."
- **outcome.success**: "You line up your men along the hedgerow. Signal. A volley rips into the Germans. Three drop immediately. The fourth crawls behind the bridge wall and fires back. Henderson flanks and finishes it. You get the papers." moraleChange: +3, readinessChange: +8, ammoSpent: -10, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "The volley drops two. Two others run. One escapes. One is hit 50 meters out. Papers are scattered — you find half of them. The escaped German will report contact." moraleChange: +1, readinessChange: +10, ammoSpent: -12, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "Linear fire doesn't cover the far side of the bridge. Three Germans escape. They fire as they run. A round hits the wall next to your head. You're alive but the papers are gone — the Feldwebel grabbed them as he ran." moraleChange: -3, readinessChange: +12, ammoSpent: -10, menLost: 0-1, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 3. "Crawl up and knife the rear sentry, then rush the rest"
- **id**: `patrol_knife`
- **tier**: `reckless`
- **timeCost**: 20 min
- **Rationale**: Hollywood. Knife kills are loud, messy, and unreliable. Even if you get one, the other three hear the struggle.
- **2IC comment** (veteran Henderson): "That's... optimistic, Captain. You knife one, the other three hear it."
- **outcome.success**: "You crawl to within arm's reach. The knife goes in clean — hand over the mouth, blade between the ribs. He sags. The others don't notice. You wave your men forward. They close the distance. A short, vicious fight at close range. It works — barely." moraleChange: +2, readinessChange: +8, ammoSpent: -3, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "The knife goes in but the German screams. Everything goes loud. Close-range firefight at the bridge. Two Germans dead, one wounded and surrendering, one escaped. Your hands are covered in blood. Doyle throws up." moraleChange: -3, readinessChange: +10, ammoSpent: -5, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "You get close but your boot kicks a stone. The sentry turns. You struggle — the knife misses. He screams. The other three open fire. You flatten. Your men fire back. A chaotic mess. You take a casualty." moraleChange: -6, readinessChange: +12, ammoSpent: -8, menLost: 1, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 4. "Open fire right now — shoot them before they move"
- **id**: `patrol_open_fire`
- **tier**: `reckless`
- **timeCost**: 15 min
- **Rationale**: No setup, no plan. Just shooting. Against surprised garrison troops it might work, but it's wasteful and noisy.
- **2IC comment** (veteran Henderson): "No setup, sir? Just... shooting?"
- **outcome.success**: "You fire. Your men fire. The Germans drop — surprised, caught in the open. But it cost you. A lot of ammunition for a messy result. You grab the papers." moraleChange: +1, readinessChange: +10, ammoSpent: -12, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "Shots everywhere. Two Germans down. Two running. One makes it. The other drops but the papers are soaked in canal water — half illegible. Ammo burned for a partial result." moraleChange: -2, readinessChange: +12, ammoSpent: -15, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "You fire. They fire back. Everyone's shooting into darkness. When it stops, one German is dead, three escaped, and you've used nearly all your ammunition. Papers gone." moraleChange: -5, readinessChange: +12, ammoSpent: -15, menLost: 0-1, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 5. "Fix bayonets and charge them"
- **id**: `patrol_charge`
- **tier**: `suicidal`
- **requiresPhase**: `squad`
- **timeCost**: 10 min
- **Rationale**: A bayonet charge in the dark against prepared defenders with automatic weapons. Henderson will actively object.
- **2IC comment** (veteran Henderson): "Captain — you are not serious. A bayonet charge? Against four men with submachine guns?"
- **2IC comment** (green replacement): "Yes sir."
- **outcome.success**: "By some miracle, the charge closes the distance before they react. The fight is short and savage. All four Germans dead. But the cost — you look at your men. Doyle is staring at his bayonet. Malone is bleeding from a graze. The violence of it settles on everyone like a weight." moraleChange: -5, readinessChange: +15, ammoSpent: 0, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.partial**: "The charge. Running through open ground. A Schmeisser opens up. Someone goes down. You reach the bridge — hand-to-hand. It's ugly. You win. Barely. Bodies everywhere. One of your men is hit." moraleChange: -8, readinessChange: +15, ammoSpent: -2, menLost: 1, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "They hear you coming. The Schmeisser tears into your line at 20 meters. Two men go down before you close. The fight at the bridge is a slaughter — theirs and yours. You survive. Some of your men don't." moraleChange: -12, readinessChange: +15, ammoSpent: -3, menLost: 2, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`
- **fatal**: true (high chance of captain casualty if leading from front)

### 6. "Throw rocks to create a diversion, then flank them"
- **id**: `patrol_rocks`
- **tier**: `reckless`
- **requiresPhase**: `squad`
- **timeCost**: 25 min
- **Rationale**: Rocks aren't a military diversion technique. Trained soldiers don't investigate rocks — they investigate threats.
- **2IC comment** (veteran Henderson): "Rocks, sir? These aren't children."
- **outcome.success**: "You throw rocks toward the canal. A splash. One German looks up. But the rest don't move — a splash during an invasion means nothing to them. When you finally open fire, you've lost the element of complete surprise. It works, but the rocks added nothing." moraleChange: +1, readinessChange: +8, ammoSpent: -8, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.partial**: "The rocks hit the bridge. A German investigates. But now your flank position isn't ready — you rushed the setup. A sloppy engagement. Two dead, two escaped. Papers partially recovered." moraleChange: -2, readinessChange: +10, ammoSpent: -10, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "You throw rocks. The Germans hear them — and immediately go to alert. They're garrison troops but they're not stupid. When you try to flank, they're already in cover. A firefight ensues. Messy, costly, loud." moraleChange: -4, readinessChange: +12, ammoSpent: -10, menLost: 0-1, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 7. "Make animal sounds to lure one of them away from the group"
- **id**: `patrol_animal_sounds`
- **tier**: `suicidal`
- **timeCost**: 15 min
- **Rationale**: A cow. Mooing. During an airborne invasion. In the middle of the night. The Germans will send someone to investigate — and that someone will find you.
- **2IC comment** (veteran Henderson): "Sir... you want to moo at them?"
- **outcome.success**: "You make a noise. One German mutters and walks toward the hedgerow with his rifle raised. You jump him — a struggle, you put him down. But the noise alerted the others. They open fire toward the hedgerow. What started as a ruse turns into a firefight you didn't set up for." moraleChange: -3, readinessChange: +10, ammoSpent: -8, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.partial**: "Your cow impression is not convincing. The German says something to the Feldwebel. The Feldwebel sends two men to investigate. They find you. Close-range firefight. Messy." moraleChange: -6, readinessChange: +12, ammoSpent: -10, menLost: 0-1, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "You moo. The Feldwebel barks an order. All four Germans fan out toward your position with weapons raised. They're not investigating livestock — they're clearing a suspected ambush position. You've given away your location for nothing." moraleChange: -8, readinessChange: +12, ammoSpent: -12, menLost: 1, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

### 8. "Let them go — we can't afford a fight right now"
- **id**: `patrol_let_pass`
- **tier**: `sound`
- **timeCost**: 10 min
- **Rationale**: No fight. No casualties. No ammo spent. But those papers reach the German CP and readiness spikes. Henderson objects.
- **2IC comment** (veteran Henderson): "Those papers, sir. If they get back to their CP, they'll know where every DZ is. That's going to hurt us." 
- **2IC comment** (green replacement): silence (doesn't understand the implications)
- **outcome.success**: "You watch them leave. The Feldwebel folds the papers into his case. They march the French civilian down the road. They're gone. No shots fired, no risk taken. But Henderson watches them go with a hard look. 'We'll pay for that later, Captain.' He's right. Readiness +15." moraleChange: -3, readinessChange: +15, ammoSpent: 0, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.partial**: "They move out. You stay hidden. One German glances your direction — you freeze. He keeps walking. They disappear into the dark. Safe. But the French civilian looks over his shoulder toward your hedgerow, as if he knows you're there. You let him go too." moraleChange: -5, readinessChange: +15, ammoSpent: 0, menLost: 0, nextScene: "act1_the_farmhouse"
- **outcome.failure**: "They leave. You breathe. Then, five minutes later, you hear a truck engine start in the distance. They had a vehicle. Those papers are already on the way to the CP. Henderson says nothing. He doesn't have to." moraleChange: -7, readinessChange: +18, ammoSpent: 0, menLost: 0, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `tactical_patience`

### 9. "Crawl through the drainage ditch — steal the map case while they're distracted"
- **id**: `patrol_solo_steal`
- **tier**: `excellent`
- **visibleIf**: { phase: "solo" } — ONLY available when alone
- **timeCost**: 35 min
- **Rationale**: Solo stealth infiltration. You can't fight four men alone, but you can outmaneuver them. High-risk, high-reward, requires patience.
- **outcome.success**: "You slide into the drainage canal. Cold water again — waist deep. You move toward the bridge, using the water to mask your sound. The Feldwebel set the map case on the wall while he briefs his men. You reach up. Your fingers close on the leather strap. You pull it into the water and crawl back the way you came. They won't notice it's gone for 10 minutes." moraleChange: +10, readinessChange: +2, ammoSpent: 0, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "You get close but the canal is shallower than you thought. Your movement creates ripples. The guard looks toward the water. You freeze, half-submerged. After an agonizing minute, he looks away. You grab the case — but knock it against the stone. The Feldwebel turns. You dive under the water and crawl. Shouting behind you. They fire into the canal. Bullets hit the water around you. You make it to the hedgerow with the case but your heart is about to explode." moraleChange: +4, readinessChange: +8, ammoSpent: 0, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.failure**: "The canal is too shallow. You can't stay submerged. A German sees movement in the water. He fires. You scramble backward, rounds snapping past. You lose the canal and make it to the hedgerow. No case. Your position is known. You need to move, now." moraleChange: -5, readinessChange: +10, ammoSpent: 0, menLost: 0, nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `stealth_operations`

### 10. "Send one man as a decoy runner, then engage when they're distracted"
- **id**: `patrol_decoy`
- **tier**: `mediocre`
- **requiresPhase**: `squad`
- **minMen**: 3
- **timeCost**: 25 min
- **Rationale**: Using one of your men as bait. Functional but morally and tactically questionable. The decoy might die.
- **2IC comment** (veteran Henderson): "Who are you sending out there, sir?"
- **outcome.success**: "You send Doyle running along the hedgerow — visible, making noise. The Germans turn. You open fire. Two down before they react. The Feldwebel grabs for the papers — Henderson puts a round through his hand. Papers secured. Doyle makes it back, gasping." moraleChange: +2, readinessChange: +8, ammoSpent: -8, menLost: 0, intelGained: "knowsPatrolRoute", nextScene: "act1_the_farmhouse"
- **outcome.partial**: "Doyle runs. The Germans fire at him — tracers chasing him through the dark. You engage from the flank. Two Germans down. Two escape. Doyle is hit — round through the calf. He's limping back. 'I'm okay, I'm okay,' he says. He's not okay." moraleChange: -2, readinessChange: +10, ammoSpent: -10, menLost: 0 (Doyle wounded), nextScene: "act1_the_farmhouse"
- **outcome.failure**: "Doyle runs. A burst catches him at 20 meters. He goes down hard. You open fire but the Germans are already in cover. A firefight you didn't want, and Doyle isn't moving." moraleChange: -8, readinessChange: +12, ammoSpent: -10, menLost: 1 (Doyle KIA), nextScene: "act1_the_farmhouse"
- **lessonUnlocked**: `ambush_doctrine`

## Intel Gain on Successful Capture

If the player captures the papers (any decision that grants `knowsPatrolRoute`):
- `knowsPatrolRoute` = true
- Readiness gets a -5 OFFSET against the combat noise (papers intercepted, enemy loses intelligence)
- This intel helps in Act 2 — you know where German patrols and defensive positions are around the crossroads

## Captain Position (Combat Scenes Only)

If phase is squad and this is tagged combatScene, the player chooses Captain Position BEFORE making their tactical decision:
- **Front**: +5 effective score, +5 morale, 15% captain casualty chance
- **Middle**: No modifier, 5% captain casualty chance
- **Rear**: -5 effective score, -5 morale, 1% captain casualty chance

This is the first time the player encounters the Captain Position mechanic.

## Design Notes for Agent

- **CRITICAL**: All decision text must be similar in length and complexity. The L-shaped ambush must NOT look more "professional" or "detailed" than "throw rocks." If anything, the fun/bad options should sound bold and creative to tempt the player.
- Henderson's comments are KEY. They provide the tactical education without being a tutorial. A first-time player who ignores Henderson dies. A repeat player listens.
- The "let them pass" option is tier `sound` (safe) but readiness +15 is devastating — it's a delayed cost that hits in Act 2. Henderson explicitly warns about it. This is the central tension of the scene.
- The solo drainage ditch option is the reward for players who stayed solo (skipped Scene 4). It's the only way a solo player can realistically handle this scene well.
- If the player is solo AND doesn't take the drainage ditch option, most combat options are severely penalized by the phase mismatch modifier (-25 to effective score for platoon-level tactics attempted solo).
- The French civilian adds moral weight. Letting the patrol go means letting the civilian be taken too.
- Ammo costs matter. A player who found the supply bundle in Scene 2 has 15 ammo and can afford to spend 8-12. A player who didn't has 5 ammo and can barely fire.
