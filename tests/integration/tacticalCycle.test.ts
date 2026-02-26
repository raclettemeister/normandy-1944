import { describe, it, expect, vi } from "vitest";
import { createInitialStateWithDifficulty } from "../../src/engine/gameState.ts";
import { deriveBalanceEnvelope } from "../../src/engine/balanceEnvelope.ts";
import { DMLayer } from "../../src/services/dmLayer.ts";
import { calculateEffectiveScore, getOutcomeRange, rollOutcome, getOutcomeTier } from "../../src/engine/outcomeEngine.ts";
import type { Decision } from "../../src/types/index.ts";

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test", tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 5, moraleChange: 5, readinessChange: 2 },
      partial: { text: "ok", menLost: 1, ammoSpent: 10, moraleChange: -5, readinessChange: 5 },
      failure: { text: "ok", menLost: 2, ammoSpent: 15, moraleChange: -15, readinessChange: 10 },
      lessonUnlocked: "test", nextScene: "test",
    },
    ...overrides,
  };
}

describe("Tactical Cycle Integration", () => {
  it("full flow: DM evaluation → engine → outcome values", async () => {
    const state = createInitialStateWithDifficulty("hardcore");
    expect(state.difficulty).toBe("hardcore");
    expect(state.revealTokensRemaining).toBe(0);

    const decisions = [
      makeDecision({ id: "d1", tier: "excellent" }),
      makeDecision({ id: "d2", tier: "reckless" }),
    ];

    const envelope = deriveBalanceEnvelope(decisions);
    expect(envelope.success.menLost[0]).toBeLessThanOrEqual(envelope.success.menLost[1]);

    const mockCallLLM = vi.fn().mockResolvedValue(JSON.stringify({
      tier: "masterful",
      reasoning: "Brilliant coordination",
      narrative: "The plan works perfectly.",
      fatal: false,
      intelGained: null,
      planSummary: "Coordinated crossfire with named soldiers",
      secondInCommandReaction: "Outstanding, sir.",
      soldierReactions: [{ soldierId: "malone", text: "Let's go!" }],
    }));

    const dm = new DMLayer(mockCallLLM);
    const evaluation = await dm.evaluatePrompt({
      playerText: "Henderson take the BAR to the stone wall",
      sceneContext: "Bridge. Four Germans.",
      decisions,
      gameState: state,
      roster: [],
      relationships: [],
      recentEvents: [],
      lessonsUnlocked: [],
    });

    expect(evaluation).not.toBeNull();
    expect(evaluation!.tier).toBe("masterful");

    const effectiveScore = calculateEffectiveScore(
      evaluation!.tier, state, decisions[0]
    );
    expect(effectiveScore).toBeGreaterThan(0);

    const range = getOutcomeRange(effectiveScore);
    const roll = rollOutcome(range, 42);
    const outcomeTier = getOutcomeTier(roll);
    expect(["success", "partial", "failure"]).toContain(outcomeTier);

    const envRange = envelope[outcomeTier];
    expect(envRange.menLost[0]).toBeLessThanOrEqual(envRange.menLost[1]);
  });

  it("easy mode has 0 reveal tokens, medium has 5", () => {
    const easy = createInitialStateWithDifficulty("easy");
    const medium = createInitialStateWithDifficulty("medium");
    const hardcore = createInitialStateWithDifficulty("hardcore");

    expect(easy.revealTokensRemaining).toBe(0);
    expect(medium.revealTokensRemaining).toBe(5);
    expect(hardcore.revealTokensRemaining).toBe(0);
  });
});
