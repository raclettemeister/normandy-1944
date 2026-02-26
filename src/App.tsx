import { useState, useCallback, useMemo } from "react";
import type { GameState, Achievement, PlaythroughEvent, Difficulty } from "./types/index.ts";
import MainMenu from "./components/MainMenu";
import GameScreen from "./components/GameScreen";
import type { GameEndData } from "./components/GameScreen";
import DeathReport from "./components/DeathReport";
import EpilogueScreen from "./components/EpilogueScreen";
import AchievementPopup from "./components/AchievementPopup";
import { NarrativeService } from "./services/narrativeService.ts";
import "./styles/game.css";

const NARRATIVE_API_URL = import.meta.env.VITE_NARRATIVE_API_URL ?? "";

type AppScreen = "menu" | "game" | "death" | "epilogue";

interface EndState {
  finalState: GameState;
  captainSurvived: boolean;
  deathNarrative: string;
  lastLesson: string | null;
  achievements: Achievement[];
  eventLog: PlaythroughEvent[];
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [endState, setEndState] = useState<EndState | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const narrativeService = useMemo(
    () => new NarrativeService({ apiUrl: NARRATIVE_API_URL, accessCode }),
    [accessCode]
  );

  const handleAccessCodeValidated = useCallback((code: string) => {
    setAccessCode(code);
  }, []);

  const handleStartGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setScreen("game");
    setEndState(null);
  }, []);

  const handleGameOver = useCallback((data: GameEndData) => {
    setEndState({
      finalState: data.finalState,
      captainSurvived: data.captainSurvived,
      deathNarrative: data.deathNarrative ?? "You did not survive.",
      lastLesson: data.lastLesson ?? null,
      achievements: data.newAchievements,
      eventLog: data.eventLog,
    });
    if (data.newAchievements.length > 0) {
      setAchievementQueue(data.newAchievements);
    }
    setScreen("death");
  }, []);

  const handleVictory = useCallback((data: GameEndData) => {
    setEndState({
      finalState: data.finalState,
      captainSurvived: true,
      deathNarrative: "",
      lastLesson: null,
      achievements: data.newAchievements,
      eventLog: data.eventLog,
    });
    if (data.newAchievements.length > 0) {
      setAchievementQueue(data.newAchievements);
    }
    setScreen("epilogue");
  }, []);

  const handleRestart = useCallback(() => {
    setScreen("menu");
    setEndState(null);
    setAchievementQueue([]);
  }, []);

  const handleContinueToEpilogue = useCallback(() => {
    setScreen("epilogue");
  }, []);

  const dismissAchievement = useCallback(() => {
    setAchievementQueue((q) => q.slice(1));
  }, []);

  return (
    <div className="app">
      {screen === "menu" && (
        <MainMenu
          onStartGame={handleStartGame}
          apiUrl={NARRATIVE_API_URL}
          onAccessCodeValidated={handleAccessCodeValidated}
          narrativeMode={narrativeService.getMode()}
        />
      )}

      {screen === "game" && (
        <GameScreen
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          narrativeService={narrativeService}
          difficulty={difficulty}
        />
      )}

      {screen === "death" && endState && (
        <DeathReport
          deathNarrative={endState.deathNarrative}
          lastLesson={endState.lastLesson}
          finalState={endState.finalState}
          onRestart={handleRestart}
          onContinueToEpilogue={handleContinueToEpilogue}
        />
      )}

      {screen === "epilogue" && endState && (
        <EpilogueScreen
          finalState={endState.finalState}
          captainSurvived={endState.captainSurvived}
          onRestart={handleRestart}
          narrativeService={narrativeService}
          eventLog={endState.eventLog}
        />
      )}

      {achievementQueue.length > 0 && (
        <AchievementPopup
          achievement={achievementQueue[0]}
          onDismiss={dismissAchievement}
        />
      )}
    </div>
  );
}
