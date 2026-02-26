# Scene 4: The Sergeant

## Metadata
- **Scene ID**: `act1_the_sergeant`
- **Act**: 1
- **Time**: ~02:15
- **timeCost**: 15-30 minutes (varies by decision)
- **Phase**: solo (men=0-1)
- **combatScene**: false
- **Next scene**: `act1_the_patrol`
- **Rally event**: Henderson (2IC, platoon_sergeant) + Malone (NCO) + Doyle (rifleman)

## State Entering
- men: 0-1 (depends on Scene 3), ammo: 3-15, morale: 20-55, readiness: 10-28
- phase: "solo"
- Possible intel: hasCompass, hasMap

## Narrative

You're pushing through a gap in the hedgerow when you hear voices. Low, urgent. Close — maybe 30 meters, on the other side of a stone wall. Two, maybe three people. One of them says something and another laughs — short, nervous. The cadence sounds English. American, maybe. But you've been awake for twenty hours and you're hearing what you want to hear. You've also heard stories from the briefing — Wehrmacht troops in this sector include Ost-Battalion soldiers, Poles and Ukrainians who sometimes speak broken English. And the 6th Fallschirmjäger have been known to use captured American equipment. One of the voices is giving orders, quietly but firmly. The tone is confident — not panicked. Is that an American NCO organizing his men, or a German Feldwebel directing a patrol?

**Sensory details**: The rough stone of the wall under your hand. The smell of woodsmoke from somewhere nearby. A distant machine gun firing in bursts — far away. The voices on the other side, indistinct but human.

## Decisions

### 1. "Cricket clicker — one click from behind the wall, wait for response"
- **id**: `sergeant_clicker`
- **tier**: `excellent`
- **timeCost**: 15 min
- **Rationale**: Correct recognition procedure. Low risk, proper distance, wall as cover.
- **outcome.success**: "One click-clack. Silence. Then — click-clack, click-clack. 'Come on over,' a voice says. American. You vault the wall. Staff Sergeant Henderson stands up from behind a hedgerow, carbine in hand. Behind him, Sgt. Malone has PFC Doyle pressed flat against the dirt. 'Captain,' Henderson says. 'Glad to see you, sir.' The relief in his voice is obvious." Rally event fires. moraleChange: +8, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**: Henderson as veteran.
- **outcome.partial**: "One click-clack. A long pause. Whispered voices on the other side. Then two clicks — tentative. You climb the wall carefully. Henderson is there, pistol leveled at your chest until he sees your face. 'Captain. Jesus Christ.' He lowers the weapon. Malone and Doyle are behind him." Rally event fires. moraleChange: +6, readinessChange: 0, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.failure**: "One click-clack. Nothing. Then a rifle bolt being worked. You hear Malone's voice: 'Flash. Right now.' You respond: 'Thunder.' Malone lowers his weapon. 'I thought you were Kraut. Henderson, it's the Captain.' The reunion is tense — everyone's on edge." Rally event fires. moraleChange: +4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **lessonUnlocked**: `rally_procedures`

### 2. "Call out 'Flash' from behind the wall"
- **id**: `sergeant_flash`
- **tier**: `sound`
- **timeCost**: 15 min
- **Rationale**: Correct verbal challenge. Louder than the clicker but you have the wall for cover.
- **outcome.success**: "'Flash.' Instant response: 'Thunder. Identify yourself.' That's Henderson's voice — you'd know it anywhere. 'Captain, 2nd Platoon.' 'Come on in, sir.' Henderson, Malone, Doyle. Your people." Rally event fires. moraleChange: +6, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.partial**: "'Flash.' A pause that lasts forever. Then: '...Thunder.' Uncertain. You come around the wall slowly. Henderson has his carbine up. When he sees you, he exhales. 'Captain. Damn, sir.'" Rally event fires. moraleChange: +5, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.failure**: "'Flash.' 'THUNDER!' Malone shouts it — loud. 'Malone, shut the hell up,' Henderson hisses. But the damage is done. Somewhere in the distance, a flare goes up. You've been located in the general area." Rally event fires. moraleChange: +3, readinessChange: +5, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **lessonUnlocked**: `rally_procedures`

### 3. "Sprint toward the voices — if they're American, every second matters"
- **id**: `sergeant_rush`
- **tier**: `reckless`
- **timeCost**: 15 min
- **Rationale**: No recognition procedure. You're betting your life on a guess about the voices.
- **outcome.success**: "You vault the wall and run. Malone spins — pistol up. Henderson grabs his arm. 'HOLD FIRE!' You skid to a stop. Henderson stares at you. 'Captain — with all due respect, sir, don't EVER do that again. Malone almost put two in your chest.'" Rally event fires. moraleChange: +3, readinessChange: +3, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.partial**: "You jump the wall. A muzzle flash — Malone fires. The round whips past your ear. 'CEASE FIRE! CEASE FIRE!' Henderson tackles Malone. Doyle is screaming. When it settles, you're on the ground with a ringing ear. No one hit. But Christ, that was close." Rally event fires. moraleChange: -2, readinessChange: +6, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.failure**: "You charge over the wall. Malone fires twice. Pain erupts in your shoulder. You hit the ground. Henderson is shouting. Doyle is shouting. Everything is chaos. You're alive — the round grazed you — but you can feel blood soaking your sleeve. Your own man just shot you." moraleChange: -8, readinessChange: +8, ammoSpent: 0, menLost: 0, **captain wounded (persistent penalty for rest of game)**, nextScene: "act1_the_patrol". **2IC activated**.
- **lessonUnlocked**: `rally_procedures`

### 4. "Toss a pebble over the wall and watch how they react"
- **id**: `sergeant_pebble`
- **tier**: `mediocre`
- **timeCost**: 30 min
- **Rationale**: Creative but not a military procedure. Creates a confusing standoff.
- **outcome.success**: "You toss a stone. It clicks off the wall. The voices go silent. Then: 'Who's there? Flash.' Henderson. You respond 'Thunder.' The pebble confused them for a minute but the procedure resolved it. Just took longer than it needed to." Rally event fires. moraleChange: +2, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. Extra 15 min for the confusion.
- **outcome.partial**: "The stone lands. Dead silence. You hear weapons being readied. Nobody speaks for two full minutes. Finally, a whisper: 'If you're American, use your goddamn clicker.' You click once. Two clicks back. Henderson: 'Would've been nice to start with that, sir.'" Rally event fires. moraleChange: +1, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. Extra 15 min.
- **outcome.failure**: "Pebble lands. Malone opens fire at the sound. You flatten. Henderson shouts 'CEASE FIRE!' Ten minutes of chaos. When you finally make contact with the clicker, everyone's nerves are shot. Doyle is crying. Malone won't look at you." Rally event fires. moraleChange: -3, readinessChange: +5, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. Extra 15 min.
- **lessonUnlocked**: `rally_procedures`

### 5. "Fire a shot in the air — signal your position"
- **id**: `sergeant_signal_shot`
- **tier**: `suicidal`
- **Rationale**: A gunshot in occupied France at 0215. The group scatters. Every German in the area hears it.
- **outcome.success**: "The shot cracks through the night. The voices scatter. You hear running. 'FLASH!' you shout. 'THUNDER!' — Henderson, from 50 meters away now. But Malone and Doyle are gone — bolted in different directions. Henderson finds you. 'A signal shot, sir? In Normandy?'" **Partial rally: Henderson ONLY**. Malone and Doyle are lost. moraleChange: -3, readinessChange: +10, ammoSpent: -1, menLost: 0, nextScene: "act1_the_patrol". **2IC activated but squad is smaller**.
- **outcome.partial**: "The shot echoes. Pandemonium. You hear running, shouting, a German voice yelling in the distance. Eventually you find Henderson crouching behind the wall alone. Malone and Doyle scattered. 'Captain... I've got nothing kind to say about what you just did.'" **Partial rally: Henderson ONLY**. moraleChange: -6, readinessChange: +12, ammoSpent: -1, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**.
- **outcome.failure**: "The shot echoes. A German machine gun opens up from 300 meters away — long bursts, tracers whipping overhead. The group scatters. You spend 45 minutes crawling through ditches. You find Henderson. Just Henderson. Malone and Doyle are gone." **Partial rally: Henderson ONLY**. moraleChange: -10, readinessChange: +15, ammoSpent: -1, menLost: 0, nextScene: "act1_the_patrol". **2IC activated but minimal squad**.
- **lessonUnlocked**: `rally_procedures`

### 6. "Circle wide through the hedgerow — observe them from a different angle"
- **id**: `sergeant_observe`
- **tier**: `sound`
- **timeCost**: 30 min (extra movement time)
- **Rationale**: Cautious, professional. You spend time confirming they're American before approaching. Zero risk but double the time.
- **outcome.success**: "You circle 100 meters through the bocage, belly-crawling the last 20. From the new angle, you can see them clearly in the faint light. Three men. American helmets. Thompson submachine gun — that's an NCO. Paratrooper boots. You use the clicker from this position. Henderson answers." Rally event fires. moraleChange: +4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. 30 min total.
- **outcome.partial**: "The detour takes 25 minutes through dense hedgerow. You can see shapes but not details in the dark. American? Probably. You use the clicker. Two clicks back. It's Henderson, Malone, and Doyle. Henderson: 'Where the hell have you been, Captain? We've been here for an hour.'" Rally event fires. moraleChange: +3, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. 30 min total.
- **outcome.failure**: "You circle wide. Too wide. It takes 35 minutes. When you get back to the spot, they've moved. You spend another 10 minutes tracking. Eventually you hear the clicker — Henderson is looking for you. You link up, but you've burned almost an hour." Rally event fires. moraleChange: +1, readinessChange: +4, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. Massive time cost.
- **lessonUnlocked**: `rally_procedures`

### 7. "Keep moving — you can't risk it"
- **id**: `sergeant_avoid`
- **tier**: `mediocre`
- **timeCost**: 15 min
- **Rationale**: You decide the risk isn't worth it. This is a legitimate survival instinct — but it costs you your 2IC, your squad, and makes everything ahead dramatically harder.
- **outcome.success**: "You slip away into the next field. The voices fade behind you. You'll never know who they were. Safe — but the silence that follows is crushing. You're still alone. Still without your platoon." moraleChange: -5, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_the_patrol". **No 2IC. Phase stays solo.**
- **outcome.partial**: "You back away. A branch snaps. The voices go quiet. Then someone whispers 'Flash?' — you can barely hear it. You keep moving. Part of you thinks you should go back. You don't." moraleChange: -7, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_the_patrol". **No 2IC.**
- **outcome.failure**: "You leave. The solitude hits you like a wall. Every sound is louder when you're alone. Every shadow is a German. You made the safe choice — but the safe choice left you without a single ally in occupied France." moraleChange: -10, readinessChange: 0, ammoSpent: 0, menLost: 0, **NO RALLY**, nextScene: "act1_the_patrol". **No 2IC.**
- **lessonUnlocked**: `rally_procedures`

### 8. "Move closer and listen for five minutes before deciding"
- **id**: `sergeant_listen`
- **tier**: `sound`
- **timeCost**: 20 min
- **Rationale**: Patient intelligence gathering. You listen for specific cues before committing. Costs time but reduces uncertainty.
- **outcome.success**: "You press against the wall and listen. '...the assembly area should be...' American English. Not textbook — actual Boston accent. That's Malone. You hear Henderson correct him quietly. You use the clicker. They respond instantly." Rally event fires. moraleChange: +5, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. 20 min.
- **outcome.partial**: "Five minutes of listening. The voices are indistinct. One of them laughs — something about 'Red Sox.' American. Probably. You use the clicker. Two clicks back. Henderson, Malone, Doyle." Rally event fires. moraleChange: +4, readinessChange: +1, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. 20 min.
- **outcome.failure**: "You listen for five minutes but can't make out the words. Accents, cadence — it all blurs in the dark. You decide to use the clicker anyway. It works — Henderson responds. But you've been crouching by this wall for too long. Your knees ache and the clock has moved." Rally event fires. moraleChange: +2, readinessChange: +2, ammoSpent: 0, menLost: 0, nextScene: "act1_the_patrol". **2IC activated**. 20 min.
- **lessonUnlocked**: `rally_procedures`

## Rally Event Details

When rally fires (all options except "keep moving" and "signal shot" partial/failure):
- **Soldiers gained**: Henderson (platoon_sergeant, veteran/steady), Malone (NCO, brave/hothead), Doyle (rifleman, green/brave)
- **ammoGain**: +10 (they have their gear)
- **moraleGain**: +8 (safety in numbers — added ON TOP of decision moraleChange)
- **Capabilities gained**: hasNCO = true, canScout = true (men >= 2)
- **Phase shift**: solo → squad
- **2IC**: Henderson becomes SecondInCommand with competence: "veteran"

When "signal shot" rally fires (Henderson only):
- **Soldiers gained**: Henderson only
- **ammoGain**: +5
- **moraleGain**: +3
- **Phase shift**: solo → squad (men >= 2 if stray paratrooper from Scene 3)
- **2IC**: Henderson activated

When "keep moving" fires:
- **No rally**. No soldiers. No 2IC. Phase remains solo. Scene 5 will be extremely difficult.

## Design Notes for Agent

- **CRITICAL**: The narrative must NOT reveal that the voices are American. Use ambiguity: "The cadence sounds English — or does it?" The player must decide without confirmation.
- Henderson's first words should vary based on the approach (see outcomes above). This is character writing — Henderson is calm, professional, slightly dry.
- Malone is the trigger-happy one. In any rushed approach, it's Malone who almost shoots you. This establishes his "hothead" trait from the first moment.
- Doyle is terrified. He doesn't speak. He just nods and grips his rifle.
- The "signal shot" option losing Malone and Doyle is a MAJOR consequence — you get your 2IC but lose an NCO and a rifleman.
- The "keep moving" option must not be labeled as "avoid them entirely" — the text should feel like a scared, reasonable survival choice, not a clinical tactical option.
- All decision text should be similar length. Don't make the correct answer longer or more detailed.
