import { describe, it, expect } from "vitest";
import {
  createPreparationPhase,
  completePrep,
  getAvailablePreps,
  calculatePrepEffects,
} from "../../src/engine/preparationPhase.ts";
import type { GameState } from "../../src/types/index.ts";

describe("Preparation Phase Engine", () => {
  it("createPreparationPhase returns all 6 default preps", () => {
    const phase = createPreparationPhase();
    expect(phase.availablePreps).toHaveLength(6);
    expect(phase.completedPreps).toEqual([]);
    expect(phase.counterattackTriggered).toBe(false);
    expect(phase.totalTimePreparing).toBe(0);
  });

  it("completePrep marks prep as done and adds time", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    expect(phase.completedPreps).toContain("defensive_positions");
    expect(phase.totalTimePreparing).toBe(90);
  });

  it("completePrep ignores already-completed preps", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    phase = completePrep(phase, "defensive_positions");
    expect(phase.completedPreps.filter(p => p === "defensive_positions")).toHaveLength(1);
    expect(phase.totalTimePreparing).toBe(90);
  });

  it("getAvailablePreps excludes completed preps", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    const available = getAvailablePreps(phase);
    expect(available.find(p => p.id === "defensive_positions")).toBeUndefined();
    expect(available).toHaveLength(5);
  });

  it("calculatePrepEffects aggregates all completed prep effects", () => {
    let phase = createPreparationPhase();
    phase = completePrep(phase, "defensive_positions");
    phase = completePrep(phase, "listening_posts");
    phase = completePrep(phase, "redistribute_ammo");
    const effects = calculatePrepEffects(phase);
    expect(effects.casualtyReduction).toBeGreaterThan(0);
    expect(effects.earlyWarning).toBe(true);
    expect(effects.ammoRedistributed).toBe(true);
  });

  it("preps have correct time costs from design doc", () => {
    const phase = createPreparationPhase();
    const preps = phase.availablePreps;
    const defensive = preps.find(p => p.id === "defensive_positions");
    const listening = preps.find(p => p.id === "listening_posts");
    const ammo = preps.find(p => p.id === "redistribute_ammo");
    const medical = preps.find(p => p.id === "medical_station");
    const stragglers = preps.find(p => p.id === "find_stragglers");
    const rest = preps.find(p => p.id === "rest_and_brief");

    expect(defensive?.timeCost).toBe(90);
    expect(listening?.timeCost).toBe(60);
    expect(ammo?.timeCost).toBe(30);
    expect(medical?.timeCost).toBe(45);
    expect(stragglers?.timeCost).toBe(60);
    expect(rest?.timeCost).toBe(45);
  });
});
