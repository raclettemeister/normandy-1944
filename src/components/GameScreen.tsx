import { useState, useCallback, useRef, useEffect } from "react";
import type {
  GameState,
  CaptainPosition,
  Decision,
  Achievement,
  PlaythroughEvent,
  Scenario,
  OutcomeNarrative,
  Difficulty,
  TacticalPhase,
  DMEvaluation,
  RunHistory,
} from "../types/index.ts";
import { createInitialStateWithDifficulty, advanceTime, clamp } from "../engine/gameState.ts";
import {
  getScene,
  getAvailableDecisions,
  getSecondInCommandComment,
} from "../engine/scenarioLoader.ts";
import {
  calculateEffectiveScore,
  calculateEffectiveScoreFromTier,
  getOutcomeRange,
  rollOutcome,
  getOutcomeTier,
  processSceneTransition,
} from "../engine/outcomeEngine.ts";
import { deriveBalanceEnvelope } from "../engine/balanceEnvelope.ts";
import { unlockWikiEntry, migrateFromLegacy, loadMeta, setRosterNote } from "../engine/metaProgress.ts";
import { checkAchievements, unlockAchievement } from "../engine/achievementTracker.ts";
import { getActiveRelationships } from "../content/relationships.ts";
import { NarrativeService } from "../services/narrativeService.ts";
import { EventLog } from "../services/eventLog.ts";
import StatusPanel from "./StatusPanel";
import NarrativePanel from "./NarrativePanel";
import PrepPhase from "./PrepPhase.tsx";
import PlanPhase from "./PlanPhase.tsx";
import BriefingPhase from "./BriefingPhase.tsx";
import OrdersPanel from "./OrdersPanel";
import WikiPanel from "./WikiPanel";
import RosterPanel from "./RosterPanel";
import AchievementPopup from "./AchievementPopup";

type Overlay = "orders" | "roster" | "wiki" | null;

interface PendingTransition {
  nextSceneId: string;
  nextScene: Scenario;
  newState: GameState;
  outcomeContext?: string;
  outcome: OutcomeNarrative;
  wikiUnlocks: string;
}

export interface GameEndData {
  finalState: GameState;
  captainSurvived: boolean;
  deathNarrative?: string;
  lastLesson?: string;
  newAchievements: Achievement[];
  eventLog: PlaythroughEvent[];
}

interface GameScreenProps {
  onGameOver: (data: GameEndData) => void;
  onVictory: (data: GameEndData) => void;
  narrativeService: NarrativeService;
  difficulty: Difficulty;
}

export default function GameScreen({
  onGameOver,
  onVictory,
  narrativeService,
  difficulty,
}: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialStateWithDifficulty(difficulty)
  );
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [sceneNarrative, setSceneNarrative] = useState<string | null>(null);
  const [rallyNarrative, setRallyNarrative] = useState<string | null>(null);
  const [captainPosition, setCaptainPosition] =
    useState<CaptainPosition>("middle");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [processing, setProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);
  const [generatingScene, setGeneratingScene] = useState(false);
  const [pendingAchievement, setPendingAchievement] =
    useState<Achievement | null>(null);
  const eventLogRef = useRef(new EventLog());
  const runTrackerRef = useRef({
    decisions: [] as string[],
    positions: [] as CaptainPosition[],
    maxMen: 0,
    minMorale: 100,
    maxReadiness: 0,
  });

  const [currentPhase, setCurrentPhase] = useState<TacticalPhase>("situation");
  const [dmEvaluation, setDmEvaluation] = useState<DMEvaluation | null>(null);
  const [forcedEasyMode, setForcedEasyMode] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [lastPlayerText, setLastPlayerText] = useState<string>("");

  useEffect(() => { migrateFromLegacy(); }, []);

  const getNewAchievements = useCallback((state: GameState, completed: boolean, cause?: string): Achievement[] => {
    const tracker = runTrackerRef.current;
    const meta = loadMeta();
    const kiaCount = state.roster.filter(s => s.status === "KIA").length;
    const woundedCount = state.roster.filter(s => s.status === "wounded").length;
    const history: RunHistory = {
      playthroughCount: meta.completedRuns + 1,
      decisionsThisRun: tracker.decisions,
      captainPositions: tracker.positions,
      gameCompleted: completed,
      gameOverCause: cause,
      wikiUnlocked: state.wikiUnlocked,
      menRallied: state.roster.length,
      maxMen: Math.max(tracker.maxMen, state.men),
      minMorale: Math.min(tracker.minMorale, state.morale),
      maxReadiness: Math.max(tracker.maxReadiness, state.readiness),
      allMilestonesOnTime: state.milestones.every(m => m.status !== "missed"),
      zeroKIA: kiaCount === 0,
      zeroCasualties: kiaCount === 0 && woundedCount === 0,
    };
    const earned = checkAchievements(state, history);
    for (const a of earned) unlockAchievement(a.id);
    return earned;
  }, []);

  const trackDecision = useCallback((decisionId: string, pos: CaptainPosition, state: GameState) => {
    const t = runTrackerRef.current;
    t.decisions.push(decisionId);
    t.positions.push(pos);
    t.maxMen = Math.max(t.maxMen, state.men);
    t.minMorale = Math.min(t.minMorale, state.morale);
    t.maxReadiness = Math.max(t.maxReadiness, state.readiness);
  }, []);

  const scene = getScene(gameState.currentScene);
  const decisions = scene ? getAvailableDecisions(scene, gameState) : [];
  const secondInCommandComment = scene
    ? getSecondInCommandComment(scene, gameState, decisions)
    : null;

  const showingOutcome = pendingTransition !== null;

  const handleDecision = useCallback(
    async (decision: Decision, playerAction?: string) => {
      if (!scene || processing) return;
      setProcessing(true);

      const pos = scene.combatScene ? captainPosition : "middle";
      const effectiveScore = calculateEffectiveScore(
        decision.tier,
        gameState,
        decision,
        pos
      );
      const range = getOutcomeRange(effectiveScore);
      const roll = rollOutcome(range);
      const tier = getOutcomeTier(roll);
      const outcome = decision.outcome[tier];
      const result = processSceneTransition(gameState, scene, outcome, pos);

      unlockWikiEntry(decision.outcome.wikiUnlocks);
      trackDecision(decision.id, pos, gameState);

      const log = eventLogRef.current;

      if (result.casualties && result.casualties.length > 0) {
        for (const c of result.casualties) {
          log.append({
            sceneId: scene.id,
            type: "casualty",
            soldierIds: [c.id],
            description: `${c.rank} ${c.name} ${c.status === "KIA" ? "killed" : "wounded"} at ${scene.id}`,
          });
        }
      }

      if (result.captainHit) {
        log.append({
          sceneId: scene.id,
          type: "close_call",
          soldierIds: [],
          description: `Captain hit at ${scene.id}`,
        });
      }

      if (playerAction) {
        log.append({
          sceneId: scene.id,
          type: "player_action",
          soldierIds: [],
          description: playerAction,
        });
      }

      const isFatal =
        result.captainHit || (decision.outcome.fatal && tier === "failure");

      if (isFatal) {
        onGameOver({
          finalState: result.state,
          captainSurvived: false,
          deathNarrative: outcome.text,
          lastLesson: decision.outcome.wikiUnlocks,
          newAchievements: getNewAchievements(result.state, false, "captain_killed"),
          eventLog: log.getAll(),
        });
        return;
      }

      if (result.state.men <= 0 && result.state.roster.length > 0) {
        onGameOver({
          finalState: result.state,
          captainSurvived: true,
          deathNarrative:
            "All your men are down. You are alone, with no way to complete the mission.",
          lastLesson: decision.outcome.wikiUnlocks,
          newAchievements: getNewAchievements(result.state, false, "all_men_down"),
          eventLog: log.getAll(),
        });
        return;
      }

      const nextSceneId =
        tier === "failure" && decision.outcome.nextSceneOnFailure
          ? decision.outcome.nextSceneOnFailure
          : decision.outcome.nextScene;

      const nextScene = getScene(nextSceneId);

      if (!nextScene) {
        onVictory({
          finalState: result.state,
          captainSurvived: true,
          newAchievements: getNewAchievements(result.state, true),
          eventLog: log.getAll(),
        });
        return;
      }

      // Phase 1: Show outcome on current scene, store transition for later
      setOutcomeText(outcome.text);

      const newState = {
        ...result.state,
        currentScene: nextSceneId,
        scenesVisited: [...result.state.scenesVisited, scene.id],
        wikiUnlocked: [
          ...new Set([
            ...result.state.wikiUnlocked,
            decision.outcome.wikiUnlocks,
          ]),
        ],
      };

      setPendingTransition({
        nextSceneId,
        nextScene,
        newState,
        outcomeContext: outcome.context,
        outcome,
        wikiUnlocks: decision.outcome.wikiUnlocks,
      });

      const isLlmMode = narrativeService.getMode() === "llm";

      if (isLlmMode && outcome.context) {
        setIsStreaming(true);
        const activeSoldierIds = gameState.roster
          .filter(s => s.status === "active")
          .map(s => s.id);
        const relationships = getActiveRelationships(activeSoldierIds);

        narrativeService.generateOutcomeNarrative({
          outcomeText: outcome.text,
          outcomeContext: outcome.context,
          sceneContext: scene.sceneContext,
          gameState,
          roster: gameState.roster.filter(s => s.status === "active"),
          relationships,
          captainHit: result.captainHit,
          playerAction,
          onChunk: (chunk) => {
            setOutcomeText(prev => (prev === outcome.text ? chunk : (prev ?? "") + chunk));
          },
        }).then(finalText => {
          setOutcomeText(finalText);
          setIsStreaming(false);
        }).catch(() => {
          setIsStreaming(false);
        });
      }

      setCaptainPosition("middle");
      setProcessing(false);
    },
    [scene, gameState, captainPosition, processing, onGameOver, onVictory, narrativeService, trackDecision, getNewAchievements]
  );

  const handleContinue = useCallback(async () => {
    if (!pendingTransition || isStreaming) return;

    const { nextScene, newState, outcomeContext, outcome } = pendingTransition;
    const isLlmMode = narrativeService.getMode() === "llm";

    setGeneratingScene(true);
    setOutcomeText(null);
    setSceneNarrative(null);
    setRallyNarrative(null);

    setGameState(newState);
    setPendingTransition(null);
    setCurrentPhase("situation");
    setDmEvaluation(null);
    setForcedEasyMode(false);
    setFallbackMessage(null);
    setLastPlayerText("");

    if (isLlmMode && nextScene.sceneContext) {
      const nextActiveRoster = newState.roster.filter(s => s.status === "active");
      const nextActiveSoldierIds = nextActiveRoster.map(s => s.id);
      const nextRelationships = getActiveRelationships(nextActiveSoldierIds);

      const [sceneText, rallyText] = await Promise.all([
        narrativeService.generateSceneNarrative(
          nextScene.sceneContext,
          newState,
          nextActiveRoster,
          nextRelationships,
          nextScene.narrative,
          outcomeContext,
        ),
        nextScene.rally && !outcome.skipRally
          ? narrativeService.generateRallyNarrative(
              nextScene.rally.soldiers,
              nextScene.rally.ammoGain,
              nextScene.rally.moraleGain,
              nextScene.sceneContext,
              newState,
              nextActiveRoster,
              nextScene.rally.narrative,
              outcomeContext,
            )
          : Promise.resolve(null),
      ]);

      setSceneNarrative(sceneText);
      if (rallyText) setRallyNarrative(rallyText);
    }

    setGeneratingScene(false);
  }, [pendingTransition, isStreaming, narrativeService]);

  const handlePrepComplete = useCallback((timeCostMinutes: number) => {
    if (timeCostMinutes > 0) {
      setGameState((prev) => ({
        ...prev,
        time: advanceTime(prev.time, timeCostMinutes),
        readiness: clamp(prev.readiness + Math.floor(timeCostMinutes / 10), 0, 100),
      }));
    }
    setCurrentPhase("plan");
  }, []);

  const handleSubmitPrompt = useCallback(
    async (playerText: string) => {
      if (!scene) return;
      setProcessing(true);
      setLastPlayerText(playerText);

      const dmLayer = narrativeService.getDMLayer();
      if (!dmLayer) {
        setFallbackMessage("Fall back on training, Captain.");
        setForcedEasyMode(true);
        setCurrentPhase("plan");
        setProcessing(false);
        return;
      }

      const recentEvents = eventLogRef.current.getRecentForDM(10);
      const activeSoldierIds = gameState.roster
        .filter((s) => s.status === "active")
        .map((s) => s.id);
      const relationships = getActiveRelationships(activeSoldierIds);

      const evaluation = await dmLayer.evaluatePrompt({
        playerText,
        sceneContext: scene.sceneContext ?? scene.narrative,
        decisions,
        gameState,
        roster: gameState.roster.filter((s) => s.status === "active"),
        relationships,
        recentEvents,
        wikiUnlocked: gameState.wikiUnlocked,
      });

      if (!evaluation) {
        setFallbackMessage("Fall back on training, Captain.");
        setForcedEasyMode(true);
        setProcessing(false);
        return;
      }

      setDmEvaluation(evaluation);
      setFallbackMessage(null);
      setForcedEasyMode(false);

      eventLogRef.current.append({
        sceneId: scene.id,
        type: "plan_summary",
        soldierIds: [],
        description: evaluation.planSummary,
      });

      setCurrentPhase("briefing");
      setProcessing(false);
    },
    [scene, gameState, decisions, narrativeService]
  );

  const handleRevealTokenUsed = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      revealTokensRemaining: Math.max(0, prev.revealTokensRemaining - 1),
    }));
  }, []);

  const handleBriefingRevise = useCallback(() => {
    setDmEvaluation(null);
    setCurrentPhase("plan");
  }, []);

  const handleBriefingCommit = useCallback(async () => {
    if (!scene || !dmEvaluation) return;
    setCurrentPhase("execution");
    setProcessing(true);

    const log = eventLogRef.current;
    const pos = scene.combatScene ? captainPosition : "middle";
    const referenceDecision = decisions[0];

    if (referenceDecision) {
      trackDecision(referenceDecision.id, pos, gameState);
    }

    if (dmEvaluation.fatal) {
      onGameOver({
        finalState: gameState,
        captainSurvived: false,
        deathNarrative: dmEvaluation.narrative,
        lastLesson: referenceDecision?.outcome.wikiUnlocks,
        newAchievements: getNewAchievements(gameState, false, "captain_killed"),
        eventLog: log.getAll(),
      });
      return;
    }

    const effectiveScore = calculateEffectiveScoreFromTier(
      dmEvaluation.tier, gameState, pos
    );
    const range = getOutcomeRange(effectiveScore);
    const roll = rollOutcome(range);
    const outcomeTier = getOutcomeTier(roll);

    const derivedEnvelope = deriveBalanceEnvelope(decisions);
    const envelope = scene.balanceEnvelopeOverride ?? derivedEnvelope;
    const envRange = envelope[outcomeTier];
    const rollPosition = (range.ceiling - range.floor) > 0
      ? (roll - range.floor) / (range.ceiling - range.floor)
      : 0.5;

    const lerp = (min: number, max: number) =>
      Math.round(min + rollPosition * (max - min));

    const outcome: OutcomeNarrative = {
      text: dmEvaluation.narrative,
      context: dmEvaluation.reasoning,
      menLost: lerp(envRange.menLost[0], envRange.menLost[1]),
      ammoSpent: lerp(envRange.ammoSpent[0], envRange.ammoSpent[1]),
      moraleChange: lerp(envRange.moraleChange[0], envRange.moraleChange[1]),
      readinessChange: lerp(envRange.readinessChange[0], envRange.readinessChange[1]),
      intelGained: dmEvaluation.intelGained,
    };

    const result = processSceneTransition(gameState, scene, outcome, pos);

    if (referenceDecision) {
      unlockWikiEntry(referenceDecision.outcome.wikiUnlocks);
    }

    if (result.casualties.length > 0) {
      for (const c of result.casualties) {
        log.append({
          sceneId: scene.id,
          type: "casualty",
          soldierIds: [c.id],
          description: `${c.rank} ${c.name} ${c.status === "KIA" ? "killed" : "wounded"} at ${scene.id}`,
        });
      }
    }

    if (result.captainHit) {
      log.append({
        sceneId: scene.id,
        type: "close_call",
        soldierIds: [],
        description: `Captain hit at ${scene.id}`,
      });

      onGameOver({
        finalState: result.state,
        captainSurvived: false,
        deathNarrative: dmEvaluation.narrative,
        lastLesson: referenceDecision?.outcome.wikiUnlocks,
        newAchievements: getNewAchievements(result.state, false, "captain_killed"),
        eventLog: log.getAll(),
      });
      return;
    }

    if (result.state.men <= 0 && result.state.roster.length > 0) {
      onGameOver({
        finalState: result.state,
        captainSurvived: true,
        deathNarrative: "All your men are down. You are alone, with no way to complete the mission.",
        lastLesson: referenceDecision?.outcome.wikiUnlocks,
        newAchievements: getNewAchievements(result.state, false, "all_men_down"),
        eventLog: log.getAll(),
      });
      return;
    }

    const nextSceneId = referenceDecision
      ? (outcomeTier === "failure" && referenceDecision.outcome.nextSceneOnFailure
          ? referenceDecision.outcome.nextSceneOnFailure
          : referenceDecision.outcome.nextScene)
      : "";

    const nextScene = getScene(nextSceneId);

    if (!nextScene) {
      onVictory({
        finalState: result.state,
        captainSurvived: true,
        newAchievements: getNewAchievements(result.state, true),
        eventLog: log.getAll(),
      });
      return;
    }

    setOutcomeText(dmEvaluation.narrative);

    const newState = {
      ...result.state,
      currentScene: nextSceneId,
      scenesVisited: [...result.state.scenesVisited, scene.id],
      wikiUnlocked: referenceDecision
        ? [...new Set([...result.state.wikiUnlocked, referenceDecision.outcome.wikiUnlocks])]
        : result.state.wikiUnlocked,
    };

    setPendingTransition({
      nextSceneId,
      nextScene,
      newState,
      outcomeContext: outcome.context,
      outcome,
      wikiUnlocks: referenceDecision?.outcome.wikiUnlocks ?? "",
    });

    setCaptainPosition("middle");
    setProcessing(false);
  }, [scene, dmEvaluation, gameState, decisions, captainPosition, onGameOver, onVictory, narrativeService, trackDecision, getNewAchievements]);

  const narrative = sceneNarrative ?? scene?.narrative ?? "";
  const rallyText = rallyNarrative ?? scene?.rally?.narrative ?? null;

  if (!scene) {
    return (
      <div className="game-screen">
        <header className="game-header">
          <span className="game-header__title">NORMANDY 1944</span>
        </header>
        <StatusPanel state={gameState} />
        <div className="no-scenario">
          <p>No scenarios loaded.</p>
          <p>
            Awaiting deployment orders... The content agent has not yet written
            Act 1 scenarios. Load scenario files to begin operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <header className="game-header">
        <span className="game-header__title">NORMANDY 1944</span>
        <div className="toolbar">
          <button
            className="btn"
            data-testid="orders-btn"
            onClick={() => setOverlay(overlay === "orders" ? null : "orders")}
          >
            Orders
          </button>
          <button
            className="btn"
            data-testid="roster-btn"
            onClick={() => setOverlay(overlay === "roster" ? null : "roster")}
          >
            Roster
          </button>
          <button
            className="btn"
            data-testid="wiki-btn"
            onClick={() => setOverlay(overlay === "wiki" ? null : "wiki")}
          >
            Wiki
          </button>
        </div>
      </header>

      <StatusPanel state={gameState} />

      {showingOutcome ? (
        <>
          <NarrativePanel
            narrative={narrative}
            outcomeText={outcomeText}
            rallyText={null}
            isStreaming={isStreaming}
          />
          <div className="transition-prompt">
            <button
              className="btn btn--primary transition-prompt__btn"
              onClick={handleContinue}
              disabled={isStreaming}
            >
              {isStreaming ? "..." : "Continue..."}
            </button>
          </div>
        </>
      ) : (
        <>
          <NarrativePanel
            narrative={narrative}
            outcomeText={null}
            rallyText={rallyText}
            isStreaming={false}
            isLoading={generatingScene}
          />

          {!generatingScene && (
            <>
              {currentPhase === "situation" && (
                <button
                  className="btn btn--primary"
                  onClick={() => setCurrentPhase(
                    scene.prepActions && scene.prepActions.length > 0
                      ? "preparation"
                      : "plan"
                  )}
                  data-testid="situation-continue"
                >
                  Assess the Situation
                </button>
              )}

              {currentPhase === "preparation" && scene.prepActions && (
                <PrepPhase
                  prepActions={scene.prepActions}
                  secondInCommandCompetence={
                    gameState.secondInCommand?.competence ?? "green"
                  }
                  onPrepComplete={handlePrepComplete}
                  disabled={processing}
                />
              )}

              {currentPhase === "plan" && (
                <>
                  {fallbackMessage && (
                    <div className="fallback-message" data-testid="fallback-message">
                      {fallbackMessage}
                    </div>
                  )}
                  <PlanPhase
                    difficulty={forcedEasyMode ? "easy" : difficulty}
                    decisions={decisions}
                    revealTokensRemaining={gameState.revealTokensRemaining}
                    onSubmitPrompt={handleSubmitPrompt}
                    initialPromptText={lastPlayerText}
                    onSelectDecision={(d) => {
                      setForcedEasyMode(false);
                      setFallbackMessage(null);
                      handleDecision(d);
                    }}
                    onRevealTokenUsed={handleRevealTokenUsed}
                    secondInCommandComment={secondInCommandComment}
                    isCombatScene={!!scene.combatScene}
                    captainPosition={captainPosition}
                    onCaptainPositionChange={setCaptainPosition}
                    disabled={processing}
                    loading={processing}
                  />
                </>
              )}

              {currentPhase === "briefing" && dmEvaluation && (
                <BriefingPhase
                  playerPlanText={lastPlayerText}
                  secondInCommandReaction={dmEvaluation.secondInCommandReaction}
                  soldierReactions={dmEvaluation.soldierReactions}
                  roster={gameState.roster.filter((s) => s.status === "active")}
                  hasSecondInCommand={gameState.secondInCommand !== null}
                  onRevise={handleBriefingRevise}
                  onCommit={handleBriefingCommit}
                  disabled={processing}
                />
              )}
            </>
          )}
        </>
      )}

      {overlay === "orders" && (
        <OrdersPanel
          milestones={gameState.milestones}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "roster" && (
        <RosterPanel
          roster={gameState.roster}
          rosterNotes={loadMeta().rosterNotes}
          onNoteChange={(soldierId, note) => {
            setRosterNote(soldierId, note);
          }}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "wiki" && (
        <WikiPanel
          unlockedEntryIds={loadMeta().unlockedWikiEntries}
          onClose={() => setOverlay(null)}
        />
      )}

      {pendingAchievement && (
        <AchievementPopup
          achievement={pendingAchievement}
          onDismiss={() => setPendingAchievement(null)}
        />
      )}
    </div>
  );
}
