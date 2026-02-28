import type {
  GameState,
  GamePhase,
  GameTime,
  PlatoonCapabilities,
  Soldier,
  AmmoState,
  Milestone,
  EnemyReadiness,
  Difficulty,
  TacticalPhase,
} from "../types/index.ts";
import { loadMeta } from "./metaProgress.ts";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getPhase(men: number): GamePhase {
  if (men <= 1) return "solo";
  if (men <= 5) return "squad";
  return "platoon";
}

export function deriveCapabilities(
  roster: Soldier[],
  ammo: AmmoState
): PlatoonCapabilities {
  const activeRoles = roster
    .filter((s) => s.status === "active")
    .map((s) => s.role);
  const activeCount = roster.filter((s) => s.status === "active").length;

  return {
    canSuppress:
      activeRoles.includes("BAR_gunner") ||
      activeRoles.includes("MG_gunner"),
    canTreatWounded: activeRoles.includes("medic"),
    hasRadio: activeRoles.includes("radioman"),
    hasNCO:
      activeRoles.includes("NCO") ||
      activeRoles.includes("platoon_sergeant"),
    hasExplosives: ammo > 10,
    canScout: activeCount >= 2,
  };
}

export function getAlertStatus(
  readiness: number
): EnemyReadiness["alertStatus"] {
  if (readiness < 25) return "CONFUSED";
  if (readiness < 50) return "ALERTED";
  if (readiness < 75) return "ORGANIZED";
  return "FORTIFIED";
}

export function getEnemyReadiness(level: number): EnemyReadiness {
  return { level, alertStatus: getAlertStatus(level) };
}

export function advanceTime(time: GameTime, minutes: number): GameTime {
  const totalMinutes = time.hour * 60 + time.minute + minutes;
  return {
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: totalMinutes % 60,
  };
}

export function parseTime(timeStr: string): GameTime {
  const hour = parseInt(timeStr.slice(0, 2), 10);
  const minute = parseInt(timeStr.slice(2, 4), 10);
  return { hour, minute };
}

export function isAfter(current: GameTime, target: GameTime): boolean {
  const currentTotal = current.hour * 60 + current.minute;
  const targetTotal = target.hour * 60 + target.minute;
  return currentTotal > targetTotal;
}

export function formatTime(time: GameTime): string {
  const h = String(time.hour).padStart(2, "0");
  const m = String(time.minute).padStart(2, "0");
  return `${h}${m}`;
}

function createDefaultMilestones(): Milestone[] {
  return [
    {
      id: "rally_complete",
      time: "0400",
      description: "Ralliement termine",
      status: "pending",
    },
    {
      id: "move_to_objective",
      time: "0600",
      description: "Mouvement vers la zone objectif",
      status: "pending",
    },
    {
      id: "crossroads_secured",
      time: "0900",
      description: "Carrefour SECURISE",
      status: "pending",
    },
    {
      id: "resupply",
      time: "1200",
      description: "Ravitaillement depuis les elements de plage",
      status: "pending",
    },
    {
      id: "relief",
      time: "1800",
      description: "Releve par la 4th Infantry Division",
      status: "pending",
    },
    {
      id: "end_operational_period",
      time: "0100",
      description: "Fin de la periode operationnelle",
      status: "pending",
    },
  ];
}

export function createInitialState(): GameState {
  return {
    men: 0,
    ammo: 5,
    morale: 40,
    readiness: 10,
    time: { hour: 1, minute: 15 },
    capabilities: {
      canSuppress: false,
      canTreatWounded: false,
      hasRadio: false,
      hasNCO: false,
      hasExplosives: true,
      canScout: false,
    },
    intel: {
      hasMap: false,
      hasCompass: false,
      scoutedObjective: false,
      knowsMGPosition: false,
      knowsPatrolRoute: false,
      friendlyContact: false,
    },
    roster: [],
    secondInCommand: null,
    milestones: createDefaultMilestones(),
    wikiUnlocked: loadMeta().unlockedWikiEntries,
    scenesVisited: [],
    currentScene: "act1_scene01_landing",
    phase: "solo",
    act: 1,
    difficulty: "easy" as Difficulty,
    revealTokensRemaining: 0,
    currentPhase: "situation" as TacticalPhase,
  };
}

const DEFAULT_REVEAL_TOKENS = 5;

export function createInitialStateWithDifficulty(difficulty: Difficulty): GameState {
  return {
    ...createInitialState(),
    difficulty,
    revealTokensRemaining: difficulty === "medium" ? DEFAULT_REVEAL_TOKENS : 0,
  };
}

export function applyRally(
  state: GameState,
  soldiers: Soldier[],
  ammoGain: number,
  moraleGain: number
): GameState {
  const newRoster = [...state.roster, ...soldiers];
  const newMen = state.men + soldiers.length;
  const newAmmo = clamp(state.ammo + ammoGain, 0, 100);
  const newMorale = clamp(state.morale + moraleGain, 0, 100);

  const secondInCommand =
    state.secondInCommand ?? promoteToSecondInCommand(newRoster);

  return {
    ...state,
    men: newMen,
    ammo: newAmmo,
    morale: newMorale,
    roster: newRoster,
    secondInCommand,
    phase: getPhase(newMen),
    capabilities: deriveCapabilities(newRoster, newAmmo),
  };
}

export function promoteToSecondInCommand(
  roster: Soldier[]
): import("../types/index.ts").SecondInCommand | null {
  const active = roster.filter((s) => s.status === "active");

  const platoonSgt = active.find((s) => s.role === "platoon_sergeant");
  if (platoonSgt) {
    return {
      soldier: platoonSgt,
      competence: platoonSgt.traits.includes("natural_leader")
        ? "veteran"
        : "veteran",
      alive: true,
    };
  }

  const nco = active.find((s) => s.role === "NCO");
  if (nco) {
    return {
      soldier: nco,
      competence: nco.traits.includes("natural_leader") ? "veteran" : "green",
      alive: true,
    };
  }

  const anyoneSenior = active.find(
    (s) => s.rank === "SSgt" || s.rank === "Sgt" || s.rank === "Cpl"
  );
  if (anyoneSenior) {
    return {
      soldier: anyoneSenior,
      competence: anyoneSenior.traits.includes("natural_leader")
        ? "veteran"
        : "green",
      alive: true,
    };
  }

  return null;
}
