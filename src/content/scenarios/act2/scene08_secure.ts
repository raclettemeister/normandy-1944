import type { Scenario } from '../../../types';

export const scene08_secure: Scenario = {
  id: "act2_scene08",
  act: 2,
  timeCost: 20,
  combatScene: true,
  achievesMilestone: "crossroads_secured",

  sceneContext:
    "Final resistance pockets around crossroads. Objective is effectively taken but not yet secured. Need sector assignments, casualty collection, and last enemy clearance.",

  narrative:
    "Most of the firing has shifted from sustained to sporadic, but sporadic still kills. The crossroads is almost yours. Almost is not secure. You need sectors, casualty pulls, and a final sweep before the enemy can counterpunch.",

  secondInCommandComments: {
    secure_sector_assignments: "Assign sectors now and this turns from assault to defense in one clean move.",
    secure_quick_sweep: "Fast sweep works if discipline holds and no one cuts corners.",
    secure_hold_road_only: "Holding just the road leaves buildings and ditches to the enemy.",
    secure_push_past_objective: "Past the objective means outside our mission and into unknown guns.",
  },

  prepActions: [
    {
      id: "secure_prep_mark_casualties",
      text: "Mark casualty collection point and med lane before final sweep",
      timeCost: 5,
      responseVeteran:
        "Aid point in the inn cellar. Marked with white cloth. Anyone hit gets pulled there first, not dragged across open road.",
      responseGreen:
        "We'll put the wounded... in the basement, I think.",
    },
    {
      id: "secure_prep_set_sectors",
      text: "Assign fixed sectors and challenge words before movement",
      timeCost: 5,
      responseVeteran:
        "North, east, south arcs assigned. Challenge remains Flash/Thunder. No one fires on movement without challenge unless fired on first.",
      responseGreen:
        "Everyone watch your area and call out before shooting.",
    },
  ],

  decisions: [
    {
      id: "secure_sector_assignments",
      text: "Assign sectors, then conduct a deliberate final clearance",
      tier: "excellent",
      minMen: 4,
      outcome: {
        success: {
          text:
            "Sector calls go out clearly. Final clearance rolls through buildings and ditches without fratricide or confusion. The crossroads is secure and organized under your control.",
          context:
            "Clear sector assignment enabled disciplined final sweep. Objective secured with full control.",
          menLost: 0,
          ammoSpent: 6,
          moraleChange: 7,
          readinessChange: 4,
        },
        partial: {
          text:
            "The sweep is successful but one alley is checked twice while another is delayed. No disaster, just friction in the handoff from assault to hold.",
          context:
            "Objective secured with minor sector-friction delays during transition to defense.",
          menLost: 0,
          ammoSpent: 7,
          moraleChange: 4,
          readinessChange: 5,
        },
        failure: {
          text:
            "A sector boundary is unclear and two teams overlap movement at the same corner. You recover quickly, but not before taking a casualty in the confusion.",
          context:
            "Sector confusion caused movement overlap and one casualty before control restored.",
          menLost: 1,
          ammoSpent: 8,
          moraleChange: -4,
          readinessChange: 8,
        },
        wikiUnlocks: "objective_security",
        nextScene: "act2_scene09",
      },
    },
    {
      id: "secure_quick_sweep",
      text: "Run a fast sweep and declare secure as soon as firing stops",
      tier: "sound",
      minMen: 3,
      outcome: {
        success: {
          text:
            "The quick sweep catches the obvious threats and gets men posted fast. Not perfect, but good enough for immediate control.",
          context:
            "Rapid sweep neutralized major threats and established basic control quickly.",
          menLost: 0,
          ammoSpent: 6,
          moraleChange: 4,
          readinessChange: 5,
        },
        partial: {
          text:
            "You post quickly, but one storage room is missed and rechecked later under tension. Secure enough, not clean.",
          context:
            "Fast sweep left one uncleared pocket requiring delayed correction.",
          menLost: 0,
          ammoSpent: 7,
          moraleChange: 1,
          readinessChange: 6,
        },
        failure: {
          text:
            "A missed cellar position opens fire after you call secure. You suppress and finish it, but one of your men is already down.",
          context:
            "Missed cellar threat engaged after premature secure call. One casualty before suppression.",
          menLost: 1,
          ammoSpent: 8,
          moraleChange: -5,
          readinessChange: 9,
        },
        wikiUnlocks: "objective_security",
        nextScene: "act2_scene09",
      },
    },
    {
      id: "secure_hold_road_only",
      text: "Hold only the road junction and skip detailed building checks",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "Road control is established quickly, and no immediate fire follows. It's efficient — and fragile if anything was left behind walls.",
          context:
            "Road-only security achieved quickly with residual hidden-threat risk.",
          menLost: 0,
          ammoSpent: 5,
          moraleChange: 1,
          readinessChange: 7,
        },
        partial: {
          text:
            "Road is held, but intermittent fire from an unchecked angle forces repeated pauses and ad hoc response teams.",
          context:
            "Incomplete clearance produced intermittent harassment fire and reactive posture.",
          menLost: 0,
          ammoSpent: 6,
          moraleChange: -3,
          readinessChange: 9,
        },
        failure: {
          text:
            "An unchecked outbuilding opens up on your road team and you lose a man before locating the source.",
          context:
            "Road-only approach left hostile pocket active; one casualty before suppression.",
          menLost: 1,
          ammoSpent: 7,
          moraleChange: -7,
          readinessChange: 10,
        },
        wikiUnlocks: "objective_security",
        nextScene: "act2_scene09",
      },
    },
    {
      id: "secure_push_past_objective",
      text: "Push past the crossroads to chase withdrawing defenders",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "You catch the withdrawing group and scatter it, but your sectors at the crossroads are thin when you return.",
          context:
            "Pursuit disrupted withdrawing defenders but temporarily weakened objective security.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 2,
          readinessChange: 9,
        },
        partial: {
          text:
            "You pursue, lose contact in bocage folds, and come back late. The crossroads is yours, but disorganized and behind where it should be.",
          context:
            "Pursuit lost contact and delayed consolidation timeline at objective.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -4,
          readinessChange: 11,
        },
        failure: {
          text:
            "The pursuit walks into an unseen fallback fire point. You break out, but not before taking a casualty and giving up precious consolidation time.",
          context:
            "Over-pursuit hit hidden fallback position. One casualty and major consolidation delay.",
          menLost: 1,
          ammoSpent: 10,
          moraleChange: -8,
          readinessChange: 13,
        },
        wikiUnlocks: "objective_security",
        nextScene: "act2_scene09",
      },
    },
  ],
};
