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
  const kiaCount = finalState.roster.filter((s) => s.status === "KIA").length;
  const survived = finalState.roster.filter(
    (s) => s.status === "active"
  ).length;

  return (
    <div className="death-report" data-testid="game-over">
      <div className="death-report__header">Mort au combat</div>

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
            {survived} sur {finalState.roster.length} hommes ont survécu à la journée.
            {kiaCount > 0 && ` ${kiaCount} morts au combat.`}
          </p>
        </div>
      )}

      {lastLesson && (
        <div className="lesson-unlocked" data-testid="lesson-unlocked">
          <div className="lesson-unlocked__header">Lecon retenue</div>
          <div className="lesson-unlocked__text">
            {lastLesson.replace(/_/g, " ")}
          </div>
        </div>
      )}

      <div className="death-report__actions">
        {finalState.roster.length > 0 && (
          <button className="btn" onClick={onContinueToEpilogue}>
            Apres-guerre
          </button>
        )}
        <button
          className="btn btn--primary"
          data-testid="restart-btn"
          onClick={onRestart}
        >
          Recommencer
        </button>
      </div>
    </div>
  );
}
