import { useTranslation } from "react-i18next";
import type { GameState } from "../types/index.ts";

interface DeathReportProps {
  deathNarrative: string;
  lastLesson: string | null;
  finalState: GameState;
  onRestart: () => void;
  onContinueToEpilogue: () => void;
}

export default function DeathReport({
  deathNarrative,
  lastLesson,
  finalState,
  onRestart,
  onContinueToEpilogue,
}: DeathReportProps) {
  const { t } = useTranslation("ui");
  const kiaCount = finalState.roster.filter((s) => s.status === "KIA").length;
  const survived = finalState.roster.filter(
    (s) => s.status === "active"
  ).length;

  return (
    <div className="death-report" data-testid="game-over">
      <div className="death-report__header">{t("killedInAction")}</div>

      <div className="death-narrative" data-testid="death-narrative">
        {deathNarrative}
      </div>

      {finalState.roster.length > 0 && (
        <div
          style={{
            width: "100%",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <p>
            {survived} of {finalState.roster.length} men survived the day.
            {kiaCount > 0 && ` ${kiaCount} killed in action.`}
          </p>
        </div>
      )}

      {lastLesson && (
        <div className="lesson-unlocked" data-testid="lesson-unlocked">
          <div className="lesson-unlocked__header">{t("lessonLearnedHeader")}</div>
          <div className="lesson-unlocked__text">
            {lastLesson.replace(/_/g, " ")}
          </div>
        </div>
      )}

      <div className="death-report__actions">
        {finalState.roster.length > 0 && (
          <button className="btn" onClick={onContinueToEpilogue}>
            {t("afterTheWar")}
          </button>
        )}
        <button
          className="btn btn--primary"
          data-testid="restart-btn"
          onClick={onRestart}
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
