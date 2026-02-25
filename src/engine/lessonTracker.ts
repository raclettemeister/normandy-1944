const STORAGE_KEY = "normandy1944_lessons";

export function loadLessons(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

export function saveLessons(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function unlockLesson(lessonId: string): void {
  const lessons = loadLessons();
  if (!lessons.includes(lessonId)) {
    lessons.push(lessonId);
    saveLessons(lessons);
  }
}

export function hasLesson(lessonId: string): boolean {
  return loadLessons().includes(lessonId);
}

export function resetLessons(): void {
  localStorage.removeItem(STORAGE_KEY);
}
