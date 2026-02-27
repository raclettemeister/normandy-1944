import type {
  NarrativeMode,
  GameState,
  Soldier,
  SoldierRelationship,
  Decision,
  ClassificationResult,
  PlaythroughEvent,
} from '../types';
import {
  buildNarrationPrompt,
  buildRallyPrompt,
  buildClassificationPrompt,
  buildEpiloguePrompt,
  buildInterludePrompt,
} from './promptBuilder.ts';
import { DMLayer } from './dmLayer.ts';
import { getLanguage } from '../locales/i18n';

interface NarrativeServiceConfig {
  apiUrl: string;
}

interface OutcomeNarrativeInput {
  outcomeText: string;
  outcomeContext?: string;
  sceneContext?: string;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  casualties?: Soldier[];
  captainHit?: boolean;
  playerAction?: string;
  onChunk?: (text: string) => void;
}

interface ClassifyInput {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
}

interface EpilogueInput {
  soldier: Soldier;
  events: PlaythroughEvent[];
  relationships: SoldierRelationship[];
  allSoldierStatuses: { id: string; status: string }[];
}

export class NarrativeService {
  private apiUrl: string;
  private mode: NarrativeMode;
  private dmLayer: DMLayer | null;

  constructor(config: NarrativeServiceConfig) {
    this.apiUrl = config.apiUrl;
    this.mode = config.apiUrl ? "llm" : "hardcoded";
    this.dmLayer = this.mode === "llm"
      ? new DMLayer((system, userMessage, maxTokens) => this.callLLM(system, userMessage, maxTokens))
      : null;
  }

  getMode(): NarrativeMode {
    return this.mode;
  }

  getDMLayer(): DMLayer | null {
    return this.dmLayer;
  }

  async generateOutcomeNarrative(input: OutcomeNarrativeInput): Promise<string> {
    if (this.mode !== "llm" || !input.outcomeContext) {
      return input.outcomeText;
    }

    try {
      const prompt = buildNarrationPrompt({
        sceneContext: input.sceneContext ?? "",
        outcomeContext: input.outcomeContext,
        playerAction: input.playerAction,
        casualties: input.casualties,
        captainHit: input.captainHit,
        gameState: input.gameState,
        roster: input.roster,
        relationships: input.relationships,
      });

      const text = await this.callLLM(prompt.system, prompt.userMessage, 300, input.onChunk);
      return text || input.outcomeText;
    } catch (e) {
      console.warn("generateOutcomeNarrative failed, using fallback:", e);
      return input.outcomeText;
    }
  }

  async generateSceneNarrative(
    sceneContext: string,
    gameState: GameState,
    roster: Soldier[],
    relationships: SoldierRelationship[],
    fallbackText: string,
    previousOutcomeContext?: string,
    onChunk?: (text: string) => void,
  ): Promise<string> {
    if (this.mode !== "llm") return fallbackText;

    try {
      const prompt = buildNarrationPrompt({
        sceneContext,
        previousOutcomeContext: previousOutcomeContext,
        gameState,
        roster,
        relationships,
      });
      const text = await this.callLLM(prompt.system, prompt.userMessage, 300, onChunk);
      return text || fallbackText;
    } catch (e) {
      console.warn("generateSceneNarrative failed, using fallback:", e);
      return fallbackText;
    }
  }

  async generateRallyNarrative(
    rallySoldiers: Soldier[],
    ammoGain: number,
    moraleGain: number,
    sceneContext: string,
    gameState: GameState,
    roster: Soldier[],
    fallbackText: string,
    previousOutcomeContext?: string,
  ): Promise<string> {
    if (this.mode !== "llm") return fallbackText;

    try {
      const prompt = buildRallyPrompt({
        rallySoldiers,
        ammoGain,
        moraleGain,
        sceneContext,
        previousOutcomeContext,
        gameState,
        roster,
      });
      const text = await this.callLLM(prompt.system, prompt.userMessage, 300);
      return text || fallbackText;
    } catch (e) {
      console.warn("generateRallyNarrative failed, using fallback:", e);
      return fallbackText;
    }
  }

  async classifyPlayerAction(input: ClassifyInput): Promise<ClassificationResult | null> {
    if (!input.playerText || input.playerText.trim().length < 5) return null;
    if (this.mode !== "llm") return null;

    try {
      const prompt = buildClassificationPrompt({
        sceneContext: input.sceneContext,
        decisions: input.decisions,
        playerText: input.playerText,
        gameState: input.gameState,
      });

      const text = await this.callLLM(prompt.system, prompt.userMessage, 150);
      if (!text) return null;

      const parsed = JSON.parse(text) as ClassificationResult;
      if (!parsed.matchedDecision || !parsed.tier) return null;

      const validTiers = ["suicidal", "reckless", "mediocre", "sound", "excellent", "masterful"];
      if (!validTiers.includes(parsed.tier)) return null;

      const validDecision = input.decisions.some(d => d.id === parsed.matchedDecision);
      if (!validDecision) {
        parsed.matchedDecision = input.decisions[0]?.id ?? parsed.matchedDecision;
      }

      return parsed;
    } catch (e) {
      console.warn("classifyPlayerAction failed:", e);
      return null;
    }
  }

  async generateEpilogue(input: EpilogueInput): Promise<string> {
    if (this.mode !== "llm") {
      return this.getDefaultEpilogue(input.soldier);
    }

    try {
      const prompt = buildEpiloguePrompt(input);
      const text = await this.callLLM(prompt.system, prompt.userMessage, 200);
      return text || this.getDefaultEpilogue(input.soldier);
    } catch (e) {
      console.warn("generateEpilogue failed, using fallback:", e);
      return this.getDefaultEpilogue(input.soldier);
    }
  }

  async generateEpilogues(
    soldiers: Soldier[],
    eventsBysoldier: Map<string, PlaythroughEvent[]>,
    relationshipsBySoldier: Map<string, SoldierRelationship[]>,
  ): Promise<Map<string, string>> {
    const allStatuses = soldiers.map(s => ({ id: s.id, status: s.status }));
    const results = new Map<string, string>();

    const promises = soldiers.map(async (soldier) => {
      const epilogue = await this.generateEpilogue({
        soldier,
        events: eventsBysoldier.get(soldier.id) ?? [],
        relationships: relationshipsBySoldier.get(soldier.id) ?? [],
        allSoldierStatuses: allStatuses,
      });
      results.set(soldier.id, epilogue);
    });

    await Promise.all(promises);
    return results;
  }

  async narrateInterlude(input: {
    beat: string;
    context?: string;
    objectiveReminder?: string;
    previousOutcomeText: string;
    previousOutcomeContext?: string;
    nextSceneContext: string;
    nextSceneNarrative: string;
    gameState: GameState;
    roster: Soldier[];
    relationships: SoldierRelationship[];
    interludeType: "movement" | "rest" | "transition";
    onChunk?: (text: string) => void;
  }): Promise<string> {
    if (this.mode !== "llm") {
      return input.beat;
    }

    try {
      const prompt = buildInterludePrompt(input);
      const text = await this.callLLM(prompt.system, prompt.userMessage, 200, input.onChunk);
      return text || input.beat;
    } catch {
      return input.beat;
    }
  }

  private getDefaultEpilogue(soldier: Soldier): string {
    switch (soldier.status) {
      case "KIA":
        return `${soldier.rank} ${soldier.name} was killed in action during Operation Overlord. He was ${soldier.age} years old, from ${soldier.hometown}.`;
      case "wounded":
        return `${soldier.rank} ${soldier.name} was evacuated after being wounded in Normandy. He recovered stateside and was discharged in 1945.`;
      case "missing":
        return `${soldier.rank} ${soldier.name} was reported missing in action during the Normandy campaign. His fate remained unknown.`;
      default:
        return `${soldier.rank} ${soldier.name} survived the Normandy campaign and continued to serve through the European theater.`;
    }
  }

  private async callLLM(
    system: string,
    userMessage: string,
    maxTokens: number,
    onChunk?: (text: string) => void,
  ): Promise<string> {
    const response = await fetch(`${this.apiUrl}/api/narrative`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system,
        messages: [{ role: "user", content: userMessage }],
        max_tokens: maxTokens,
        language: getLanguage(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Narrative API returned ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    return this.parseSSEStream(response.body, onChunk);
  }

  private async parseSSEStream(
    body: ReadableStream<Uint8Array>,
    onChunk?: (text: string) => void,
  ): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (event.type === "content_block_delta" && event.delta?.text) {
              fullText += event.delta.text;
              onChunk?.(event.delta.text);
            }
          } catch {
            // Skip malformed SSE events
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }
}
