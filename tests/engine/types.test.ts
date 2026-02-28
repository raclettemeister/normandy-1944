import { describe, it, expect } from "vitest";
import type {
  EnhancedDMEvaluation,
  PersonnelAssignment,
  GameEvent,
  PlatoonAudit,
  PrepEffects,
  PreparationPhase,
} from "../../src/types/index.ts";

describe("Enhanced type definitions exist", () => {
  it("EnhancedDMEvaluation has personnelScore field", () => {
    const eval_: EnhancedDMEvaluation = {
      tier: "sound",
      reasoning: "test",
      narrative: "test",
      matchedDecisionId: "d1",
      matchConfidence: 0.9,
      tacticalReasoning: "solid plan",
      personnelScore: 75,
      assignments: [],
      assignmentIssues: [],
      assignmentBonuses: [],
      soldierReactions: [],
      secondInCommandReaction: "good plan",
      vulnerablePersonnel: [],
      capabilityRisks: [],
      planSummary: "test",
    };
    expect(eval_.personnelScore).toBe(75);
  });

  it("PersonnelAssignment has fitScore", () => {
    const assignment: PersonnelAssignment = {
      soldierId: "henderson",
      assignedTask: "point man",
      fitScore: 80,
      reasoning: "veteran NCO",
    };
    expect(assignment.fitScore).toBe(80);
  });

  it("GameEvent covers all event types from design doc", () => {
    const events: GameEvent[] = [
      { type: "scene_complete", sceneId: "act1_landing", summary: "landed safely", timeCost: 15, timestamp: "0115" },
      { type: "decision_made", sceneId: "act1_landing", prompt: "check gear", tier: "excellent", personnelScore: 0, timestamp: "0115" },
      { type: "casualty", sceneId: "act1_patrol", soldierId: "doyle", name: "Doyle", cause: "gunshot", status: "wounded", timestamp: "0220" },
      { type: "rally", sceneId: "act1_sergeant", soldiers: ["henderson"], description: "found Henderson", timestamp: "0200" },
      { type: "capability_change", sceneId: "act1_farmhouse", capability: "canTreatWounded", gained: true, reason: "Rivera joined", timestamp: "0240" },
      { type: "intel_gained", sceneId: "act1_patrol", flag: "hasMap", source: "captured documents", timestamp: "0220" },
      { type: "trait_triggered", sceneId: "act1_patrol", soldierId: "doyle", trait: "green", effect: "froze", timestamp: "0220" },
      { type: "relationship_moment", sceneId: "act1_patrol", soldiers: ["kowalski", "novak"], momentType: "brothers", description: "covered each other", timestamp: "0220" },
      { type: "assignment_consequence", sceneId: "act1_patrol", soldierId: "rivera", task: "point", outcome: "medic at risk", timestamp: "0220" },
      { type: "resource_snapshot", sceneId: "act1_patrol", men: 12, ammo: 65, morale: 70, readiness: 28, time: "0240", timestamp: "0240" },
    ];
    expect(events).toHaveLength(10);
  });

  it("PlatoonAudit has required fields", () => {
    const audit: PlatoonAudit = {
      currentCapabilities: {
        canSuppress: true,
        canTreatWounded: true,
        hasRadio: false,
        hasNCO: true,
        hasExplosives: false,
        canScout: true,
      },
      criticalRisks: ["only one medic"],
      personnelGaps: ["no radioman"],
      relationshipStatus: ["kowalski-novak brothers"],
      effectiveStrength: 12,
    };
    expect(audit.effectiveStrength).toBe(12);
  });

  it("PreparationPhase tracks prep state", () => {
    const phase: PreparationPhase = {
      availablePreps: [],
      completedPreps: ["defensive_positions"],
      counterattackTriggered: false,
      totalTimePreparing: 90,
    };
    expect(phase.counterattackTriggered).toBe(false);
  });

  it("PrepEffects modifies counterattack outcomes", () => {
    const effects: PrepEffects = {
      casualtyReduction: 2,
      earlyWarning: true,
      ammoRedistributed: true,
      medicalReady: true,
      moraleBonus: 10,
      additionalMen: 3,
    };
    expect(effects.casualtyReduction).toBe(2);
  });
});
