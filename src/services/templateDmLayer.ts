import type {
  DMEvaluation,
  Soldier,
  SoldierReaction,
  TacticalTier,
} from "../types/index.ts";
import type { DMEvaluateInput, DMEvaluator } from "./dmLayer.ts";

const MIN_PROMPT_LENGTH = 5;

const TIER_ORDER: TacticalTier[] = [
  "suicidal",
  "reckless",
  "mediocre",
  "sound",
  "excellent",
  "masterful",
];

const FATAL_PATTERNS = [
  /\bshoot myself\b/i,
  /\bkill myself\b/i,
  /\bsuicide\b/i,
  /\bsurrender\b/i,
  /\bdesert\b/i,
  /\bkill (my )?(men|squad|team|friendly)\b/i,
  /\bfrag (my )?(men|squad|team|friendly)\b/i,
];

const FANTASY_PATTERNS = [
  /\bfireball\b/i,
  /\bdragon\b/i,
  /\bmagic\b/i,
  /\bteleport\b/i,
  /\bwizard\b/i,
];

const RECKLESS_PATTERNS = [
  /\bcharge\b/i,
  /\brush\b/i,
  /\byell\b/i,
  /\bwithout cover\b/i,
  /\bopen ground\b/i,
];

const STRONG_TACTICAL_PATTERNS = [
  /\bcover\b/i,
  /\bflank\b/i,
  /\bambush\b/i,
  /\bscout\b/i,
  /\bidentify\b/i,
  /\bclicker\b/i,
  /\bflash\b/i,
  /\bthunder\b/i,
  /\bhedgerow\b/i,
  /\bcanal\b/i,
  /\bcrossfire\b/i,
  /\bsector\b/i,
];

function clampTierIndex(index: number): number {
  return Math.max(0, Math.min(TIER_ORDER.length - 1, index));
}

function upgradeTier(tier: TacticalTier, steps = 1): TacticalTier {
  const index = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[clampTierIndex(index + steps)];
}

function downgradeTier(tier: TacticalTier, steps = 1): TacticalTier {
  const index = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[clampTierIndex(index - steps)];
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function overlapScore(a: string, b: string): number {
  const aTokens = new Set(tokenize(a));
  const bTokens = tokenize(b);
  let score = 0;
  for (const token of bTokens) {
    if (aTokens.has(token)) score += 1;
  }
  return score;
}

function selectReferenceTier(input: DMEvaluateInput): TacticalTier {
  if (input.decisions.length === 0) return "mediocre";
  const prompt = input.playerText;
  const best = input.decisions
    .map((decision) => ({
      decision,
      score: overlapScore(decision.text, prompt) + overlapScore(decision.id, prompt),
    }))
    .sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.decision.tier : "mediocre";
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

function summarizePlan(planText: string): string {
  const words = planText.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 18) return planText.trim();
  return `${words.slice(0, 18).join(" ")}...`;
}

function pickSoldierReactions(roster: Soldier[], tier: TacticalTier): SoldierReaction[] {
  const active = roster.filter((s) => s.status === "active").slice(0, 2);
  const tierReaction: Record<TacticalTier, string> = {
    suicidal: "Sir... this is going to get us killed.",
    reckless: "We'll do it, sir, but this is rough.",
    mediocre: "Understood, Captain. We'll make it work.",
    sound: "Solid orders, Captain.",
    excellent: "Good plan, Captain. We can execute this.",
    masterful: "Best plan I've heard all night, sir. We'll move now.",
  };

  return active.map((soldier) => ({
    soldierId: soldier.id,
    text: tierReaction[tier],
  }));
}

function secondInCommandReaction(
  tier: TacticalTier,
  competence?: "veteran" | "green"
): string {
  if (!competence) return "";
  if (competence === "green") {
    if (tier === "suicidal") return "Uh... yes sir. We'll go.";
    if (tier === "masterful") return "Sounds good, sir. I think.";
    return "Right, sir.";
  }

  switch (tier) {
    case "suicidal":
      return "With respect, sir, this gets men killed for nothing.";
    case "reckless":
      return "We'll move, but we need tighter control than that.";
    case "mediocre":
      return "It'll work if we keep discipline.";
    case "sound":
      return "Solid, Captain. Quiet and controlled.";
    case "excellent":
      return "Good plan, sir. We can execute clean.";
    case "masterful":
      return "That's it, Captain. Sharp, disciplined, and fast.";
    default:
      return "Understood, sir.";
  }
}

function generateNarrative(input: DMEvaluateInput, tier: TacticalTier, fatal: boolean): string {
  if (fatal) {
    return "The order collapses command and discipline in seconds. Men hesitate, then panic. Gunfire and shouting tear through the line. By the time the noise fades, command is finished and the fight is over for you.";
  }

  const sceneLead = input.sceneContext.split(".")[0].trim();
  const plan = summarizePlan(input.playerText);

  const executionLine: Record<TacticalTier, string> = {
    suicidal:
      "The move shatters cohesion immediately. Men are exposed, timing is gone, and the enemy seizes the initiative.",
    reckless:
      "The push has momentum but poor control. You gain ground fast, then lose shape under pressure.",
    mediocre:
      "The intent is understandable, but the order is thin on detail. The men execute with caution and mixed confidence.",
    sound:
      "Orders are clear and practical. The team moves with measured tempo and keeps contact discipline.",
    excellent:
      "The plan fits the ground and the moment. Teams coordinate cleanly, cover angles, and keep pressure where it matters.",
    masterful:
      "The order is crisp, adaptive, and situation-aware. Every movement supports another, and the unit stays one step ahead.",
  };

  const resultLine: Record<TacticalTier, string> = {
    suicidal: "You survive the moment, but only barely, and the position is worse than before.",
    reckless: "You get a result, but the cost and noise will follow you into the next scene.",
    mediocre: "You move forward, though the unit pays in time and certainty.",
    sound: "You secure forward momentum with manageable risk and solid control.",
    excellent: "You carry the objective forward with confidence and low friction.",
    masterful: "You turn a dangerous position into initiative, momentum, and trust in command.",
  };

  return `${sceneLead}. ${executionLine[tier]} Plan executed: ${plan}. ${resultLine[tier]}`;
}

export class TemplateDMLayer implements DMEvaluator {
  async evaluatePrompt(input: DMEvaluateInput): Promise<DMEvaluation | null> {
    const text = input.playerText?.trim() ?? "";
    if (text.length < MIN_PROMPT_LENGTH) return null;

    const isFatal = FATAL_PATTERNS.some((pattern) => pattern.test(text));
    let tier = isFatal ? "suicidal" as TacticalTier : selectReferenceTier(input);

    if (!isFatal) {
      if (countMatches(text, FANTASY_PATTERNS) > 0) {
        tier = "mediocre";
      }

      const strongSignals = countMatches(text, STRONG_TACTICAL_PATTERNS);
      const recklessSignals = countMatches(text, RECKLESS_PATTERNS);
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const namedSoldierSignals = input.roster.filter((s) =>
        new RegExp(`\\b${s.name.split(" ")[0]}\\b`, "i").test(text)
      ).length;

      if (strongSignals >= 3 && wordCount >= 18) {
        tier = upgradeTier(tier, 1);
      }
      if (strongSignals >= 5 && namedSoldierSignals >= 1) {
        tier = upgradeTier(tier, 1);
      }
      if (namedSoldierSignals >= 2 && wordCount >= 24) {
        tier = upgradeTier(tier, 1);
      }
      if (recklessSignals >= 1) {
        tier = downgradeTier(tier, 1);
      }
      if (wordCount < 8) {
        tier = downgradeTier(tier, 1);
      }
    }

    return {
      tier,
      reasoning: isFatal
        ? "Order is catastrophic to mission integrity and survival."
        : `Template DM judged this as ${tier} based on clarity, discipline, and tactical fit.`,
      narrative: generateNarrative(input, tier, isFatal),
      fatal: isFatal,
      intelGained: undefined,
      secondInCommandReaction: secondInCommandReaction(tier, input.secondInCommandCompetence),
      soldierReactions: pickSoldierReactions(input.roster, tier),
      planSummary: summarizePlan(text),
    };
  }
}
