import { useState, useCallback } from "react";
import type {
  GameState,
  CaptainPosition,
  Decision,
  Achievement,
} from "../types/index.ts";
import { createInitialState } from "../engine/gameState.ts";
import {
  getScene,
  getAvailableDecisions,
  getSecondInCommandComment,
} from "../engine/scenarioLoader.ts";
import {
  calculateEffectiveScore,
  getOutcomeRange,
  rollOutcome,
  getOutcomeTier,
  processSceneTransition,
} from "../engine/outcomeEngine.ts";
import { unlockLesson } from "../engine/lessonTracker.ts";
import StatusPanel from "./StatusPanel";
import NarrativePanel from "./NarrativePanel";
import DecisionPanel from "./DecisionPanel";
import LessonJournal from "./LessonJournal";
import OrdersPanel from "./OrdersPanel";
import WikiPanel from "./WikiPanel";
import RosterPanel from "./RosterPanel";
import AchievementPopup from "./AchievementPopup";

type Overlay = "orders" | "roster" | "wiki" | "lessons" | null;

export interface GameEndData {
  finalState: GameState;
  captainSurvived: boolean;
  deathNarrative?: string;
  lastLesson?: string;
  newAchievements: Achievement[];
}

interface GameScreenProps {
  onGameOver: (data: GameEndData) => void;
  onVictory: (data: GameEndData) => void;
}

export default function GameScreen({ onGameOver, onVictory }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [captainPosition, setCaptainPosition] =
    useState<CaptainPosition>("middle");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [processing, setProcessing] = useState(false);
  const [pendingAchievement, setPendingAchievement] =
    useState<Achievement | null>(null);

  const scene = getScene(gameState.currentScene);
  const decisions = scene ? getAvailableDecisions(scene, gameState) : [];
  const secondInCommandComment = scene
    ? getSecondInCommandComment(scene, gameState, decisions)
    : null;

  const handleDecision = useCallback(
    (decision: Decision) => {
      if (!scene || processing) return;
      setProcessing(true);

      const effectiveScore = calculateEffectiveScore(
        decision.tier,
        gameState,
        decision
      );
      const range = getOutcomeRange(effectiveScore);
      const roll = rollOutcome(range);
      const tier = getOutcomeTier(roll);
      const outcome = decision.outcome[tier];

      const pos = scene.combatScene ? captainPosition : "middle";
      const result = processSceneTransition(gameState, scene, outcome, pos);

      unlockLesson(decision.outcome.lessonUnlocked);

      const isFatal =
        result.captainHit || (decision.outcome.fatal && tier === "failure");

      if (isFatal) {
        onGameOver({
          finalState: result.state,
          captainSurvived: false,
          deathNarrative: outcome.text,
          lastLesson: decision.outcome.lessonUnlocked,
          newAchievements: [],
        });
        return;
      }

      if (result.state.men <= 0 && result.state.roster.length > 0) {
        onGameOver({
          finalState: result.state,
          captainSurvived: true,
          deathNarrative:
            "All your men are down. You are alone, with no way to complete the mission.",
          lastLesson: decision.outcome.lessonUnlocked,
          newAchievements: [],
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
          newAchievements: [],
        });
        return;
      }

      setGameState({
        ...result.state,
        currentScene: nextSceneId,
        scenesVisited: [...result.state.scenesVisited, scene.id],
        lessonsUnlocked: [
          ...new Set([
            ...result.state.lessonsUnlocked,
            decision.outcome.lessonUnlocked,
          ]),
        ],
      });

      setOutcomeText(outcome.text);
      setCaptainPosition("middle");
      setProcessing(false);
    },
    [scene, gameState, captainPosition, processing, onGameOver, onVictory]
  );

  const narrative = scene?.narrative ?? "";
  const rallyText = scene?.rally?.narrative ?? null;

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
          <button
            className="btn"
            data-testid="lesson-journal-btn"
            onClick={() =>
              setOverlay(overlay === "lessons" ? null : "lessons")
            }
          >
            Lessons
          </button>
        </div>
      </header>

      <StatusPanel state={gameState} />

      <NarrativePanel
        narrative={narrative}
        outcomeText={outcomeText}
        rallyText={rallyText}
      />

      <DecisionPanel
        decisions={decisions}
        onDecision={handleDecision}
        secondInCommandComment={secondInCommandComment}
        isCombatScene={!!scene.combatScene}
        captainPosition={captainPosition}
        onCaptainPositionChange={setCaptainPosition}
        disabled={processing}
      />

      {overlay === "orders" && (
        <OrdersPanel
          milestones={gameState.milestones}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "roster" && (
        <RosterPanel
          roster={gameState.roster}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "wiki" && <WikiPanel onClose={() => setOverlay(null)} />}
      {overlay === "lessons" && (
        <LessonJournal
          lessonIds={gameState.lessonsUnlocked}
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
