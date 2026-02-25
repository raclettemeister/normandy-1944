import { describe, it, expect } from "vitest";
import {
  buildNarrationPrompt,
  buildClassificationPrompt,
  buildEpiloguePrompt,
} from "../../src/services/promptBuilder.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type { GameState, Soldier, SoldierRelationship, Decision } from "../../src/types/index.ts";

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), men: 5, morale: 60, ammo: 50, ...overrides };
}

function makeSoldier(overrides: Partial<Soldier> & { id: string }): Soldier {
  return {
    name: "Test Soldier",
    rank: "Pvt",
    role: "rifleman",
    status: "active",
    age: 20,
    hometown: "Anytown, USA",
    background: "Test background",
    traits: [],
    ...overrides,
  };
}

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Do something",
    tier: "sound",
    outcome: {
      success: { text: "Ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      partial: { text: "Meh", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      failure: { text: "Bad", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      lessonUnlocked: "test",
      nextScene: "test",
    },
    ...overrides,
  };
}

describe("buildNarrationPrompt", () => {
  it("should include scene context in system prompt", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Night landing. Flooded field.",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.system).toContain("Night landing");
    expect(prompt.system).toContain("Terse");
  });

  it("should include active roster with traits", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ id: "henderson", name: "Henderson", traits: ["veteran", "steady"] })],
      relationships: [],
    });
    expect(prompt.system).toContain("Henderson");
    expect(prompt.system).toContain("veteran");
  });

  it("should include relationships for active soldiers", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      gameState: makeMinimalGameState(),
      roster: [
        makeSoldier({ id: "henderson", name: "Henderson" }),
        makeSoldier({ id: "doyle", name: "Doyle" }),
      ],
      relationships: [{
        soldierId: "henderson", targetId: "doyle",
        type: "protective", detail: "Trained him personally.",
      }],
    });
    expect(prompt.system).toContain("protective");
    expect(prompt.system).toContain("Trained him personally");
  });

  it("should include outcome context and casualties", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      outcomeContext: "Ambush successful. One German escaped.",
      casualties: [makeSoldier({ id: "doyle", name: "Doyle", status: "wounded" })],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.userMessage).toContain("Ambush successful");
    expect(prompt.userMessage).toContain("Doyle");
    expect(prompt.userMessage).toContain("wounded");
  });

  it("should include player action when provided", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      playerAction: "I throw my helmet as a decoy",
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
    });
    expect(prompt.userMessage).toContain("throw my helmet");
  });

  it("should include game state numbers", () => {
    const prompt = buildNarrationPrompt({
      sceneContext: "Bridge.",
      gameState: makeMinimalGameState({ men: 8, ammo: 45, morale: 62 }),
      roster: [],
      relationships: [],
    });
    expect(prompt.system).toContain("Men: 8/18");
    expect(prompt.system).toContain("Ammo: 45%");
    expect(prompt.system).toContain("Morale: 62");
  });
});

describe("buildClassificationPrompt", () => {
  it("should list all available decisions", () => {
    const prompt = buildClassificationPrompt({
      sceneContext: "German patrol at bridge.",
      decisions: [
        makeDecision({ id: "ambush", text: "Set up ambush", tier: "excellent" }),
        makeDecision({ id: "charge", text: "Charge", tier: "suicidal" }),
      ],
      playerText: "I crawl through the ditch",
      gameState: makeMinimalGameState(),
    });
    expect(prompt.userMessage).toContain("ambush");
    expect(prompt.userMessage).toContain("charge");
    expect(prompt.userMessage).toContain("crawl through the ditch");
  });

  it("should request JSON response format", () => {
    const prompt = buildClassificationPrompt({
      sceneContext: "Bridge.",
      decisions: [],
      playerText: "test",
      gameState: makeMinimalGameState(),
    });
    expect(prompt.system).toContain("JSON");
  });

  it("should include scene context", () => {
    const prompt = buildClassificationPrompt({
      sceneContext: "German patrol at bridge.",
      decisions: [],
      playerText: "test",
      gameState: makeMinimalGameState(),
    });
    expect(prompt.userMessage).toContain("German patrol at bridge");
  });
});

describe("buildEpiloguePrompt", () => {
  it("should include soldier details and events", () => {
    const prompt = buildEpiloguePrompt({
      soldier: makeSoldier({ id: "doyle", name: "Doyle", status: "active", hometown: "Boise, Idaho" }),
      events: [{ sceneId: "s1", type: "trait_triggered",
        soldierIds: ["doyle"], description: "Froze during first combat" }],
      relationships: [{ soldierId: "henderson", targetId: "doyle",
        type: "protective", detail: "Trained him" }],
      allSoldierStatuses: [{ id: "henderson", status: "active" }],
    });
    expect(prompt.userMessage).toContain("Doyle");
    expect(prompt.userMessage).toContain("Boise");
    expect(prompt.userMessage).toContain("Froze during first combat");
    expect(prompt.userMessage).toContain("protective");
  });

  it("should include partner status in relationships", () => {
    const prompt = buildEpiloguePrompt({
      soldier: makeSoldier({ id: "doyle", name: "Doyle" }),
      events: [],
      relationships: [{ soldierId: "henderson", targetId: "doyle",
        type: "protective", detail: "Trained him" }],
      allSoldierStatuses: [{ id: "henderson", status: "KIA" }],
    });
    expect(prompt.userMessage).toContain("KIA");
  });

  it("should use third person past tense instructions", () => {
    const prompt = buildEpiloguePrompt({
      soldier: makeSoldier({ id: "doyle", name: "Doyle" }),
      events: [],
      relationships: [],
      allSoldierStatuses: [],
    });
    expect(prompt.system).toContain("past tense");
    expect(prompt.system).toContain("third person");
  });
});
