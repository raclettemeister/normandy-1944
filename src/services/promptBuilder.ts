import type {
  GameState,
  Soldier,
  SoldierRelationship,
  Decision,
  PlaythroughEvent,
} from '../types';
import { getAlertStatus, formatTime } from '../engine/gameState.ts';

export interface PromptPair {
  system: string;
  userMessage: string;
}

export interface NarrationPromptInput {
  sceneContext: string;
  outcomeContext?: string;
  playerAction?: string;
  casualties?: Soldier[];
  captainHit?: boolean;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
}

export interface ClassificationPromptInput {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
}

export interface EpiloguePromptInput {
  soldier: Soldier;
  events: PlaythroughEvent[];
  relationships: SoldierRelationship[];
  allSoldierStatuses: { id: string; status: string }[];
}

const TONE_GUIDE = `Terse, military, present tense, second person. No melodrama, no purple prose. Write like a combat memoir — Ambrose, not Tolkien. Concrete military language. Never use "strategic" or "tactical." Maximum specificity: name weapons, terrain, distances. Reference soldiers by name when they act.`;

function formatGameState(state: GameState): string {
  const alert = getAlertStatus(state.readiness);
  return `Men: ${state.men}/18, Ammo: ${state.ammo}%, Morale: ${state.morale}, Enemy: ${alert}, Time: ${formatTime(state.time)}, Phase: ${state.phase}`;
}

function formatRoster(roster: Soldier[]): string {
  if (roster.length === 0) return "No active soldiers.";
  return roster.map(s => {
    const traits = s.traits.length > 0 ? s.traits.join("/") : "no traits";
    const notes: string[] = [];
    if (s.traits.includes("green")) notes.push("FIRST COMBAT");
    if (s.status === "wounded") notes.push("WOUNDED");
    const suffix = notes.length > 0 ? ` — ${notes.join(", ")}` : "";
    return `- ${s.rank} ${s.name} (${s.role}, ${traits})${suffix}`;
  }).join("\n");
}

function formatRelationships(relationships: SoldierRelationship[]): string {
  if (relationships.length === 0) return "";
  const lines = relationships.map(r => {
    const target = r.targetId === "everyone" ? "everyone" : r.targetId;
    return `${r.soldierId} → ${target} (${r.type}): ${r.detail}`;
  });
  return `\n[RELATIONSHIPS]\n${lines.join("\n")}`;
}

function formatCasualties(casualties?: Soldier[]): string {
  if (!casualties || casualties.length === 0) return "";
  const lines = casualties.map(c => `${c.rank} ${c.name}: ${c.status}`);
  return `\nCasualties: ${lines.join(", ")}.`;
}

export function buildNarrationPrompt(input: NarrationPromptInput): PromptPair {
  const system = `[ROLE]
You are the narrator of a WWII tactical text game set during D-Day.

[TONE GUIDE]
${TONE_GUIDE}

[GAME STATE]
${formatGameState(input.gameState)}

[ACTIVE ROSTER]
${formatRoster(input.roster)}
${formatRelationships(input.relationships)}

[SCENE CONTEXT]
${input.sceneContext}

[INSTRUCTIONS]
Write 2-4 sentences describing this outcome.
Reference specific soldiers by name when they act.
If a soldier was wounded or killed, reference their relationships.
Do not reference game mechanics (scores, percentages, tiers).
Maximum 80 words.`;

  let userMessage = "";

  if (input.outcomeContext) {
    userMessage += `[OUTCOME CONTEXT]\n${input.outcomeContext}`;
    userMessage += formatCasualties(input.casualties);
    if (input.captainHit) {
      userMessage += "\nThe captain was hit.";
    }
  }

  if (input.playerAction) {
    userMessage += `\n\n[PLAYER ACTION]\nThe player wrote: "${input.playerAction}"\nNarrate THIS action with the outcome described above.`;
  }

  if (!userMessage) {
    userMessage = "Narrate the scene as described in the context.";
  }

  return { system, userMessage: userMessage.trim() };
}

export function buildClassificationPrompt(input: ClassificationPromptInput): PromptPair {
  const system = `[ROLE]
You are a tactical advisor evaluating a player's proposed action in a WWII game.

[INSTRUCTIONS]
Evaluate the player's proposed action against the available decisions.
Return JSON only — no markdown, no explanation outside the JSON:
{
  "matchedDecision": "<id of the closest existing decision>",
  "tier": "<suicidal|reckless|mediocre|sound|excellent>",
  "reasoning": "<one sentence explaining why>"
}
The tier should reflect the tactical quality of the player's plan given the situation.
Match to the existing decision whose outcome best fits what would happen.`;

  const decisionsFormatted = input.decisions.map((d, i) =>
    `${i + 1}. "${d.id}" (${d.tier}) — ${d.text}`
  ).join("\n");

  const userMessage = `[SCENE CONTEXT]
${input.sceneContext}

[GAME STATE]
${formatGameState(input.gameState)}

[AVAILABLE ACTIONS]
${decisionsFormatted}

[PLAYER'S ACTION]
"${input.playerText}"`;

  return { system, userMessage };
}

export function buildEpiloguePrompt(input: EpiloguePromptInput): PromptPair {
  const system = `[ROLE]
You are writing the "After the War" epilogue for soldiers in a WWII game.
Write in past tense, third person. Factual, restrained, moving. Like the
closing text of a documentary — no melodrama, just lives lived.

[INSTRUCTIONS]
Write 3-5 sentences about what happened to this soldier after D-Day.
Reference their relationships — especially if someone close survived or died.
If wounded, it should affect their postwar life.
If they lost someone close, it should mark them.
Keep it grounded. Real names, real places, real jobs. No Hollywood endings.
Maximum 100 words.`;

  const traits = input.soldier.traits.length > 0
    ? input.soldier.traits.join(", ")
    : "no notable traits";

  let userMessage = `[SOLDIER]
${input.soldier.rank} ${input.soldier.name}, age ${input.soldier.age}, from ${input.soldier.hometown}.
${input.soldier.background}. Traits: ${traits}.
Status at end: ${input.soldier.status}`;

  if (input.relationships.length > 0) {
    const relLines = input.relationships.map(r => {
      const targetId = r.soldierId === input.soldier.id ? r.targetId : r.soldierId;
      const partner = input.allSoldierStatuses.find(s => s.id === targetId);
      const partnerStatus = partner ? ` (${partner.status})` : "";
      return `- ${r.type}: ${r.detail}${partnerStatus}`;
    });
    userMessage += `\n\n[RELATIONSHIPS]\n${relLines.join("\n")}`;
  }

  if (input.events.length > 0) {
    const eventLines = input.events.map(e => `- ${e.description}`);
    userMessage += `\n\n[PLAYTHROUGH EVENTS]\n${eventLines.join("\n")}`;
  }

  return { system, userMessage };
}
