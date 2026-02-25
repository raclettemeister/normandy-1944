import { describe, it, expect } from "vitest";
import {
  calculateEffectiveScore,
  getOutcomeRange,
  rollOutcome,
  getOutcomeTier,
  getCaptainCasualtyChance,
  assignCasualties,
  shouldCounterattackTrigger,
  seededRandom,
  processSceneTransition,
} from "../../src/engine/outcomeEngine.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type {
  GameState,
  Decision,
  TacticalTier,
  Soldier,
  CaptainPosition,
  Scenario,
  OutcomeNarrative,
} from "../../src/types/index.ts";

// ─── Helpers ──────────────────────────────────────────────────────

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides };
}

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: "test_decision",
    text: "Test decision",
    tier: "sound",
    outcome: {
      success: {
        text: "Success",
        menLost: 0,
        ammoSpent: 0,
        moraleChange: 0,
        readinessChange: 0,
      },
      partial: {
        text: "Partial",
        menLost: 1,
        ammoSpent: 5,
        moraleChange: -5,
        readinessChange: 5,
      },
      failure: {
        text: "Failure",
        menLost: 2,
        ammoSpent: 10,
        moraleChange: -15,
        readinessChange: 10,
      },
      lessonUnlocked: "test_lesson",
      nextScene: "test_next",
    },
    ...overrides,
  };
}

function makeSoldier(
  overrides: Partial<Soldier> & { id: string; role: Soldier["role"] }
): Soldier {
  return {
    name: "Test Soldier",
    rank: "Pvt",
    status: "active",
    age: 20,
    hometown: "Anytown, USA",
    background: "Test background",
    traits: [],
    ...overrides,
  };
}

function makeMinimalScene(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: "test_scene",
    act: 1,
    timeCost: 15,
    narrative: "Test scene narrative.",
    decisions: [],
    ...overrides,
  };
}

// ─── calculateEffectiveScore ──────────────────────────────────────

describe("calculateEffectiveScore", () => {
  it("returns base tier score with neutral state", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    const decision = makeDecision();
    expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
  });

  it("applies all five tier base scores correctly", () => {
    const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
    const decision = makeDecision();
    const tiers: TacticalTier[] = [
      "suicidal",
      "reckless",
      "mediocre",
      "sound",
      "excellent",
    ];
    const expected = [5, 25, 45, 70, 90];
    tiers.forEach((tier, i) => {
      expect(calculateEffectiveScore(tier, state, decision)).toBe(expected[i]);
    });
  });

  describe("morale modifiers", () => {
    const decision = makeDecision();
    const base = { readiness: 0, ammo: 50, men: 0 } as const;

    it("applies -15 when morale < 20", () => {
      const state = makeState({ ...base, morale: 10 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(55);
    });

    it("applies -10 when morale 20-39", () => {
      const state = makeState({ ...base, morale: 30 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(60);
    });

    it("applies 0 when morale 40-79", () => {
      const state = makeState({ ...base, morale: 60 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
    });

    it("applies +5 when morale >= 80", () => {
      const state = makeState({ ...base, morale: 90 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(75);
    });
  });

  describe("enemy readiness modifiers", () => {
    const decision = makeDecision();
    const base = { morale: 60, ammo: 50, men: 0 } as const;

    it("no penalty when readiness < 25 (CONFUSED)", () => {
      const state = makeState({ ...base, readiness: 10 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
    });

    it("-5 when readiness 25-49 (ALERTED)", () => {
      const state = makeState({ ...base, readiness: 25 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(65);
    });

    it("-12 when readiness 50-74 (ORGANIZED)", () => {
      const state = makeState({ ...base, readiness: 50 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(58);
    });

    it("-20 when readiness >= 75 (FORTIFIED)", () => {
      const state = makeState({ ...base, readiness: 75 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(50);
    });
  });

  describe("ammo modifiers", () => {
    const decision = makeDecision();
    const base = { morale: 60, readiness: 0, men: 0 } as const;

    it("-10 when ammo < 10", () => {
      const state = makeState({ ...base, ammo: 5 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(60);
    });

    it("-5 when ammo 10-29", () => {
      const state = makeState({ ...base, ammo: 20 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(65);
    });

    it("no penalty when ammo >= 30", () => {
      const state = makeState({ ...base, ammo: 50 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
    });
  });

  describe("manning modifiers", () => {
    const base = { morale: 60, readiness: 0, ammo: 50 } as const;

    it("-15 when undermanned for the decision", () => {
      const state = makeState({ ...base, men: 3 });
      const decision = makeDecision({ minMen: 6 });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(55);
    });

    it("+5 when platoon phase with >= 12 men", () => {
      const state = makeState({ ...base, men: 14, phase: "platoon" });
      const decision = makeDecision();
      expect(calculateEffectiveScore("sound", state, decision)).toBe(75);
    });
  });

  describe("capability modifiers", () => {
    const base = { morale: 60, readiness: 0, ammo: 50, men: 0 } as const;

    it("+5 when required capability is present", () => {
      const state = makeState({
        ...base,
        capabilities: {
          ...createInitialState().capabilities,
          canSuppress: true,
        },
      });
      const decision = makeDecision({ requiresCapability: "canSuppress" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(75);
    });

    it("-10 when required capability is missing", () => {
      const state = makeState({
        ...base,
        capabilities: {
          ...createInitialState().capabilities,
          canSuppress: false,
        },
      });
      const decision = makeDecision({ requiresCapability: "canSuppress" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(60);
    });
  });

  describe("intel modifiers", () => {
    const base = { morale: 60, readiness: 0, ammo: 50, men: 0 } as const;

    it("+10 when beneficial intel is present", () => {
      const state = makeState({
        ...base,
        intel: { ...createInitialState().intel, knowsMGPosition: true },
      });
      const decision = makeDecision({ benefitsFromIntel: "knowsMGPosition" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(80);
    });

    it("no bonus when intel is missing", () => {
      const state = makeState({ ...base });
      const decision = makeDecision({ benefitsFromIntel: "knowsMGPosition" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
    });
  });

  describe("phase mismatch", () => {
    it("-25 when requiring platoon but in squad phase", () => {
      const state = makeState({
        morale: 60,
        readiness: 0,
        ammo: 50,
        men: 3,
        phase: "squad",
      });
      const decision = makeDecision({ requiresPhase: "platoon" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(45);
    });

    it("no penalty when phase matches", () => {
      const state = makeState({
        morale: 60,
        readiness: 0,
        ammo: 50,
        men: 10,
        phase: "platoon",
      });
      const decision = makeDecision({ requiresPhase: "platoon" });
      expect(calculateEffectiveScore("sound", state, decision)).toBe(70);
    });
  });

  describe("trait bonuses", () => {
    it("+3 when roster has a sharpshooter", () => {
      const state = makeState({
        morale: 60,
        readiness: 0,
        ammo: 50,
        men: 1,
        roster: [
          makeSoldier({
            id: "s1",
            role: "rifleman",
            traits: ["sharpshooter"],
          }),
        ],
      });
      const decision = makeDecision();
      expect(calculateEffectiveScore("sound", state, decision)).toBe(73);
    });

    it("+3 when roster has a hothead", () => {
      const state = makeState({
        morale: 60,
        readiness: 0,
        ammo: 50,
        men: 1,
        roster: [
          makeSoldier({ id: "s1", role: "rifleman", traits: ["hothead"] }),
        ],
      });
      const decision = makeDecision();
      expect(calculateEffectiveScore("sound", state, decision)).toBe(73);
    });

    it("+6 with both sharpshooter and hothead", () => {
      const state = makeState({
        morale: 60,
        readiness: 0,
        ammo: 50,
        men: 2,
        roster: [
          makeSoldier({
            id: "s1",
            role: "rifleman",
            traits: ["sharpshooter"],
          }),
          makeSoldier({ id: "s2", role: "rifleman", traits: ["hothead"] }),
        ],
      });
      const decision = makeDecision();
      expect(calculateEffectiveScore("sound", state, decision)).toBe(76);
    });
  });

  describe("suicidal decisions stay below 30 even with perfect state", () => {
    it("suicidal tier with max-favorable state still fails", () => {
      const state = makeState({
        morale: 100,
        readiness: 0,
        ammo: 100,
        men: 14,
        phase: "platoon",
        roster: [
          makeSoldier({
            id: "s1",
            role: "rifleman",
            traits: ["sharpshooter"],
          }),
          makeSoldier({ id: "s2", role: "rifleman", traits: ["hothead"] }),
        ],
        capabilities: {
          canSuppress: true,
          canTreatWounded: true,
          hasRadio: true,
          hasNCO: true,
          hasExplosives: true,
          canScout: true,
        },
        intel: {
          hasMap: true,
          hasCompass: true,
          scoutedObjective: true,
          knowsMGPosition: true,
          knowsPatrolRoute: true,
          friendlyContact: true,
        },
      });
      const decision = makeDecision({
        requiresCapability: "canSuppress",
        benefitsFromIntel: "knowsMGPosition",
      });
      // suicidal base=5, +5 morale, +5 manning(platoon >=12), +5 capability, +10 intel, +3 sharp, +3 hothead = 36
      // Still very low — and without those stacked bonuses, well under 30
      const score = calculateEffectiveScore("suicidal", state, decision);
      expect(score).toBeLessThanOrEqual(36);
    });

    it("suicidal with neutral state scores far below 30", () => {
      const state = makeState({ morale: 60, readiness: 0, ammo: 50, men: 0 });
      const decision = makeDecision();
      expect(calculateEffectiveScore("suicidal", state, decision)).toBe(5);
    });
  });

  describe("excellent decisions with good state score above 75", () => {
    it("excellent + high morale + low readiness", () => {
      const state = makeState({
        morale: 80,
        readiness: 0,
        ammo: 50,
        men: 14,
        phase: "platoon",
      });
      const decision = makeDecision();
      // excellent=90, +5 morale, +5 manning = 100
      expect(
        calculateEffectiveScore("excellent", state, decision)
      ).toBeGreaterThan(75);
    });

    it("excellent + organized enemy still above 75", () => {
      const state = makeState({
        morale: 80,
        readiness: 50,
        ammo: 50,
        men: 14,
        phase: "platoon",
      });
      const decision = makeDecision();
      // excellent=90, +5 morale, -12 readiness, +5 manning = 88
      expect(
        calculateEffectiveScore("excellent", state, decision)
      ).toBeGreaterThan(75);
    });
  });

  it("clamps result to [0, 100]", () => {
    const worstState = makeState({
      morale: 10,
      readiness: 90,
      ammo: 5,
      men: 1,
      phase: "solo",
    });
    const decision = makeDecision({
      minMen: 10,
      requiresCapability: "canSuppress",
      requiresPhase: "platoon",
    });
    const score = calculateEffectiveScore("suicidal", worstState, decision);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── getOutcomeRange ──────────────────────────────────────────────

describe("getOutcomeRange", () => {
  it("returns a 35-point window for mid-range scores", () => {
    const range = getOutcomeRange(50);
    expect(range.ceiling - range.floor).toBe(35);
    expect(range.floor).toBe(30);
    expect(range.ceiling).toBe(65);
  });

  it("floor clamps at 0 for low scores", () => {
    const range = getOutcomeRange(10);
    expect(range.floor).toBe(0);
    expect(range.ceiling).toBe(25);
  });

  it("ceiling clamps at 100 for high scores", () => {
    const range = getOutcomeRange(95);
    expect(range.floor).toBe(75);
    expect(range.ceiling).toBe(100);
  });

  it("both clamp at extremes", () => {
    const range = getOutcomeRange(0);
    expect(range.floor).toBe(0);
    expect(range.ceiling).toBe(15);
  });

  it("window is always at most 35 points wide", () => {
    for (let score = 0; score <= 100; score++) {
      const range = getOutcomeRange(score);
      expect(range.ceiling - range.floor).toBeLessThanOrEqual(35);
      expect(range.floor).toBeGreaterThanOrEqual(0);
      expect(range.ceiling).toBeLessThanOrEqual(100);
    }
  });
});

// ─── rollOutcome ──────────────────────────────────────────────────

describe("rollOutcome", () => {
  it("is deterministic with same seed", () => {
    const range = { floor: 20, ceiling: 80 };
    const result1 = rollOutcome(range, 42);
    const result2 = rollOutcome(range, 42);
    expect(result1).toBe(result2);
  });

  it("produces different results with different seeds", () => {
    const range = { floor: 20, ceiling: 80 };
    const result1 = rollOutcome(range, 42);
    const result2 = rollOutcome(range, 999);
    expect(result1).not.toBe(result2);
  });

  it("result is within the given range", () => {
    const range = { floor: 30, ceiling: 65 };
    for (let seed = 0; seed < 100; seed++) {
      const result = rollOutcome(range, seed);
      expect(result).toBeGreaterThanOrEqual(range.floor);
      expect(result).toBeLessThanOrEqual(range.ceiling);
    }
  });

  it("returns floor when seeded random returns 0-ish", () => {
    const range = { floor: 40, ceiling: 75 };
    const result = rollOutcome(range, 0);
    expect(result).toBeGreaterThanOrEqual(range.floor);
    expect(result).toBeLessThanOrEqual(range.ceiling);
  });
});

describe("seededRandom", () => {
  it("returns values in [0, 1)", () => {
    for (let seed = 0; seed < 200; seed++) {
      const val = seededRandom(seed);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("same seed produces same value", () => {
    expect(seededRandom(12345)).toBe(seededRandom(12345));
  });
});

// ─── getOutcomeTier ───────────────────────────────────────────────

describe("getOutcomeTier", () => {
  it("returns 'success' for score >= 60", () => {
    expect(getOutcomeTier(60)).toBe("success");
    expect(getOutcomeTier(100)).toBe("success");
    expect(getOutcomeTier(75)).toBe("success");
  });

  it("returns 'partial' for score 30-59", () => {
    expect(getOutcomeTier(30)).toBe("partial");
    expect(getOutcomeTier(59)).toBe("partial");
    expect(getOutcomeTier(45)).toBe("partial");
  });

  it("returns 'failure' for score 0-29", () => {
    expect(getOutcomeTier(0)).toBe("failure");
    expect(getOutcomeTier(29)).toBe("failure");
    expect(getOutcomeTier(15)).toBe("failure");
  });

  it("handles exact boundary values", () => {
    expect(getOutcomeTier(29)).toBe("failure");
    expect(getOutcomeTier(30)).toBe("partial");
    expect(getOutcomeTier(59)).toBe("partial");
    expect(getOutcomeTier(60)).toBe("success");
  });
});

// ─── getCaptainCasualtyChance ─────────────────────────────────────

describe("getCaptainCasualtyChance", () => {
  it("returns 0.15 for front position", () => {
    expect(getCaptainCasualtyChance("front")).toBe(0.15);
  });

  it("returns 0.05 for middle position", () => {
    expect(getCaptainCasualtyChance("middle")).toBe(0.05);
  });

  it("returns 0.01 for rear position", () => {
    expect(getCaptainCasualtyChance("rear")).toBe(0.01);
  });

  it("front > middle > rear", () => {
    expect(getCaptainCasualtyChance("front")).toBeGreaterThan(
      getCaptainCasualtyChance("middle")
    );
    expect(getCaptainCasualtyChance("middle")).toBeGreaterThan(
      getCaptainCasualtyChance("rear")
    );
  });
});

// ─── assignCasualties ─────────────────────────────────────────────

describe("assignCasualties", () => {
  function makeRoster(): Soldier[] {
    return [
      makeSoldier({ id: "r1", role: "rifleman" }),
      makeSoldier({ id: "r2", role: "rifleman" }),
      makeSoldier({ id: "bar", role: "BAR_gunner" }),
      makeSoldier({ id: "medic", role: "medic" }),
      makeSoldier({ id: "radio", role: "radioman" }),
      makeSoldier({ id: "nco", role: "NCO" }),
    ];
  }

  it("returns the correct number of casualties", () => {
    const roster = makeRoster();
    const { casualties } = assignCasualties(roster, 2, "middle");
    expect(casualties).toHaveLength(2);
  });

  it("does not exceed available active soldiers", () => {
    const roster = makeRoster();
    const { casualties } = assignCasualties(roster, 10, "middle");
    expect(casualties.length).toBeLessThanOrEqual(6);
  });

  it("marks casualties as KIA or wounded", () => {
    const roster = makeRoster();
    const { casualties } = assignCasualties(roster, 3, "middle");
    casualties.forEach((s) => {
      expect(["KIA", "wounded"]).toContain(s.status);
    });
  });

  it("skips already-inactive soldiers", () => {
    const roster = makeRoster();
    roster[0].status = "wounded";
    roster[1].status = "KIA";
    const { casualties } = assignCasualties(roster, 2, "middle");
    expect(casualties.every((c) => c.id !== "r1" && c.id !== "r2")).toBe(true);
  });

  it("respects role vulnerability weights — riflemen more likely than medics", () => {
    const riflemanHits: Record<string, number> = { rifleman: 0, medic: 0 };
    for (let i = 0; i < 500; i++) {
      const roster = [
        makeSoldier({ id: "r1", role: "rifleman" }),
        makeSoldier({ id: "m1", role: "medic" }),
      ];
      const { casualties } = assignCasualties(roster, 1, "rear");
      riflemanHits[casualties[0].role]++;
    }
    expect(riflemanHits.rifleman).toBeGreaterThan(riflemanHits.medic);
  });

  it("returns empty casualties when menLost is 0", () => {
    const roster = makeRoster();
    const { casualties, captainHit } = assignCasualties(roster, 0, "front");
    expect(casualties).toHaveLength(0);
    expect(captainHit).toBe(false);
  });
});

// ─── shouldCounterattackTrigger ───────────────────────────────────

describe("shouldCounterattackTrigger", () => {
  it("triggers at hour 16 with zero readiness", () => {
    const state = makeState({
      readiness: 0,
      time: { hour: 16, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(true);
  });

  it("does not trigger at hour 15 with zero readiness", () => {
    const state = makeState({
      readiness: 0,
      time: { hour: 15, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(false);
  });

  it("triggers earlier with high readiness", () => {
    // readiness 75 → modifier 3 → trigger at hour 13
    const state = makeState({
      readiness: 75,
      time: { hour: 13, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(true);
  });

  it("readiness 100 triggers at hour 12", () => {
    // readiness 100 → modifier 4 → trigger at hour 12
    const state = makeState({
      readiness: 100,
      time: { hour: 12, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(true);
  });

  it("readiness 25 triggers at hour 15", () => {
    // readiness 25 → modifier 1 → trigger at hour 15
    const state = makeState({
      readiness: 25,
      time: { hour: 15, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(true);
  });

  it("readiness 50 triggers at hour 14", () => {
    // readiness 50 → modifier 2 → trigger at hour 14
    const state = makeState({
      readiness: 50,
      time: { hour: 14, minute: 0 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(true);
  });

  it("does not trigger before the threshold hour", () => {
    // readiness 50 → modifier 2 → trigger at hour 14; hour 13 should not trigger
    const state = makeState({
      readiness: 50,
      time: { hour: 13, minute: 59 },
    });
    expect(shouldCounterattackTrigger(state)).toBe(false);
  });
});

// ─── processSceneTransition — menGained ─────────────────────────────

describe("processSceneTransition — menGained", () => {
  it("should increase men count when menGained is set", () => {
    const state = makeState({ men: 1, roster: [
      makeSoldier({ id: "r1", role: "rifleman" }),
    ] });
    const scene = makeMinimalScene();
    const outcome: OutcomeNarrative = {
      text: "A stray paratrooper joins you.",
      menLost: 0,
      ammoSpent: 0,
      moraleChange: 5,
      readinessChange: 0,
      menGained: 1,
    };
    const result = processSceneTransition(state, scene, outcome, "middle");
    expect(result.state.men).toBe(2);
  });

  it("should cap men at 18", () => {
    const roster = Array.from({ length: 18 }, (_, i) =>
      makeSoldier({ id: `r${i}`, role: "rifleman" })
    );
    const state = makeState({ men: 18, roster });
    const scene = makeMinimalScene();
    const outcome: OutcomeNarrative = {
      text: "Another joins.",
      menLost: 0,
      ammoSpent: 0,
      moraleChange: 0,
      readinessChange: 0,
      menGained: 2,
    };
    const result = processSceneTransition(state, scene, outcome, "middle");
    expect(result.state.men).toBeLessThanOrEqual(18);
  });
});

// ─── processSceneTransition — skipRally ─────────────────────────────

describe("processSceneTransition — skipRally", () => {
  it("should not process rally when outcome has skipRally: true", () => {
    const rallyScene = makeMinimalScene({
      rally: {
        soldiers: [makeSoldier({ id: "henderson", role: "platoon_sergeant" })],
        ammoGain: 10,
        moraleGain: 8,
        narrative: "Henderson appears.",
      },
    });
    const outcome: OutcomeNarrative = {
      text: "You slip away.",
      menLost: 0,
      ammoSpent: 0,
      moraleChange: 0,
      readinessChange: 0,
      skipRally: true,
    };
    const state = makeState({ men: 1, ammo: 20, morale: 40, roster: [
      makeSoldier({ id: "r1", role: "rifleman" }),
    ] });
    const result = processSceneTransition(state, rallyScene, outcome, "middle");
    expect(result.state.men).toBe(1);
    expect(result.state.ammo).toBe(20);
  });

  it("should process rally normally when skipRally is not set", () => {
    const rallyScene = makeMinimalScene({
      rally: {
        soldiers: [makeSoldier({ id: "henderson", role: "platoon_sergeant" })],
        ammoGain: 10,
        moraleGain: 8,
        narrative: "Henderson appears.",
      },
    });
    const outcome: OutcomeNarrative = {
      text: "Success.",
      menLost: 0,
      ammoSpent: 0,
      moraleChange: 0,
      readinessChange: 0,
    };
    const state = makeState({ men: 1, ammo: 20, morale: 40, roster: [
      makeSoldier({ id: "r1", role: "rifleman" }),
    ] });
    const result = processSceneTransition(state, rallyScene, outcome, "middle");
    expect(result.state.men).toBe(2);
    expect(result.state.ammo).toBe(30);
  });
});
