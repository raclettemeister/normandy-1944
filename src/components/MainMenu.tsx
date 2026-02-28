import { useTranslation } from "react-i18next";
import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadMeta, resetMeta } from "../engine/metaProgress.ts";
import type { Difficulty } from "../types/index.ts";
import LanguageSelector from "./LanguageSelector";

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
}

export default function MainMenu({
  onStartGame,
}: MainMenuProps) {
  const { t } = useTranslation("ui");
  const achievements = loadAchievements();
  const meta = loadMeta();
  const lessons = meta.unlockedWikiEntries;

  const handleReset = () => {
    if (
      window.confirm(
        "Reinitialiser toute la progression ? Cela effacera les lecons et les succes."
      )
    ) {
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

      <div className="main-menu__actions">
        <div className="difficulty-selection">
          <h2>Choisir la difficulte</h2>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("easy")}
            data-testid="start-easy"
          >
            <span className="difficulty-btn__name">Facile</span>
            <span className="difficulty-btn__desc">Decisions visibles. IA non requise.</span>
          </button>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("medium")}
            data-testid="start-medium"
          >
            <span className="difficulty-btn__name">Moyen</span>
            <span className="difficulty-btn__desc">Redigez vos ordres. 5 jetons de revelation.</span>
          </button>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("hardcore")}
            data-testid="start-hardcore"
          >
            <span className="difficulty-btn__name">Extreme</span>
            <span className="difficulty-btn__desc">Aucune decision. Aucun jeton. Commandez ou mourez.</span>
          </button>
        </div>

        {(achievements.length > 0 || lessons.length > 0) && (
          <button className="btn" onClick={handleReset}>
            Reinitialiser la progression
          </button>
        )}
      </div>

      {achievements.length > 0 && (
        <div data-testid="achievement-gallery" style={{ marginTop: "1rem" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {achievements.length} succes ·{" "}
            {lessons.length} lecon{lessons.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
