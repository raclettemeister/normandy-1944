import type { MetaProgress } from "../types/index.ts";

const STORAGE_KEY = "normandy1944_meta";
const LEGACY_LESSONS_KEY = "normandy1944_lessons";
const LEGACY_ACHIEVEMENTS_KEY = "normandy1944_achievements";

function createDefaultMeta(): MetaProgress {
  return {
    unlockedWikiEntries: [],
    rosterNotes: {},
    completedRuns: 0,
    bestRun: null,
    difficultyUnlocked: [],
    achievements: [],
  };
}

export function loadMeta(): MetaProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultMeta();
    return JSON.parse(stored) as MetaProgress;
  } catch {
    return createDefaultMeta();
  }
}

export function saveMeta(meta: MetaProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
}

export function unlockWikiEntry(id: string): void {
  if (!id) return;
  const meta = loadMeta();
  if (!meta.unlockedWikiEntries.includes(id)) {
    meta.unlockedWikiEntries.push(id);
    saveMeta(meta);
  }
}

export function setRosterNote(soldierId: string, note: string): void {
  const meta = loadMeta();
  meta.rosterNotes[soldierId] = note;
  saveMeta(meta);
}

export function resetRun(): void {
  localStorage.removeItem("normandy1944_run");
}

export function recordRunEnd(result: {
  act: number;
  scene: string;
  time: string;
}): void {
  const meta = loadMeta();
  meta.completedRuns += 1;
  if (
    !meta.bestRun ||
    result.act > meta.bestRun.act
  ) {
    meta.bestRun = result;
  }
  saveMeta(meta);
}

export function resetMeta(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function migrateFromLegacy(): void {
  const legacyLessons = localStorage.getItem(LEGACY_LESSONS_KEY);
  const legacyAchievements = localStorage.getItem(LEGACY_ACHIEVEMENTS_KEY);

  if (!legacyLessons && !legacyAchievements) return;

  const meta = loadMeta();

  if (legacyLessons) {
    try {
      const lessons = JSON.parse(legacyLessons) as string[];
      for (const id of lessons) {
        if (!meta.unlockedWikiEntries.includes(id)) {
          meta.unlockedWikiEntries.push(id);
        }
      }
    } catch { /* ignore corrupt data */ }
    localStorage.removeItem(LEGACY_LESSONS_KEY);
  }

  if (legacyAchievements) {
    try {
      const achievements = JSON.parse(legacyAchievements) as string[];
      for (const id of achievements) {
        if (!meta.achievements.includes(id)) {
          meta.achievements.push(id);
        }
      }
    } catch { /* ignore corrupt data */ }
    localStorage.removeItem(LEGACY_ACHIEVEMENTS_KEY);
  }

  saveMeta(meta);
}
