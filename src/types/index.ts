// ─── Core Game Types ───────────────────────────────────────────────

export type GamePhase = "solo" | "squad" | "platoon";

export type CaptainPosition = "front" | "middle" | "rear";

export type AmmoState = number;

export interface GameTime {
  hour: number;
  minute: number;
}

export interface GameState {
  men: number;
  ammo: AmmoState;
  morale: number;
  readiness: number;
  time: GameTime;

  capabilities: PlatoonCapabilities;
  intel: IntelFlags;

  roster: Soldier[];
  secondInCommand: SecondInCommand | null;

  milestones: Milestone[];

  lessonsUnlocked: string[];
  scenesVisited: string[];
  currentScene: string;

  phase: GamePhase;
  act: 1 | 2 | 3;
}

// ─── Platoon Capabilities ──────────────────────────────────────────

export interface PlatoonCapabilities {
  canSuppress: boolean;
  canTreatWounded: boolean;
  hasRadio: boolean;
  hasNCO: boolean;
  hasExplosives: boolean;
  canScout: boolean;
}

// ─── Intel ─────────────────────────────────────────────────────────

export interface IntelFlags {
  hasMap: boolean;
  hasCompass: boolean;
  scoutedObjective: boolean;
  knowsMGPosition: boolean;
  knowsPatrolRoute: boolean;
  friendlyContact: boolean;
}

// ─── Soldiers ──────────────────────────────────────────────────────

export type SoldierRole =
  | "rifleman"
  | "BAR_gunner"
  | "MG_gunner"
  | "NCO"
  | "medic"
  | "radioman"
  | "platoon_sergeant";

export type SoldierTrait =
  | "steady"
  | "brave"
  | "coward"
  | "hothead"
  | "sharpshooter"
  | "green"
  | "veteran"
  | "scrounger"
  | "medic_instinct"
  | "natural_leader"
  | "loyal"
  | "unlucky"
  | "lucky"
  | "quiet"
  | "loud_mouth"
  | "resourceful";

export interface Soldier {
  id: string;
  name: string;
  nickname?: string;
  rank: "Pvt" | "PFC" | "Cpl" | "Sgt" | "SSgt";
  role: SoldierRole;
  status: "active" | "wounded" | "KIA" | "missing";
  age: number;
  hometown: string;
  background: string;
  traits: SoldierTrait[];
}

// ─── Enemy Readiness ───────────────────────────────────────────────

export interface EnemyReadiness {
  level: number;
  alertStatus: "CONFUSED" | "ALERTED" | "ORGANIZED" | "FORTIFIED";
}

// ─── Second in Command ─────────────────────────────────────────────

export interface SecondInCommand {
  soldier: Soldier;
  competence: "veteran" | "green";
  alive: boolean;
}

export interface SecondInCommandComment {
  trigger: CommentTrigger;
  text: string;
}

export type CommentTrigger =
  | { type: "low_ammo"; threshold: number }
  | { type: "low_morale"; threshold: number }
  | { type: "low_men"; threshold: number }
  | { type: "high_readiness"; threshold: number }
  | { type: "time_pressure"; milestone: string }
  | { type: "time_surplus" }
  | { type: "bad_decision"; tier: "suicidal" | "reckless" }
  | { type: "before_decision"; decisionId: string };

// ─── Tactical Tiers ────────────────────────────────────────────────

export type TacticalTier = "suicidal" | "reckless" | "mediocre" | "sound" | "excellent";

export const TIER_BASE_SCORES: Record<TacticalTier, number> = {
  suicidal: 5,
  reckless: 25,
  mediocre: 45,
  sound: 70,
  excellent: 90,
};

// ─── Outcome Engine ────────────────────────────────────────────────

export type OutcomeTier = "success" | "partial" | "failure";

export interface OutcomeRange {
  floor: number;
  ceiling: number;
}

export interface OutcomeNarrative {
  text: string;
  menLost: number;
  ammoSpent: number;
  moraleChange: number;
  readinessChange: number;
  intelGained?: keyof IntelFlags;
  menGained?: number;
  skipRally?: boolean;
  timeCost?: number;
  context?: string;
}

export interface OutcomeTemplate {
  success: OutcomeNarrative;
  partial: OutcomeNarrative;
  failure: OutcomeNarrative;
  fatal?: boolean;
  lessonUnlocked: string;
  nextScene: string;
  nextSceneOnFailure?: string;
}

export interface SceneTransitionResult {
  state: GameState;
  casualties: Soldier[];
  captainHit: boolean;
}

// ─── Scenario / Content ────────────────────────────────────────────

export interface Scenario {
  id: string;
  act: 1 | 2 | 3;
  timeCost: number;
  narrative: string;
  narrativeAlt?: Record<string, string>;
  combatScene?: boolean;
  secondInCommandComments?: Record<string, string>;
  decisions: Decision[];
  rally?: RallyEvent;
  achievesMilestone?: string;
  sceneContext?: string;
}

export interface Decision {
  id: string;
  text: string;
  tier: TacticalTier;
  minMen?: number;
  requiresPhase?: GamePhase;
  requiresCapability?: keyof PlatoonCapabilities;
  benefitsFromIntel?: keyof IntelFlags;
  visibleIf?: VisibilityCondition;
  outcome: OutcomeTemplate;
}

export interface VisibilityCondition {
  hasLesson?: string;
  hasIntel?: string;
  minMen?: number;
  phase?: GamePhase;
}

export interface RallyEvent {
  soldiers: Soldier[];
  ammoGain: number;
  moraleGain: number;
  narrative: string;
}

// ─── Battle Orders ─────────────────────────────────────────────────

export interface BattleOrders {
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  time: string;
  description: string;
  status: "pending" | "achieved" | "missed";
}

// ─── Lessons ───────────────────────────────────────────────────────

export type LessonCategory =
  | "movement_navigation"
  | "engagement"
  | "defense"
  | "leadership"
  | "intel_recon";

export interface Lesson {
  id: string;
  category: LessonCategory;
  title: string;
  content: string;
  unlockedBy: string[];
  enablesOptions?: string[];
}

// ─── Wiki ──────────────────────────────────────────────────────────

export type WikiCategory =
  | "weapon_us"
  | "weapon_german"
  | "equipment"
  | "tactic"
  | "unit"
  | "terrain"
  | "vehicle";

export interface WikiEntry {
  id: string;
  term: string;
  category: WikiCategory;
  shortDescription: string;
  fullDescription: string;
  tacticalNote?: string;
}

// ─── Achievements ──────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: "game_complete" }
  | { type: "game_complete_no_casualties" }
  | { type: "game_over"; cause: string }
  | { type: "captain_position_streak"; position: CaptainPosition; count: number }
  | { type: "all_lessons_unlocked" }
  | { type: "men_count"; threshold: number; comparison: "gte" | "lte" }
  | { type: "milestone_all_on_time" }
  | { type: "readiness_threshold"; max: number }
  | { type: "specific_decision"; decisionId: string }
  | { type: "playthroughs"; count: number };

export interface RunHistory {
  playthroughCount: number;
  decisionsThisRun: string[];
  captainPositions: CaptainPosition[];
  gameCompleted: boolean;
  gameOverCause?: string;
  lessonsUnlocked: string[];
  menRallied: number;
  maxMen: number;
  minMorale: number;
  maxReadiness: number;
  allMilestonesOnTime: boolean;
  zeroKIA: boolean;
  zeroCasualties: boolean;
}

// ─── Epilogues ─────────────────────────────────────────────────────

export interface SoldierEpilogue {
  soldierId: string;
  status: "active" | "wounded" | "KIA" | "missing";
  epilogue: string;
}

export interface EpilogueTemplate {
  active: string[];
  wounded: string[];
  KIA: string[];
  missing: string[];
}

// ─── Soldier Relationships ────────────────────────────────────────

export interface SoldierRelationship {
  soldierId: string;
  targetId: string;
  type: "protective" | "rivalry" | "brothers" | "depends_on" | "resents";
  detail: string;
}

// ─── Playthrough Events ───────────────────────────────────────────

export interface PlaythroughEvent {
  sceneId: string;
  type:
    | "casualty"
    | "trait_triggered"
    | "relationship_moment"
    | "close_call"
    | "brave_act"
    | "player_action"
    | "promotion";
  soldierIds: string[];
  description: string;
}

// ─── Narrative Service ────────────────────────────────────────────

export type NarrativeMode = "llm" | "template" | "hardcoded";

export interface NarrativeRequest {
  type: "scene" | "outcome" | "rally" | "death" | "epilogue" | "secondInCommand";
  sceneContext?: string;
  outcomeContext?: string;
  playerAction?: string;
  gameState: GameState;
  casualties?: Soldier[];
  captainHit?: boolean;
  soldier?: Soldier;
  events?: PlaythroughEvent[];
}

export interface ClassificationRequest {
  sceneContext: string;
  decisions: Decision[];
  playerText: string;
  gameState: GameState;
}

export interface ClassificationResult {
  matchedDecision: string;
  tier: TacticalTier;
  reasoning: string;
}

// ─── Access Codes ─────────────────────────────────────────────────

export interface AccessCode {
  code: string;
  createdAt: string;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  label?: string;
}
