import { describe, it, expect } from "vitest";
import { resolveSceneNarrative } from "../../src/engine/scenarioLoader.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type { Scenario, Soldier } from "../../src/types/index.ts";

function makeScenario(narrativeAlt?: Record<string, string>): Scenario {
  return {
    id: "test_scene",
    act: 1,
    timeCost: 10,
    narrative: "Texte principal.",
    narrativeAlt,
    decisions: [],
  };
}

function makeSoldier(id: string): Soldier {
  return {
    id,
    name: "Test",
    rank: "Sgt",
    role: "NCO",
    status: "active",
    age: 24,
    hometown: "Paris",
    background: "Test",
    traits: ["steady"],
  };
}

describe("resolveSceneNarrative", () => {
  it("returns base narrative when no alternative matches", () => {
    const scenario = makeScenario({ hasCompass: "Alt boussole." });
    const state = createInitialState();
    expect(resolveSceneNarrative(scenario, state)).toBe("Texte principal.");
  });

  it("uses intel-based narrativeAlt when the intel flag is true", () => {
    const scenario = makeScenario({ hasCompass: "Alt boussole." });
    const state = createInitialState();
    state.intel.hasCompass = true;
    expect(resolveSceneNarrative(scenario, state)).toBe("Alt boussole.");
  });

  it("uses solo narrativeAlt when player is solo", () => {
    const scenario = makeScenario({ solo: "Alt solo." });
    const state = createInitialState();
    state.men = 1;
    state.phase = "solo";
    expect(resolveSceneNarrative(scenario, state)).toBe("Alt solo.");
  });

  it("uses hasSecondInCommand narrativeAlt when 2IC is active", () => {
    const scenario = makeScenario({ hasSecondInCommand: "Alt 2IC." });
    const state = createInitialState();
    state.secondInCommand = {
      soldier: makeSoldier("henderson"),
      competence: "veteran",
      alive: true,
    };
    expect(resolveSceneNarrative(scenario, state)).toBe("Alt 2IC.");
  });

  it("uses lesson-key narrativeAlt when lesson is unlocked", () => {
    const scenario = makeScenario({ assess_before_acting: "Alt lecon." });
    const state = createInitialState();
    state.wikiUnlocked.push("assess_before_acting");
    expect(resolveSceneNarrative(scenario, state)).toBe("Alt lecon.");
  });
});
