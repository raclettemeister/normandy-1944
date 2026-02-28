import { describe, it, expect, vi } from "vitest";
import { DMLayer } from "../../src/services/dmLayer.ts";
import type { Decision, GameState, Soldier, EnhancedDMEvaluation } from "../../src/types/index.ts";
import { createInitialState } from "../../src/engine/gameState.ts";

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), men: 5, morale: 60, ammo: 50, ...overrides };
}

function makeSoldier(overrides: Partial<Soldier> & { id: string }): Soldier {
  return {
    name: "Test", rank: "Pvt", role: "rifleman", status: "active",
    age: 20, hometown: "Test", background: "Test", traits: [], ...overrides,
  };
}

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test", tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      partial: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      failure: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      wikiUnlocks: "test", nextScene: "test",
    },
    ...overrides,
  };
}

describe("DMLayer", () => {
  it("parses valid LLM response into DMEvaluation", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "excellent",
      reasoning: "Good use of crossfire",
      narrative: "The ambush works perfectly.",
      fatal: false,
      intelGained: null,
      planSummary: "Player set crossfire ambush",
      secondInCommandReaction: "Good plan, sir.",
      soldierReactions: [{ soldierId: "malone", text: "Let's go!" }],
    }));

    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "Set crossfire from the canal",
      sceneContext: "Bridge. Four Germans.",
      decisions: [makeDecision({ id: "d1" })],
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ id: "henderson" })],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });

    expect(result).not.toBeNull();
    expect(result!.tier).toBe("excellent");
    expect(result!.narrative).toContain("ambush");
    expect(result!.soldierReactions).toHaveLength(1);
  });

  it("returns null on malformed LLM response", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue("not json");
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack the bridge",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("returns null on LLM error", async () => {
    const mockCallLLM = vi.fn().mockRejectedValue(new Error("Network error"));
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack the bridge",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("validates tier is a valid TacticalTier", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "godlike",
      reasoning: "test",
      narrative: "test",
      planSummary: "test",
      secondInCommandReaction: "test",
      soldierReactions: [],
    }));

    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "attack the bridge",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("rejects gibberish input client-side", async () => {
    const mockCallLLM = vi.fn();
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePrompt({
      playerText: "asd",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
    expect(mockCallLLM).not.toHaveBeenCalled();
  });
});

describe("DMLayer enhanced (evaluatePromptEnhanced)", () => {
  it("returns EnhancedDMEvaluation with personnelScore", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "excellent",
      reasoning: "Good use of crossfire",
      narrative: "The ambush works.",
      matchedDecisionId: "d1",
      matchConfidence: 0.9,
      tacticalReasoning: "Solid plan",
      personnelScore: 78,
      assignments: [{ soldierId: "henderson", assignedTask: "point", fitScore: 85, reasoning: "veteran" }],
      assignmentIssues: [],
      assignmentBonuses: ["Henderson ideal for point"],
      soldierReactions: [],
      secondInCommandReaction: "Good plan.",
      vulnerablePersonnel: [],
      capabilityRisks: [],
      planSummary: "Crossfire ambush",
    }));

    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePromptEnhanced({
      playerText: "Henderson on point, crossfire from the canal",
      sceneContext: "Bridge. Four Germans.",
      decisions: [makeDecision({ id: "d1" })],
      gameState: makeMinimalGameState(),
      roster: [makeSoldier({ id: "henderson" })],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });

    expect(result).not.toBeNull();
    const eval_ = result as EnhancedDMEvaluation;
    expect(eval_.personnelScore).toBe(78);
    expect(eval_.tier).toBe("excellent");
    expect(eval_.assignments).toHaveLength(1);
    expect(eval_.assignments[0].fitScore).toBe(85);
  });

  it("fallback: malformed JSON uses regex extraction for tier", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue('Something happened. The tier is "sound". More text.');
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePromptEnhanced({
      playerText: "attack the bridge",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });

    expect(result).not.toBeNull();
    expect((result as EnhancedDMEvaluation).tier).toBe("sound");
    expect((result as EnhancedDMEvaluation).personnelScore).toBeGreaterThanOrEqual(0);
  });

  it("fallback: total failure returns mediocre baseline with personnelScore 50", async () => {
    const mockCallLLM = vi.fn().mockResolvedValue("gibberish xyz no tier here");
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePromptEnhanced({
      playerText: "attack the bridge",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });

    expect(result).not.toBeNull();
    const eval_ = result as EnhancedDMEvaluation;
    expect(eval_.tier).toBe("mediocre");
    expect(eval_.personnelScore).toBe(50);
  });

  it("returns null for too-short input (client-side)", async () => {
    const mockCallLLM = vi.fn();
    const dm = new DMLayer(mockCallLLM);
    const result = await dm.evaluatePromptEnhanced({
      playerText: "go",
      sceneContext: "Bridge.",
      decisions: [],
      gameState: makeMinimalGameState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
    expect(mockCallLLM).not.toHaveBeenCalled();
  });
});
