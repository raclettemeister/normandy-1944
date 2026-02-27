import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const byId = (id: string) => {
  const soldier = PLATOON_ROSTER.find((s) => s.id === id);
  if (!soldier) throw new Error(`Unknown soldier: ${id}`);
  return { ...soldier };
};

export const scene09_consolidate: Scenario = {
  id: "act2_scene09",
  act: 2,
  timeCost: 20,
  combatScene: false,

  sceneContext:
    "Crossroads secured after assault. Immediate consolidation window before expected German probe. Need fortification, ammo redistribution, and casualty management.",

  narrative:
    "The crossroads is finally in American hands. Smoke hangs low over shattered walls and churned mud. Men are breathing hard, hands shaking, eyes still searching for movement. This is the dangerous lull: either you consolidate now, or you bleed later when the counter-pressure starts.",

  narrativeAlt: {
    hasSecondInCommand:
      "Henderson wipes dust from his face and starts assigning men before you even speak. 'We've got a few minutes if we're lucky, sir. Let's spend them right.'",
  },

  rally: {
    soldiers: [byId("washington"), byId("mitchell"), byId("sullivan")],
    ammoGain: 10,
    moraleGain: 5,
    narrative:
      "Three late stragglers reach the crossroads from a sunken lane: Washington first, Mitchell right behind him, Sullivan crossing himself as he drops into cover. They bring dry bandoliers and hard-won calm. Reinforcements are small — but timely.",
  },

  decisions: [
    {
      id: "consolidate_dig_and_rearm",
      text: "Dig in immediately, reassign sectors, and prepare casualty lanes",
      tier: "excellent",
      outcome: {
        success: {
          text:
            "Foxholes start appearing in the soft verge, sectors get marked, and ammo gets pushed where it's needed. The position starts to feel like a defense, not a brawl.",
          context:
            "Rapid defensive consolidation completed: digging, sector assignment, and ammo redistribution.",
          menLost: 0,
          ammoSpent: 2,
          moraleChange: 7,
          readinessChange: 2,
        },
        partial: {
          text:
            "You get most of it done, but casualty movement and sector overlap still need cleanup. Better than before, not finished.",
          context:
            "Consolidation mostly complete with remaining friction in casualty and sector flow.",
          menLost: 0,
          ammoSpent: 3,
          moraleChange: 4,
          readinessChange: 3,
        },
        failure: {
          text:
            "Orders are good, execution is rushed. One lane remains exposed and men are still uneven on ammunition by the end of the cycle.",
          context:
            "Rushed consolidation left exposed lane and uneven ammo distribution.",
          menLost: 0,
          ammoSpent: 4,
          moraleChange: 0,
          readinessChange: 5,
        },
        wikiUnlocks: "defensive_consolidation",
        nextScene: "act2_scene10",
      },
    },
    {
      id: "consolidate_redistribute_ammo",
      text: "Pause and do a full ammo redistribution before anything else",
      tier: "sound",
      outcome: {
        success: {
          text:
            "You pool rounds by weapon type and rebuild loadouts. BAR belts are topped off, riflemen balanced, and no one is dangerously dry anymore.",
          context:
            "Comprehensive ammo redistribution restored balanced combat loads across squads.",
          menLost: 0,
          ammoSpent: -8,
          moraleChange: 4,
          readinessChange: 3,
        },
        partial: {
          text:
            "Redistribution helps, but medical and sector tasks lag while everyone counts rounds in the open.",
          context:
            "Ammo balancing improved sustainability but delayed other consolidation tasks.",
          menLost: 0,
          ammoSpent: -5,
          moraleChange: 2,
          readinessChange: 5,
        },
        failure: {
          text:
            "The count takes too long and gets interrupted repeatedly. You end up with only a partial rebalance and lost time you needed for fortification.",
          context:
            "Ammo redistribution interrupted and incomplete; fortification timeline slipped.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: -2,
          readinessChange: 7,
        },
        wikiUnlocks: "defensive_consolidation",
        nextScene: "act2_scene10",
      },
    },
    {
      id: "consolidate_send_raid",
      text: "Send a quick raid east to disrupt regrouping Germans",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "The raid hits a small regrouping team and breaks contact quickly. You return with useful pressure relief but limited time left to improve defenses.",
          context:
            "Short disruptive raid succeeded against small regrouping element; consolidation time reduced.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 2,
          readinessChange: 8,
        },
        partial: {
          text:
            "The raid skirmishes and withdraws with no decisive effect. You spend rounds and minutes for ambiguous gain.",
          context:
            "Raid made contact but achieved no clear tactical disruption; resource expenditure high.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -2,
          readinessChange: 10,
        },
        failure: {
          text:
            "The raid runs into a larger element than expected. You pull them out under fire and lose one man doing it.",
          context:
            "Raid encountered superior force; fighting withdrawal incurred one casualty.",
          menLost: 1,
          ammoSpent: 10,
          moraleChange: -7,
          readinessChange: 12,
        },
        wikiUnlocks: "defensive_consolidation",
        nextScene: "act2_scene10",
      },
    },
    {
      id: "consolidate_rest_first",
      text: "Stand down briefly for water, breathing, and reset",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "A short reset steadies breathing and lowers panic. It helps the men, but little physical work gets done on the position.",
          context:
            "Short rest improved immediate composure but produced minimal defensive preparation.",
          menLost: 0,
          ammoSpent: 1,
          moraleChange: 3,
          readinessChange: 5,
        },
        partial: {
          text:
            "The pause drifts long. Men recover a little, but your defensive setup remains shallow.",
          context:
            "Extended rest consumed preparation window; defense remained underdeveloped.",
          menLost: 0,
          ammoSpent: 1,
          moraleChange: 1,
          readinessChange: 7,
        },
        failure: {
          text:
            "You get comfort without structure. By the end of the pause, sectors are still loose and enemy pressure is already building again.",
          context:
            "Unstructured rest replaced essential consolidation tasks as enemy pressure rose.",
          menLost: 0,
          ammoSpent: 1,
          moraleChange: -3,
          readinessChange: 9,
        },
        wikiUnlocks: "defensive_consolidation",
        nextScene: "act2_scene10",
      },
    },
  ],
};
