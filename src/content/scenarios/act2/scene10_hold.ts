import type { Scenario } from '../../../types';

export const scene10_hold: Scenario = {
  id: "act2_scene10",
  act: 2,
  timeCost: 20,
  combatScene: true,

  sceneContext:
    "Late-morning enemy probing attack on newly captured crossroads. Objective now is to hold, preserve force, and transition into sustained defense phase.",

  narrative:
    "The first probe comes sooner than you wanted — scattered rifle fire, then coordinated bursts from the east hedgerow. Not a full counterattack yet. A test. They want to see how solid you are and where you'll panic. How you answer this sets the tone for the rest of the day.",

  narrativeAlt: {
    hasSecondInCommand:
      "Henderson checks each sector once, quick and deliberate. 'Probe attack, sir. They're feeling us out. If we stay disciplined here, they'll pay for every meter later.'",
  },

  secondInCommandComments: {
    hold_fire_discipline: "Disciplined fire wins this. No one wastes rounds on shadows.",
    hold_controlled_counterpush: "Short push, then back to sectors. We don't get sucked out.",
    hold_immediate_counterattack: "Big push now could overextend us before noon.",
    hold_everyone_fires_at_once: "Volume isn't control, sir. We burn ammo and lose sight lines.",
  },

  decisions: [
    {
      id: "hold_fire_discipline",
      text: "Hold strict fire discipline and engage only confirmed targets",
      tier: "excellent",
      requiresCapability: "canSuppress",
      outcome: {
        success: {
          text:
            "Your sectors hold discipline. Controlled bursts break the probe without exposing your own movement. The enemy falls back with little to show for it.",
          context:
            "Disciplined sector fire repelled probe efficiently with minimal exposure and ammo waste.",
          menLost: 0,
          ammoSpent: 6,
          moraleChange: 7,
          readinessChange: 4,
        },
        partial: {
          text:
            "The line holds, but one sector fires early and burns extra rounds. Probe still breaks, though not as cleanly.",
          context:
            "Probe repelled with minor fire-discipline breach and increased ammo use.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 3,
          readinessChange: 5,
        },
        failure: {
          text:
            "Two sectors misread movement and fire across each other's lanes. The probe withdraws, but not before one of your men is hit in the confusion.",
          context:
            "Sector control failure caused lane confusion and one casualty during probe defense.",
          menLost: 1,
          ammoSpent: 9,
          moraleChange: -4,
          readinessChange: 7,
        },
        wikiUnlocks: "fire_discipline",
        nextScene: "act3_scene01",
      },
    },
    {
      id: "hold_controlled_counterpush",
      text: "Repel the probe, then launch a short counterpush to reset their line",
      tier: "sound",
      minMen: 4,
      outcome: {
        success: {
          text:
            "You blunt the probe, push fifty meters to break their staging hedge, then pull back before overextending. Controlled aggression, clean return.",
          context:
            "Disciplined local counterpush disrupted staging area and returned to objective in order.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 5,
          readinessChange: 6,
        },
        partial: {
          text:
            "The counterpush gains ground but lingers too long under sporadic mortar adjustment. You return with position intact and nerves frayed.",
          context:
            "Counterpush achieved limited gain but overstayed under indirect-fire risk.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 1,
          readinessChange: 8,
        },
        failure: {
          text:
            "The push chases too far into broken hedgerows. You fight your way back and lose a man in the withdrawal.",
          context:
            "Counterpush overextended in complex terrain; one casualty during forced withdrawal.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -5,
          readinessChange: 10,
        },
        wikiUnlocks: "fire_discipline",
        nextScene: "act3_scene01",
      },
    },
    {
      id: "hold_immediate_counterattack",
      text: "Commit to a full immediate counterattack into the east hedgerow",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "You hit hard enough to push them back, but your own line stretches thin and takes time to reform.",
          context:
            "Immediate counterattack displaced probe force but strained objective cohesion.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: 2,
          readinessChange: 8,
        },
        partial: {
          text:
            "The attack gains little and burns a lot. You return to the crossroads tired, loud, and less ready than before.",
          context:
            "Immediate counterattack produced limited effect with high fatigue and ammo cost.",
          menLost: 0,
          ammoSpent: 12,
          moraleChange: -4,
          readinessChange: 11,
        },
        failure: {
          text:
            "The counterattack collides with a prepared fallback line. You break contact late and lose two men getting back.",
          context:
            "Full counterattack hit prepared fallback fire line; two casualties during disengagement.",
          menLost: 2,
          ammoSpent: 13,
          moraleChange: -10,
          readinessChange: 13,
        },
        fatal: true,
        wikiUnlocks: "fire_discipline",
        nextScene: "act3_scene01",
      },
    },
    {
      id: "hold_everyone_fires_at_once",
      text: "Order maximum volume fire from every position immediately",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "The sudden wall of fire shocks the probe and drives it back, but ammo drains fast and target discrimination is poor.",
          context:
            "Massed volume fire repelled probe quickly but at high ammunition cost and low precision.",
          menLost: 0,
          ammoSpent: 12,
          moraleChange: 1,
          readinessChange: 8,
        },
        partial: {
          text:
            "Everyone firing means no one really controlling arcs. The probe withdraws, but your line is loud, hot, and half-spent.",
          context:
            "Uncontrolled volume fire degraded arc control and consumed major ammo reserves.",
          menLost: 0,
          ammoSpent: 14,
          moraleChange: -3,
          readinessChange: 10,
        },
        failure: {
          text:
            "Crossing fires and overexposure follow the order. You stop the probe, but one man is hit and your ammo state is now precarious.",
          context:
            "Mass fire caused crossing-lane exposure. Probe repelled with one casualty and severe ammo depletion.",
          menLost: 1,
          ammoSpent: 15,
          moraleChange: -7,
          readinessChange: 11,
        },
        wikiUnlocks: "fire_discipline",
        nextScene: "act3_scene01",
      },
    },
  ],

  interlude: {
    type: "transition",
    beat: "The smoke thins as noon approaches. The crossroads is yours, but every road leading into it now feels like a question you haven't answered yet.",
    context: "post-assault fatigue, rising dread of counterattack",
    objectiveReminder: "Hold this ground. Prepare for what comes next.",
  },
};
