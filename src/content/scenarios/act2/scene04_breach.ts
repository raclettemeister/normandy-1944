import type { Scenario } from '../../../types';

export const scene04_breach: Scenario = {
  id: "act2_scene04",
  act: 2,
  timeCost: 15,
  combatScene: true,

  sceneContext:
    "Near wall reached. Need breach into crossroads proper through wire, ditch, and stone cover. MG lane still dangerous from north corner.",

  narrative:
    "You're at the near wall now. Wire hangs low across the lane and the ditch is deeper than it looked from a distance. The north-corner gun still sweeps every few seconds. One good breach and the crossroads opens. One bad breach and you're pinned in dead ground with nowhere left to hide.",

  secondInCommandComments: {
    breach_drainage_flank: "If we keep that gun pinned, this ditch gets us under their line.",
    breach_gammon_gap: "Fast and violent. Works if the throw is right and timing is tighter.",
    breach_hedgerow_push: "We'll get through, but they'll be waiting when we do.",
    breach_road_rush: "Road is the kill lane, sir. That's what they built this for.",
  },

  decisions: [
    {
      id: "breach_drainage_flank",
      text: "Pin the gun and push a flank team through the drainage ditch",
      tier: "excellent",
      requiresCapability: "canSuppress",
      benefitsFromIntel: "knowsMGPosition",
      minMen: 4,
      outcome: {
        success: {
          text:
            "Suppression keeps the gun head-down while your flank team crawls the ditch and emerges on the gun's blind side. One burst later, the corner position is neutralized and the wire lane opens.",
          context:
            "Suppression plus ditch flank neutralized corner MG from blind side; breach lane opened.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 6,
          readinessChange: 5,
        },
        partial: {
          text:
            "The flank reaches position but mud slows the final meters. The gun team recovers enough for a short burst before being knocked out. You breach, but under real pressure.",
          context:
            "Ditch flank succeeded with delay due terrain. Brief MG recovery caused pressured breach.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 2,
          readinessChange: 7,
        },
        failure: {
          text:
            "Suppression falters during a reload and the gun catches your flank in the ditch. You still force the breach, but you lose a man on the way through.",
          context:
            "Reload gap in suppression exposed flank team in ditch. Breach forced with one casualty.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -5,
          readinessChange: 10,
        },
        wikiUnlocks: "suppress_and_flank",
        nextScene: "act2_scene05",
      },
    },
    {
      id: "breach_gammon_gap",
      text: "Use a grenade blast to open a gap in wire and rush through",
      tier: "sound",
      requiresCapability: "hasExplosives",
      minMen: 3,
      outcome: {
        success: {
          text:
            "The blast rips a clean gap in the wire. You surge through in sequence before the defenders re-orient. Fast entry, manageable chaos.",
          context:
            "Explosive breach created clean wire gap. Team passed quickly before defensive reset.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 4,
          readinessChange: 7,
        },
        partial: {
          text:
            "The grenade tears some wire but leaves snarls at shin height. The lead element trips through and regains control on the far side.",
          context:
            "Partial wire breach left obstacles during crossing. Formation disrupted but recovered.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 1,
          readinessChange: 8,
        },
        failure: {
          text:
            "The throw lands short and the wire mostly holds. You try to force through anyway under rising fire. One man is hit before the lane finally opens.",
          context:
            "Poor grenade placement failed full breach. Forced crossing under fire caused one casualty.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -4,
          readinessChange: 11,
        },
        wikiUnlocks: "suppress_and_flank",
        nextScene: "act2_scene05",
      },
    },
    {
      id: "breach_hedgerow_push",
      text: "Cut through the hedge line and muscle into the intersection",
      tier: "mediocre",
      minMen: 3,
      outcome: {
        success: {
          text:
            "You force through roots and branches, then spill into the edge of the intersection from an angle they didn't fully cover. It's ugly, but it gets you in.",
          context:
            "Hedge breach forced entry from partially uncovered angle. Tactically rough but effective.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 2,
          readinessChange: 7,
        },
        partial: {
          text:
            "The hedge slows everyone and compresses your file. You enter bunched and burn extra rounds untangling under fire.",
          context:
            "Hedge breach compressed formation. Entry bunched under fire with increased ammo expenditure.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: -2,
          readinessChange: 9,
        },
        failure: {
          text:
            "You get stuck in the hedge exactly where the enemy expected movement. Fire rakes the gap and one of your men drops before you break through.",
          context:
            "Predictable hedge gap became kill point. One casualty before forced passage.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -6,
          readinessChange: 11,
        },
        wikiUnlocks: "suppress_and_flank",
        nextScene: "act2_scene05",
      },
    },
    {
      id: "breach_road_rush",
      text: "Ignore the ditch and sprint the road shoulder into the objective",
      tier: "reckless",
      minMen: 2,
      outcome: {
        success: {
          text:
            "Speed and confusion carry the first element into the crossroads edge before defenders settle. You gain ground, but only by gambling hard.",
          context:
            "Road-shoulder rush gained immediate ground through speed; high-risk method succeeded narrowly.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 0,
          readinessChange: 10,
        },
        partial: {
          text:
            "The road shoulder gives no concealment. You make it in with rounds snapping at knee height and one near-miss that shakes the whole line.",
          context:
            "Exposed rush through road shoulder. No direct losses but severe close-fire pressure.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: -4,
          readinessChange: 12,
        },
        failure: {
          text:
            "The shoulder becomes a funnel. Crossfire catches your lead pair and you lose a man before the rest can dive into cover.",
          context:
            "Road rush entered crossfire funnel. One casualty before cover reached.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -8,
          readinessChange: 14,
        },
        fatal: true,
        wikiUnlocks: "suppress_and_flank",
        nextScene: "act2_scene05",
      },
    },
  ],
};
