import { describe, it, expect } from "vitest";
import { buildInterludePrompt } from "../../src/services/promptBuilder.ts";
import { createInitialState } from "../../src/engine/gameState.ts";

describe("buildInterludePrompt", () => {
  const baseInput = {
    beat: "The platoon moves in wedge formation toward the church.",
    context: "tense, they just lost a man",
    objectiveReminder: "Secure the crossroads before 0600",
    previousOutcomeText: "The patrol passed without seeing you.",
    previousOutcomeContext: "Stealth success, no contact.",
    nextSceneContext: "The church looms ahead. Stone walls, dark windows.",
    nextSceneNarrative: "The church steeple rises from the bocage.",
    gameState: createInitialState(),
    roster: [],
    relationships: [],
    interludeType: "movement" as const,
  };

  it("returns system and userMessage", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toBeTruthy();
    expect(result.userMessage).toBeTruthy();
  });

  it("includes the beat in the prompt", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("wedge formation");
  });

  it("includes previous outcome context", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("patrol passed");
  });

  it("includes next scene context", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("church looms");
  });

  it("includes interlude type", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("movement");
  });

  it("includes tone context when provided", () => {
    const result = buildInterludePrompt(baseInput);
    expect(result.system).toContain("tense, they just lost a man");
  });
});
