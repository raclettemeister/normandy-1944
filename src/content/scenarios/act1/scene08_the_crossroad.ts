import type { Scenario } from "../../../types/index.ts";

export const scene08_the_crossroad: Scenario = {
  id: "act1_scene08_crossroad",
  act: 1,
  timeCost: 15,
  combatScene: false,

  sceneContext: "Road crossing. Wire across the road. Fresh tire tracks — vehicles passed recently. Route choice: safe and slow through the hedgerows, or fast and exposed on the road.",

  narrative:
    "The track opens onto a road. Someone has strung wire across it. The mud is cut by fresh tire tracks. They passed recently. You can go around — ditch and hedgerow — or risk the road. Henderson waits for your call.",

  interlude: { type: "transition", beat: "Wire. Tracks. Choose.", context: "Those tracks are fresh." },
  secondInCommandComments: { veteran: "Those tracks are fresh. We go around — ditch and hedgerow. Kowalski, keep us covered till we're across.", green: "Don't like the road. Let's find another way." },

  decisions: [
    {
      id: "crossroad_bypass",
      text: "Bypass the road — move through the ditch and hedgerow, slower but covered",
      tier: "excellent",
      minMen: 2,
      outcome: {
        success: {
          text: "You signal the bypass. Single file along the ditch, then through the hedgerow. Kowalski covers the road until everyone's across. No contact. Fifteen minutes lost, nobody exposed.",
          context: "Bypass via ditch and hedgerow. No contact. Safe passage.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 0,
        },
        partial: {
          text: "You go around. The hedgerow is thick — twenty minutes of pushing through. You're across and intact. Just slower than you'd hoped.",
          context: "Bypass took longer. No contact.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 1,
        },
        failure: {
          text: "The bypass takes too long. A vehicle engine in the distance — you freeze in the hedge. By the time you're across, you've lost half an hour.",
          context: "Bypass delayed by vehicle. Time lost.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 2,
        },
        wikiUnlocks: "route_selection",
        nextScene: "act1_scene09_minefield",
      },
    },
    {
      id: "crossroad_scout_then_cross",
      text: "Send one man to scout the wire, then cross in pairs if clear",
      tier: "sound",
      minMen: 2,
      outcome: {
        success: {
          text: "Webb scouts the wire. No sign of anyone. You cross in pairs. Quick and quiet. The road is behind you.",
          context: "Scout confirmed clear. Crossed in pairs.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1,
        },
        partial: {
          text: "Your scout signals clear. You cross. Half the squad is over when a motorcycle echoes somewhere east. You freeze, then push the rest across. No contact.",
          context: "Scout clear. Motorcycle heard during crossing. No contact.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2,
        },
        failure: {
          text: "The scout is halfway to the wire when headlights cut the road. He drops. You pull him back. Twenty minutes in the ditch before the road is dark again. You go around after all.",
          context: "Vehicle on road during scout. Delayed. Bypass used.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 3,
        },
        wikiUnlocks: "route_selection",
        nextScene: "act1_scene09_minefield",
      },
    },
    {
      id: "crossroad_rush",
      text: "Cross the road fast — speed over caution",
      tier: "reckless",
      outcome: {
        success: {
          text: "You run. The squad crosses in a rush. Nobody fires. You're in the hedge on the far side, breathing hard. It worked. This time.",
          context: "Rushed the road. No contact.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 4,
        },
        partial: {
          text: "You go. Halfway across, a shot from somewhere — you don't know where. Everyone makes the far side. No casualties. Your heart doesn't slow for ten minutes.",
          context: "Rushed. One shot from unknown position. No casualties.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -2,
          readinessChange: 6,
        },
        failure: {
          text: "You run. The machine gun opens up from the treeline. You dive into the ditch. One man is hit — not bad, but he's bleeding. You crawl the rest of the way. The road cost you.",
          context: "Rush drew MG fire. One wounded. Crossed under fire.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 8,
        },
        wikiUnlocks: "route_selection",
        nextScene: "act1_scene09_minefield",
      },
    },
  ],
};
