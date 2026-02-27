import type { Scenario } from '../../../types';

export const scene03_base_of_fire: Scenario = {
  id: "act2_scene03",
  act: 2,
  timeCost: 15,
  combatScene: true,

  sceneContext:
    "Assault start line. Objective crossroads 120 meters ahead. Enemy MG and rifle teams active. Need synchronized suppress-and-move plan.",

  narrative:
    "This is the line of departure. Wet ditch, cut hedgerow, road beyond. The crossroads sits one hundred twenty meters ahead under machine-gun threat. If the base of fire is weak, the maneuver team dies in the open. If the maneuver is slow, suppression burns out and the enemy recovers.",

  secondInCommandComments: {
    assault_base_of_fire: "Kowalski anchors suppression. Malone moves on your shift-fire call. That's the right shape.",
    assault_smoke_bound: "Smoke buys seconds, not miracles. We still need good timing on each bound.",
    assault_split_even: "Equal teams sounds fair, sir. Doesn't make it tactically right.",
    assault_frontal_charge: "Frontally into a machine gun? That's men into a sawmill.",
  },

  prepActions: [
    {
      id: "basefire_prep_henderson_sectors",
      text: "Have Henderson assign exact sectors and shift-fire triggers",
      soldierId: "henderson",
      timeCost: 5,
      responseVeteran:
        "North corner gun is primary. Kowalski suppresses at my mark. Malone's element moves west ditch. Shift fire only on my signal. No one freelances.",
      responseGreen:
        "We'll shoot the gun, then... move up, I guess.",
    },
    {
      id: "basefire_prep_check_ammo",
      text: "Run a quick ammo count before stepping off",
      timeCost: 5,
      responseVeteran:
        "We're uneven. BAR has enough for suppression if he fires in bursts. Two riflemen are light. Rebalance now or they'll go dry on the push.",
      responseGreen:
        "Some guys have more rounds than others.",
    },
    {
      id: "basefire_prep_mark_lane",
      text: "Mark the maneuver lane with hand signals and landmarks",
      timeCost: 5,
      responseVeteran:
        "Burned cart, then drainage lip, then stone trough. Three bounds. Anyone lost from the lane pulls back, not forward.",
      responseGreen:
        "We go that way... by the cart.",
    },
  ],

  decisions: [
    {
      id: "assault_base_of_fire",
      text: "Set a true base of fire and move one element by bounds",
      tier: "excellent",
      requiresPhase: "platoon",
      requiresCapability: "canSuppress",
      benefitsFromIntel: "knowsMGPosition",
      minMen: 6,
      outcome: {
        success: {
          text:
            "Kowalski's BAR pins the north corner hard. Henderson calls shifts exactly on time. Malone's element bounds ditch to ditch and reaches the near wall without losing momentum. The assault is on schedule and under control.",
          context:
            "Textbook base-of-fire execution. Effective suppression and timed bounds reached near wall with no losses.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 7,
          readinessChange: 5,
        },
        partial: {
          text:
            "Suppression holds for the first two bounds, then one rifleman hesitates and bunches the lane. You still reach the near wall, but slower and with rounds cracking close the whole way.",
          context:
            "Base-of-fire mostly effective; lane discipline break slowed movement under enemy fire.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: 3,
          readinessChange: 7,
        },
        failure: {
          text:
            "Your shift-fire call comes late. Maneuver and suppression overlap confusion for a few seconds and the enemy gun recovers. A man goes down crossing the final gap.",
          context:
            "Mistimed shift fire allowed MG recovery during bound. One casualty crossing final open segment.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -4,
          readinessChange: 10,
        },
        wikiUnlocks: "base_of_fire_principles",
        nextScene: "act2_scene04",
      },
    },
    {
      id: "assault_smoke_bound",
      text: "Throw smoke, then bound fast before it thins",
      tier: "sound",
      requiresCapability: "hasExplosives",
      minMen: 4,
      outcome: {
        success: {
          text:
            "Smoke blooms across the road and you move immediately. The first two bounds are clean; by the third, silhouettes begin to show, but you're already at the wall.",
          context:
            "Smoke used correctly with immediate movement. Reached wall before concealment collapsed.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 5,
          readinessChange: 6,
        },
        partial: {
          text:
            "Smoke drifts with the wind and opens gaps faster than expected. You make the wall, but one element arrives disorganized and short on breath.",
          context:
            "Smoke cover degraded early due wind shift. Objective reached with formation cohesion issues.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 1,
          readinessChange: 8,
        },
        failure: {
          text:
            "Smoke is late and thin. The enemy sees movement and rakes the lane. You force through, but not before losing a man in the open.",
          context:
            "Ineffective smoke timing and density. Enemy acquired movers in lane; one casualty incurred.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -5,
          readinessChange: 11,
        },
        wikiUnlocks: "base_of_fire_principles",
        nextScene: "act2_scene04",
      },
    },
    {
      id: "assault_split_even",
      text: "Split into equal teams and push together on both sides",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Equal teams surge together and brute-force their way to the wall. It works through momentum, not control, and costs extra ammunition.",
          context:
            "Simultaneous equal-team push succeeded via momentum without clean command-and-control.",
          menLost: 0,
          ammoSpent: 12,
          moraleChange: 1,
          readinessChange: 8,
        },
        partial: {
          text:
            "Both teams move at once and block each other's fire lanes. You still close distance, but one team stalls behind the other and loses tempo.",
          context:
            "Mutual interference between equal teams degraded fire lanes and movement tempo.",
          menLost: 0,
          ammoSpent: 13,
          moraleChange: -2,
          readinessChange: 10,
        },
        failure: {
          text:
            "No true support element means no true suppression. Enemy fire catches the center of your push and one man drops before you crawl into cover.",
          context:
            "Lack of dedicated suppression exposed maneuver centerline; one casualty before cover regained.",
          menLost: 1,
          ammoSpent: 14,
          moraleChange: -6,
          readinessChange: 12,
        },
        wikiUnlocks: "base_of_fire_principles",
        nextScene: "act2_scene04",
      },
    },
    {
      id: "assault_frontal_charge",
      text: "Blow a whistle and charge straight across before they settle",
      tier: "suicidal",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Sheer aggression carries you farther than it should. You hit the wall at a sprint and somehow keep everyone moving, but the enemy is fully awake and angry now.",
          context:
            "Frontal charge reached wall through shock and speed. No immediate losses but enemy fully alerted.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: -2,
          readinessChange: 13,
        },
        partial: {
          text:
            "The whistle blast turns the whole crossroads toward you. You make it across by inches, dragging one wounded man into cover.",
          context:
            "Frontal charge exposed whole force. One wounded/casualty during crossing under concentrated fire.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -8,
          readinessChange: 14,
        },
        failure: {
          text:
            "They cut into the charge at mid-road. Men dive, bunch, and crawl with nowhere to go. You lose two before the survivors reach broken cover.",
          context:
            "Charge broke under prepared fire in open ground. Two casualties before partial cover reached.",
          menLost: 2,
          ammoSpent: 12,
          moraleChange: -12,
          readinessChange: 15,
        },
        fatal: true,
        wikiUnlocks: "base_of_fire_principles",
        nextScene: "act2_scene04",
      },
    },
  ],
};
