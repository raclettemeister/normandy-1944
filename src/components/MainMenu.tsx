import { loadAchievements } from "../engine/achievementTracker.ts";
import { loadMeta, resetMeta } from "../engine/metaProgress.ts";
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
      <h1 className="main-menu__title">Normandy 1944</h1>
      <p className="main-menu__subtitle">
        Nuit du 5 au 6 juin 1944. Vous commandez le 2e peloton, Easy Company,
        506th Parachute Infantry Regiment, 101st Airborne Division. Vos hommes
        sont disperses dans la campagne normande. Le temps joue contre vous.
      </p>

      {apiUrl && narrativeMode !== "llm" && (
        <AccessCodeInput apiUrl={apiUrl} onValidated={onAccessCodeValidated} />
      )}

      {narrativeMode === "llm" && (
        <div className="main-menu__mode-badge" data-testid="narrative-mode-badge">
          Narration IA active
        </div>
      )}

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
            disabled={narrativeMode !== "llm"}
            data-testid="start-medium"
          >
            <span className="difficulty-btn__name">Moyen</span>
            <span className="difficulty-btn__desc">Redigez vos ordres. 5 jetons de revelation.</span>
          </button>

          <button
            className="btn btn--primary difficulty-btn"
            onClick={() => onStartGame("hardcore")}
            disabled={narrativeMode !== "llm"}
            data-testid="start-hardcore"
          >
            <span className="difficulty-btn__name">Hardcore</span>
            <span className="difficulty-btn__desc">Aucune decision. Aucun jeton. Commandez ou mourez.</span>
          </button>

          {narrativeMode !== "llm" && (
            <p className="difficulty-note">
              Entrez un code d'acces ci-dessus pour debloquer les modes Moyen et Hardcore.
            </p>
          )}
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
