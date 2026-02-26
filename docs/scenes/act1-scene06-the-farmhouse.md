# Scene 6: The Farmhouse

## Metadata
- **Scene ID**: `act1_the_farmhouse`
- **Act**: 1
- **Time**: ~03:30
- **timeCost**: 10-25 minutes (varies by decision)
- **Phase**: solo or squad (depends on Scene 4)
- **combatScene**: false (discipline test, not combat)
- **Next scene**: `act1_scene07` (or end of current Act 1 content — TBD, scenes 7-10 not yet designed)
- **Rally event**: Rivera (medic) + Kowalski (BAR gunner)

## State Entering
- men: 0-4, ammo: highly variable (3-30), morale: 10-65, readiness: 10-45
- phase: "solo" or "squad"
- Possible intel: hasCompass, hasMap, knowsPatrolRoute
- 2IC: Henderson (veteran) if Scene 4 rally fired
- Key variables from Scene 5: ammo remaining, casualties taken, readiness level

## Narrative

A stone farmhouse. Two stories, slate roof, attached barn. Typical Norman countryside. You can see paratrooper equipment on the front porch — a musette bag, a helmet with the ace of spades on it (that's 506th). Someone from your regiment landed here. But the farmhouse is dark and the door is closed. From inside, you hear movement — muffled, like someone shifting weight. Could be one of your men. Could be Germans who stripped a dead paratrooper's gear as a lure. Could be a terrified French family. You don't know.

**narrativeAlt** (if Henderson is alive): Henderson studies the building. "506th gear on the porch. Could be ours." He checks his carbine. "How do you want to handle this, sir?"

**narrativeAlt** (if solo): You're alone. A farmhouse with unknown occupants. The paratrooper gear on the porch calls to you — that's ammo, that's equipment. But going in alone...

**The truth** (not revealed to the player): Rivera and Kowalski are inside. They landed together, found the farmhouse, and barricaded themselves inside. They're terrified and armed. They haven't heard a cricket clicker or a "Flash" challenge. As far as they know, every sound outside is German. If someone bursts through the door without identifying themselves, they WILL shoot.

**Sensory details**: The smell of animal feed from the barn. A broken window on the second floor — curtain flapping. The creak of floorboards from inside. An overturned milk pail by the door. Pre-dawn gray starting to lighten the eastern sky — it's been four hours since the drop.

## Decisions

### 1. "Stack on the door — proper room-clearing procedure, room by room"
- **id**: `farmhouse_stack_clear`
- **tier**: `excellent`
- **requiresPhase**: `squad`
- **minMen**: 2
- **timeCost**: 20 min
- **Rationale**: Textbook building clearance. You announce yourself, use the clicker, then clear methodically. Slow, safe, professional.
- **2IC comment** (veteran Henderson): "I'll take point. Standard two-man stack. We clear left on entry."
- **outcome.success**: "Henderson takes the door. One click-clack before entry. Two clicks back from inside. Henderson opens the door low, sweeps left. Rivera is there, hands up, shaking. Kowalski has the BAR leveled at the doorway. 'Thunder,' Rivera says. 'It's us,' Henderson replies. Room by room, you clear the building. Empty except for your men. Rivera exhales for what seems like the first time in hours." moraleChange: +5, readinessChange: +2, ammoSpent: -2, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.partial**: "You stack on the door. Henderson clicks. No response from inside — Rivera's clicker was lost in the drop. Henderson whispers 'Flash.' A voice from inside: 'Thunder! Don't shoot! We're American!' Rivera. The door opens. Kowalski has the BAR aimed at Henderson's chest. It takes a minute for everyone to stop shaking." moraleChange: +3, readinessChange: +2, ammoSpent: -2, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.failure**: "The stack goes wrong. Doyle trips on the milk pail — noise. Inside, Kowalski fires through the door. Splinters fly. Henderson throws himself flat. 'AMERICAN! AMERICAN!' he shouts. Kowalski stops firing. Nobody hit — but Jesus, that was close. Rivera is on the floor, hands over his ears." moraleChange: +1, readinessChange: +5, ammoSpent: -3, menLost: 0, nextScene: "act1_scene07". **Rally fires** (shaken but intact).
- **lessonUnlocked**: `positive_identification`

### 2. "Send two men to the front while you cover the back exit"
- **id**: `farmhouse_two_element`
- **tier**: `sound`
- **requiresPhase**: `squad`
- **minMen**: 3
- **timeCost**: 15 min
- **Rationale**: Reasonable approach — cover both exits. The clearing team enters while you prevent escape from the back.
- **2IC comment** (veteran Henderson): "Malone and I take the front. You cover the back with Doyle."
- **outcome.success**: "Henderson and Malone approach the front. Henderson clicks. Two clicks from inside. 'Friendlies coming in!' The front door opens. You hear Henderson's voice: 'Clear! Captain, come on in.' Rivera and Kowalski. Alive and armed." moraleChange: +3, readinessChange: +1, ammoSpent: -1, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.partial**: "Henderson and Malone enter. You hear voices — urgent but not gunfire. Then Henderson at the window: 'Captain, it's ours. Rivera and Kowalski.' But Doyle is nervous at the back — he heard the voices and nearly fired. You had to grab his barrel." moraleChange: +2, readinessChange: +2, ammoSpent: -1, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.failure**: "Henderson enters. Kowalski fires at movement. Henderson dives. Malone fires back. 'CEASE FIRE! CEASE FIRE!' Henderson screaming. Rivera on the floor. When it settles, Malone has a graze on his arm. Nobody dead — barely." moraleChange: -2, readinessChange: +5, ammoSpent: -3, menLost: 0 (Malone minor wound), nextScene: "act1_scene07". **Rally fires**.
- **lessonUnlocked**: `positive_identification`

### 3. "Go in fast — rush the building before anyone inside can react"
- **id**: `farmhouse_rush`
- **tier**: `reckless`
- **timeCost**: 10 min
- **Rationale**: No recognition procedure. You charge in blind. Rivera and Kowalski are inside, terrified and armed. If you send nervous soldiers in first, they'll shoot at shadows — and the shadows will shoot back. FRATRICIDE RISK.
- **2IC comment** (veteran Henderson): "Slow down, Captain. We don't know who's in there. Could be ours."
- **outcome.success**: "You burst through the door. Rivera screams. Kowalski swings the BAR — but recognizes your helmet silhouette before pulling the trigger. 'JESUS! We're American!' Rivera shouts. Everyone's alive. Everyone's shaking. Kowalski's finger was on the trigger. One more second." moraleChange: -2, readinessChange: +5, ammoSpent: -3, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.partial**: "You crash through the door. A flash from the BAR — Kowalski fires at the doorway. The round hits the wall inches from your head. 'STOP! FLASH! FLASH!' you scream. Kowalski stops. Rivera is crying. Everyone's alive, but the trust in the room is gone." moraleChange: -5, readinessChange: +6, ammoSpent: -3, menLost: 0, nextScene: "act1_scene07". **Rally fires** (low morale bonus).
- **outcome.failure**: "You charge in. Kowalski fires. The BAR round catches someone in the doorway — one of YOUR men, silhouetted against the gray sky. He goes down. 'AMERICAN! WE'RE AMERICAN!' Too late. Rivera rushes to the wounded man. Your own soldier, shot by your own men, because you didn't announce yourself." moraleChange: -10, readinessChange: +8, ammoSpent: -3, menLost: 1 (FRATRICIDE), nextScene: "act1_scene07". **Rally fires but with devastating morale penalty**.
- **lessonUnlocked**: `positive_identification`

### 4. "Toss a grenade through the window, then enter"
- **id**: `farmhouse_grenade`
- **tier**: `reckless`
- **timeCost**: 10 min
- **Rationale**: You just grenaded a building containing two of your own soldiers. This is catastrophic if they're inside — and they are.
- **2IC comment** (veteran Henderson): "Sir — that's paratrooper gear on the porch. Those could be our people inside. Hold fire."
- **outcome.success**: "You pull the pin. Henderson grabs your arm. 'Captain. CAPTAIN. Look at the porch. That's 506th gear.' You look. He's right. You put the pin back. Henderson saves you from a terrible mistake." moraleChange: -3, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". Redirects to a clearing procedure. **Rally fires**.
- **outcome.partial**: "The grenade goes through the window. The explosion is deafening in the enclosed space. You enter. Rivera is on the floor, ears bleeding. Kowalski is dazed, the BAR knocked from his hands. Both alive — the grenade landed in the next room. But Rivera can barely hear. Your medic just lost his hearing because you grenaded him." moraleChange: -12, readinessChange: +8, ammoSpent: -5 (grenade), menLost: 0 (Rivera wounded/degraded), nextScene: "act1_scene07". **Rally fires but Rivera's effectiveness is reduced**.
- **outcome.failure**: "The grenade detonates in the main room. You enter through the smoke. Kowalski is dead — the blast caught him square. Rivera is slumped against the far wall, bleeding from shrapnel wounds. He looks up at you. He sees the screaming eagle patch on your shoulder. 'You...' he whispers. You just killed your own BAR gunner and critically wounded your medic." moraleChange: -15, readinessChange: +10, ammoSpent: -5, menLost: 1 (Kowalski KIA by fratricide), nextScene: "act1_scene07". **Partial rally: Rivera only, wounded. canSuppress lost permanently.**
- **lessonUnlocked**: `positive_identification`
- **Note**: If Henderson is alive AND the outcome would be success, Henderson STOPS you. The grenade only actually detonates on partial/failure — meaning Henderson's death in Scene 4 or 5 makes this decision truly catastrophic.

### 5. "Use the cricket clicker from the porch — see if anyone responds"
- **id**: `farmhouse_clicker_outside`
- **tier**: `sound`
- **timeCost**: 15 min
- **Rationale**: Smart — use recognition signal before entering. Not as thorough as a full stack-and-clear, but identifies occupants safely.
- **outcome.success**: "One click-clack. From inside: click-clack, click-clack. Then Rivera's voice, muffled: 'American? Please be American.' You open the door. Rivera and Kowalski. Alive. Armed. Relieved." moraleChange: +4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.partial**: "One click. Silence. Rivera lost his clicker. You try again. Then a voice: 'Flash.' You respond: 'Thunder.' The door opens a crack. Rivera's face. 'Captain? Oh thank God.'" moraleChange: +3, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.failure**: "One click. From inside, the sound of a weapon being readied. They don't have a clicker. You call out 'Flash.' Long pause. Then 'Thunder' — scared, uncertain. You enter carefully. Rivera's hands are shaking so badly he can barely hold his aid bag." moraleChange: +1, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **lessonUnlocked**: `positive_identification`

### 6. "Scout the building first — check every window, look for movement"
- **id**: `farmhouse_scout`
- **tier**: `sound`
- **timeCost**: 25 min
- **Rationale**: Cautious reconnaissance. You circle the building, peek through windows, listen. Takes time but gives you information before committing.
- **outcome.success**: "You circle the building low. Through a side window, you see two figures in American uniforms. One has a medic armband. The other is cradling a BAR. You tap the window. 'Flash.' 'Thunder!' They let you in through the side door." moraleChange: +3, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.partial**: "You circle the building. Dark inside — can't see much. You hear breathing. American boots on the floor (you can tell by the tread pattern). You tap the door with your clicker. Eventually contact is made. Rivera and Kowalski." moraleChange: +2, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**.
- **outcome.failure**: "You spend 25 minutes crawling around the farmhouse. You see shapes inside but can't confirm anything. Eventually you use the clicker at the door. It works. But you burned 25 minutes for what a clicker at the front door would have done in 2." moraleChange: 0, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_scene07". **Rally fires**. Time penalty.
- **lessonUnlocked**: `positive_identification`

### 7. "Skip the farmhouse — keep moving toward the rally point"
- **id**: `farmhouse_skip`
- **tier**: `mediocre`
- **timeCost**: 15 min
- **Rationale**: You bypass the farmhouse entirely. Safe — but you miss Rivera (medic) and Kowalski (BAR). No canTreatWounded. No canSuppress. This is a massive capability loss for the rest of the game.
- **2IC comment** (veteran Henderson): "Captain, that's paratrooper gear on the porch. Somebody's in there."
- **outcome.success**: "You move past. Henderson looks back at the farmhouse. 'Those were our people, sir.' Maybe. Maybe not. You'll never know. But deep down, you suspect Henderson is right." moraleChange: -3, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_scene07". No Rivera, no Kowalski.
- **outcome.partial**: "You push on. The farmhouse recedes behind you. As you cross the next field, you think you hear a cricket clicker from that direction — one click. But you're already moving and you don't go back." moraleChange: -5, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_scene07".
- **outcome.failure**: "You leave. Henderson says nothing but his jaw is set. Malone mutters something you can't hear. You've left potential friendlies behind because you were afraid. The men noticed." moraleChange: -8, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_scene07".
- **lessonUnlocked**: `positive_identification`

## Rally Event Details

When rally fires:
- **Soldiers gained**: Rivera (medic, brave/steady) + Kowalski (BAR_gunner, loyal/steady)
- **ammoGain**: +15 (Kowalski carries extra bandoliers)
- **moraleGain**: +7 (having a medic and automatic weapon is a massive boost — ON TOP of decision moraleChange)
- **Capabilities gained**: canTreatWounded = true (Rivera), canSuppress = true (Kowalski)
- **Phase shift**: If men >= 6, shift to "platoon"

Special case — grenade failure:
- Kowalski KIA: canSuppress NOT gained
- Rivera wounded: canTreatWounded gained but with a degraded flag (slower healing in future scenes)

Special case — rush failure (fratricide):
- One of the player's EXISTING soldiers is killed (from Scene 4 rally — could be Malone or Doyle), NOT Rivera/Kowalski
- Rivera and Kowalski still join, but morale penalty is severe

## Design Notes for Agent

- **CRITICAL**: The building is EMPTY of enemies. The test is leadership and discipline, not combat skill. Every option that involves identification procedures succeeds. Every option that involves shooting first risks fratricide.
- The grenade option is the most dramatic — and Henderson STOPS you on success outcome. This means: if Henderson is dead (from Scene 4 or 5), the grenade always goes off. Henderson's survival directly prevents a catastrophe. Players will learn across runs that keeping Henderson alive is essential.
- "Green" trait soldiers (Doyle, Ellis) are the fratricide risk in the rush option. If a green soldier is in the stack, they're the ones who panic and shoot at shadows.
- Decision text must not reveal that the building is safe. "Rush the building" should sound as aggressive-but-valid as "stack on the door." The player doesn't know there's no enemy inside.
- The skip option (Decision 7) is devastating but the text doesn't say "you're losing your medic and BAR." It just says "keep moving." The player only discovers the cost when they reach Act 2 without canTreatWounded or canSuppress.
- Rivera's personality should come through: gentle, scared, emotional, but competent. He's the heart of the platoon.
- Kowalski's personality: quiet, solid, the BAR is everything. He doesn't talk, he nods.
- This is the last scene before the currently-designed content ends. nextScene should be `act1_scene07` (placeholder for human-in-the-loop design of scenes 7-10).
