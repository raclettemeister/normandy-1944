import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MetaProgress } from "../../src/types/index.ts";

const STORAGE_KEY = "normandy1944_meta";
const LEGACY_LESSONS_KEY = "normandy1944_lessons";
const LEGACY_ACHIEVEMENTS_KEY = "normandy1944_achievements";

const store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};

vi.stubGlobal("localStorage", mockLocalStorage);

let loadMeta: typeof import("../../src/engine/metaProgress.ts").loadMeta;
let saveMeta: typeof import("../../src/engine/metaProgress.ts").saveMeta;
let unlockWikiEntry: typeof import("../../src/engine/metaProgress.ts").unlockWikiEntry;
let setRosterNote: typeof import("../../src/engine/metaProgress.ts").setRosterNote;
let resetMeta: typeof import("../../src/engine/metaProgress.ts").resetMeta;
let migrateFromLegacy: typeof import("../../src/engine/metaProgress.ts").migrateFromLegacy;

beforeEach(async () => {
  for (const k in store) delete store[k];
  vi.clearAllMocks();
  const mod = await import("../../src/engine/metaProgress.ts");
  loadMeta = mod.loadMeta;
  saveMeta = mod.saveMeta;
  unlockWikiEntry = mod.unlockWikiEntry;
  setRosterNote = mod.setRosterNote;
  resetMeta = mod.resetMeta;
  migrateFromLegacy = mod.migrateFromLegacy;
});

describe("loadMeta", () => {
  it("returns defaults when localStorage is empty", () => {
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
    expect(meta.rosterNotes).toEqual({});
    expect(meta.completedRuns).toBe(0);
    expect(meta.bestRun).toBeNull();
    expect(meta.difficultyUnlocked).toEqual([]);
    expect(meta.achievements).toEqual([]);
  });

  it("loads saved meta from localStorage", () => {
    const saved: MetaProgress = {
      unlockedWikiEntries: ["m1_garand"],
      rosterNotes: { henderson: "Good leader" },
      completedRuns: 2,
      bestRun: { act: 3, scene: "victory", time: "1800" },
      difficultyUnlocked: ["medium"],
      achievements: ["first_drop"],
    };
    store[STORAGE_KEY] = JSON.stringify(saved);
    const meta = loadMeta();
    expect(meta).toEqual(saved);
  });

  it("returns defaults on corrupt JSON", () => {
    store[STORAGE_KEY] = "not json";
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});

describe("saveMeta", () => {
  it("persists to localStorage", () => {
    const meta = loadMeta();
    meta.completedRuns = 5;
    saveMeta(meta);
    expect(JSON.parse(store[STORAGE_KEY]).completedRuns).toBe(5);
  });
});

describe("unlockWikiEntry", () => {
  it("adds entry to unlockedWikiEntries", () => {
    unlockWikiEntry("m1_garand");
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toContain("m1_garand");
  });

  it("does not duplicate entries", () => {
    unlockWikiEntry("m1_garand");
    unlockWikiEntry("m1_garand");
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries.filter(e => e === "m1_garand")).toHaveLength(1);
  });
});

describe("setRosterNote", () => {
  it("saves note for soldier", () => {
    setRosterNote("henderson", "Solid NCO");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Solid NCO");
  });

  it("overwrites existing note", () => {
    setRosterNote("henderson", "First note");
    setRosterNote("henderson", "Updated note");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Updated note");
  });
});

describe("resetMeta", () => {
  it("clears all meta data", () => {
    unlockWikiEntry("test");
    resetMeta();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});

describe("migrateFromLegacy", () => {
  it("migrates legacy lessons into unlockedWikiEntries", () => {
    store[LEGACY_LESSONS_KEY] = JSON.stringify(["assess_before_acting", "dead_reckoning"]);
    store[LEGACY_ACHIEVEMENTS_KEY] = JSON.stringify(["first_drop"]);
    migrateFromLegacy();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toContain("assess_before_acting");
    expect(meta.unlockedWikiEntries).toContain("dead_reckoning");
    expect(meta.achievements).toContain("first_drop");
  });

  it("removes legacy keys after migration", () => {
    store[LEGACY_LESSONS_KEY] = JSON.stringify(["test"]);
    migrateFromLegacy();
    expect(store[LEGACY_LESSONS_KEY]).toBeUndefined();
    expect(store[LEGACY_ACHIEVEMENTS_KEY]).toBeUndefined();
  });

  it("does nothing when no legacy data exists", () => {
    migrateFromLegacy();
    const meta = loadMeta();
    expect(meta.unlockedWikiEntries).toEqual([]);
  });
});
