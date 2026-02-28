import type { Scenario } from "../../../types/index.ts";

export const scene10_rally_point: Scenario = {
  id: "act1_scene10_rally_point",
  act: 1,
  timeCost: 20,
  combatScene: false,
  achievesMilestone: "rally_complete",

  sceneContext: "Hollow lane between high hedgerows. Rally point under a kilometer north — American small-arms fire audible. American voices ahead. Challenge and response. Last stretch of Act 1.",

  narrative:
    "A hollow lane between hedgerows. The rally point has to be under a kilometer north — you hear American small-arms, scattered. American voices somewhere ahead. You need the password. Flash. Thunder. Then you're in.",

  narrativeAlt: {
    hasSecondInCommand:
      "Henderson studies the lane. 'Rally point's close, Captain. We do this by the book. Challenge from cover. Nobody moves till we know it's ours.'",
    solo: "The rally point is close. You hear American weapons. But you're still alone, and the last stretch is the one that gets people killed.",
  },

  interlude: { type: "transition", beat: "American voices. One word. Then the tension drops.", context: "We're a platoon again. Or what's left." },
  secondInCommandComments: {
    veteran: "Flash. Wait for Thunder. Then we move in. Everybody hold fire.",
    green: "Challenge first. Nobody moves till we know it's ours.",
  },

  decisions: [
    {
      id: "rally_scouts_forward",
      text: "Send two men forward to recon the approach, then challenge from cover",
      tier: "excellent",
      requiresPhase: "squad",
      requiresCapability: "canScout",
      outcome: {
        success: {
          text: "Two men slip forward. Five minutes of silence. Then one appears at the gap — thumbs up. You give the challenge. 'Flash.' 'Thunder.' You move in. American paratroopers, foxholes, radio antenna. The rally point. You made it.",
          context: "Scouts confirmed approach. Challenge from cover. Clean link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 8,
          readinessChange: 0,
        },
        partial: {
          text: "The scouts signal movement to the east — a patrol moving away. You wait ten minutes, then move. The challenge goes clean. You're in. Tired. Intact.",
          context: "Patrol detected. Waited. Challenge clean. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 2,
        },
        failure: {
          text: "A sentinel spots your scouts — one shot, then he's gone. Your men scatter, regroup, cross the last stretch at a run. Nobody hit. You hit the rally point gasping. The shot will draw attention.",
          context: "Scouts spotted. One shot. Crossed under alert. Link-up.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 2,
          readinessChange: 5,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act2_scene01",
      },
    },
    {
      id: "rally_hedgerow_approach",
      text: "Follow the hedgerow north — avoid the open approach",
      tier: "sound",
      minMen: 2,
      outcome: {
        success: {
          text: "You push through the bocage parallel to the lane. Twenty minutes of mud and branches. The lane opens onto a field — and there they are. American paratroopers, foxholes, radio. The rally point. You came in from the flank.",
          context: "Hedgerow approach. Rally point reached from flank.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1,
        },
        partial: {
          text: "The hedgerow route takes longer. Thorns, a drainage ditch with cold water to your waist. Half an hour before you hit the rally perimeter from the east. A sentry almost shot you before you gave the password.",
          context: "Long approach. Nearly fired on by sentry. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2,
        },
        failure: {
          text: "You get lost in the bocage. Every hedge looks the same in the dark. Forty minutes wasted before you find the lane and have to cross the open stretch anyway. The rally point is there. You're just late.",
          context: "Got lost. Crossed open anyway. Late link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 3,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act2_scene01",
      },
    },
    {
      id: "rally_straight_in",
      text: "Call the challenge from here and move in when they answer",
      tier: "sound",
      minMen: 1,
      outcome: {
        success: {
          text: "'Flash.' A pause. 'Thunder. Identify.' You give your unit. They wave you in. American voices, American faces. The rally point. You're not alone anymore.",
          context: "Challenge from position. Correct response. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 6,
          readinessChange: 1,
        },
        partial: {
          text: "'Flash.' A long pause. Someone's moving. Then: 'Thunder. Who's there?' You answer. They let you in. Tense. But you're in.",
          context: "Challenge. Delayed response. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 2,
        },
        failure: {
          text: "'Flash.' Nothing. You call again. Your voice carries. Someone on the perimeter fires — one shot, wild. You hit the dirt. It takes five minutes to sort it out. You're in. Nobody's happy.",
          context: "Challenge. Friendly fire. Sorted. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 4,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act2_scene01",
      },
    },
    {
      id: "rally_rush",
      text: "Move in fast — trust the voices are American",
      tier: "reckless",
      outcome: {
        success: {
          text: "You move. The challenge comes from the perimeter. You answer. They wave you in. Fast and dirty. You're in. It worked.",
          context: "Rushed in. Challenge answered. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 3,
        },
        partial: {
          text: "You're halfway across the open when a flare goes up — the field lights in white. You hit the dirt. The flare fades. Nobody shoots. You crawl the last hundred meters. The sentries find you covered in mud.",
          context: "Flare during approach. Crawled in. Link-up.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 5,
        },
        failure: {
          text: "You run. The perimeter opens up — they thought you were Germans. You're shouting. Someone's hit. It takes a minute to stop the shooting. You're in. One of yours is down. Your fault.",
          context: "Rushed. Taken for enemy. Friendly fire. One casualty.",
          menLost: 1,
          ammoSpent: 0,
          moraleChange: -6,
          readinessChange: 8,
        },
        wikiUnlocks: "rally_procedures",
        nextScene: "act2_scene01",
      },
    },
  ],
};
