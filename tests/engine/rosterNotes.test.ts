import { describe, it, expect, beforeEach, vi } from "vitest";

const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
});

let loadMeta: typeof import("../../src/engine/metaProgress.ts").loadMeta;
let setRosterNote: typeof import("../../src/engine/metaProgress.ts").setRosterNote;

beforeEach(async () => {
  for (const k in store) delete store[k];
  vi.clearAllMocks();
  const mod = await import("../../src/engine/metaProgress.ts");
  loadMeta = mod.loadMeta;
  setRosterNote = mod.setRosterNote;
});

describe("roster notes via metaProgress", () => {
  it("saves and loads a note for a soldier", () => {
    setRosterNote("henderson", "Solid leader, keeps everyone calm");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Solid leader, keeps everyone calm");
  });

  it("persists across separate loadMeta calls", () => {
    setRosterNote("malone", "Good in a fight");
    const meta1 = loadMeta();
    expect(meta1.rosterNotes["malone"]).toBe("Good in a fight");
    const meta2 = loadMeta();
    expect(meta2.rosterNotes["malone"]).toBe("Good in a fight");
  });

  it("overwrites existing note", () => {
    setRosterNote("henderson", "First impression");
    setRosterNote("henderson", "Updated after combat");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Updated after combat");
  });

  it("supports notes for multiple soldiers", () => {
    setRosterNote("henderson", "Leader");
    setRosterNote("malone", "Fighter");
    setRosterNote("rivera", "Medic");
    const meta = loadMeta();
    expect(Object.keys(meta.rosterNotes)).toHaveLength(3);
  });

  it("notes survive meta reset cycle (new run)", () => {
    setRosterNote("henderson", "Persists");
    const meta = loadMeta();
    expect(meta.rosterNotes["henderson"]).toBe("Persists");
  });
});
