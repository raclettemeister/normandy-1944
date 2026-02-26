import { describe, it, expect, vi, afterEach } from "vitest";
import { NarrativeService } from "../../src/services/narrativeService.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type { GameState } from "../../src/types/index.ts";

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), men: 5, morale: 60, ammo: 50, ...overrides };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NarrativeService", () => {
  describe("mode detection", () => {
    it("should use hardcoded mode when no API URL configured", () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      expect(service.getMode()).toBe("hardcoded");
    });

    it("should use hardcoded mode when no access code configured", () => {
      const service = new NarrativeService({ apiUrl: "http://localhost:8787", accessCode: "" });
      expect(service.getMode()).toBe("hardcoded");
    });

    it("should use llm mode when API URL and code are configured", () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "TEST-CODE"
      });
      expect(service.getMode()).toBe("llm");
    });

    it("should treat whitespace-only access code as hardcoded mode", () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787",
        accessCode: "   ",
      });
      expect(service.getMode()).toBe("hardcoded");
    });

    it("should normalize access code before narrative API calls", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as unknown as Response);
      vi.stubGlobal("fetch", fetchMock);

      const service = new NarrativeService({
        apiUrl: "http://localhost:8787",
        accessCode: "  test-code  ",
      });

      await service.generateSceneNarrative(
        "Scene context",
        makeMinimalGameState(),
        [],
        [],
        "Fallback scene text",
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = requestInit.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer TEST-CODE");
    });
  });

  describe("generateOutcomeNarrative", () => {
    it("should return hardcoded text when in hardcoded mode", async () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      const result = await service.generateOutcomeNarrative({
        outcomeText: "You succeed.",
        outcomeContext: "Ambush worked.",
        sceneContext: "Bridge.",
        gameState: makeMinimalGameState(),
        roster: [],
        relationships: [],
      });
      expect(result).toBe("You succeed.");
    });

    it("should return hardcoded text when no outcome context", async () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "CODE"
      });
      const result = await service.generateOutcomeNarrative({
        outcomeText: "You succeed.",
        gameState: makeMinimalGameState(),
        roster: [],
        relationships: [],
      });
      expect(result).toBe("You succeed.");
    });
  });

  describe("classifyPlayerAction", () => {
    it("should reject empty input", async () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "CODE"
      });
      const result = await service.classifyPlayerAction({
        sceneContext: "Bridge.", decisions: [], playerText: "",
        gameState: makeMinimalGameState(),
      });
      expect(result).toBeNull();
    });

    it("should reject short input", async () => {
      const service = new NarrativeService({
        apiUrl: "http://localhost:8787", accessCode: "CODE"
      });
      const result = await service.classifyPlayerAction({
        sceneContext: "Bridge.", decisions: [], playerText: "hi",
        gameState: makeMinimalGameState(),
      });
      expect(result).toBeNull();
    });

    it("should return null in hardcoded mode", async () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      const result = await service.classifyPlayerAction({
        sceneContext: "Bridge.", decisions: [],
        playerText: "I throw a grenade",
        gameState: makeMinimalGameState(),
      });
      expect(result).toBeNull();
    });
  });

  describe("generateEpilogue fallbacks", () => {
    it("should return default KIA epilogue in hardcoded mode", async () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      const result = await service.generateEpilogue({
        soldier: {
          id: "doyle", name: "Doyle", rank: "PFC", role: "rifleman",
          status: "KIA", age: 19, hometown: "Boise, Idaho",
          background: "Farm kid", traits: ["green"],
        },
        events: [],
        relationships: [],
        allSoldierStatuses: [],
      });
      expect(result).toContain("killed in action");
      expect(result).toContain("Doyle");
    });

    it("should return default active epilogue in hardcoded mode", async () => {
      const service = new NarrativeService({ apiUrl: "", accessCode: "" });
      const result = await service.generateEpilogue({
        soldier: {
          id: "henderson", name: "Henderson", rank: "SSgt", role: "platoon_sergeant",
          status: "active", age: 28, hometown: "Scranton, PA",
          background: "Career NCO", traits: ["veteran", "steady"],
        },
        events: [],
        relationships: [],
        allSoldierStatuses: [],
      });
      expect(result).toContain("survived");
      expect(result).toContain("Henderson");
    });
  });
});
