import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadLessons, resetLessons } from "../engine/lessonTracker.ts";

interface MainMenuProps {
  onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
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
