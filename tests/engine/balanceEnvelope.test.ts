import { describe, it, expect } from "vitest";
import { deriveBalanceEnvelope } from "../../src/engine/balanceEnvelope.ts";
import type { Decision } from "../../src/types/index.ts";

function makeDecision(overrides: Partial<Decision> & { id: string }): Decision {
  return {
    text: "Test",
    tier: "sound",
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 5, moraleChange: 5, readinessChange: 2 },
      partial: { text: "ok", menLost: 1, ammoSpent: 10, moraleChange: -5, readinessChange: 5 },
      failure: { text: "ok", menLost: 2, ammoSpent: 15, moraleChange: -15, readinessChange: 10 },
      lessonUnlocked: "test",
      nextScene: "test",
    },
    ...overrides,
  };
}

describe("deriveBalanceEnvelope", () => {
  it("derives min/max from a single decision", () => {
    const decisions = [makeDecision({ id: "d1" })];
    const envelope = deriveBalanceEnvelope(decisions);

    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.success.ammoSpent).toEqual([5, 5]);
    expect(envelope.partial.menLost).toEqual([1, 1]);
    expect(envelope.failure.menLost).toEqual([2, 3]); // +1 buffer on failure
  });

  it("derives wider ranges from multiple decisions", () => {
    const decisions = [
      makeDecision({ id: "d1" }),
      makeDecision({
        id: "d2",
        outcome: {
          success: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 10, readinessChange: 0 },
          partial: { text: "ok", menLost: 2, ammoSpent: 20, moraleChange: -10, readinessChange: 8 },
          failure: { text: "ok", menLost: 3, ammoSpent: 25, moraleChange: -20, readinessChange: 12 },
          lessonUnlocked: "test",
          nextScene: "test",
        },
      }),
    ];
    const envelope = deriveBalanceEnvelope(decisions);

    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.success.ammoSpent).toEqual([0, 5]);
    expect(envelope.partial.menLost).toEqual([1, 2]);
    expect(envelope.partial.ammoSpent).toEqual([10, 20]);
    expect(envelope.failure.menLost).toEqual([2, 4]); // max 3 + 1 buffer
    expect(envelope.failure.moraleChange).toEqual([-20, -15]);
  });

  it("returns zero-range envelope for empty decisions", () => {
    const envelope = deriveBalanceEnvelope([]);
    expect(envelope.success.menLost).toEqual([0, 0]);
    expect(envelope.failure.menLost).toEqual([0, 1]); // buffer
  });

  it("handles negative ammoSpent (ammo gained)", () => {
    const decisions = [
      makeDecision({
        id: "d1",
        outcome: {
          success: { text: "ok", menLost: 0, ammoSpent: -8, moraleChange: 8, readinessChange: 5 },
          partial: { text: "ok", menLost: 0, ammoSpent: -10, moraleChange: 5, readinessChange: 7 },
          failure: { text: "ok", menLost: 0, ammoSpent: -12, moraleChange: 1, readinessChange: 10 },
          lessonUnlocked: "test",
          nextScene: "test",
        },
      }),
    ];
    const envelope = deriveBalanceEnvelope(decisions);
    expect(envelope.success.ammoSpent).toEqual([-8, -8]);
  });
});
