import { describe, expect, it } from "vitest";
import { checkMilestones } from "../../src/engine/battleOrders.ts";
import { createInitialState } from "../../src/engine/gameState.ts";
import type { GameState } from "../../src/types/index.ts";

function withState(state: GameState, overrides: Partial<GameState>): GameState {
  return { ...state, ...overrides };
}

describe("checkMilestones day-aware timing", () => {
  it("does not immediately miss end_operational_period at campaign start", () => {
    const state = createInitialState();
    const updated = checkMilestones(state.milestones, state);
    const end = updated.find((m) => m.id === "end_operational_period");
    expect(end?.status).toBe("pending");
  });

  it("marks end_operational_period missed only after day 1 passes 0100", () => {
    const start = createInitialState();

    const sameDayLate = withState(start, {
      day: 0,
      time: { hour: 23, minute: 59 },
    });
    const sameDayChecked = checkMilestones(sameDayLate.milestones, sameDayLate);
    expect(
      sameDayChecked.find((m) => m.id === "end_operational_period")?.status
    ).toBe("pending");

    const nextDayBoundary = withState(start, {
      day: 1,
      time: { hour: 1, minute: 0 },
    });
    const boundaryChecked = checkMilestones(nextDayBoundary.milestones, nextDayBoundary);
    expect(
      boundaryChecked.find((m) => m.id === "end_operational_period")?.status
    ).toBe("pending");

    const nextDayLate = withState(start, {
      day: 1,
      time: { hour: 1, minute: 1 },
    });
    const nextDayChecked = checkMilestones(nextDayLate.milestones, nextDayLate);
    expect(
      nextDayChecked.find((m) => m.id === "end_operational_period")?.status
    ).toBe("missed");
  });

  it("still marks same-day milestones missed after their time passes", () => {
    const state = createInitialState();
    const afterRallyDeadline = withState(state, {
      day: 0,
      time: { hour: 4, minute: 1 },
    });

    const checked = checkMilestones(afterRallyDeadline.milestones, afterRallyDeadline);
    expect(checked.find((m) => m.id === "rally_complete")?.status).toBe("missed");
  });
});
