import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const byId = (id: string) => {
  const s = PLATOON_ROSTER.find(r => r.id === id);
  if (!s) throw new Error(`Unknown soldier: ${id}`);
  return { ...s };
};

// ENGINE NOTES:
// - sergeant_signal_shot should trigger a PARTIAL rally (Henderson only,
//   ammoGain: 5, moraleGain: 3) instead of the full rally below.
//   Malone and Doyle scatter and are lost for the rest of the game.
// - sergeant_avoid skips the rally entirely. No soldiers, no 2IC.
// - sergeant_rush failure inflicts a persistent captain_wounded penalty
//   (shoulder graze) that should carry through the rest of the run.
// - Decisions with longer time costs: sergeant_pebble (30 min),
//   sergeant_observe (30 min), sergeant_listen (20 min). All others are 15 min.
//   The Scenario.timeCost field only supports a single value; the engine
//   would need per-decision overrides or narrative-only time references.

export const scene04_the_sergeant: Scenario = {
  id: "act1_the_sergeant",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Stone wall, 30 meters from 2-3 voices. Cadence sounds American but could be Ost-Battalion or Fallschirmjäger with captured gear. Cricket clicker available. Potential rally with Henderson, Malone, Doyle.",

  narrative: "Voices on the other side of a stone wall. Thirty meters, maybe less. Two, three people — one giving orders, quiet but firm. The cadence sounds American. But the briefing warned about Ost-Battalion troops with broken English, Fallschirmjäger with captured gear. Your hand finds the cricket clicker.",

  narrativeAlt: {
    low_morale: "Voices on the other side of a stone wall. Close. You drop to a knee. The cadence might be English — or you might need it to be. You're too exhausted to trust your own ears. The cricket clicker is in your breast pocket. Your fingers are slow finding it."
  },

  rally: {
    soldiers: [byId('henderson'), byId('malone'), byId('doyle')],
    ammoGain: 10,
    moraleGain: 8,
    narrative: "Henderson stands up from the hedgerow, carbine low. 'Captain.' That's all he says. Behind him, Malone crouches with his Thompson, eyes sweeping the dark, jaw set like he's hoping someone gives him a reason. Doyle is flat on his belly, white-knuckled on his Garand. The kid won't look up. Three men. Your men. Something in your chest unclenches."
  },

  decisions: [
    {
      id: "sergeant_clicker",
      text: "Use the cricket clicker from behind the wall",
      tier: "excellent",
      outcome: {
        success: {
          text: "One click-clack. Silence — then click-clack, click-clack from the dark. You vault the wall. Henderson is there, carbine low, eyes steady. 'Captain,' he says. 'Glad to see you, sir.'",
          context: "Cricket challenge from cover. Proper response. Clean rally with Henderson. No noise, no delay.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 8,
          readinessChange: 0
        },
        partial: {
          text: "One click-clack. A long pause. Whispered voices on the other side. Then two clicks — tentative. You climb the wall carefully. Henderson has his pistol leveled at your chest until he sees your face. 'Captain. Jesus Christ.' He lowers the weapon.",
          context: "Cricket challenge, hesitant response. Henderson had weapon drawn on approach. Rally made but tense.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 6,
          readinessChange: 0
        },
        failure: {
          text: "One click-clack. Nothing. Then a rifle bolt being worked. Malone's voice: 'Flash. Right now.' You answer 'Thunder.' He lowers his weapon. 'Thought you were Kraut.' The reunion is tense — everyone's on edge.",
          context: "Cricket got no response. Malone nearly fired. Verbal challenge resolved it. Rally made but squad on edge.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_flash",
      text: "Call out 'Flash' from behind the stone wall",
      tier: "sound",
      outcome: {
        success: {
          text: "'Flash.' Instant: 'Thunder. Identify yourself.' Henderson's voice — you'd know it anywhere. 'Captain, 2nd Platoon.' 'Come on in, sir.' Henderson, Malone, Doyle. Your people.",
          context: "Verbal challenge. Instant proper response from Henderson. Clean rally with full squad element.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 6,
          readinessChange: 2
        },
        partial: {
          text: "'Flash.' A pause that lasts forever. Then: '...Thunder.' Uncertain. You come around the wall slowly. Henderson has his carbine up. When he sees you, he exhales. 'Captain. Damn, sir.'",
          context: "Verbal challenge, uncertain response. Henderson had carbine raised. Rally made but approach was tense.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 2
        },
        failure: {
          text: "'Flash.' 'THUNDER!' Malone shouts it — loud enough to echo off the hedgerows. 'Malone, shut the hell up,' Henderson hisses. Too late. Somewhere east, a flare climbs into the sky. You've been located.",
          context: "Verbal challenge. Malone shouted response — echo carried. German flare went up east. Position compromised.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 5
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_rush",
      text: "Sprint toward the voices before they move on",
      tier: "reckless",
      outcome: {
        success: {
          text: "You vault the wall and run. Malone spins — pistol up. Henderson grabs his arm. 'HOLD FIRE.' You skid to a stop, breathing hard. Henderson stares at you. 'With all due respect, sir — don't ever do that again.'",
          context: "Rushed over wall without identification. Henderson prevented Malone from firing. Rally made but nearly fatal.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 3
        },
        partial: {
          text: "You jump the wall. Muzzle flash — Malone fires. The round whips past your ear. 'CEASE FIRE!' Henderson tackles Malone. Doyle is screaming. When it settles, no one's hit. But your ear is ringing and your hands won't stop shaking.",
          context: "Rushed wall. Malone fired — near miss. Henderson tackled shooter. No casualties but squad shaken. Noise signature.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 6
        },
        failure: {
          // captain_wounded: persistent penalty — engine must track shoulder graze
          text: "You charge over the wall. Malone fires twice. Pain tears through your shoulder — you hit the ground. Henderson is shouting. Everything is chaos. The round grazed you, but blood is soaking your sleeve. Your own man shot you.",
          context: "Charged wall without identification. Malone shot captain — shoulder graze. Friendly fire wound. Squad in chaos.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 8
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_pebble",
      text: "Toss a pebble over the wall and listen",
      tier: "mediocre",
      // Effective timeCost: 30 min (extra 15 min for the confusion this causes)
      outcome: {
        success: {
          text: "The stone clicks off the far side of the wall. Voices go silent. Then: 'Who's there? Flash.' Henderson. You answer 'Thunder.' It works — just took longer than it needed to.",
          context: "Tossed pebble. Caused alert but Henderson challenged verbally. Rally made with extra delay.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 1
        },
        partial: {
          text: "The stone lands. Dead silence. Weapons being readied. Two full minutes before a whisper: 'If you're American, use your goddamn clicker.' You do. Henderson: 'Would've been nice to start with that, sir.'",
          context: "Pebble caused two-minute armed standoff. Had to use clicker anyway. Rally made but time wasted, trust strained.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 2
        },
        failure: {
          text: "The pebble lands and Malone opens fire at the sound. You flatten yourself into the dirt. Henderson shouts cease fire. Ten minutes of chaos before you make contact with the clicker. Doyle is crying. Malone won't look at you.",
          context: "Pebble triggered Malone to fire. Ten minutes of chaos. Rally made but squad traumatized. Doyle breaking down.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 5
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_signal_shot",
      text: "Fire a shot in the air to signal them",
      tier: "suicidal",
      // PARTIAL RALLY: Only Henderson is found. Malone and Doyle scatter
      // and are lost. Engine should override the full rally with:
      // soldiers: [henderson], ammoGain: 5, moraleGain: 3
      outcome: {
        success: {
          text: "The shot cracks the night open. Voices scatter — running in every direction. 'FLASH!' you shout. 'THUNDER!' Henderson, fifty meters away and moving farther. Malone and Doyle are gone — bolted into the dark. Henderson finds you alone. 'A signal shot, sir? In Normandy?'",
          context: "Signal shot scattered everyone. Malone and Doyle bolted — lost. Only Henderson recovered. Partial rally, ammo spent.",
          rallyOverride: {
            soldiers: [byId('henderson')],
            ammoGain: 5,
            moraleGain: 3,
          },
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -3,
          readinessChange: 10
        },
        partial: {
          text: "The shot echoes off the hedgerows. Pandemonium — running, shouting, a German voice barking in the distance. You find Henderson crouching behind the wall, alone. Malone and Doyle scattered. 'Captain. I've got nothing kind to say about what you just did.'",
          context: "Signal shot caused pandemonium. German voice in distance. Malone and Doyle scattered, lost. Henderson only.",
          rallyOverride: {
            soldiers: [byId('henderson')],
            ammoGain: 5,
            moraleGain: 3,
          },
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -6,
          readinessChange: 12
        },
        failure: {
          text: "The shot echoes. A machine gun opens up from three hundred meters — long bursts, tracers whipping overhead. Everyone scatters. Forty-five minutes of crawling through ditches. You find Henderson. Just Henderson. Malone and Doyle are gone.",
          context: "Signal shot drew MG fire. 45 minutes crawling ditches. Only Henderson found. Malone and Doyle lost. Rally failed.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: -10,
          readinessChange: 15,
          skipRally: true,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_observe",
      text: "Circle wide through the hedgerow and observe them",
      tier: "sound",
      // Effective timeCost: 30 min (extra movement through bocage)
      outcome: {
        success: {
          text: "A hundred meters through the bocage, belly-crawling the last twenty. From the new angle: three men. American helmets. Paratrooper boots. A Thompson — NCO weapon. You use the clicker. Henderson answers.",
          context: "Circled wide, observed from new angle. Confirmed American helmets, paratrooper boots, Thompson. Clean clicker rally.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        partial: {
          text: "Twenty-five minutes through dense hedgerow. Shapes in the dark — details gone. American, probably. You use the clicker. Two clicks back. Henderson, Malone, Doyle. 'Where the hell have you been, Captain? We've been here an hour.'",
          context: "25-minute flanking circuit. Could not confirm IDs visually. Clicker resolved it. Rally made but time burned.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "You circle too wide. Thirty-five minutes. When you reach the spot, they've moved. Another ten minutes tracking before Henderson's clicker finds you. You've burned nearly an hour.",
          context: "Circled too wide — 45 minutes total. Group had moved. Henderson's clicker found you. Nearly an hour wasted.",
          timeCost: 30,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 4
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_avoid",
      text: "Slip away into the next field and keep moving",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You slip into the next field. The voices fade behind the wall. Safe. The silence that follows is the loudest thing you've heard all night. You're still alone.",
          context: "Avoided contact entirely. Slipped away undetected. No rally — still alone. No risk taken, no men gained.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 0,
          skipRally: true,
        },
        partial: {
          text: "You back away. A branch snaps. The voices go quiet. Someone whispers 'Flash?' — barely audible. You keep moving. Part of you says go back. You don't.",
          context: "Retreated. Heard 'Flash' challenge behind — Americans. Kept moving anyway. Rally skipped. Alone.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -7,
          readinessChange: 0,
          skipRally: true,
        },
        failure: {
          text: "You leave. Every sound is louder alone. Every shadow has a rifle. You made the safe choice. The safe choice left you without a single ally in occupied France.",
          context: "Left potential allies behind wall. No rally. Alone in enemy territory. Fear-driven decision.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -10,
          readinessChange: 0,
          skipRally: true,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    },
    {
      id: "sergeant_listen",
      text: "Press against the wall and listen before deciding",
      tier: "sound",
      // Effective timeCost: 20 min (five minutes listening plus approach)
      outcome: {
        success: {
          text: "Five minutes against the wall. '...assembly area should be...' American English. Not textbook — real Boston vowels. That's Malone. Henderson corrects him quietly. You click. They respond instantly.",
          context: "Listened five minutes. Confirmed American accents, identified Malone's voice. Clicker rally instant. Clean approach.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1
        },
        partial: {
          text: "Five minutes of listening. Indistinct voices. One of them laughs — something about the Red Sox. American. Probably. You use the clicker. Two clicks back. Henderson, Malone, Doyle.",
          context: "Listened five minutes. Voices indistinct but cultural cues suggest American. Clicker confirmed. Rally made.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        failure: {
          text: "Five minutes and the words blur in the dark. Accents, cadence — nothing clear. You use the clicker anyway. Henderson responds. But you've been crouching here too long. Your knees ache and the clock has moved.",
          context: "Listened five minutes, couldn't confirm identity. Used clicker anyway — worked. Time burned for no intelligence gain.",
          timeCost: 20,
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act1_the_patrol"
      }
    }
  ],

  interlude: {
    type: "rest",
    beat: "You take a knee behind a low stone wall and spread the map across your thigh. Moonlight picks out the contour lines. Somewhere ahead, voices. You mark your position and fold the map away.",
    context: "brief pause before potential contact, cautious anticipation",
    objectiveReminder: "Continue rallying. Secure enough men to move on the objective.",
  },
};
