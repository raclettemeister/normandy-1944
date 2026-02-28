import type {
  DMEvaluation,
  TacticalTier,
  Decision,
  GameState,
  Soldier,
  SoldierRelationship,
  PlaythroughEvent,
  GameLanguage,
} from "../types/index.ts";
import { buildDMEvaluationPrompt } from "./promptBuilder.ts";

const VALID_TIERS: TacticalTier[] = [
  "suicidal", "reckless", "mediocre", "sound", "excellent", "masterful",
];

const MIN_PROMPT_LENGTH = 5;

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
}
