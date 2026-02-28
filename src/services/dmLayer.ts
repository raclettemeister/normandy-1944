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
  IntelFlags,
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
  /'tier'\s*:\s*'([^']+)'/i,
  /tier\s+is\s+"([^"]+)"/i,
  /\btier\s*:\s*"?([a-z_]+)"?/i,
];

type LLMCallFn = (system: string, userMessage: string, maxTokens: number) => Promise<string>;
const JSON_CODE_BLOCK_REGEX = /```(?:json)?\s*([\s\S]*?)```/gi;
const VALID_INTEL_FLAGS = new Set<keyof IntelFlags>([
  "hasMap",
  "hasCompass",
  "scoutedObjective",
  "knowsMGPosition",
  "knowsPatrolRoute",
  "friendlyContact",
]);

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
    if (!raw || !raw.trim()) {
      return null;
    }

    const parsed = this.parseBestEffortJson(raw);
    if (!parsed) {
      return this.buildFallbackEvaluation(this.extractTierFromText(raw));
    }

    const parsedTier = this.stringOrNull(parsed.tier)?.toLowerCase();
    const tier = parsedTier && VALID_TIERS.includes(parsedTier as TacticalTier)
      ? parsedTier as TacticalTier
      : (this.extractTierFromText(raw) ?? "mediocre");

    return {
      tier,
      reasoning: this.stringOrNull(parsed.reasoning) ?? this.fallbackReasoning(tier),
      narrative: this.stringOrNull(parsed.narrative) ?? this.fallbackNarrative(tier),
      fatal: typeof parsed.fatal === "boolean" ? parsed.fatal : false,
      intelGained: this.parseIntelFlag(parsed.intelGained),
      soldierReactions: this.parseSoldierReactions(parsed.soldierReactions),
      secondInCommandReaction:
        this.stringOrNull(parsed.secondInCommandReaction) ??
        this.fallbackSecondInCommandReaction(tier),
      planSummary:
        this.stringOrNull(parsed.planSummary) ??
        this.fallbackPlanSummary(tier),
    };
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
    const parsed = this.parseBestEffortJson(raw);
    if (!parsed) {
      const tier = this.extractTierFromText(raw);
      return this.baselineFromTier(tier, null);
    }

    const parsedTier = this.stringOrNull(parsed.tier)?.toLowerCase();
    if (!parsedTier || !VALID_TIERS.includes(parsedTier as TacticalTier)) {
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
      tier: parsedTier as TacticalTier,
      reasoning: this.stringOrNull(parsed.reasoning) ?? "",
      narrative: this.stringOrNull(parsed.narrative) ?? "",
      fatal: typeof parsed.fatal === "boolean" ? parsed.fatal : false,
      intelGained: this.parseIntelFlag(parsed.intelGained),
      tacticalReasoning: this.stringOrNull(parsed.tacticalReasoning) ?? "",
      personnelScore: typeof parsed.personnelScore === "number" ? Math.max(0, Math.min(100, parsed.personnelScore)) : 50,
      assignments,
      assignmentIssues: Array.isArray(parsed.assignmentIssues) ? parsed.assignmentIssues : [],
      assignmentBonuses: Array.isArray(parsed.assignmentBonuses) ? parsed.assignmentBonuses : [],
      soldierReactions: this.parseSoldierReactions(parsed.soldierReactions),
      secondInCommandReaction: this.stringOrNull(parsed.secondInCommandReaction) ?? "",
      vulnerablePersonnel: Array.isArray(parsed.vulnerablePersonnel) ? parsed.vulnerablePersonnel : [],
      capabilityRisks: Array.isArray(parsed.capabilityRisks) ? parsed.capabilityRisks : [],
      matchedDecisionId: this.stringOrNull(parsed.matchedDecisionId) ?? "",
      matchConfidence: typeof parsed.matchConfidence === "number" ? parsed.matchConfidence : 0,
      planSummary: this.stringOrNull(parsed.planSummary) ?? "",
    };
  }

  private extractTierFromText(raw: string): TacticalTier | null {
    for (const re of TIER_REGEXES) {
      const m = raw.match(re);
      if (m) {
        const normalized = m[1].toLowerCase();
        if (VALID_TIERS.includes(normalized as TacticalTier)) {
          return normalized as TacticalTier;
        }
      }
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

  private buildFallbackEvaluation(tier: TacticalTier | null): DMEvaluation {
    const resolvedTier = tier ?? "mediocre";
    return {
      tier: resolvedTier,
      reasoning: this.fallbackReasoning(resolvedTier),
      narrative: this.fallbackNarrative(resolvedTier),
      fatal: false,
      intelGained: undefined,
      soldierReactions: [],
      secondInCommandReaction: this.fallbackSecondInCommandReaction(resolvedTier),
      planSummary: this.fallbackPlanSummary(resolvedTier),
    };
  }

  private parseBestEffortJson(raw: string): Record<string, unknown> | null {
    const candidates = this.extractJsonCandidates(raw);
    for (const candidate of candidates) {
      const parsed = this.tryParseObject(candidate);
      if (parsed) return parsed;
    }
    return null;
  }

  private extractJsonCandidates(raw: string): string[] {
    const unique = new Set<string>();
    const trimmed = raw.trim();
    if (!trimmed) return [];

    unique.add(trimmed);

    JSON_CODE_BLOCK_REGEX.lastIndex = 0;
    let codeBlockMatch: RegExpExecArray | null;
    while ((codeBlockMatch = JSON_CODE_BLOCK_REGEX.exec(raw)) !== null) {
      const candidate = codeBlockMatch[1]?.trim();
      if (candidate) unique.add(candidate);
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      unique.add(trimmed.slice(firstBrace, lastBrace + 1));
    }

    for (const objectText of this.extractBalancedObjects(trimmed)) {
      unique.add(objectText);
    }

    return [...unique];
  }

  private extractBalancedObjects(text: string): string[] {
    const objects: string[] = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === "\"") {
          inString = false;
        }
        continue;
      }

      if (char === "\"") {
        inString = true;
        continue;
      }

      if (char === "{") {
        if (depth === 0) {
          start = i;
        }
        depth++;
        continue;
      }

      if (char === "}" && depth > 0) {
        depth--;
        if (depth === 0 && start !== -1) {
          objects.push(text.slice(start, i + 1));
          start = -1;
        }
      }
    }

    return objects;
  }

  private tryParseObject(candidate: string): Record<string, unknown> | null {
    const normalized = this.normalizeJsonCandidate(candidate);
    const attempts = [normalized, this.removeTrailingCommas(normalized)];

    for (const attempt of attempts) {
      try {
        const parsed = JSON.parse(attempt);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Continue trying candidates.
      }
    }

    return null;
  }

  private normalizeJsonCandidate(candidate: string): string {
    let normalized = candidate
      .replace(/^\uFEFF/, "")
      .replace(/[“”]/g, "\"")
      .replace(/[‘’]/g, "'")
      .trim();

    if (/^json\b/i.test(normalized)) {
      normalized = normalized.replace(/^json\b/i, "").trim();
    }

    return normalized;
  }

  private removeTrailingCommas(candidate: string): string {
    return candidate.replace(/,\s*([}\]])/g, "$1");
  }

  private parseSoldierReactions(value: unknown): DMEvaluation["soldierReactions"] {
    if (!Array.isArray(value)) return [];

    const reactions: DMEvaluation["soldierReactions"] = [];
    for (const reaction of value) {
      if (!reaction || typeof reaction !== "object") continue;
      const soldierId =
        "soldierId" in reaction ? this.stringOrNull((reaction as { soldierId?: unknown }).soldierId) : null;
      const text =
        "text" in reaction ? this.stringOrNull((reaction as { text?: unknown }).text) : null;
      if (!soldierId || !text) continue;
      reactions.push({ soldierId, text });
    }
    return reactions;
  }

  private parseIntelFlag(value: unknown): keyof IntelFlags | undefined {
    if (typeof value !== "string") return undefined;
    if (VALID_INTEL_FLAGS.has(value as keyof IntelFlags)) {
      return value as keyof IntelFlags;
    }
    return undefined;
  }

  private stringOrNull(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private fallbackReasoning(tier: TacticalTier): string {
    if (this.language === "en") {
      return `Fallback adjudication (${tier}): response was partially malformed, using conservative interpretation.`;
    }
    return `Evaluation de secours (${tier}) : reponse partiellement invalide, interpretation prudente appliquee.`;
  }

  private fallbackNarrative(tier: TacticalTier): string {
    if (this.language === "en") {
      switch (tier) {
        case "suicidal":
          return "The order is openly self-destructive. The team hesitates, then defaults to survival.";
        case "reckless":
          return "The team executes quickly but without full control. Tension spikes as risks stack up.";
        case "sound":
          return "The plan is workable. The team moves with caution and keeps formation.";
        case "excellent":
          return "The order is clear and disciplined. The team executes with confidence under pressure.";
        case "masterful":
          return "Your intent is sharp and coherent. The team synchronizes and gains the initiative.";
        case "mediocre":
        default:
          return "The order remains unclear. The men move, but without a crisp shared plan.";
      }
    }

    switch (tier) {
      case "suicidal":
        return "L'ordre est ouvertement suicidaire. L'equipe hesite puis revient a un comportement de survie.";
      case "reckless":
        return "L'equipe execute vite, mais sans controle complet. La tension monte et les risques s'accumulent.";
      case "sound":
        return "Le plan est praticable. L'equipe progresse prudemment et garde la cohesion.";
      case "excellent":
        return "L'ordre est clair et discipline. L'equipe execute proprement sous pression.";
      case "masterful":
        return "L'intention est nette et coherente. L'equipe se synchronise et prend l'initiative.";
      case "mediocre":
      default:
        return "L'ordre reste flou. Les hommes avancent, mais sans plan partage net.";
    }
  }

  private fallbackSecondInCommandReaction(tier: TacticalTier): string {
    if (this.language === "en") {
      if (tier === "suicidal" || tier === "reckless") {
        return "Sir, we can execute — but this is high risk.";
      }
      return "Understood, sir. We'll execute.";
    }
    if (tier === "suicidal" || tier === "reckless") {
      return "Mon capitaine, on peut executer, mais c'est tres risque.";
    }
    return "Bien recu, mon capitaine. On execute.";
  }

  private fallbackPlanSummary(tier: TacticalTier): string {
    if (this.language === "en") {
      return `Fallback adjudication used (${tier}).`;
    }
    return `Evaluation de secours appliquee (${tier}).`;
  }
}
