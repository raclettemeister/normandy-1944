import "../src/content/scenarios/act1/index.ts";
import { createInitialStateWithDifficulty, formatTime } from "../src/engine/gameState.ts";
import { getScene, getAvailableDecisions } from "../src/engine/scenarioLoader.ts";
import {
  calculateEffectiveScoreFromTier,
  getOutcomeRange,
  rollOutcome,
  getOutcomeTier,
  processSceneTransition,
} from "../src/engine/outcomeEngine.ts";
import { deriveBalanceEnvelope } from "../src/engine/balanceEnvelope.ts";
import type { DMEvaluation, GameState, TacticalTier } from "../src/types/index.ts";

interface DemoStep {
  sceneId: string;
  prompt: string;
  tier: TacticalTier;
  seed: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    sceneId: "act1_landing",
    prompt:
      "I cut free first, whisper a gear roll call, and use AA arcs plus the steeple silhouette to set a calm northbound bearing before I move.",
    tier: "masterful",
    seed: 1101,
  },
  {
    sceneId: "act1_finding_north",
    prompt:
      "I pace by compass checks and hedgerow counting, marking turns with shallow knife cuts so we do not loop in the bocage.",
    tier: "excellent",
    seed: 1102,
  },
  {
    sceneId: "act1_first_contact",
    prompt:
      "One click challenge only. If response is wrong, fallback to Flash/Thunder. Weapon low but ready. Fold any friendly into rear security immediately.",
    tier: "excellent",
    seed: 1103,
  },
  {
    sceneId: "act1_the_sergeant",
    prompt:
      "Use clicker from hard cover, confirm voices, then quietly consolidate under Henderson with sectors and noise discipline.",
    tier: "masterful",
    seed: 1104,
  },
  {
    sceneId: "act1_the_patrol",
    prompt:
      "Fun prompt: 'Operation Midnight Accordion' — Malone left through canal, Henderson base fire, I trigger L-ambush when Feldwebel hunches over the papers. No heroics.",
    tier: "masterful",
    seed: 1105,
  },
  {
    sceneId: "act1_the_farmhouse",
    prompt:
      "Porch clicker first. No grenades until positive ID. Then controlled stack clear and immediate med/ammo triage inside.",
    tier: "excellent",
    seed: 1106,
  },
  {
    sceneId: "act1_scene07",
    prompt:
      "Send paired scouts with hand signals, cross in bounds only after wire is confirmed cold, keep everyone below hedge line to avoid silhouette.",
    tier: "excellent",
    seed: 1107,
  },
];

function assertScene(state: GameState, expected: string): void {
  if (state.currentScene !== expected) {
    throw new Error(`Expected scene ${expected}, got ${state.currentScene}`);
  }
}

function buildNarrative(step: DemoStep, sceneName: string): string {
  return `[AI Narrator] ${sceneName}: ${step.prompt}`;
}

function runDemo(): void {
  let state = createInitialStateWithDifficulty("hardcore");
  const transcript: string[] = [];

  transcript.push("# Hardcore Stress Demo (Deterministic)");
  transcript.push("");
  transcript.push("- Mode: Hardcore");
  transcript.push("- Narration path: DM-style free-text flow");
  transcript.push("- Goal: Verify coherent scene-to-scene progression under creative prompts");
  transcript.push("");

  for (let index = 0; index < DEMO_STEPS.length; index += 1) {
    const step = DEMO_STEPS[index];
    assertScene(state, step.sceneId);

    const scene = getScene(state.currentScene);
    if (!scene) throw new Error(`Scene not found: ${state.currentScene}`);

    const decisions = getAvailableDecisions(scene, state);
    if (decisions.length === 0) {
      throw new Error(`No decisions available for scene ${scene.id}`);
    }

    const evaluation: DMEvaluation = {
      tier: step.tier,
      reasoning: `Plan is coherent for ${scene.id} with disciplined tempo and ID checks.`,
      narrative: buildNarrative(step, scene.id),
      fatal: false,
      intelGained: undefined,
      secondInCommandReaction:
        state.secondInCommand
          ? "Solid call, Captain. Keep it tight and quiet."
          : "",
      soldierReactions: [],
      planSummary: step.prompt,
    };

    const effectiveScore = calculateEffectiveScoreFromTier(evaluation.tier, state, "middle");
    const range = getOutcomeRange(effectiveScore);
    const roll = rollOutcome(range, step.seed);
    const outcomeTier = getOutcomeTier(roll);

    const envelope = scene.balanceEnvelopeOverride ?? deriveBalanceEnvelope(decisions);
    const envRange = envelope[outcomeTier];
    const rollPosition = (range.ceiling - range.floor) > 0
      ? (roll - range.floor) / (range.ceiling - range.floor)
      : 0.5;

    const lerp = (min: number, max: number) =>
      Math.round(min + rollPosition * (max - min));

    const outcome = {
      text: evaluation.narrative,
      context: evaluation.reasoning,
      menLost: lerp(envRange.menLost[0], envRange.menLost[1]),
      ammoSpent: lerp(envRange.ammoSpent[0], envRange.ammoSpent[1]),
      moraleChange: lerp(envRange.moraleChange[0], envRange.moraleChange[1]),
      readinessChange: lerp(envRange.readinessChange[0], envRange.readinessChange[1]),
      intelGained: evaluation.intelGained,
    };

    const result = processSceneTransition(state, scene, outcome, "middle");
    const referenceDecision = decisions[0];
    const nextSceneId =
      outcomeTier === "failure" && referenceDecision.outcome.nextSceneOnFailure
        ? referenceDecision.outcome.nextSceneOnFailure
        : referenceDecision.outcome.nextScene;

    transcript.push(`## ${index + 1}. ${scene.id}`);
    transcript.push(`- Prompt: ${step.prompt}`);
    transcript.push(`- Tier/roll: ${step.tier} / ${roll} (${outcomeTier})`);
    transcript.push(`- Narrator: ${evaluation.narrative}`);
    transcript.push(
      `- State -> men ${result.state.men}, ammo ${result.state.ammo}, morale ${result.state.morale}, readiness ${result.state.readiness}, time ${formatTime(result.state.time)} (day ${result.state.day})`
    );
    transcript.push(`- Next: ${nextSceneId}`);
    transcript.push("");

    const advancedState: GameState = {
      ...result.state,
      currentScene: nextSceneId,
      scenesVisited: [...result.state.scenesVisited, scene.id],
      wikiUnlocked: [
        ...new Set([
          ...result.state.wikiUnlocked,
          referenceDecision.outcome.wikiUnlocks,
        ]),
      ],
    };

    if (!getScene(nextSceneId)) {
      state = advancedState;
      transcript.push(`Final playable scene reached at ${scene.id}. Next scene (${nextSceneId}) is not yet authored.`);
      transcript.push("");
      break;
    }

    state = advancedState;
  }

  transcript.push("## Final State");
  transcript.push(
    `Men ${state.men} | Ammo ${state.ammo} | Morale ${state.morale} | Readiness ${state.readiness} | Time ${formatTime(state.time)} (day ${state.day})`
  );
  transcript.push(`Milestones missed: ${state.milestones.filter((m) => m.status === "missed").map((m) => m.id).join(", ") || "none"}`);

  console.log(transcript.join("\n"));
}

runDemo();
