import { useTranslation } from "react-i18next";
import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadMeta, resetMeta } from "../engine/metaProgress.ts";
import type { NarrativeMode, Difficulty } from "../types/index.ts";
import LanguageSelector from "./LanguageSelector";

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  narrativeMode: NarrativeMode;
}

export default function MainMenu({
  onStartGame,
  narrativeMode,
}: MainMenuProps) {
  const { t } = useTranslation("ui");
  const achievements = loadAchievements();
  const meta = loadMeta();
  const lessons = meta.unlockedWikiEntries;

  const handleReset = () => {
    if (window.confirm(t("resetConfirm"))) {
      resetMeta();
      window.location.reload();
    }
  };

  return (
    <div className="main-menu" data-testid="main-menu">
      <span className="main-menu__version">v1.0</span>
      <LanguageSelector />
      <h1 className="main-menu__title">{t("title")}</h1>
      <p className="main-menu__subtitle">{t("subtitle")}</p>

      {narrativeMode === "llm" && (
        <div className="main-menu__mode-badge" data-testid="narrative-mode-badge">
          {t("aiNarrationActive")}
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
            {t("resetProgress")}
          </button>
        )}
      </div>

      {achievements.length > 0 && (
        <div data-testid="achievement-gallery" style={{ marginTop: "1rem" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {t("achievementCount", { count: achievements.length })} ·{" "}
            {t("lessonCount", { count: lessons.length })}
          </span>
        </div>
      )}
    </div>
  );
}
