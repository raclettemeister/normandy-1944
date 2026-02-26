import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const rivera = PLATOON_ROSTER.find(s => s.id === 'rivera')!;
const kowalski = PLATOON_ROSTER.find(s => s.id === 'kowalski')!;

export const scene06_the_farmhouse: Scenario = {
  id: "act1_the_farmhouse",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Stone farmhouse, two stories, barn attached. 506th paratrooper gear on porch — musette bag, ace of spades helmet. Door shut, windows dark, floorboards creaking inside. Possible friendlies: Rivera (medic) and Kowalski (BAR gunner).",

  narrative: "A stone farmhouse at the edge of a pasture. Two stories, slate roof, barn attached. Paratrooper gear on the front porch — musette bag, helmet with the ace of spades. That's 506th. The door is shut and the windows are dark, but you hear floorboards creaking inside. Someone is in there.",

  narrativeAlt: {
    "hasSecondInCommand": "A stone farmhouse. Paratrooper gear on the porch — 506th helmet, musette bag. Henderson studies the building for a long moment. 'Could be ours,' he says quietly. He checks his carbine. 'How do you want to handle this, sir?'",
    "solo": "A stone farmhouse alone at the edge of a pasture. Paratrooper gear on the porch — that's 506th, your regiment. Ammo in there, maybe. Equipment. But the windows are dark and you're one man with a pistol."
  },

  secondInCommandComments: {
    "farmhouse_stack_clear": "I'll take point. Standard two-man stack. We clear left on entry.",
    "farmhouse_two_element": "Malone and I take the front. You cover the back with Doyle.",
    "farmhouse_rush": "Slow down, Captain. We don't know who's in there. Could be ours.",
    "farmhouse_grenade": "Sir, that's paratrooper gear on the porch. Those could be our people inside. Hold fire.",
    "farmhouse_clicker_outside": "Smart. Let the clicker do the talking.",
    "farmhouse_scout": "Take your time. I'll hold the tree line.",
    "farmhouse_skip": "Captain, that's paratrooper gear on the porch. Somebody's in there."
  },

  prepActions: [
    {
      id: "farmhouse_prep_observe",
      text: "Watch the farmhouse for movement",
      timeCost: 5,
      responseVeteran: "Floorboards creaking — someone pacing. Musette bag on the porch is 506th issue. No German boot prints in the mud, just jump boots. Whoever's in there came down in a chute.",
      responseGreen: "I can hear someone moving inside. The helmet on the porch has a spade on it.",
    },
    {
      id: "farmhouse_prep_ask_henderson",
      text: "Ask Henderson about the approach",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran: "One door front, one door barn side. Windows: two ground floor, two upstairs. Stone walls — nothing's going through those. If they're ours, the clicker should sort it. If they're not, that BAR on the doorframe is going to be a problem. I'd say front door, clicker first.",
      responseGreen: "It's a building, sir. Door's right there.",
    },
    {
      id: "farmhouse_prep_circle_building",
      text: "Circle the building to check exits",
      timeCost: 5,
      responseVeteran: "Back door through the barn, one window accessible on the west side. Stone walls everywhere else. Good news: only two ways out. You can cover both with four men.",
      responseGreen: "There's a door in the back. And a window, I think.",
    },
  ],

  rally: {
    soldiers: [{ ...rivera }, { ...kowalski }],
    ammoGain: 15,
    moraleGain: 7,
    narrative: "Rivera comes out shaking, but his hands go straight to the aid bag — already checking your men before anyone asks. Kowalski fills the doorway behind him, BAR across his chest, two extra bandoliers over his shoulders. He looks at you and nods once. A medic and an automatic weapon. Everything just changed."
  },

  decisions: [
    {
      id: "farmhouse_stack_clear",
      text: "Stack on the door — clear the building room by room",
      tier: "excellent",
      requiresPhase: "squad",
      minMen: 2,
      outcome: {
        success: {
          text: "Henderson clicks at the door. Two clicks back from inside. He enters low, sweeps left — Rivera standing there with hands raised, Kowalski with the BAR on the doorframe. 'Thunder,' Rivera whispers. Room by room, you clear it. Nothing but your own men.",
          context: "Stack and clear with clicker ID. Rivera and Kowalski identified. Clean entry, rooms cleared. Rally with medic and BAR gunner.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 5,
          readinessChange: 2
        },
        partial: {
          text: "Henderson clicks at the door. Silence — Rivera lost his clicker in the drop. 'Flash,' Henderson whispers. A voice comes back shaky: 'Thunder! Don't shoot, we're American!' The door opens to Kowalski's BAR aimed at Henderson's chest. A full minute before anyone stops shaking.",
          context: "Stack and clear. Clicker failed — Rivera lost his. Verbal challenge resolved it. BAR aimed at friendlies. Tense rally.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "Doyle catches the milk pail with his boot — it clatters across stone and the BAR opens up through the door. Henderson throws himself flat screaming 'AMERICAN!' until the firing stops. Nobody hit. Close enough to taste.",
          context: "Noise during approach triggered BAR fire through door. No casualties by luck. Henderson screamed identification. Rally made under fire.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: 1,
          readinessChange: 5
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_two_element",
      text: "Send two men to the front while you cover the back exit",
      tier: "sound",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text: "Henderson and Malone take the front. Henderson clicks. Two clicks from inside. 'Friendlies coming in.' The door opens and Henderson's voice carries through the window: 'Clear. Captain, come on in.' Rivera and Kowalski. Alive and armed.",
          context: "Two-element approach. Clicker exchange at front door. Clean entry. Rivera and Kowalski rallied. Back covered.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: 3,
          readinessChange: 1
        },
        partial: {
          text: "Henderson and Malone enter. You hear voices — urgent, not gunfire. Then Henderson at the back window: 'Captain, it's ours. Rivera and Kowalski.' But Doyle at the back door heard the commotion and nearly squeezed one off. You had to push his barrel down yourself.",
          context: "Front element entered successfully. Rear element nearly fired on commotion. Captain prevented friendly fire. Rally made with close call.",
          menLost: 0,
          ammoSpent: -1,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "Henderson enters. Kowalski fires at the movement. Henderson dives. Malone fires back. 'CEASE FIRE! CEASE FIRE!' — Henderson screaming in the dark. When the ringing stops, Malone has a graze on his arm. Nobody dead. Barely.",
          context: "Entry triggered friendly firefight. Kowalski fired, Malone returned fire. Malone grazed. Henderson stopped it. Rally under chaos.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -2,
          readinessChange: 5
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_rush",
      text: "Go in fast — rush the building before anyone can react",
      tier: "reckless",
      outcome: {
        success: {
          text: "You burst through the door. Rivera screams. Kowalski swings the BAR toward your chest and stops — your helmet silhouette, American. 'JESUS! We're American!' Rivera shouts. Kowalski's finger was on the trigger. One more second.",
          context: "Rushed building without identification. Kowalski nearly fired BAR at captain. Recognized helmet silhouette. Rally by luck, not skill.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -2,
          readinessChange: 5
        },
        partial: {
          text: "You crash through the door. The BAR fires — the round hits the wall an inch from your head, plaster dust in your eyes. 'FLASH! FLASH!' you scream. Kowalski stops. Rivera is on the floor, hands over his ears, crying. Everyone alive, but something in the room is broken.",
          context: "Rushed in, BAR fired. Near miss on captain — round into wall. Rivera breaking down. Rally made but squad psychologically damaged.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -5,
          readinessChange: 6
        },
        failure: {
          text: "You charge in. The BAR fires. One of your men is silhouetted in the doorway and the round takes him off his feet. 'AMERICAN! WE'RE AMERICAN!' Too late. Rivera rushes to the body. Your own soldier, shot by your own people, because you didn't say a word before you came through that door.",
          context: "Rushed building. BAR killed one friendly in doorway. No identification given before entry. Friendly fire fatality.",
          menLost: 1,
          ammoSpent: -3,
          moraleChange: -10,
          readinessChange: 8
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_grenade",
      text: "Toss a grenade through the window, then enter",
      tier: "reckless",
      outcome: {
        success: {
          text: "You pull the pin. Henderson grabs your wrist. 'Captain. CAPTAIN. Look at the porch.' His voice is flat, urgent. 'That's 506th gear.' You look. He's right. You work the pin back in with fingers that won't stop trembling. Henderson just saved you from the worst mistake of your life.",
          context: "Grenade aborted — Henderson stopped captain. 506th gear on porch identified just in time. No throw. Near-catastrophic mistake prevented.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 3
        },
        partial: {
          text: "The grenade goes through the window. The blast shakes the walls. You enter through smoke and find Rivera on the floor, ears bleeding, mouth open in a scream you can't hear. Kowalski is dazed against the far wall, the BAR knocked from his hands. Both alive — the grenade landed in the next room. Your medic can't hear you calling his name.",
          context: "Grenade thrown into friendlies' position. Blast wounded Rivera (ears) and dazed Kowalski. Both alive — grenade hit adjacent room. Medic hearing damaged.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: -12,
          readinessChange: 8
        },
        failure: {
          text: "The grenade detonates in the main room. You go in through the smoke. Kowalski is dead where he sat — the blast caught him square. Rivera is slumped against the far wall, shrapnel in his chest, staring at the screaming eagle on your shoulder. 'You...' he whispers. You just killed your own BAR gunner with a Gammon bomb.",
          context: "Grenade killed Kowalski (BAR gunner). Rivera hit by shrapnel. Friendly fire — grenaded own men. Catastrophic leadership failure.",
          menLost: 1,
          ammoSpent: -5,
          moraleChange: -15,
          readinessChange: 10
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_clicker_outside",
      text: "Use the cricket clicker from the porch — listen for a response",
      tier: "sound",
      outcome: {
        success: {
          text: "One click-clack from the porch. Silence. Then from inside: click-clack, click-clack. Rivera's voice, muffled: 'American? Please be American.' You open the door. Rivera and Kowalski. Alive, armed, and the relief on Rivera's face nearly breaks you.",
          context: "Clicker from porch. Proper response from inside. Clean identification. Rivera and Kowalski rallied. No shots fired.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1
        },
        partial: {
          text: "One click. Nothing — Rivera lost his clicker in the drop. You try the verbal: 'Flash.' Long pause. Then a voice through the door, barely audible: 'Thunder.' The door cracks open. Rivera's face, drawn and pale. 'Captain? Oh, thank God.'",
          context: "Clicker failed — no response. Verbal challenge worked. Rivera and Kowalski found alive. Slow identification process.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "One click. The sound of a weapon being readied inside — a bolt sliding home. No clicker, no response. You call out 'Flash.' A long silence. Then: '...Thunder?' Scared, uncertain. You enter slow. Rivera's hands are shaking so badly he can't hold his aid bag.",
          context: "Clicker and verbal both met with fear. Weapon readied inside. Slow, tense identification. Rivera badly shaken — compromised medic capability.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 3
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_scout",
      text: "Scout the building first — check every window for movement",
      tier: "sound",
      outcome: {
        success: {
          text: "You circle the building low, back against the stone. Through a side window: two figures in American uniforms. Medic armband on one, the other cradling a BAR. You tap the glass. 'Flash.' 'Thunder!' They let you in through the side door.",
          context: "Scouted building. Visually confirmed American uniforms, medic armband, BAR. Verbal challenge at window. Clean rally.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 1
        },
        partial: {
          text: "You circle the farmhouse. Dark inside — shapes, nothing clear. But the boots on the floor are American tread, not German hobnail. You tap the door with your clicker and wait. It takes time, but contact is made. Rivera and Kowalski, alive in the dark.",
          context: "Scouted building. Visual inconclusive — identified American boot tread. Clicker at door resolved it. Rally made with delay.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2
        },
        failure: {
          text: "Twenty-five minutes circling the building on your belly. Shapes through dirty glass, nothing confirmed. You finally use the clicker at the front door and it works in thirty seconds. Half an hour burned for what the clicker would have done from the porch.",
          context: "25 minutes scouting gained nothing. Clicker at door worked in 30 seconds. Excessive time spent for no intelligence advantage.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 3
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    },
    {
      id: "farmhouse_skip",
      text: "Skip the farmhouse — keep moving toward the rally point",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You move past the farmhouse without stopping. Henderson glances back once. 'Those were our people, sir.' Maybe. Maybe not. The gear on the porch stays with you longer than it should.",
          context: "Bypassed farmhouse. No rally attempt. Possible friendlies left behind. Kept moving toward rally point.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 0
        },
        partial: {
          text: "You push on through the next field. The farmhouse falls behind in the gray. Halfway across, you hear it — a cricket clicker from that direction. One click. Faint. You're already moving and you don't go back.",
          context: "Bypassed farmhouse. Heard clicker behind — confirmed friendlies. Did not return. Rally opportunity missed.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 0
        },
        failure: {
          text: "You leave. Henderson says nothing but his jaw is set. Malone mutters something you don't catch. You left possible friendlies in a dark farmhouse because you were afraid of what was inside. The men saw it.",
          context: "Bypassed farmhouse out of fear. Squad noticed avoidance. Lost potential medic and BAR gunner. Leadership credibility damaged.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 0
        },
        wikiUnlocks: "positive_identification",
        nextScene: "act1_scene07"
      }
    }
  ],

  interlude: {
    type: "transition",
    beat: "The farmhouse sits dark and silent at the edge of the field. Stone walls, shuttered windows. Could be empty. Could be anything.",
    context: "tension rising, approaching unknown structure",
    objectiveReminder: "Clear the farmhouse and continue to the crossroads.",
  },
};
