import type {
  Achievement,
  GameState,
  RunHistory,
} from "../types/index.ts";

const STORAGE_KEY = "normandy1944_achievements";

// ─── Persistence ───────────────────────────────────────────────────

export function loadAchievements(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): void {
  const unlocked = loadAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }
}

export function resetAchievements(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Achievement Definitions ───────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  // Common
  {
    id: "first_drop",
    title: "Premier saut",
    description: "Terminez votre premiere partie (victoire ou defaite).",
    icon: "🪂",
    rarity: "common",
    condition: { type: "game_complete" },
  },
  {
    id: "lessons_of_war",
    title: "Lecons de guerre",
    description: "Debloquez votre premiere lecon.",
    icon: "📖",
    rarity: "common",
    condition: { type: "playthroughs", count: 1 },
  },
  {
    id: "rally_point",
    title: "Point de ralliement",
    description: "Ralliez 10 hommes ou plus dans l'acte 1.",
    icon: "🏁",
    rarity: "common",
    condition: { type: "men_count", threshold: 10, comparison: "gte" },
  },

  // Uncommon
  {
    id: "on_schedule",
    title: "Dans les temps",
    description: "Atteignez chaque jalon des ordres de bataille a l'heure.",
    icon: "⏱️",
    rarity: "uncommon",
    condition: { type: "milestone_all_on_time" },
  },
  {
    id: "conservation",
    title: "Economie de feu",
    description: "Terminez la partie avec plus de 40 % de munitions.",
    icon: "🎯",
    rarity: "uncommon",
    condition: { type: "men_count", threshold: 40, comparison: "gte" },
  },
  {
    id: "ghost",
    title: "Fantome",
    description: "Terminez l'acte 1 sans depasser 25 de vigilance ennemie.",
    icon: "👻",
    rarity: "uncommon",
    condition: { type: "readiness_threshold", max: 25 },
  },
  {
    id: "knife_in_the_dark",
    title: "Couteau dans la nuit",
    description: "Gagnez votre premier combat au couteau en solo.",
    icon: "🗡️",
    rarity: "uncommon",
    condition: { type: "specific_decision", decisionId: "knife_sentry" },
  },

  // Rare
  {
    id: "band_of_brothers",
    title: "Freres d'armes",
    description: "Tenez 24 heures avec au moins 15 survivants.",
    icon: "🎖️",
    rarity: "rare",
    condition: { type: "men_count", threshold: 15, comparison: "gte" },
  },
  {
    id: "lead_from_the_front",
    title: "Mener depuis l'avant",
    description:
      'Choisissez la position "front" dans chaque scene de combat et survivez.',
    icon: "⭐",
    rarity: "rare",
    condition: {
      type: "captain_position_streak",
      position: "front",
      count: 10,
    },
  },
  {
    id: "tactical_genius",
    title: "Genie tactique",
    description: "Terminez le jeu a la premiere tentative (sans lecons).",
    icon: "🧠",
    rarity: "rare",
    condition: { type: "playthroughs", count: 1 },
  },
  {
    id: "no_man_left_behind",
    title: "Personne laisse derriere",
    description: "Terminez le jeu avec zero KIA (blesses autorises).",
    icon: "🛡️",
    rarity: "rare",
    condition: { type: "game_complete_no_casualties" },
  },

  // Legendary
  {
    id: "perfect_captain",
    title: "Capitaine parfait",
    description:
      "Zero KIA, tous les jalons a l'heure, vigilance <= 50, moral >= 50.",
    icon: "👑",
    rarity: "legendary",
    condition: { type: "game_complete_no_casualties" },
  },
  {
    id: "armchair_general",
    title: "General de salon",
    description:
      'Terminez le jeu en choisissant toujours la position "rear" — tres difficile.',
    icon: "🪑",
    rarity: "legendary",
    condition: {
      type: "captain_position_streak",
      position: "rear",
      count: 10,
    },
  },
  {
    id: "scholar_of_war",
    title: "Erudit de guerre",
    description: "Debloquez toutes les lecons sur l'ensemble des parties.",
    icon: "📚",
    rarity: "legendary",
    condition: { type: "all_lessons_unlocked" },
  },
  {
    id: "immortal",
    title: "Immortel",
    description: "Terminez 10 parties completes.",
    icon: "♾️",
    rarity: "legendary",
    condition: { type: "playthroughs", count: 10 },
  },
];

// ─── Achievement Checking ──────────────────────────────────────────

export function checkAchievements(
  state: GameState,
  runHistory: RunHistory
): Achievement[] {
  const alreadyUnlocked = loadAchievements();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (alreadyUnlocked.includes(achievement.id)) continue;
    if (evaluateCondition(achievement.condition, state, runHistory)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

function evaluateCondition(
  condition: Achievement["condition"],
  state: GameState,
  history: RunHistory
): boolean {
  switch (condition.type) {
    case "game_complete":
      return history.gameCompleted;

    case "game_complete_no_casualties":
      return history.gameCompleted && history.zeroCasualties;

    case "game_over":
      return history.gameOverCause === condition.cause;

    case "captain_position_streak":
      return (
        history.captainPositions.length >= condition.count &&
        history.captainPositions.every((p) => p === condition.position)
      );

    case "all_lessons_unlocked":
      return history.wikiUnlocked.length >= 30;

    case "men_count":
      return condition.comparison === "gte"
        ? state.men >= condition.threshold
        : state.men <= condition.threshold;

    case "milestone_all_on_time":
      return history.allMilestonesOnTime;

    case "readiness_threshold":
      return history.maxReadiness <= condition.max;

    case "specific_decision":
      return history.decisionsThisRun.includes(condition.decisionId);

    case "playthroughs":
      return history.playthroughCount >= condition.count;
  }
}
