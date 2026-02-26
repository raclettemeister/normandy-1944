import {
  TIER_BASE_SCORES,
  type TacticalTier,
  type GameState,
  type Decision,
  type OutcomeRange,
  type OutcomeTier,
  type OutcomeNarrative,
  type Soldier,
  type SoldierRole,
  type CaptainPosition,
  type Scenario,
  type SceneTransitionResult,
} from "../types/index.ts";
import {
  clamp,
  getPhase,
  deriveCapabilities,
  advanceTime,
  promoteToSecondInCommand,
} from "./gameState.ts";
import { checkMilestones, achieveMilestone } from "./battleOrders.ts";

// ─── Effective Score Calculation ───────────────────────────────────

export function calculateEffectiveScore(
  tier: TacticalTier,
  state: GameState,
  decision: Decision,
  captainPosition?: CaptainPosition
): number {
  let score = TIER_BASE_SCORES[tier];

  if (state.morale < 20) score -= 15;
  else if (state.morale < 40) score -= 10;
  else if (state.morale < 60) score -= 0;
  else if (state.morale < 80) score += 0;
  else score += 5;

  if (state.readiness >= 75) score -= 20;
  else if (state.readiness >= 50) score -= 12;
  else if (state.readiness >= 25) score -= 5;

  if (decision.minMen && state.men < decision.minMen) {
    score -= 15;
  } else if (state.phase === "platoon" && state.men >= 12) {
    score += 5;
  }

  if (state.ammo < 10) score -= 10;
  else if (state.ammo < 30) score -= 5;

  if (decision.requiresCapability) {
    if (state.capabilities[decision.requiresCapability]) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  if (decision.benefitsFromIntel) {
    if (state.intel[decision.benefitsFromIntel]) {
      score += 10;
    }
  }

  if (decision.requiresPhase) {
    const phaseOrder = { solo: 0, squad: 1, platoon: 2 } as const;
    if (phaseOrder[state.phase] < phaseOrder[decision.requiresPhase]) {
      score -= 25;
    }
  }

  const activeTraits = state.roster
    .filter((s) => s.status === "active")
    .flatMap((s) => s.traits);

  if (activeTraits.includes("sharpshooter")) score += 3;
  if (activeTraits.includes("hothead")) {
    score += 3;
  }

  if (captainPosition === "front") score += 5;
  if (captainPosition === "rear") score -= 5;

  return clamp(score, 0, 100);
}

export function calculateEffectiveScoreFromTier(
  tier: TacticalTier,
  state: GameState,
  captainPosition?: CaptainPosition
): number {
  let score = TIER_BASE_SCORES[tier];

  if (state.morale < 20) score -= 15;
  else if (state.morale < 40) score -= 10;
  else if (state.morale < 60) score -= 0;
  else if (state.morale < 80) score += 0;
  else score += 5;

  if (state.readiness >= 75) score -= 20;
  else if (state.readiness >= 50) score -= 12;
  else if (state.readiness >= 25) score -= 5;

  if (state.ammo < 10) score -= 10;
  else if (state.ammo < 30) score -= 5;

  const activeTraits = state.roster
    .filter((s) => s.status === "active")
    .flatMap((s) => s.traits);

  if (activeTraits.includes("sharpshooter")) score += 3;
  if (activeTraits.includes("hothead")) score += 3;

  if (captainPosition === "front") score += 5;
  if (captainPosition === "rear") score -= 5;

  return clamp(score, 0, 100);
}

// ─── Outcome Range ─────────────────────────────────────────────────

export function getOutcomeRange(effectiveScore: number): OutcomeRange {
  return {
    floor: Math.max(0, effectiveScore - 20),
    ceiling: Math.min(100, effectiveScore + 15),
  };
}

// ─── Dice Roll ─────────────────────────────────────────────────────

export function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function rollOutcome(range: OutcomeRange, seed?: number): number {
  const roll = seed !== undefined ? seededRandom(seed) : Math.random();
  return Math.round(range.floor + roll * (range.ceiling - range.floor));
}

// ─── Outcome Tier ──────────────────────────────────────────────────

export function getOutcomeTier(score: number): OutcomeTier {
  if (score >= 60) return "success";
  if (score >= 30) return "partial";
  return "failure";
}

// ─── Captain Casualty ──────────────────────────────────────────────

export function getCaptainCasualtyChance(position: CaptainPosition): number {
  switch (position) {
    case "front":
      return 0.15;
    case "middle":
      return 0.05;
    case "rear":
      return 0.01;
  }
}

// ─── Casualty Assignment ───────────────────────────────────────────

const BASE_VULNERABILITY: Record<SoldierRole, number> = {
  rifleman: 10,
  BAR_gunner: 8,
  MG_gunner: 7,
  NCO: 5,
  platoon_sergeant: 4,
  radioman: 3,
  medic: 2,
};

function getTraitVulnerabilityMultiplier(soldier: Soldier): number {
  let multiplier = 1.0;
  if (soldier.traits.includes("lucky")) multiplier *= 0.7;
  if (soldier.traits.includes("unlucky")) multiplier *= 1.4;
  if (soldier.traits.includes("brave")) multiplier *= 1.2;
  if (soldier.traits.includes("coward")) multiplier *= 0.8;
  return multiplier;
}

function weightedRandom<T>(items: T[], weightFn: (item: T) => number): T {
  const weights = items.map(weightFn);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function assignCasualties(
  roster: Soldier[],
  menLost: number,
  captainPosition: CaptainPosition
): { casualties: Soldier[]; captainHit: boolean } {
  const active = roster.filter((s) => s.status === "active");
  const casualties: Soldier[] = [];
  let captainHit = false;

  if (menLost > 0 && Math.random() < getCaptainCasualtyChance(captainPosition)) {
    captainHit = true;
  }

  const remaining = [...active];
  for (let i = 0; i < menLost && remaining.length > 0; i++) {
    const selected = weightedRandom(
      remaining,
      (s) => BASE_VULNERABILITY[s.role] * getTraitVulnerabilityMultiplier(s)
    );
    selected.status = Math.random() < 0.6 ? "KIA" : "wounded";
    casualties.push(selected);
    remaining.splice(remaining.indexOf(selected), 1);
  }

  return { casualties, captainHit };
}

// ─── Scene Transition ──────────────────────────────────────────────

export function processSceneTransition(
  state: GameState,
  scene: Scenario,
  outcomeNarrative: OutcomeNarrative,
  captainPosition: CaptainPosition
): SceneTransitionResult {
  const newRoster = state.roster.map((s) => ({ ...s }));
  const newState: GameState = {
    ...state,
    roster: newRoster,
    intel: { ...state.intel },
  };

  const allCasualties: Soldier[] = [];
  let captainHit = false;

  if (outcomeNarrative.menLost > 0) {
    const result = assignCasualties(
      newRoster,
      outcomeNarrative.menLost,
      captainPosition
    );
    captainHit = result.captainHit;
    allCasualties.push(...result.casualties);

    if (
      newState.secondInCommand &&
      result.casualties.some(
        (s) => s.id === newState.secondInCommand!.soldier.id
      )
    ) {
      newState.secondInCommand = promoteToSecondInCommand(newRoster);
    }
  }

  if (outcomeNarrative.menGained && outcomeNarrative.menGained > 0) {
    newState.men = Math.min(18, newRoster.filter((s) => s.status === "active").length + outcomeNarrative.menGained);
  } else {
    newState.men = Math.max(0, newRoster.filter((s) => s.status === "active").length);
  }
  newState.ammo = clamp(state.ammo - outcomeNarrative.ammoSpent, 0, 100);
  newState.morale = clamp(
    state.morale + outcomeNarrative.moraleChange,
    0,
    100
  );
  newState.readiness = clamp(
    state.readiness + outcomeNarrative.readinessChange,
    0,
    100
  );

  if (captainPosition === "front") {
    newState.morale = clamp(newState.morale + 5, 0, 100);
  }
  if (captainPosition === "rear") {
    newState.morale = clamp(newState.morale - 5, 0, 100);
  }

  const effectiveTimeCost = outcomeNarrative.timeCost ?? scene.timeCost;
  newState.time = advanceTime(state.time, effectiveTimeCost);

  newState.readiness = clamp(
    newState.readiness + Math.floor(effectiveTimeCost / 10),
    0,
    100
  );

  newState.phase = getPhase(newState.men);
  newState.capabilities = deriveCapabilities(newState.roster, newState.ammo);

  if (outcomeNarrative.intelGained) {
    newState.intel[outcomeNarrative.intelGained] = true;
  }

  if (scene.rally && !outcomeNarrative.skipRally) {
    const rallySoldiers = scene.rally.soldiers.map((s) => ({ ...s }));
    newState.roster = [...newState.roster, ...rallySoldiers];
    newState.men += rallySoldiers.length;
    newState.ammo = clamp(newState.ammo + scene.rally.ammoGain, 0, 100);
    newState.morale = clamp(
      newState.morale + scene.rally.moraleGain,
      0,
      100
    );
    newState.phase = getPhase(newState.men);
    newState.capabilities = deriveCapabilities(
      newState.roster,
      newState.ammo
    );

    if (!newState.secondInCommand) {
      newState.secondInCommand = promoteToSecondInCommand(newState.roster);
    }
  }

  if (scene.achievesMilestone) {
    newState.milestones = achieveMilestone(
      newState.milestones,
      scene.achievesMilestone
    );
  }
  newState.milestones = checkMilestones(newState.milestones, newState);

  return {
    state: newState,
    casualties: allCasualties,
    captainHit,
  };
}

// ─── Counterattack Trigger ─────────────────────────────────────────

export function shouldCounterattackTrigger(state: GameState): boolean {
  const baseHour = 16;
  const readinessModifier = Math.floor(state.readiness / 25);
  const triggerHour = baseHour - readinessModifier;
  return state.time.hour >= triggerHour;
}
