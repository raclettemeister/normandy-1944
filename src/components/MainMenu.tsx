import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadLessons, resetLessons } from "../engine/lessonTracker.ts";
import type { NarrativeMode, Difficulty } from "../types/index.ts";
import AccessCodeInput from "./AccessCodeInput";

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
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
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("easy")}
            data-testid="start-easy"
          >
            <span className="difficulty-btn__name">Easy</span>
            <span className="difficulty-btn__desc">Decisions visible. No AI required.</span>
          </button>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("medium")}
            disabled={narrativeMode !== "llm"}
            data-testid="start-medium"
          >
            <span className="difficulty-btn__name">Medium</span>
            <span className="difficulty-btn__desc">Write your own orders. 5 reveal tokens.</span>
          </button>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("hardcore")}
            disabled={narrativeMode !== "llm"}
            data-testid="start-hardcore"
          >
            <span className="difficulty-btn__name">Hardcore</span>
            <span className="difficulty-btn__desc">No decisions. No tokens. Lead or die.</span>
          </button>

          {narrativeMode !== "llm" && (
            <p className="difficulty-note">
              Enter an access code above to unlock Medium and Hardcore modes.
            </p>
          )}
        </div>

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
