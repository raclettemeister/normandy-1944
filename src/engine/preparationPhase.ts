import type { PreparationPhase, PrepScene, PrepEffects } from "../types/index.ts";

const DEFAULT_PREPS: PrepScene[] = [
  {
    id: "defensive_positions",
    label: "Defensive Positions",
    description: "Dig foxholes, set fields of fire, place BAR/MG",
    timeCost: 90,
    effect: { casualtyReduction: 2, moraleBonus: 5 },
  },
  {
    id: "listening_posts",
    label: "Listening Posts",
    description: "Scouts watch approaches",
    timeCost: 60,
    effect: { earlyWarning: true },
  },
  {
    id: "redistribute_ammo",
    label: "Redistribute Ammo",
    description: "Pool and rebalance ammunition",
    timeCost: 30,
    effect: { ammoRedistributed: true },
  },
  {
    id: "medical_station",
    label: "Medical Station",
    description: "Aid station, evacuation plan",
    timeCost: 45,
    effect: { medicalReady: true },
  },
  {
    id: "find_stragglers",
    label: "Find Stragglers",
    description: "Patrol for more paratroopers",
    timeCost: 60,
    effect: { additionalMen: 3 },
  },
  {
    id: "rest_and_brief",
    label: "Rest and Brief",
    description: "Sleep shifts, brief NCOs on sectors",
    timeCost: 45,
    effect: { moraleBonus: 10 },
  },
];

export function createPreparationPhase(): PreparationPhase {
  return {
    availablePreps: DEFAULT_PREPS.map(p => ({ ...p })),
    completedPreps: [],
    counterattackTriggered: false,
    totalTimePreparing: 0,
  };
}

export function completePrep(phase: PreparationPhase, prepId: string): PreparationPhase {
  if (phase.completedPreps.includes(prepId)) return phase;

  const prep = phase.availablePreps.find(p => p.id === prepId);
  if (!prep) return phase;

  return {
    ...phase,
    completedPreps: [...phase.completedPreps, prepId],
    totalTimePreparing: phase.totalTimePreparing + prep.timeCost,
  };
}

export function getAvailablePreps(phase: PreparationPhase): PrepScene[] {
  return phase.availablePreps.filter(p => !phase.completedPreps.includes(p.id));
}

export function calculatePrepEffects(phase: PreparationPhase): PrepEffects {
  const effects: PrepEffects = {};

  for (const prepId of phase.completedPreps) {
    const prep = phase.availablePreps.find(p => p.id === prepId);
    if (!prep) continue;
    const e = prep.effect;

    if (e.casualtyReduction) effects.casualtyReduction = (effects.casualtyReduction ?? 0) + e.casualtyReduction;
    if (e.earlyWarning) effects.earlyWarning = true;
    if (e.ammoRedistributed) effects.ammoRedistributed = true;
    if (e.medicalReady) effects.medicalReady = true;
    if (e.moraleBonus) effects.moraleBonus = (effects.moraleBonus ?? 0) + e.moraleBonus;
    if (e.additionalMen) effects.additionalMen = (effects.additionalMen ?? 0) + e.additionalMen;
  }

  return effects;
}
