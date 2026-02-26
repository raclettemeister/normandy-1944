import type { Decision, BalanceEnvelope, BalanceEnvelopeRange, OutcomeTier } from "../types/index.ts";

type OutcomeField = "menLost" | "ammoSpent" | "moraleChange" | "readinessChange";

const FIELDS: OutcomeField[] = ["menLost", "ammoSpent", "moraleChange", "readinessChange"];
const TIERS: OutcomeTier[] = ["success", "partial", "failure"];
const FAILURE_BUFFER = 1;

function emptyRange(): BalanceEnvelopeRange {
  return {
    menLost: [0, 0],
    ammoSpent: [0, 0],
    moraleChange: [0, 0],
    readinessChange: [0, 0],
  };
}

export function deriveBalanceEnvelope(decisions: Decision[]): BalanceEnvelope {
  const envelope: BalanceEnvelope = {
    success: emptyRange(),
    partial: emptyRange(),
    failure: emptyRange(),
  };

  if (decisions.length === 0) {
    envelope.failure.menLost = [0, FAILURE_BUFFER];
    return envelope;
  }

  for (const tier of TIERS) {
    for (const field of FIELDS) {
      const values = decisions.map((d) => d.outcome[tier][field]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bufferedMax = tier === "failure" && field === "menLost" ? max + FAILURE_BUFFER : max;
      envelope[tier][field] = [min, bufferedMax];
    }
  }

  return envelope;
}
