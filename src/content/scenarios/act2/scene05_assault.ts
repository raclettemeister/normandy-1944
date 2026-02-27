import type { Scenario } from '../../../types';

export const scene05_assault: Scenario = {
  id: "act2_scene05",
  act: 2,
  timeCost: 20,
  combatScene: true,

  sceneContext:
    "Main assault inside objective perimeter. German defenders split between inn wall, roadblock cart, and north trench. Need coordinated push to break resistance.",

  narrative:
    "You're inside the perimeter now. The crossroads is a maze of stone walls, ditches, and shattered wagons. Germans are firing from three pockets: inn courtyard, roadblock cart, and a shallow trench north of the road. This is the decisive push. If these pockets hold, the assault stalls.",

  secondInCommandComments: {
    crossroads_two_axis_assault: "Two axes with one clock. That's how we break this before they reinforce.",
    crossroads_bound_and_clear: "Steady and controlled. Slower, but we keep command of the fight.",
    crossroads_single_squad_reckless: "One squad can't do everything at once in this kind of ground.",
    crossroads_pause_for_mortar: "Waiting lets them reset sectors and move more rifles into cover.",
  },

  decisions: [
    {
      id: "crossroads_two_axis_assault",
      text: "Launch a two-axis assault: fix front, flank left through the courtyard wall",
      tier: "excellent",
      requiresPhase: "platoon",
      requiresCapability: "canSuppress",
      benefitsFromIntel: "knowsMGPosition",
      minMen: 6,
      outcome: {
        success: {
          text:
            "Suppression holds the road pocket while Malone's axis punches through the courtyard wall. The trench team breaks when hit from the side. Resistance collapses in under five minutes.",
          context:
            "Coordinated two-axis assault succeeded quickly. Suppression and flank synchronized; enemy pockets collapsed.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: 8,
          readinessChange: 6,
        },
        partial: {
          text:
            "The flank reaches the wall but arrives thirty seconds late. You still break two pockets, but the third withdraws in good order toward the barns.",
          context:
            "Two-axis assault mostly effective; timing slip allowed one enemy pocket to withdraw.",
          menLost: 0,
          ammoSpent: 13,
          moraleChange: 4,
          readinessChange: 8,
        },
        failure: {
          text:
            "The axes desynchronize and both elements take fire while moving. You seize only part of the crossroads and lose a man in the trench lane.",
          context:
            "Assault timing broke down. Partial objective gain with one casualty in trench approach.",
          menLost: 1,
          ammoSpent: 14,
          moraleChange: -3,
          readinessChange: 11,
        },
        wikiUnlocks: "assault_tempo",
        nextScene: "act2_scene06",
      },
    },
    {
      id: "crossroads_bound_and_clear",
      text: "Bound section by section and clear each pocket before advancing",
      tier: "sound",
      minMen: 4,
      outcome: {
        success: {
          text:
            "You clear methodically: cart, wall, trench. It's slower than a hard shock assault, but controlled and disciplined. The defenders give ground in sequence.",
          context:
            "Deliberate section-by-section clearing retained control and reduced chaos.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 5,
          readinessChange: 6,
        },
        partial: {
          text:
            "The method works, but each pause costs time and rounds. You clear two positions cleanly and fight hard for the third.",
          context:
            "Methodical clearing effective but time- and ammo-intensive on final pocket.",
          menLost: 0,
          ammoSpent: 12,
          moraleChange: 2,
          readinessChange: 8,
        },
        failure: {
          text:
            "One pocket is declared clear too early and opens fire into your movement lane. You take a casualty before sealing it.",
          context:
            "Premature clearance call exposed movement lane to surviving defenders. One casualty.",
          menLost: 1,
          ammoSpent: 13,
          moraleChange: -4,
          readinessChange: 10,
        },
        wikiUnlocks: "assault_tempo",
        nextScene: "act2_scene06",
      },
    },
    {
      id: "crossroads_single_squad_reckless",
      text: "Send one squad to do everything while others hold where they are",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "The lead squad fights like hell and takes the cart position, then the wall. They carry the moment through force of will.",
          context:
            "Single squad seized two pockets through aggressive action; high strain on one element.",
          menLost: 0,
          ammoSpent: 13,
          moraleChange: 1,
          readinessChange: 9,
        },
        partial: {
          text:
            "One squad cannot cover every angle. They take one pocket and get pinned trying to roll into the next.",
          context:
            "Single-squad effort gained limited ground then stalled under multi-angle fire.",
          menLost: 0,
          ammoSpent: 14,
          moraleChange: -3,
          readinessChange: 11,
        },
        failure: {
          text:
            "The lead squad overextends into intersecting lanes and loses a man before pulling back to the ditch line.",
          context:
            "Overextended single squad entered intersecting fire lanes; one casualty on withdrawal.",
          menLost: 1,
          ammoSpent: 15,
          moraleChange: -7,
          readinessChange: 12,
        },
        wikiUnlocks: "assault_tempo",
        nextScene: "act2_scene06",
      },
    },
    {
      id: "crossroads_pause_for_mortar",
      text: "Pause the assault and wait for perfect fire support timing",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "You buy cleaner timing at the cost of momentum. The enemy also uses the pause to reposition, but you still resume in good order.",
          context:
            "Assault pause improved order but surrendered momentum; enemy partially repositioned.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 0,
          readinessChange: 7,
        },
        partial: {
          text:
            "The pause turns into uncertainty. By the time you move again, defenders are settled into better angles.",
          context:
            "Delay eroded initiative and allowed defenders to improve positions.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -4,
          readinessChange: 10,
        },
        failure: {
          text:
            "Waiting in partial cover invites ranging fire. Fragmentation drops into your ditch and costs you a man before the assault even restarts.",
          context:
            "Extended pause under observation drew effective indirect fire; one casualty before movement.",
          menLost: 1,
          ammoSpent: 10,
          moraleChange: -8,
          readinessChange: 12,
        },
        wikiUnlocks: "assault_tempo",
        nextScene: "act2_scene06",
      },
    },
  ],
};
