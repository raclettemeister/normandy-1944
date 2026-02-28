import type {
  DMEvaluation,
  EnhancedDMEvaluation,
  TacticalTier,
  Decision,
  GameState,
  Soldier,
  SoldierRelationship,
  PlaythroughEvent,
  GameLanguage,
  PersonnelAssignment,
} from "../types/index.ts";
import { buildDMEvaluationPrompt } from "./promptBuilder.ts";

const VALID_TIERS: TacticalTier[] = [
  "suicidal", "reckless", "mediocre", "sound", "excellent", "masterful",
];

const MIN_PROMPT_LENGTH = 5;

const MEDIOCRE_BASELINE: EnhancedDMEvaluation = {
  tier: "mediocre",
  reasoning: "Fallback: could not parse LLM response.",
  narrative: "The order is unclear. The men wait for clarification.",
  tacticalReasoning: "Unclear.",
  personnelScore: 50,
  assignments: [],
  assignmentIssues: [],
  assignmentBonuses: [],
  soldierReactions: [],
  secondInCommandReaction: "Need clearer orders, sir.",
  vulnerablePersonnel: [],
  capabilityRisks: [],
  matchedDecisionId: "",
  matchConfidence: 0,
  planSummary: "Unclear orders.",
};

const TIER_REGEXES = [
  /"tier"\s*:\s*"([^"]+)"/i,
  /tier\s+is\s+"([^"]+)"/i,
];

type LLMCallFn = (system: string, userMessage: string, maxTokens: number) => Promise<string>;

export interface DMEvaluateInput {
  playerText: string;
  sceneContext: string;
  decisions: Decision[];
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  recentEvents: PlaythroughEvent[];
  wikiUnlocked: string[];
  secondInCommandName?: string;
  secondInCommandCompetence?: "veteran" | "green";
}

export class DMLayer {
  private callLLM: LLMCallFn;
  private language: GameLanguage;

  constructor(callLLM: LLMCallFn, language: GameLanguage = "fr") {
    this.callLLM = callLLM;
    this.language = language;
  }

  async evaluatePrompt(input: DMEvaluateInput): Promise<DMEvaluation | null> {
    if (!input.playerText || input.playerText.trim().length < MIN_PROMPT_LENGTH) {
      return null;
    }

    try {
      const prompt = buildDMEvaluationPrompt({
        sceneContext: input.sceneContext,
        decisions: input.decisions,
        playerText: input.playerText,
        gameState: input.gameState,
        roster: input.roster,
        relationships: input.relationships,
        recentEvents: input.recentEvents,
        wikiUnlocked: input.wikiUnlocked,
        secondInCommandName: input.secondInCommandName,
        secondInCommandCompetence: input.secondInCommandCompetence,
      }, this.language);

      const raw = await this.callLLM(prompt.system, prompt.userMessage, 800);
      return this.parseResponse(raw);
    } catch (e) {
      console.warn("DMLayer.evaluatePrompt failed:", e);
      return null;
    }
  }

  private parseResponse(raw: string): DMEvaluation | null {
    try {
      const parsed = JSON.parse(raw);

      if (!parsed.tier || !VALID_TIERS.includes(parsed.tier)) return null;
      if (!parsed.narrative || !parsed.reasoning) return null;

      return {
        tier: parsed.tier as TacticalTier,
        reasoning: parsed.reasoning,
        narrative: parsed.narrative,
        fatal: parsed.fatal ?? false,
        intelGained: parsed.intelGained ?? undefined,
        soldierReactions: Array.isArray(parsed.soldierReactions) ? parsed.soldierReactions : [],
        secondInCommandReaction: parsed.secondInCommandReaction ?? "",
        planSummary: parsed.planSummary ?? "",
      };
    } catch (e) {
      console.warn("DMLayer.parseResponse failed:", e);
      return null;
    }
  }

  async evaluatePromptEnhanced(input: DMEvaluateInput): Promise<EnhancedDMEvaluation | null> {
    if (!input.playerText || input.playerText.trim().length < MIN_PROMPT_LENGTH) {
      return null;
    }

    try {
      const prompt = buildDMEvaluationPrompt({
        sceneContext: input.sceneContext,
        decisions: input.decisions,
        playerText: input.playerText,
        gameState: input.gameState,
        roster: input.roster,
        relationships: input.relationships,
        recentEvents: input.recentEvents,
        wikiUnlocked: input.wikiUnlocked,
        secondInCommandName: input.secondInCommandName,
        secondInCommandCompetence: input.secondInCommandCompetence,
      }, this.language);

      const raw = await this.callLLM(prompt.system, prompt.userMessage, 800);
      return this.parseEnhancedResponse(raw);
    } catch (e) {
      console.warn("DMLayer.evaluatePromptEnhanced failed:", e);
      return { ...MEDIOCRE_BASELINE };
    }
  }

  private parseEnhancedResponse(raw: string): EnhancedDMEvaluation {
    try {
      const parsed = JSON.parse(raw);

      if (!parsed.tier || !VALID_TIERS.includes(parsed.tier)) {
        const tier = this.extractTierFromText(raw);
        return this.baselineFromTier(tier, parsed);
      }

      const assignments: PersonnelAssignment[] = Array.isArray(parsed.assignments)
        ? parsed.assignments.filter(
            (a: unknown) =>
              a && typeof a === "object" && "soldierId" in a && "assignedTask" in a && "fitScore" in a
          ).map((a: { soldierId: string; assignedTask: string; fitScore: number; reasoning?: string }) => ({
            soldierId: a.soldierId,
            assignedTask: a.assignedTask,
            fitScore: typeof a.fitScore === "number" ? a.fitScore : 50,
            reasoning: a.reasoning ?? "",
          }))
        : [];

      return {
        tier: parsed.tier as TacticalTier,
        reasoning: parsed.reasoning ?? "",
        narrative: parsed.narrative ?? "",
        fatal: parsed.fatal ?? false,
        intelGained: parsed.intelGained ?? undefined,
        tacticalReasoning: parsed.tacticalReasoning ?? "",
        personnelScore: typeof parsed.personnelScore === "number" ? Math.max(0, Math.min(100, parsed.personnelScore)) : 50,
        assignments,
        assignmentIssues: Array.isArray(parsed.assignmentIssues) ? parsed.assignmentIssues : [],
        assignmentBonuses: Array.isArray(parsed.assignmentBonuses) ? parsed.assignmentBonuses : [],
        soldierReactions: Array.isArray(parsed.soldierReactions) ? parsed.soldierReactions : [],
        secondInCommandReaction: parsed.secondInCommandReaction ?? "",
        vulnerablePersonnel: Array.isArray(parsed.vulnerablePersonnel) ? parsed.vulnerablePersonnel : [],
        capabilityRisks: Array.isArray(parsed.capabilityRisks) ? parsed.capabilityRisks : [],
        matchedDecisionId: parsed.matchedDecisionId ?? "",
        matchConfidence: typeof parsed.matchConfidence === "number" ? parsed.matchConfidence : 0,
        planSummary: parsed.planSummary ?? "",
      };
    } catch {
      const tier = this.extractTierFromText(raw);
      return this.baselineFromTier(tier, null);
    }
  }

  private extractTierFromText(raw: string): TacticalTier | null {
    for (const re of TIER_REGEXES) {
      const m = raw.match(re);
      if (m && VALID_TIERS.includes(m[1] as TacticalTier)) return m[1] as TacticalTier;
    }
    return null;
  }

  private baselineFromTier(tier: TacticalTier | null, parsed: Record<string, unknown> | null): EnhancedDMEvaluation {
    const t = tier ?? "mediocre";
    return {
      ...MEDIOCRE_BASELINE,
      tier: t,
      narrative: parsed?.narrative && typeof parsed.narrative === "string" ? parsed.narrative : MEDIOCRE_BASELINE.narrative,
      reasoning: parsed?.reasoning && typeof parsed.reasoning === "string" ? parsed.reasoning : MEDIOCRE_BASELINE.reasoning,
      personnelScore: tier ? 50 : 50,
    };
  }
}
