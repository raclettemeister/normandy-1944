import { describe, expect, it } from "vitest";
import { TemplateDMLayer } from "../../src/services/templateDmLayer.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type { Decision } from "../../src/types/index.ts";

function makeDecision(id: string, text: string, tier: Decision["tier"]): Decision {
  return {
    id,
    text,
    tier,
    outcome: {
      success: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      partial: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      failure: { text: "ok", menLost: 0, ammoSpent: 0, moraleChange: 0, readinessChange: 0 },
      wikiUnlocks: "test",
      nextScene: "next",
    },
  };
}

describe("TemplateDMLayer", () => {
  it("returns null for short prompts", async () => {
    const dm = new TemplateDMLayer();
    const result = await dm.evaluatePrompt({
      playerText: "go",
      sceneContext: "Bridge in the dark.",
      decisions: [makeDecision("d1", "Set ambush", "sound")],
      gameState: createInitialState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
    });
    expect(result).toBeNull();
  });

  it("marks self-harm prompts as fatal suicidal outcomes", async () => {
    const dm = new TemplateDMLayer();
    const result = await dm.evaluatePrompt({
      playerText: "I shoot myself with my pistol right now.",
      sceneContext: "Bridge in the dark.",
      decisions: [makeDecision("d1", "Set ambush", "sound")],
      gameState: createInitialState(),
      roster: [],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
      secondInCommandCompetence: "veteran",
    });
    expect(result).not.toBeNull();
    expect(result!.fatal).toBe(true);
    expect(result!.tier).toBe("suicidal");
    expect(result!.narrative.toLowerCase()).toContain("fight is over");
  });

  it("upgrades coherent tactical plans toward excellent/masterful", async () => {
    const dm = new TemplateDMLayer();
    const state = createInitialState();
    const result = await dm.evaluatePrompt({
      playerText:
        "Henderson takes left flank through the canal while Malone sets base fire. I hold clicker discipline, confirm flash thunder, then collapse crossfire from hedgerow cover.",
      sceneContext: "Stone bridge with German patrol.",
      decisions: [
        makeDecision("patrol_l_ambush", "Set an L-shaped ambush", "excellent"),
        makeDecision("patrol_charge", "Charge across open ground", "suicidal"),
      ],
      gameState: state,
      roster: [
        {
          id: "henderson",
          name: "Henderson",
          rank: "SSgt",
          role: "platoon_sergeant",
          status: "active",
          age: 28,
          hometown: "Scranton, PA",
          background: "Veteran NCO",
          traits: ["veteran", "steady"],
        },
      ],
      relationships: [],
      recentEvents: [],
      wikiUnlocked: [],
      secondInCommandCompetence: "veteran",
    });

    expect(result).not.toBeNull();
    expect(["excellent", "masterful"]).toContain(result!.tier);
    expect(result!.fatal).toBe(false);
    expect(result!.secondInCommandReaction.length).toBeGreaterThan(0);
    expect(result!.planSummary.length).toBeGreaterThan(0);
  });
});
