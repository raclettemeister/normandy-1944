import { describe, it, expect } from "vitest";
import {
  getRelationships,
  getRelationshipsForSoldier,
  getActiveRelationships,
} from "../../src/content/relationships.ts";

describe("relationships", () => {
  it("should return all defined relationships", () => {
    const all = getRelationships();
    expect(all.length).toBeGreaterThanOrEqual(8);
  });

  it("should return relationships for a specific soldier", () => {
    const hendersonRels = getRelationshipsForSoldier("henderson");
    expect(hendersonRels.length).toBeGreaterThanOrEqual(1);
    expect(hendersonRels.some(r => r.targetId === "doyle")).toBe(true);
  });

  it("should return bidirectional relationships", () => {
    const doyleRels = getRelationshipsForSoldier("doyle");
    expect(doyleRels.some(r => r.soldierId === "henderson")).toBe(true);
    expect(doyleRels.some(r => r.soldierId === "doyle" && r.targetId === "ellis")).toBe(true);
  });

  it("should filter to active soldiers only", () => {
    const activeSoldierIds = ["henderson", "malone", "doyle"];
    const active = getActiveRelationships(activeSoldierIds);
    active.forEach(r => {
      if (r.targetId === "everyone") {
        expect(activeSoldierIds).toContain(r.soldierId);
      } else {
        expect(activeSoldierIds).toContain(r.soldierId);
        expect(activeSoldierIds).toContain(r.targetId);
      }
    });
  });

  it("should include 'everyone' relationships when soldier is active", () => {
    const active = getActiveRelationships(["rivera", "henderson"]);
    const riveraEveryone = active.find(r => r.soldierId === "rivera" && r.targetId === "everyone");
    expect(riveraEveryone).toBeDefined();
  });

  it("should exclude 'everyone' relationships when soldier is not active", () => {
    const active = getActiveRelationships(["henderson", "malone"]);
    const riveraRel = active.find(r => r.soldierId === "rivera");
    expect(riveraRel).toBeUndefined();
  });

  it("should return empty when no soldiers are active", () => {
    const active = getActiveRelationships([]);
    expect(active).toHaveLength(0);
  });
});
