import { describe, it, expect } from "vitest";
import type {
  Scenario,
  Decision,
  PlatoonCapabilities,
  IntelFlags,
  GamePhase,
} from "../../src/types/index.ts";

// ─── Validation Types ─────────────────────────────────────────────

export interface ValidationError {
  rule: number;
  sceneId: string;
  decisionId?: string;
  message: string;
}

// ─── Valid Keys ───────────────────────────────────────────────────

const VALID_CAPABILITY_KEYS: (keyof PlatoonCapabilities)[] = [
  "canSuppress",
  "canTreatWounded",
  "hasRadio",
  "hasNCO",
  "hasExplosives",
  "canScout",
];

const VALID_INTEL_KEYS: (keyof IntelFlags)[] = [
  "hasMap",
  "hasCompass",
  "scoutedObjective",
  "knowsMGPosition",
  "knowsPatrolRoute",
  "friendlyContact",
];

const VALID_PHASES: GamePhase[] = ["solo", "squad", "platoon"];

// ─── Rule 1: Every nextScene/nextSceneOnFailure points to valid ID

function validateSceneReferences(
  scenario: Scenario,
  allSceneIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const decision of scenario.decisions) {
    if (!allSceneIds.has(decision.outcome.nextScene)) {
      errors.push({
        rule: 1,
        sceneId: scenario.id,
        decisionId: decision.id,
        message: `nextScene "${decision.outcome.nextScene}" is not a valid scene ID`,
      });
    }
    if (
      decision.outcome.nextSceneOnFailure &&
      !allSceneIds.has(decision.outcome.nextSceneOnFailure)
    ) {
      errors.push({
        rule: 1,
        sceneId: scenario.id,
        decisionId: decision.id,
        message: `nextSceneOnFailure "${decision.outcome.nextSceneOnFailure}" is not a valid scene ID`,
      });
    }
  }

  return errors;
}

// ─── Rule 2: Every scene reachable from starting scene ───────────

function validateReachability(
  scenarios: Scenario[],
  startingSceneId: string
): ValidationError[] {
  if (scenarios.length === 0) return [];

  const sceneMap = new Map(scenarios.map((s) => [s.id, s]));
  const visited = new Set<string>();
  const queue = [startingSceneId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const scene = sceneMap.get(current);
    if (!scene) continue;

    for (const decision of scene.decisions) {
      if (!visited.has(decision.outcome.nextScene)) {
        queue.push(decision.outcome.nextScene);
      }
      if (
        decision.outcome.nextSceneOnFailure &&
        !visited.has(decision.outcome.nextSceneOnFailure)
      ) {
        queue.push(decision.outcome.nextSceneOnFailure);
      }
    }
  }

  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    if (!visited.has(scene.id)) {
      errors.push({
        rule: 2,
        sceneId: scene.id,
        message: `Scene "${scene.id}" is not reachable from starting scene "${startingSceneId}"`,
      });
    }
  }
  return errors;
}

// ─── Rule 3: No dead ends ────────────────────────────────────────

function validateNoDeadEnds(scenarios: Scenario[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    if (scene.decisions.length === 0) {
      errors.push({
        rule: 3,
        sceneId: scene.id,
        message: `Scene "${scene.id}" has no decisions (dead end)`,
      });
    }
    const hasNextScene = scene.decisions.some((d) => d.outcome.nextScene);
    if (scene.decisions.length > 0 && !hasNextScene) {
      errors.push({
        rule: 3,
        sceneId: scene.id,
        message: `Scene "${scene.id}" has decisions but none have a nextScene`,
      });
    }
  }
  return errors;
}

// ─── Rule 4: Every lessonUnlocked matches a lesson ID ────────────

function validateLessonReferences(
  scenarios: Scenario[],
  validLessonIds: Set<string>
): ValidationError[] {
  if (validLessonIds.size === 0) return [];

  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    for (const decision of scene.decisions) {
      const lessonId = decision.outcome.lessonUnlocked;
      if (lessonId && !validLessonIds.has(lessonId)) {
        errors.push({
          rule: 4,
          sceneId: scene.id,
          decisionId: decision.id,
          message: `lessonUnlocked "${lessonId}" does not match any known lesson ID`,
        });
      }
    }
  }
  return errors;
}

// ─── Rule 5: menLost doesn't exceed minMen ───────────────────────

function validateCasualtyLimits(scenarios: Scenario[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    for (const decision of scene.decisions) {
      if (decision.minMen === undefined) continue;
      for (const tier of ["success", "partial", "failure"] as const) {
        const narrative = decision.outcome[tier];
        if (narrative.menLost > decision.minMen) {
          errors.push({
            rule: 5,
            sceneId: scene.id,
            decisionId: decision.id,
            message: `${tier} outcome menLost (${narrative.menLost}) exceeds minMen (${decision.minMen})`,
          });
        }
      }
    }
  }
  return errors;
}

// ─── Rule 6: Solo scenes don't require platoon phase ─────────────

function validatePhaseConsistency(scenarios: Scenario[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    if (scene.act !== 1) continue;

    const isSoloScene =
      scene.id.includes("landing") ||
      scene.id.includes("solo") ||
      /act1_scene_?[0-3]/i.test(scene.id) ||
      /act1_s[0-3]/i.test(scene.id);

    if (!isSoloScene) continue;

    for (const decision of scene.decisions) {
      if (decision.requiresPhase === "platoon") {
        errors.push({
          rule: 6,
          sceneId: scene.id,
          decisionId: decision.id,
          message: `Solo-phase scene has a decision requiring platoon phase`,
        });
      }
    }
  }
  return errors;
}

// ─── Rule 7: Valid capability/intel keys ──────────────────────────

function validateKeyReferences(scenarios: Scenario[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const scene of scenarios) {
    for (const decision of scene.decisions) {
      if (
        decision.requiresCapability &&
        !VALID_CAPABILITY_KEYS.includes(
          decision.requiresCapability as keyof PlatoonCapabilities
        )
      ) {
        errors.push({
          rule: 7,
          sceneId: scene.id,
          decisionId: decision.id,
          message: `requiresCapability "${decision.requiresCapability}" is not a valid PlatoonCapabilities key`,
        });
      }
      if (
        decision.benefitsFromIntel &&
        !VALID_INTEL_KEYS.includes(
          decision.benefitsFromIntel as keyof IntelFlags
        )
      ) {
        errors.push({
          rule: 7,
          sceneId: scene.id,
          decisionId: decision.id,
          message: `benefitsFromIntel "${decision.benefitsFromIntel}" is not a valid IntelFlags key`,
        });
      }
    }
  }
  return errors;
}

// ─── Public API ───────────────────────────────────────────────────

export function validateScenario(
  scenario: Scenario,
  allSceneIds: Set<string>,
  validLessonIds?: Set<string>
): ValidationError[] {
  return [
    ...validateSceneReferences(scenario, allSceneIds),
    ...validateNoDeadEnds([scenario]),
    ...validateCasualtyLimits([scenario]),
    ...validatePhaseConsistency([scenario]),
    ...validateKeyReferences([scenario]),
    ...(validLessonIds
      ? validateLessonReferences([scenario], validLessonIds)
      : []),
  ];
}

export function validateAct(
  scenarios: Scenario[],
  startingSceneId?: string,
  validLessonIds?: Set<string>
): ValidationError[] {
  if (scenarios.length === 0) return [];

  const allSceneIds = new Set(scenarios.map((s) => s.id));
  const start = startingSceneId ?? scenarios[0].id;

  const errors: ValidationError[] = [];

  for (const scenario of scenarios) {
    errors.push(...validateScenario(scenario, allSceneIds, validLessonIds));
  }

  errors.push(...validateReachability(scenarios, start));

  return errors;
}

// ─── Tests ────────────────────────────────────────────────────────

function makeMinimalScenario(
  overrides: Partial<Scenario> & { id: string }
): Scenario {
  return {
    act: 1,
    timeCost: 15,
    narrative: "Test narrative",
    decisions: [
      {
        id: `${overrides.id}_d1`,
        text: "Do something",
        tier: "sound",
        outcome: {
          success: {
            text: "Ok",
            menLost: 0,
            ammoSpent: 0,
            moraleChange: 0,
            readinessChange: 0,
          },
          partial: {
            text: "Meh",
            menLost: 0,
            ammoSpent: 0,
            moraleChange: 0,
            readinessChange: 0,
          },
          failure: {
            text: "Bad",
            menLost: 0,
            ammoSpent: 0,
            moraleChange: 0,
            readinessChange: 0,
          },
          lessonUnlocked: "test_lesson",
          nextScene: overrides.id,
        },
      },
    ],
    ...overrides,
  };
}

function makeLinkedScenarios(): Scenario[] {
  return [
    makeMinimalScenario({
      id: "scene_a",
      decisions: [
        {
          id: "d1",
          text: "Go to B",
          tier: "sound",
          outcome: {
            success: {
              text: "Ok",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            partial: {
              text: "Meh",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            failure: {
              text: "Bad",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            lessonUnlocked: "test_lesson",
            nextScene: "scene_b",
          },
        },
      ],
    }),
    makeMinimalScenario({
      id: "scene_b",
      decisions: [
        {
          id: "d2",
          text: "Go to A",
          tier: "sound",
          outcome: {
            success: {
              text: "Ok",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            partial: {
              text: "Meh",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            failure: {
              text: "Bad",
              menLost: 0,
              ammoSpent: 0,
              moraleChange: 0,
              readinessChange: 0,
            },
            lessonUnlocked: "test_lesson",
            nextScene: "scene_a",
          },
        },
      ],
    }),
  ];
}

describe("validateScenario", () => {
  it("returns no errors for a valid self-referencing scenario", () => {
    const scenario = makeMinimalScenario({ id: "scene_a" });
    const errors = validateScenario(scenario, new Set(["scene_a"]));
    expect(errors).toEqual([]);
  });

  describe("Rule 1: nextScene references", () => {
    it("flags invalid nextScene reference", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].outcome.nextScene = "nonexistent";
      const errors = validateScenario(
        scenario,
        new Set(["scene_a", "scene_b"])
      );
      expect(errors.some((e) => e.rule === 1)).toBe(true);
    });

    it("flags invalid nextSceneOnFailure reference", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].outcome.nextSceneOnFailure = "nonexistent";
      const errors = validateScenario(
        scenario,
        new Set(["scene_a", "scene_b"])
      );
      expect(errors.some((e) => e.rule === 1)).toBe(true);
    });
  });

  describe("Rule 3: no dead ends", () => {
    it("flags scenes with no decisions", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions = [];
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.some((e) => e.rule === 3)).toBe(true);
    });
  });

  describe("Rule 5: menLost vs minMen", () => {
    it("flags when menLost exceeds minMen", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].minMen = 2;
      scenario.decisions[0].outcome.failure.menLost = 5;
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.some((e) => e.rule === 5)).toBe(true);
    });

    it("passes when menLost equals minMen", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].minMen = 3;
      scenario.decisions[0].outcome.failure.menLost = 3;
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.filter((e) => e.rule === 5)).toEqual([]);
    });
  });

  describe("Rule 6: solo scenes and platoon phase", () => {
    it("flags act1 solo scene with platoon requirement", () => {
      const scenario = makeMinimalScenario({ id: "act1_landing", act: 1 });
      scenario.decisions[0].requiresPhase = "platoon";
      const errors = validateScenario(
        scenario,
        new Set(["act1_landing"])
      );
      expect(errors.some((e) => e.rule === 6)).toBe(true);
    });

    it("does not flag act2 scenes", () => {
      const scenario = makeMinimalScenario({ id: "act2_assault", act: 2 });
      scenario.decisions[0].requiresPhase = "platoon";
      const errors = validateScenario(
        scenario,
        new Set(["act2_assault"])
      );
      expect(errors.filter((e) => e.rule === 6)).toEqual([]);
    });
  });

  describe("Rule 7: valid capability/intel keys", () => {
    it("accepts valid capability key", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].requiresCapability = "canSuppress";
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.filter((e) => e.rule === 7)).toEqual([]);
    });

    it("accepts valid intel key", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].benefitsFromIntel = "knowsMGPosition";
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.filter((e) => e.rule === 7)).toEqual([]);
    });
  });

  describe("Rule 4: lesson references", () => {
    it("flags unknown lesson IDs when validLessonIds provided", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].outcome.lessonUnlocked = "unknown_lesson";
      const errors = validateScenario(
        scenario,
        new Set(["scene_a"]),
        new Set(["real_lesson"])
      );
      expect(errors.some((e) => e.rule === 4)).toBe(true);
    });

    it("passes when lesson IDs are valid", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].outcome.lessonUnlocked = "real_lesson";
      const errors = validateScenario(
        scenario,
        new Set(["scene_a"]),
        new Set(["real_lesson"])
      );
      expect(errors.filter((e) => e.rule === 4)).toEqual([]);
    });

    it("skips lesson validation when no validLessonIds provided", () => {
      const scenario = makeMinimalScenario({ id: "scene_a" });
      scenario.decisions[0].outcome.lessonUnlocked = "anything";
      const errors = validateScenario(scenario, new Set(["scene_a"]));
      expect(errors.filter((e) => e.rule === 4)).toEqual([]);
    });
  });
});

describe("validateAct", () => {
  it("returns no errors for a valid linked act", () => {
    const scenarios = makeLinkedScenarios();
    const errors = validateAct(scenarios, "scene_a");
    expect(errors).toEqual([]);
  });

  it("returns empty array for empty scenarios", () => {
    const errors = validateAct([]);
    expect(errors).toEqual([]);
  });

  describe("Rule 2: reachability", () => {
    it("flags unreachable scenes", () => {
      const scenarios = [
        ...makeLinkedScenarios(),
        makeMinimalScenario({ id: "orphan_scene" }),
      ];
      const errors = validateAct(scenarios, "scene_a");
      expect(errors.some((e) => e.rule === 2 && e.sceneId === "orphan_scene")).toBe(
        true
      );
    });
  });

  it("runs all 7 validation rules across an act", () => {
    const badScenarios: Scenario[] = [
      {
        id: "scene_a",
        act: 1,
        timeCost: 10,
        narrative: "Test",
        decisions: [
          {
            id: "d1",
            text: "Do",
            tier: "sound",
            minMen: 2,
            outcome: {
              success: {
                text: "Ok",
                menLost: 0,
                ammoSpent: 0,
                moraleChange: 0,
                readinessChange: 0,
              },
              partial: {
                text: "Meh",
                menLost: 0,
                ammoSpent: 0,
                moraleChange: 0,
                readinessChange: 0,
              },
              failure: {
                text: "Bad",
                menLost: 5,
                ammoSpent: 0,
                moraleChange: 0,
                readinessChange: 0,
              },
              lessonUnlocked: "bogus",
              nextScene: "nonexistent",
            },
          },
        ],
      },
    ];
    const errors = validateAct(badScenarios, "scene_a", new Set(["real"]));
    expect(errors.some((e) => e.rule === 1)).toBe(true);
    expect(errors.some((e) => e.rule === 4)).toBe(true);
    expect(errors.some((e) => e.rule === 5)).toBe(true);
  });
});

describe("placeholder: validators importable and callable", () => {
  it("validateScenario is callable with empty inputs", () => {
    const result = validateScenario(
      makeMinimalScenario({ id: "test" }),
      new Set(["test"])
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it("validateAct is callable with empty array", () => {
    const result = validateAct([]);
    expect(Array.isArray(result)).toBe(true);
  });
});
