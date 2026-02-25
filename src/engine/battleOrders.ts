import type { BattleOrders, Milestone, GameState } from "../types/index.ts";
import { isAfter, parseTime } from "./gameState.ts";

export const BATTLE_ORDERS: BattleOrders = {
  milestones: [
    {
      id: "drop",
      time: "0100",
      description: "Drop on DZ C. Rally at assembly area.",
      status: "achieved",
    },
    {
      id: "rally_complete",
      time: "0400",
      description: "Assembly complete. Move to objective area.",
      status: "pending",
    },
    {
      id: "h_hour",
      time: "0600",
      description: "H-HOUR. Beach landings begin.",
      status: "pending",
    },
    {
      id: "crossroads_secured",
      time: "0900",
      description:
        "Crossroads SECURED. Establish defensive perimeter.",
      status: "pending",
    },
    {
      id: "resupply",
      time: "1200",
      description:
        "Resupply expected from beach elements. Ensure position is secure.",
      status: "pending",
    },
    {
      id: "relief",
      time: "1800",
      description:
        "Relief expected from 4th Infantry Division. Maintain position.",
      status: "pending",
    },
    {
      id: "end_operational_period",
      time: "0100",
      description: "End of operational period.",
      status: "pending",
    },
  ],
};

export function checkMilestones(
  milestones: Milestone[],
  state: GameState
): Milestone[] {
  return milestones.map((m) => {
    if (m.status !== "pending") return m;

    const milestoneTime = parseTime(m.time);

    if (isAfter(state.time, milestoneTime)) {
      return { ...m, status: "missed" as const };
    }

    return m;
  });
}

export function achieveMilestone(
  milestones: Milestone[],
  milestoneId: string
): Milestone[] {
  return milestones.map((m) => {
    if (m.id === milestoneId && m.status === "pending") {
      return { ...m, status: "achieved" as const };
    }
    return m;
  });
}
