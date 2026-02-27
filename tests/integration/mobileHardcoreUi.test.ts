import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import PlanPhase from "../../src/components/PlanPhase.tsx";
import MainMenu from "../../src/components/MainMenu.tsx";
import type { Decision } from "../../src/types/index.ts";

function makeDecision(id: string): Decision {
  return {
    id,
    text: "Test decision",
    tier: "sound",
    outcome: {
      success: {
        text: "ok",
        menLost: 0,
        ammoSpent: 0,
        moraleChange: 0,
        readinessChange: 0,
      },
      partial: {
        text: "ok",
        menLost: 0,
        ammoSpent: 0,
        moraleChange: 0,
        readinessChange: 0,
      },
      failure: {
        text: "ok",
        menLost: 0,
        ammoSpent: 0,
        moraleChange: 0,
        readinessChange: 0,
      },
      wikiUnlocks: "test",
      nextScene: "next",
    },
  };
}

describe("mobile hardcore UI guardrails", () => {
  it("hardcore plan phase keeps free-text and hides decision reveal affordances", () => {
    const html = renderToStaticMarkup(
      createElement(PlanPhase, {
        difficulty: "hardcore",
        decisions: [makeDecision("d1")],
        revealTokensRemaining: 0,
        onSubmitPrompt: () => {},
        onSelectDecision: () => {},
        onRevealTokenUsed: () => {},
        secondInCommandComment: null,
        isCombatScene: true,
        captainPosition: "middle",
        onCaptainPositionChange: () => {},
        disabled: false,
        loading: false,
        sceneId: "act1_the_patrol",
      })
    );

    expect(html).toContain("data-testid=\"free-text-form\"");
    expect(html).toContain("captain-position-selector");
    expect(html).not.toContain("Reveal Decisions");
    expect(html).not.toContain("decision-panel");
  });

  it("main menu renders hardcore button as structured name + description", () => {
    const html = renderToStaticMarkup(
      createElement(MainMenu, {
        onStartGame: vi.fn(),
        apiUrl: "",
        onAccessCodeValidated: vi.fn(),
        narrativeMode: "llm",
      })
    );

    expect(html).toContain("difficulty-btn__name\">Hardcore</span>");
    expect(html).toContain(
      "difficulty-btn__desc\">No decisions. No tokens. Lead or die.</span>"
    );
  });

  it("mobile stylesheet keeps key controls at 44px touch targets", () => {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const cssPath = resolve(currentDir, "../../src/styles/game.css");
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\.toolbar \.btn\s*\{[\s\S]*min-height:\s*44px;/);
    expect(css).toMatch(/\.decision-btn\s*\{[\s\S]*min-height:\s*44px;/);
    expect(css).toMatch(/\.overlay-close\s*\{[\s\S]*min-height:\s*44px;/);
    expect(css).toMatch(/\.captain-position__option\s*\{[\s\S]*min-height:\s*44px;/);
    expect(css).toMatch(/\.wiki-category-btn\s*\{[\s\S]*min-height:\s*44px;/);
  });
});
