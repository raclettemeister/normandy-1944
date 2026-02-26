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
    title: "First Drop",
    description: "Complete your first playthrough (win or lose).",
    icon: "🪂",
    rarity: "common",
    condition: { type: "game_complete" },
  },
  {
    id: "lessons_of_war",
    title: "Lessons of War",
    description: "Unlock your first lesson.",
    icon: "📖",
    rarity: "common",
    condition: { type: "playthroughs", count: 1 },
  },
  {
    id: "rally_point",
    title: "Rally Point",
    description: "Find and rally 10 or more men in Act 1.",
    icon: "🏁",
    rarity: "common",
    condition: { type: "men_count", threshold: 10, comparison: "gte" },
  },

  // Uncommon
  {
    id: "on_schedule",
    title: "On Schedule",
    description: "Complete every battle order milestone on time.",
    icon: "⏱️",
    rarity: "uncommon",
    condition: { type: "milestone_all_on_time" },
  },
  {
    id: "conservation",
    title: "Conservation",
    description: "Finish the game with ammo above 40%.",
    icon: "🎯",
    rarity: "uncommon",
    condition: { type: "men_count", threshold: 40, comparison: "gte" },
  },
  {
    id: "ghost",
    title: "Ghost",
    description: "Complete Act 1 without raising enemy readiness above 25.",
    icon: "👻",
    rarity: "uncommon",
    condition: { type: "readiness_threshold", max: 25 },
  },
  {
    id: "knife_in_the_dark",
    title: "Knife in the Dark",
    description: "Win the first solo knife fight.",
    icon: "🗡️",
    rarity: "uncommon",
    condition: { type: "specific_decision", decisionId: "knife_sentry" },
  },

  // Rare
  {
    id: "band_of_brothers",
    title: "Band of Brothers",
    description: "Complete the full 24 hours with 15+ men surviving.",
    icon: "🎖️",
    rarity: "rare",
    condition: { type: "men_count", threshold: 15, comparison: "gte" },
  },
  {
    id: "lead_from_the_front",
    title: "Lead from the Front",
    description:
      'Choose "front" position in every combat scene and survive.',
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
    title: "Tactical Genius",
    description: "Complete the game on first playthrough (no lessons).",
    icon: "🧠",
    rarity: "rare",
    condition: { type: "playthroughs", count: 1 },
  },
  {
    id: "no_man_left_behind",
    title: "No Man Left Behind",
    description: "Complete the game with zero KIA (wounded allowed).",
    icon: "🛡️",
    rarity: "rare",
    condition: { type: "game_complete_no_casualties" },
  },

  // Legendary
  {
    id: "perfect_captain",
    title: "Perfect Captain",
    description:
      "Zero KIA, all milestones on time, readiness never above 50, morale never below 50.",
    icon: "👑",
    rarity: "legendary",
    condition: { type: "game_complete_no_casualties" },
  },
  {
    id: "armchair_general",
    title: "Armchair General",
    description:
      'Complete the game always choosing "rear" position — extremely difficult.',
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
    title: "Scholar of War",
    description: "Unlock every single lesson across all playthroughs.",
    icon: "📚",
    rarity: "legendary",
    condition: { type: "all_lessons_unlocked" },
  },
  {
    id: "immortal",
    title: "Immortal",
    description: "Complete 10 full playthroughs.",
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
