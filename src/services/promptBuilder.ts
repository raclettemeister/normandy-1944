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
  previousOutcomeContext?: string;
  playerAction?: string;
  casualties?: Soldier[];
  captainHit?: boolean;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
}

export interface RallyPromptInput {
  rallySoldiers: Soldier[];
  ammoGain: number;
  moraleGain: number;
  sceneContext: string;
  previousOutcomeContext?: string;
  gameState: GameState;
  roster: Soldier[];
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
  const isSceneEntry = !input.outcomeContext;

  const instructions = isSceneEntry
    ? `Write 2-4 sentences setting the scene.${input.previousOutcomeContext ? " Account for what just happened — the player is transitioning from the previous situation." : ""}
Reference the environment, threats, and sensory details.
Do not reference game mechanics (scores, percentages, tiers).
Maximum 80 words.`
    : `Write 2-4 sentences describing this outcome.
Reference specific soldiers by name when they act.
If a soldier was wounded or killed, reference their relationships.
Do not reference game mechanics (scores, percentages, tiers).
Maximum 80 words.`;

  let system = `[ROLE]
You are the narrator of a WWII tactical text game set during D-Day.

[TONE GUIDE]
${TONE_GUIDE}

[GAME STATE]
${formatGameState(input.gameState)}

[ACTIVE ROSTER]
${formatRoster(input.roster)}
${formatRelationships(input.relationships)}

[SCENE CONTEXT]
${input.sceneContext}`;

  if (input.previousOutcomeContext) {
    system += `\n\n[PREVIOUS OUTCOME — what just happened]\n${input.previousOutcomeContext}`;
  }

  system += `\n\n[INSTRUCTIONS]\n${instructions}`;

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
    userMessage = isSceneEntry
      ? "Narrate the scene entry. Ground it in the current situation and what just happened."
      : "Narrate the scene as described in the context.";
  }

  return { system, userMessage: userMessage.trim() };
}

export function buildRallyPrompt(input: RallyPromptInput): PromptPair {
  const soldierList = input.rallySoldiers.map(s => {
    const traits = s.traits.length > 0 ? s.traits.join("/") : "no traits";
    return `- ${s.rank} ${s.name} (${s.role}, ${traits}): ${s.background}`;
  }).join("\n");

  const system = `[ROLE]
You are the narrator of a WWII tactical text game set during D-Day.

[TONE GUIDE]
${TONE_GUIDE}

[GAME STATE]
${formatGameState(input.gameState)}

[SCENE CONTEXT]
${input.sceneContext}${input.previousOutcomeContext ? `\n\n[PREVIOUS OUTCOME — what just happened]\n${input.previousOutcomeContext}` : ""}

[SOLDIERS RALLYING]
${soldierList}

[INSTRUCTIONS]
Write 3-5 sentences describing these soldiers joining the captain.
Show each soldier's personality through how they arrive and react.
Account for the current situation — if things just went badly, the rally should reflect that tension.
Do not reference game mechanics.
Maximum 100 words.`;

  const userMessage = `${input.rallySoldiers.length} soldiers rally to the captain: ${input.rallySoldiers.map(s => s.name).join(", ")}. They bring ammo and raise morale. Narrate their arrival.`;

  return { system, userMessage };
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

// ─── DM Evaluation ─────────────────────────────────────────────────

export interface DMEvaluationPromptInput {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
  roster: Soldier[];
  relationships: SoldierRelationship[];
  recentEvents: PlaythroughEvent[];
  lessonsUnlocked: string[];
}

const TIER_DEFINITIONS = `[TIER DEFINITIONS — evaluate holistically]
- suicidal (5): Deliberately harmful, insane, will get people killed for no reason
- reckless (25): Brave but stupid. Takes extreme risks without mitigation
- mediocre (45): Vague, lazy, generic. "Attack" with no plan. Or does nothing
- sound (70): Reasonable plan. Makes tactical sense, accounts for basics
- excellent (90): Strong plan. Good use of terrain, coordination, timing
- masterful (105): ALL of these: tactically coherent, creative, shows situation awareness (names soldiers, references terrain, accounts for equipment), shows genuine engagement with the scenario. This is the ceiling — a player thinking like a real platoon leader.`;

const ADVERSARIAL_RULES = `[ADVERSARIAL INPUT HANDLING]
- Deliberate team-kill or betrayal → fatal: true. Game over.
- Surrender/desert → fatal: true. Game over.
- Fantasy/impossible ("cast fireball") → tier: mediocre. Narrative: incoherent order, men stare.
- Do nothing / "wait" → tier: mediocre. Time passes, readiness increases, morale drops.
- Vague / lazy ("attack") → tier: mediocre. Generic outcome.
- Repeating the same plan as a previous scene → consider downgrading. The enemy adapts.`;

export function buildDMEvaluationPrompt(input: DMEvaluationPromptInput): PromptPair {
  const anchorLines = input.decisions.map((d) => {
    const s = d.outcome.success;
    const f = d.outcome.failure;
    return `- "${d.id}" (${d.tier}): ${d.text} → success: ${s.menLost} casualties, failure: ${f.menLost} casualties`;
  });

  const anchors = anchorLines.length > 0
    ? `[ANCHOR DECISIONS — for calibration, not constraint]\nThese show the SCALE of outcomes for this scene:\n${anchorLines.join("\n")}\n\nUse these as calibration for what each tier looks like HERE.\nA player's plan can match an anchor, blend concepts, or be entirely original. Evaluate on its own merits.`
    : "[ANCHOR DECISIONS]\nNo predefined decisions for this scene. Evaluate the player's plan entirely on its own merits.";

  const recentEventLines = input.recentEvents.map((e) =>
    `- [${e.sceneId}] ${e.type}: ${e.description}`
  );
  const recentSection = recentEventLines.length > 0
    ? `\n\n[RECENT EVENTS — cross-scene memory]\n${recentEventLines.join("\n")}`
    : "";

  const lessonsSection = input.lessonsUnlocked.length > 0
    ? `\n\n[PLAYER'S UNLOCKED LESSONS]\n${input.lessonsUnlocked.join(", ")}`
    : "";

  const system = `[ROLE]
You are the DM (Dungeon Master) of a WWII tactical text game. You evaluate the player's plan and assign a tactical tier.

[TONE GUIDE]
${TONE_GUIDE}

${TIER_DEFINITIONS}

${ADVERSARIAL_RULES}

[GAME STATE]
${formatGameState(input.gameState)}

[ACTIVE ROSTER]
${formatRoster(input.roster)}
${formatRelationships(input.relationships)}

[SCENE CONTEXT]
${input.sceneContext}

${anchors}${recentSection}${lessonsSection}

[OUTPUT FORMAT — JSON only, no markdown]
{
  "tier": "<suicidal|reckless|mediocre|sound|excellent|masterful>",
  "reasoning": "<one sentence explaining why this tier>",
  "narrative": "<3-5 sentences narrating the execution and outcome. Reference specific soldiers. Use the player's plan language.>",
  "fatal": false,
  "intelGained": null,
  "planSummary": "<one sentence summary of the player's plan for the event log>",
  "secondInCommandReaction": "<Henderson's in-character reaction to the plan — calibrated to tier and competence>",
  "soldierReactions": [
    {"soldierId": "<id>", "text": "<in-character reaction>"}
  ]
}`;

  const userMessage = `[PLAYER'S PLAN]\n"${input.playerText}"\n\nEvaluate this plan. Return JSON only.`;

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
