import { describe, it, expect } from "vitest";
import {
  createInitialState,
  createInitialStateWithDifficulty,
  getPhase,
  deriveCapabilities,
  getAlertStatus,
  advanceTime,
  applyRally,
  clamp,
  parseTime,
  isAfter,
  formatTime,
  promoteToSecondInCommand,
} from "../../src/engine/gameState.ts";
import type { Soldier, GameState } from "../../src/types/index.ts";

// ─── Helpers ──────────────────────────────────────────────────────

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

// ─── createInitialState ───────────────────────────────────────────

describe("createInitialState", () => {
  it("returns correct starting values per the spec", () => {
    const state = createInitialState();
    expect(state.men).toBe(0);
    expect(state.ammo).toBe(5);
    expect(state.morale).toBe(40);
    expect(state.readiness).toBe(10);
    expect(state.time).toEqual({ hour: 1, minute: 15 });
    expect(state.phase).toBe("solo");
    expect(state.act).toBe(1);
    expect(state.currentScene).toBe("act1_landing");
  });

  it("starts with empty roster and no 2IC", () => {
    const state = createInitialState();
    expect(state.roster).toEqual([]);
    expect(state.secondInCommand).toBeNull();
  });

  it("starts with all intel false except none", () => {
    const state = createInitialState();
    expect(state.intel.hasMap).toBe(false);
    expect(state.intel.hasCompass).toBe(false);
    expect(state.intel.scoutedObjective).toBe(false);
    expect(state.intel.knowsMGPosition).toBe(false);
    expect(state.intel.knowsPatrolRoute).toBe(false);
    expect(state.intel.friendlyContact).toBe(false);
  });

  it("starts with correct capabilities for solo phase", () => {
    const state = createInitialState();
    expect(state.capabilities.canSuppress).toBe(false);
    expect(state.capabilities.canTreatWounded).toBe(false);
    expect(state.capabilities.hasRadio).toBe(false);
    expect(state.capabilities.hasNCO).toBe(false);
    expect(state.capabilities.hasExplosives).toBe(true);
    expect(state.capabilities.canScout).toBe(false);
  });

  it("starts with milestones", () => {
    const state = createInitialState();
    expect(state.milestones.length).toBeGreaterThan(0);
    expect(state.milestones.every((m) => m.status === "pending")).toBe(true);
  });

  it("starts with empty lessons and visited scenes", () => {
    const state = createInitialState();
    expect(state.wikiUnlocked).toEqual([]);
    expect(state.scenesVisited).toEqual([]);
  });
});

// ─── getPhase ─────────────────────────────────────────────────────

describe("getPhase", () => {
  it("returns 'solo' when men is 0", () => {
    expect(getPhase(0)).toBe("solo");
  });

  it("returns 'solo' when men is 1", () => {
    expect(getPhase(1)).toBe("solo");
  });

  it("returns 'squad' when men is 2", () => {
    expect(getPhase(2)).toBe("squad");
  });

  it("returns 'squad' when men is 5", () => {
    expect(getPhase(5)).toBe("squad");
  });

  it("returns 'platoon' when men is 6", () => {
    expect(getPhase(6)).toBe("platoon");
  });

  it("returns 'platoon' when men is 18", () => {
    expect(getPhase(18)).toBe("platoon");
  });

  it("transitions at exact boundaries: 1→solo, 2→squad, 6→platoon", () => {
    expect(getPhase(1)).toBe("solo");
    expect(getPhase(2)).toBe("squad");
    expect(getPhase(5)).toBe("squad");
    expect(getPhase(6)).toBe("platoon");
  });
});

// ─── deriveCapabilities ───────────────────────────────────────────

describe("deriveCapabilities", () => {
  it("returns all false with empty roster", () => {
    const caps = deriveCapabilities([], 50);
    expect(caps.canSuppress).toBe(false);
    expect(caps.canTreatWounded).toBe(false);
    expect(caps.hasRadio).toBe(false);
    expect(caps.hasNCO).toBe(false);
    expect(caps.hasExplosives).toBe(true);
    expect(caps.canScout).toBe(false);
  });

  it("canSuppress is true with BAR_gunner", () => {
    const roster = [makeSoldier({ id: "bar", role: "BAR_gunner" })];
    expect(deriveCapabilities(roster, 50).canSuppress).toBe(true);
  });

  it("canSuppress is true with MG_gunner", () => {
    const roster = [makeSoldier({ id: "mg", role: "MG_gunner" })];
    expect(deriveCapabilities(roster, 50).canSuppress).toBe(true);
  });

  it("canTreatWounded is true with medic", () => {
    const roster = [makeSoldier({ id: "m", role: "medic" })];
    expect(deriveCapabilities(roster, 50).canTreatWounded).toBe(true);
  });

  it("hasRadio is true with radioman", () => {
    const roster = [makeSoldier({ id: "r", role: "radioman" })];
    expect(deriveCapabilities(roster, 50).hasRadio).toBe(true);
  });

  it("hasNCO is true with NCO", () => {
    const roster = [makeSoldier({ id: "n", role: "NCO" })];
    expect(deriveCapabilities(roster, 50).hasNCO).toBe(true);
  });

  it("hasNCO is true with platoon_sergeant", () => {
    const roster = [makeSoldier({ id: "ps", role: "platoon_sergeant" })];
    expect(deriveCapabilities(roster, 50).hasNCO).toBe(true);
  });

  it("hasExplosives is true when ammo > 10", () => {
    expect(deriveCapabilities([], 11).hasExplosives).toBe(true);
  });

  it("hasExplosives is false when ammo <= 10", () => {
    expect(deriveCapabilities([], 10).hasExplosives).toBe(false);
    expect(deriveCapabilities([], 5).hasExplosives).toBe(false);
  });

  it("canScout is true with 2+ active soldiers", () => {
    const roster = [
      makeSoldier({ id: "s1", role: "rifleman" }),
      makeSoldier({ id: "s2", role: "rifleman" }),
    ];
    expect(deriveCapabilities(roster, 50).canScout).toBe(true);
  });

  it("canScout is false with < 2 active soldiers", () => {
    const roster = [makeSoldier({ id: "s1", role: "rifleman" })];
    expect(deriveCapabilities(roster, 50).canScout).toBe(false);
  });

  it("ignores non-active soldiers for all capabilities", () => {
    const roster = [
      makeSoldier({ id: "bar", role: "BAR_gunner", status: "KIA" }),
      makeSoldier({ id: "m", role: "medic", status: "wounded" }),
      makeSoldier({ id: "r", role: "radioman", status: "missing" }),
    ];
    const caps = deriveCapabilities(roster, 50);
    expect(caps.canSuppress).toBe(false);
    expect(caps.canTreatWounded).toBe(false);
    expect(caps.hasRadio).toBe(false);
    expect(caps.canScout).toBe(false);
  });

  it("derives full platoon capabilities from mixed roster", () => {
    const roster = [
      makeSoldier({ id: "r1", role: "rifleman" }),
      makeSoldier({ id: "r2", role: "rifleman" }),
      makeSoldier({ id: "bar", role: "BAR_gunner" }),
      makeSoldier({ id: "med", role: "medic" }),
      makeSoldier({ id: "rad", role: "radioman" }),
      makeSoldier({ id: "nco", role: "NCO" }),
    ];
    const caps = deriveCapabilities(roster, 50);
    expect(caps.canSuppress).toBe(true);
    expect(caps.canTreatWounded).toBe(true);
    expect(caps.hasRadio).toBe(true);
    expect(caps.hasNCO).toBe(true);
    expect(caps.hasExplosives).toBe(true);
    expect(caps.canScout).toBe(true);
  });
});

// ─── getAlertStatus ───────────────────────────────────────────────

describe("getAlertStatus", () => {
  it("CONFUSED for readiness < 25", () => {
    expect(getAlertStatus(0)).toBe("CONFUSED");
    expect(getAlertStatus(24)).toBe("CONFUSED");
  });

  it("ALERTED for readiness 25-49", () => {
    expect(getAlertStatus(25)).toBe("ALERTED");
    expect(getAlertStatus(49)).toBe("ALERTED");
  });

  it("ORGANIZED for readiness 50-74", () => {
    expect(getAlertStatus(50)).toBe("ORGANIZED");
    expect(getAlertStatus(74)).toBe("ORGANIZED");
  });

  it("FORTIFIED for readiness >= 75", () => {
    expect(getAlertStatus(75)).toBe("FORTIFIED");
    expect(getAlertStatus(100)).toBe("FORTIFIED");
  });

  it("transitions at exact boundaries", () => {
    expect(getAlertStatus(24)).toBe("CONFUSED");
    expect(getAlertStatus(25)).toBe("ALERTED");
    expect(getAlertStatus(49)).toBe("ALERTED");
    expect(getAlertStatus(50)).toBe("ORGANIZED");
    expect(getAlertStatus(74)).toBe("ORGANIZED");
    expect(getAlertStatus(75)).toBe("FORTIFIED");
  });
});

// ─── advanceTime ──────────────────────────────────────────────────

describe("advanceTime", () => {
  it("advances minutes within the same hour", () => {
    expect(advanceTime({ hour: 3, minute: 15 }, 20)).toEqual({
      hour: 3,
      minute: 35,
    });
  });

  it("rolls over to next hour", () => {
    expect(advanceTime({ hour: 3, minute: 45 }, 30)).toEqual({
      hour: 4,
      minute: 15,
    });
  });

  it("wraps past midnight (hour 24 → hour 0)", () => {
    expect(advanceTime({ hour: 23, minute: 30 }, 60)).toEqual({
      hour: 0,
      minute: 30,
    });
  });

  it("wraps past midnight with large advance", () => {
    expect(advanceTime({ hour: 22, minute: 0 }, 180)).toEqual({
      hour: 1,
      minute: 0,
    });
  });

  it("handles zero-minute advance", () => {
    expect(advanceTime({ hour: 5, minute: 30 }, 0)).toEqual({
      hour: 5,
      minute: 30,
    });
  });

  it("handles multi-hour advance", () => {
    expect(advanceTime({ hour: 1, minute: 15 }, 300)).toEqual({
      hour: 6,
      minute: 15,
    });
  });

  it("handles full-day wrap", () => {
    expect(advanceTime({ hour: 0, minute: 0 }, 1440)).toEqual({
      hour: 0,
      minute: 0,
    });
  });
});

// ─── Time utilities ───────────────────────────────────────────────

describe("parseTime", () => {
  it("parses military time strings", () => {
    expect(parseTime("0100")).toEqual({ hour: 1, minute: 0 });
    expect(parseTime("0630")).toEqual({ hour: 6, minute: 30 });
    expect(parseTime("2359")).toEqual({ hour: 23, minute: 59 });
  });
});

describe("isAfter", () => {
  it("returns true when current is after target", () => {
    expect(isAfter({ hour: 5, minute: 0 }, { hour: 4, minute: 0 })).toBe(true);
  });

  it("returns false when current equals target", () => {
    expect(isAfter({ hour: 5, minute: 0 }, { hour: 5, minute: 0 })).toBe(
      false
    );
  });

  it("returns false when current is before target", () => {
    expect(isAfter({ hour: 3, minute: 0 }, { hour: 4, minute: 0 })).toBe(
      false
    );
  });
});

describe("formatTime", () => {
  it("formats with zero-padding", () => {
    expect(formatTime({ hour: 1, minute: 5 })).toBe("0105");
    expect(formatTime({ hour: 23, minute: 59 })).toBe("2359");
    expect(formatTime({ hour: 0, minute: 0 })).toBe("0000");
  });
});

// ─── applyRally ───────────────────────────────────────────────────

describe("applyRally", () => {
  it("increases men count by number of soldiers found", () => {
    const state = createInitialState();
    const soldiers = [
      makeSoldier({ id: "s1", role: "rifleman" }),
      makeSoldier({ id: "s2", role: "rifleman" }),
    ];
    const newState = applyRally(state, soldiers, 10, 5);
    expect(newState.men).toBe(2);
  });

  it("adds soldiers to roster", () => {
    const state = createInitialState();
    const soldiers = [makeSoldier({ id: "s1", role: "NCO" })];
    const newState = applyRally(state, soldiers, 5, 3);
    expect(newState.roster).toHaveLength(1);
    expect(newState.roster[0].id).toBe("s1");
  });

  it("increases ammo clamped to 100", () => {
    const state: GameState = { ...createInitialState(), ammo: 95 };
    const newState = applyRally(state, [], 10, 0);
    expect(newState.ammo).toBe(100);
  });

  it("increases morale clamped to 100", () => {
    const state: GameState = { ...createInitialState(), morale: 98 };
    const newState = applyRally(state, [], 0, 5);
    expect(newState.morale).toBe(100);
  });

  it("updates phase based on new men count", () => {
    const state = createInitialState();
    const soldiers = Array.from({ length: 6 }, (_, i) =>
      makeSoldier({ id: `s${i}`, role: "rifleman" })
    );
    const newState = applyRally(state, soldiers, 10, 5);
    expect(newState.phase).toBe("platoon");
  });

  it("recalculates capabilities from updated roster", () => {
    const state = createInitialState();
    const soldiers = [
      makeSoldier({ id: "bar", role: "BAR_gunner" }),
      makeSoldier({ id: "med", role: "medic" }),
    ];
    const newState = applyRally(state, soldiers, 10, 5);
    expect(newState.capabilities.canSuppress).toBe(true);
    expect(newState.capabilities.canTreatWounded).toBe(true);
    expect(newState.capabilities.canScout).toBe(true);
  });

  it("assigns 2IC on first NCO rally when no existing 2IC", () => {
    const state = createInitialState();
    const soldiers = [
      makeSoldier({
        id: "ps",
        role: "platoon_sergeant",
        rank: "SSgt",
        traits: ["veteran"],
      }),
    ];
    const newState = applyRally(state, soldiers, 5, 3);
    expect(newState.secondInCommand).not.toBeNull();
    expect(newState.secondInCommand!.soldier.id).toBe("ps");
  });

  it("does not replace existing 2IC on subsequent rallies", () => {
    const existingSgt = makeSoldier({
      id: "ps",
      role: "platoon_sergeant",
      rank: "SSgt",
      traits: ["veteran"],
    });
    const state: GameState = {
      ...createInitialState(),
      roster: [existingSgt],
      secondInCommand: {
        soldier: existingSgt,
        competence: "veteran",
        alive: true,
      },
    };
    const newSoldiers = [
      makeSoldier({ id: "nco", role: "NCO", rank: "Sgt" }),
    ];
    const newState = applyRally(state, newSoldiers, 5, 3);
    expect(newState.secondInCommand!.soldier.id).toBe("ps");
  });
});

// ─── clamp ────────────────────────────────────────────────────────

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

// ─── promoteToSecondInCommand ─────────────────────────────────────

describe("promoteToSecondInCommand", () => {
  it("prefers platoon_sergeant over NCO", () => {
    const roster = [
      makeSoldier({ id: "ps", role: "platoon_sergeant", rank: "SSgt" }),
      makeSoldier({ id: "nco", role: "NCO", rank: "Sgt" }),
    ];
    const result = promoteToSecondInCommand(roster);
    expect(result!.soldier.id).toBe("ps");
  });

  it("falls back to NCO when no platoon_sergeant", () => {
    const roster = [
      makeSoldier({ id: "nco", role: "NCO", rank: "Sgt" }),
      makeSoldier({ id: "r1", role: "rifleman" }),
    ];
    const result = promoteToSecondInCommand(roster);
    expect(result!.soldier.id).toBe("nco");
    expect(result!.competence).toBe("green");
  });

  it("NCO with natural_leader trait gets veteran competence", () => {
    const roster = [
      makeSoldier({
        id: "nco",
        role: "NCO",
        rank: "Sgt",
        traits: ["natural_leader"],
      }),
    ];
    const result = promoteToSecondInCommand(roster);
    expect(result!.competence).toBe("veteran");
  });

  it("returns null when no eligible soldiers", () => {
    const roster = [
      makeSoldier({ id: "r1", role: "rifleman", rank: "Pvt" }),
      makeSoldier({ id: "r2", role: "rifleman", rank: "PFC" }),
    ];
    const result = promoteToSecondInCommand(roster);
    expect(result).toBeNull();
  });

  it("skips non-active soldiers", () => {
    const roster = [
      makeSoldier({
        id: "ps",
        role: "platoon_sergeant",
        rank: "SSgt",
        status: "KIA",
      }),
      makeSoldier({ id: "r1", role: "rifleman", rank: "Pvt" }),
    ];
    const result = promoteToSecondInCommand(roster);
    expect(result).toBeNull();
  });
});

describe("createInitialState — difficulty fields", () => {
  it("includes difficulty defaulting to easy", () => {
    const state = createInitialState();
    expect(state.difficulty).toBe("easy");
  });

  it("includes revealTokensRemaining defaulting to 0", () => {
    const state = createInitialState();
    expect(state.revealTokensRemaining).toBe(0);
  });

  it("includes currentPhase defaulting to situation", () => {
    const state = createInitialState();
    expect(state.currentPhase).toBe("situation");
  });
});

describe("createInitialStateWithDifficulty", () => {
  it("easy mode: 0 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("easy");
    expect(state.difficulty).toBe("easy");
    expect(state.revealTokensRemaining).toBe(0);
  });

  it("medium mode: 5 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("medium");
    expect(state.difficulty).toBe("medium");
    expect(state.revealTokensRemaining).toBe(5);
  });

  it("hardcore mode: 0 reveal tokens", () => {
    const state = createInitialStateWithDifficulty("hardcore");
    expect(state.difficulty).toBe("hardcore");
    expect(state.revealTokensRemaining).toBe(0);
  });
});
