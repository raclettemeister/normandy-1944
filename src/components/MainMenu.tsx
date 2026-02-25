import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadLessons, resetLessons } from "../engine/lessonTracker.ts";
import type { NarrativeMode } from "../types/index.ts";
import AccessCodeInput from "./AccessCodeInput";

interface MainMenuProps {
  onStartGame: () => void;
  apiUrl: string;
  onAccessCodeValidated: (code: string) => void;
  narrativeMode: NarrativeMode;
}

export default function MainMenu({
  onStartGame,
  apiUrl,
  onAccessCodeValidated,
  narrativeMode,
}: MainMenuProps) {
  const achievements = loadAchievements();
  const lessons = loadLessons();

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all progress? This clears lessons and achievements."
      )
    ) {
      resetLessons();
      localStorage.removeItem("normandy1944_achievements");
      window.location.reload();
    }
  };

  return (
    <div className="main-menu" data-testid="main-menu">
      <h1 className="main-menu__title">Normandy 1944</h1>
      <p className="main-menu__subtitle">
        Night of June 5-6, 1944. You command 2nd Platoon, Easy Company, 506th
        Parachute Infantry Regiment, 101st Airborne Division. Your men are
        scattered across the Normandy countryside. The clock is ticking.
      </p>

      {apiUrl && narrativeMode !== "llm" && (
        <AccessCodeInput apiUrl={apiUrl} onValidated={onAccessCodeValidated} />
      )}

      {narrativeMode === "llm" && (
        <div className="main-menu__mode-badge" data-testid="narrative-mode-badge">
          AI Narration Active
        </div>
      )}

      <div className="main-menu__actions">
        <button
          className="btn btn--primary"
          data-testid="start-game-btn"
          onClick={onStartGame}
        >
          Begin Operation
        </button>

        {(achievements.length > 0 || lessons.length > 0) && (
          <button className="btn" onClick={handleReset}>
            Reset Progress
          </button>
        )}
      </div>

      {achievements.length > 0 && (
        <div data-testid="achievement-gallery" style={{ marginTop: "1rem" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {achievements.length} achievement{achievements.length !== 1 ? "s" : ""} ·{" "}
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
