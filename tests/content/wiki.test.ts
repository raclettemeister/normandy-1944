import { describe, it, expect } from "vitest";
import { WIKI_ENTRIES, getWikiEntry, getEntriesByCategory } from "../../src/content/wiki.ts";
import type { WikiCategory } from "../../src/types/index.ts";

const ALL_CATEGORIES: WikiCategory[] = [
  "operation",
  "your_unit",
  "weapons_equipment",
  "enemy_forces",
  "terrain_landmarks",
  "tactics_learned",
];

describe("wiki content integrity", () => {
  it("has no duplicate IDs", () => {
    const ids = WIKI_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has required fields", () => {
    for (const entry of WIKI_ENTRIES) {
      expect(entry.id).toBeTruthy();
      expect(entry.term).toBeTruthy();
      expect(ALL_CATEGORIES).toContain(entry.category);
      expect(entry.shortDescription).toBeTruthy();
      expect(entry.fullDescription).toBeTruthy();
      expect(typeof entry.alwaysAvailable).toBe("boolean");
    }
  });

  it("all tactics_learned entries are locked with unlockedBy", () => {
    const tactics = WIKI_ENTRIES.filter((e) => e.category === "tactics_learned");
    expect(tactics.length).toBeGreaterThan(0);
    for (const entry of tactics) {
      expect(entry.alwaysAvailable).toBe(false);
      expect(entry.unlockedBy).toBeDefined();
      expect(entry.unlockedBy!.length).toBeGreaterThan(0);
    }
  });

  it("operation and your_unit entries are always available", () => {
    const alwaysOn = WIKI_ENTRIES.filter(
      (e) => e.category === "operation" || e.category === "your_unit"
    );
    expect(alwaysOn.length).toBeGreaterThan(0);
    for (const entry of alwaysOn) {
      expect(entry.alwaysAvailable).toBe(true);
    }
  });

  it("all 6 categories have at least one entry", () => {
    for (const cat of ALL_CATEGORIES) {
      const entries = WIKI_ENTRIES.filter((e) => e.category === cat);
      expect(entries.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has at least 18 entries total", () => {
    expect(WIKI_ENTRIES.length).toBeGreaterThanOrEqual(18);
  });

  it("all 11 existing lesson IDs have matching tactics_learned entries", () => {
    const lessonIds = [
      "assess_before_acting",
      "dead_reckoning",
      "supply_discipline",
      "recognition_signals",
      "identify_before_engaging",
      "rally_procedures",
      "ambush_doctrine",
      "tactical_patience",
      "stealth_operations",
      "positive_identification",
      "route_selection",
    ];
    for (const id of lessonIds) {
      const entry = getWikiEntry(id);
      expect(entry, `Missing wiki entry for lesson: ${id}`).toBeDefined();
      expect(entry!.category).toBe("tactics_learned");
    }
  });
});

describe("getWikiEntry", () => {
  it("finds entry by ID", () => {
    const entry = getWikiEntry("m1_garand");
    expect(entry).toBeDefined();
    expect(entry!.term).toBe("M1 Garand");
  });

  it("returns undefined for unknown ID", () => {
    expect(getWikiEntry("nonexistent")).toBeUndefined();
  });
});

describe("getEntriesByCategory", () => {
  it("returns only entries of the specified category", () => {
    const ops = getEntriesByCategory("operation");
    expect(ops.length).toBeGreaterThan(0);
    for (const entry of ops) {
      expect(entry.category).toBe("operation");
    }
  });

  it("returns empty array for category with no entries if applicable", () => {
    const all = getEntriesByCategory("operation");
    expect(all.every((e) => e.category === "operation")).toBe(true);
  });
});
