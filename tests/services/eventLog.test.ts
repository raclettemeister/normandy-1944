import { describe, it, expect } from "vitest";
import { EventLog } from "../../src/services/eventLog.ts";
import type { GameEvent, PlatoonAudit, GameState } from "../../src/types/index.ts";

describe("EventLog v2", () => {
  it("buildContextSummary returns formatted situation log", () => {
    const log = new EventLog();
    log.appendGameEvent({
      type: "scene_complete",
      sceneId: "act1_landing",
      summary: "Landed in flooded field",
      timeCost: 15,
      timestamp: "0115",
    });
    log.appendGameEvent({
      type: "rally",
      sceneId: "act1_sergeant",
      soldiers: ["henderson"],
      description: "Found Henderson behind stone wall",
      timestamp: "0200",
    });

    const summary = log.buildContextSummary();
    expect(summary).toContain("SITUATION LOG:");
    expect(summary).toContain("0115");
    expect(summary).toContain("Landed in flooded field");
    expect(summary).toContain("0200");
    expect(summary).toContain("Henderson");
  });

  it("compresses old events and keeps recent events detailed", () => {
    const log = new EventLog();
    for (let i = 0; i < 20; i++) {
      log.appendGameEvent({
        type: "scene_complete",
        sceneId: `scene_${i}`,
        summary: `Scene ${i} completed with details about what happened in this specific scene`,
        timeCost: 15,
        timestamp: `${String(Math.floor(i / 4) + 1).padStart(2, "0")}${String((i % 4) * 15).padStart(2, "0")}`,
      });
    }
    const summary = log.buildContextSummary();
    // Recent events should be more detailed than older ones
    expect(summary.length).toBeLessThan(3000);
  });

  it("runPlatoonAudit returns capabilities and risks", () => {
    const log = new EventLog();
    const mockState: Partial<GameState> = {
      roster: [
        { id: "henderson", name: "Henderson", role: "platoon_sergeant", status: "active", rank: "SSgt", age: 28, hometown: "Scranton", background: "test", traits: ["veteran"] },
        { id: "rivera", name: "Rivera", role: "medic", status: "active", rank: "Cpl", age: 22, hometown: "San Antonio", background: "test", traits: ["brave"] },
      ],
      capabilities: {
        canSuppress: false,
        canTreatWounded: true,
        hasRadio: false,
        hasNCO: true,
        hasExplosives: false,
        canScout: true,
      },
      men: 2,
      ammo: 35,
      morale: 62,
    };

    const audit = log.runPlatoonAudit(mockState as GameState, []);
    expect(audit.currentCapabilities.canTreatWounded).toBe(true);
    expect(audit.effectiveStrength).toBe(2);
    expect(audit.criticalRisks).toContain("No suppressive fire capability");
    expect(audit.personnelGaps).toContain("No radioman");
  });
});

describe("EventLog", () => {
  it("should append events", () => {
    const log = new EventLog();
    log.append({
      sceneId: "act1_landing", type: "casualty",
      soldierIds: ["kowalski"], description: "Kowalski KIA at the bridge",
    });
    expect(log.getAll()).toHaveLength(1);
  });

  it("should filter events by soldier", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1", type: "casualty",
      soldierIds: ["kowalski"], description: "Kowalski KIA",
    });
    log.append({
      sceneId: "s2", type: "brave_act",
      soldierIds: ["malone"], description: "Malone volunteered",
    });
    expect(log.getForSoldier("kowalski")).toHaveLength(1);
    expect(log.getForSoldier("malone")).toHaveLength(1);
    expect(log.getForSoldier("henderson")).toHaveLength(0);
  });

  it("should filter events by type", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1", type: "casualty",
      soldierIds: ["kowalski"], description: "KIA",
    });
    log.append({
      sceneId: "s1", type: "trait_triggered",
      soldierIds: ["ellis"], description: "Froze",
    });
    expect(log.getByType("casualty")).toHaveLength(1);
    expect(log.getByType("trait_triggered")).toHaveLength(1);
    expect(log.getByType("promotion")).toHaveLength(0);
  });

  it("should serialize to array", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1", type: "casualty",
      soldierIds: ["k"], description: "d",
    });
    const serialized = log.serialize();
    expect(Array.isArray(serialized)).toBe(true);
    expect(serialized).toHaveLength(1);
  });

  it("should return copies from getAll and serialize", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1", type: "casualty",
      soldierIds: ["k"], description: "d",
    });
    const all = log.getAll();
    all.push({
      sceneId: "s2", type: "promotion",
      soldierIds: ["m"], description: "promoted",
    });
    expect(log.getAll()).toHaveLength(1);
  });

  it("should clear all events", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1", type: "casualty",
      soldierIds: ["k"], description: "d",
    });
    log.clear();
    expect(log.getAll()).toHaveLength(0);
  });
});

describe("EventLog — plan summaries", () => {
  it("getRecentForDM returns last N events", () => {
    const log = new EventLog();
    for (let i = 0; i < 15; i++) {
      log.append({
        sceneId: `scene_${i}`,
        type: "player_action",
        soldierIds: [],
        description: `Action ${i}`,
      });
    }
    const recent = log.getRecentForDM(10);
    expect(recent).toHaveLength(10);
    expect(recent[0].description).toBe("Action 5");
    expect(recent[9].description).toBe("Action 14");
  });

  it("getRecentForDM returns all if fewer than N", () => {
    const log = new EventLog();
    log.append({
      sceneId: "s1",
      type: "casualty",
      soldierIds: ["henderson"],
      description: "Henderson KIA",
    });
    const recent = log.getRecentForDM(10);
    expect(recent).toHaveLength(1);
  });

  it("tracks plan_summary event type", () => {
    const log = new EventLog();
    log.append({
      sceneId: "act1_the_patrol",
      type: "plan_summary",
      soldierIds: [],
      description: "Player set L-ambush using Henderson and Malone in crossfire",
    });
    const summaries = log.getByType("plan_summary");
    expect(summaries).toHaveLength(1);
  });
});
