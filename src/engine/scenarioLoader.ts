import type {
  Scenario,
  Decision,
  GameState,
  SecondInCommandComment,
  CommentTrigger,
} from "../types/index.ts";

// ─── Scenario Registry ─────────────────────────────────────────────
// Content files register scenarios here at import time.
// The loader retrieves them by act or ID.

const scenarioRegistry = new Map<string, Scenario>();

export function registerScenario(scenario: Scenario): void {
  scenarioRegistry.set(scenario.id, scenario);
}

export function registerScenarios(scenarios: Scenario[]): void {
  for (const s of scenarios) {
    registerScenario(s);
  }
}

export function clearScenarios(): void {
  scenarioRegistry.clear();
}

// ─── Public API ────────────────────────────────────────────────────

export function loadScenarios(act: number): Scenario[] {
  const results: Scenario[] = [];
  for (const scenario of scenarioRegistry.values()) {
    if (scenario.act === act) {
      results.push(scenario);
    }
  }
  return results;
}

export function getScene(id: string): Scenario | undefined {
  return scenarioRegistry.get(id);
}

function narrativeAltMatches(key: string, state: GameState): boolean {
  switch (key) {
    case "solo":
      return state.phase === "solo" || state.men <= 1;
    case "squad":
      return state.phase !== "solo" && state.men > 1;
    case "hasSecondInCommand":
      return !!state.secondInCommand?.alive;
    case "low_morale":
      return state.morale < 30;
    default:
      if (key in state.intel) {
        return Boolean(state.intel[key as keyof GameState["intel"]]);
      }
      return state.wikiUnlocked.includes(key);
  }
}

export function resolveSceneNarrative(scene: Scenario, state: GameState): string {
  if (!scene.narrativeAlt) return scene.narrative;

  for (const [key, text] of Object.entries(scene.narrativeAlt)) {
    if (narrativeAltMatches(key, state)) return text;
  }

  return scene.narrative;
}

export function getAvailableDecisions(
  scene: Scenario,
  state: GameState
): Decision[] {
  return scene.decisions.filter((d) => isDecisionVisible(d, state));
}

function isDecisionVisible(decision: Decision, state: GameState): boolean {
  const cond = decision.visibleIf;
  if (!cond) return true;

  if (cond.hasLesson && !state.wikiUnlocked.includes(cond.hasLesson)) {
    return false;
  }

  if (cond.hasIntel) {
    const flag = cond.hasIntel as keyof typeof state.intel;
    if (!state.intel[flag]) return false;
  }

  if (cond.minMen !== undefined && state.men < cond.minMen) {
    return false;
  }

  if (cond.phase) {
    const phaseOrder = { solo: 0, squad: 1, platoon: 2 } as const;
    if (phaseOrder[state.phase] < phaseOrder[cond.phase]) {
      return false;
    }
  }

  return true;
}

// ─── Second-in-Command Comments ────────────────────────────────────

const VETERAN_COMMENTS: SecondInCommandComment[] = [
  {
    trigger: { type: "low_ammo", threshold: 20 },
    text: "Mon capitaine, on brule les munitions. Il faudrait peut-etre economiser pour l'objectif.",
  },
  {
    trigger: { type: "low_morale", threshold: 30 },
    text: "Les hommes sont nerveux, mon capitaine. Il nous faut une victoire — quelque chose pour les calmer.",
  },
  {
    trigger: { type: "low_men", threshold: 6 },
    text: "On n'est plus qu'une poignee, mon capitaine. Pas assez pour un assaut propre. Peut-etre trouver autre chose.",
  },
  {
    trigger: { type: "high_readiness", threshold: 60 },
    text: "Ils sont retranches maintenant, mon capitaine. Ce ne sera pas facile. Il faut etre malins sur le plan.",
  },
  {
    trigger: { type: "time_surplus" },
    text: "On a de l'avance. On pourrait utiliser le temps pour reconnaitre l'approche.",
  },
  {
    trigger: { type: "bad_decision", tier: "suicidal" },
    text: "Avec tout le respect, mon capitaine — c'est du suicide. Il doit y avoir une autre solution.",
  },
  {
    trigger: { type: "bad_decision", tier: "reckless" },
    text: "Mon capitaine, c'est risque. Vraiment risque. J'aimerais un meilleur plan avant d'engager les hommes.",
  },
];

const GREEN_COMMENTS: SecondInCommandComment[] = [
  {
    trigger: { type: "low_ammo", threshold: 20 },
    text: "Euh... on n'a pas beaucoup de balles, mon capitaine.",
  },
  {
    trigger: { type: "low_morale", threshold: 30 },
    text: "Les gars ont l'air assez effrayes, mon capitaine.",
  },
  {
    trigger: { type: "low_men", threshold: 6 },
    text: "Il... ne reste plus beaucoup de nous, mon capitaine.",
  },
  {
    trigger: { type: "high_readiness", threshold: 60 },
    text: "On dirait beaucoup de tirs devant, mon capitaine.",
  },
  {
    trigger: { type: "time_surplus" },
    text: "Qu'est-ce qu'on fait maintenant, mon capitaine?",
  },
  {
    trigger: { type: "bad_decision", tier: "suicidal" },
    text: "Oui mon capitaine, tout ce que vous voulez.",
  },
  {
    trigger: { type: "bad_decision", tier: "reckless" },
    text: "Si vous le dites, mon capitaine.",
  },
];

function matchesTrigger(trigger: CommentTrigger, state: GameState, decisions?: Decision[]): boolean {
  switch (trigger.type) {
    case "low_ammo":
      return state.ammo < trigger.threshold;
    case "low_morale":
      return state.morale < trigger.threshold;
    case "low_men":
      return state.men < trigger.threshold;
    case "high_readiness":
      return state.readiness >= trigger.threshold;
    case "time_surplus": {
      const pending = state.milestones.find((m) => m.status === "pending");
      if (!pending) return false;
      const milestoneHour = parseInt(pending.time.slice(0, 2), 10);
      return milestoneHour - state.time.hour > 2;
    }
    case "bad_decision":
      return decisions
        ? decisions.some((d) => d.tier === trigger.tier)
        : false;
    case "time_pressure": {
      const ms = state.milestones.find((m) => m.id === trigger.milestone);
      if (!ms || ms.status !== "pending") return false;
      const msHour = parseInt(ms.time.slice(0, 2), 10);
      return msHour - state.time.hour <= 1;
    }
    case "before_decision":
      return decisions
        ? decisions.some((d) => d.id === trigger.decisionId)
        : false;
  }
}

export function getSecondInCommandComment(
  scene: Scenario,
  state: GameState,
  decisions: Decision[]
): string | null {
  if (!state.secondInCommand || !state.secondInCommand.alive) return null;

  // Scene-specific comments take priority (keyed by first matching decision ID)
  if (scene.secondInCommandComments) {
    for (const d of decisions) {
      const comment = scene.secondInCommandComments[d.id];
      if (comment) return comment;
    }
  }

  const commentPool =
    state.secondInCommand.competence === "veteran"
      ? VETERAN_COMMENTS
      : GREEN_COMMENTS;

  for (const comment of commentPool) {
    if (matchesTrigger(comment.trigger, state, decisions)) {
      return comment.text;
    }
  }

  return null;
}
