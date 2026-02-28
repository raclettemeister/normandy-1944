import type { Scenario } from "../../../types/index.ts";

export const scene09_the_minefield: Scenario = {
  id: "act1_scene09_minefield",
  act: 1,
  timeCost: 20,
  combatScene: false,

  sceneContext: "Flooded pasture. Possible mines — marked or not. Slow and careful, or bypass and lose time. One wrong step and someone you know is gone.",

  narrative:
    "The ground turns to mush. Flooded pasture. Somewhere in the briefing they mentioned mines. You can't see them. You can probe, or you can go around and burn daylight. Henderson looks at you. 'We don't run. We probe. I'll take the lead.'",

  interlude: { type: "transition", beat: "Wet ground. Possible mines. No running.", context: "One step at a time." },
  secondInCommandComments: { veteran: "We don't run. We probe. I'll take the lead — you keep the interval. Doyle, you're in the middle.", green: "One step at a time. Nobody moves till I say." },

  decisions: [
    {
      id: "minefield_probe",
      text: "Probe with a bayonet or stick; single file, careful. Veteran or steady man in front.",
      tier: "excellent",
      minMen: 2,
      outcome: {
        success: {
          text: "Henderson takes the lead. One step, probe. Another. The pasture gives nothing but mud. Twenty minutes and you're across. No one hurt. No shortcuts.",
          context: "Probed across. No mines. Safe.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 0,
        },
        partial: {
          text: "You probe. It's slow. Halfway across someone's boot sinks and the whole line freezes. False alarm — just mud. You're across in thirty minutes. Shaken but intact.",
          context: "Probed. One false alarm. Crossed safely.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 1,
        },
        failure: {
          text: "The probe finds nothing. Then it does. The blast is behind you — someone didn't follow the trace. You turn. One man down. Not dead. You drag him across. The pasture cost you.",
          context: "Mine hit. One casualty. Evacuated.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -6,
          readinessChange: 3,
        },
        wikiUnlocks: "minefield_discipline",
        nextScene: "act1_scene10_rally_point",
      },
    },
    {
      id: "minefield_bypass",
      text: "Bypass the pasture — take the long way, lose time but avoid the risk",
      tier: "sound",
      minMen: 1,
      outcome: {
        success: {
          text: "You go around. Forty minutes of hedgerow and ditch. Nobody steps on anything. The rally point is still ahead. You're late. You're alive.",
          context: "Bypassed. Time cost. No casualties.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 0,
        },
        partial: {
          text: "The long way takes an hour. The men are tired. You reach the far side of the pasture without incident. Time you didn't have. But everyone's still here.",
          context: "Bypass took an hour. No casualties.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 1,
        },
        failure: {
          text: "You bypass. Halfway around you hear the blast — someone didn't stay in trace. A stray step. You double back. One wounded. The long way wasn't long enough.",
          context: "Bypass still hit one mine. One casualty.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -4,
          readinessChange: 2,
        },
        wikiUnlocks: "minefield_discipline",
        nextScene: "act1_scene10_rally_point",
      },
    },
    {
      id: "minefield_rush",
      text: "Move fast — spread out and cross quickly",
      tier: "reckless",
      outcome: {
        success: {
          text: "You push the pace. Everyone spreads out. You're across in ten minutes. Nobody triggers anything. Luck. Nothing else.",
          context: "Rushed across. No mines triggered. Luck.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 2,
        },
        partial: {
          text: "You run. Two-thirds of the way something clicks. The man behind you goes down. You hit the mud. When you look back he's still moving. Wounded. You crawl the rest.",
          context: "Rush triggered mine. One wounded.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -5,
          readinessChange: 4,
        },
        failure: {
          text: "You run. The pasture explodes. One man doesn't get up. You drag the other wounded to the far side. The rally point is ahead. You've got one fewer to bring home.",
          context: "Rush. Mine. One KIA, possible wounded.",
          menLost: 1,
          ammoSpent: 0,
          moraleChange: -8,
          readinessChange: 5,
        },
        wikiUnlocks: "minefield_discipline",
        nextScene: "act1_scene10_rally_point",
      },
    },
  ],
};
