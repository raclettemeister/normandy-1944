import type { GameState } from "../types/index.ts";
import { formatTime, getAlertStatus } from "../engine/gameState.ts";

interface StatusPanelProps {
  state: GameState;
}

function moraleClass(morale: number): string {
  if (morale >= 60) return "progress-fill--morale-high";
  if (morale >= 30) return "progress-fill--morale-mid";
  return "progress-fill--morale-low";
}

function formatAlertStatus(status: ReturnType<typeof getAlertStatus>): string {
  switch (status) {
    case "CONFUSED":
      return "DESORGANISE";
    case "ALERTED":
      return "EN ALERTE";
    case "ORGANIZED":
      return "ORGANISE";
    case "FORTIFIED":
      return "FORTIFIE";
  }
}

export default function StatusPanel({ state }: StatusPanelProps) {
  const isSolo = state.phase === "solo";
  const alertStatus = getAlertStatus(state.readiness);

  return (
    <div className="status-panel">
      <div className="status-item" data-testid="status-men">
        <span className="status-label">Hommes</span>
        {isSolo ? (
          <span className="status-value status-value--alone">SEUL</span>
        ) : (
          <span className="status-value">{state.men}</span>
        )}
      </div>

      <div className="status-item" data-testid="status-ammo">
        <span className="status-label">Munitions</span>
        <div className="progress-bar">
          <div
            className="progress-fill progress-fill--ammo"
            style={{ width: `${state.ammo}%` }}
          />
        </div>
        <span className="status-value">{state.ammo}%</span>
      </div>

      <div className="status-item" data-testid="status-morale">
        <span className="status-label">Moral</span>
        <div className="progress-bar">
          <div
            className={`progress-fill ${moraleClass(state.morale)}`}
            style={{ width: `${state.morale}%` }}
          />
        </div>
        <span className="status-value">{state.morale}</span>
      </div>

      <div className="status-item" data-testid="status-readiness">
        <span className="status-label">Ennemi</span>
        <span className="status-value status-readiness">
          {formatAlertStatus(alertStatus)} ({state.readiness})
        </span>
      </div>

      <div className="status-item" data-testid="status-time">
        <span className="status-value status-value--time">
          {formatTime(state.time)} h
        </span>
      </div>

      {state.difficulty === "medium" && (
        <div className="status-row">
          <span className="status-label">Jetons de revelation</span>
          <span className="status-value" data-testid="reveal-token-count">
            {state.revealTokensRemaining}
          </span>
        </div>
      )}
    </div>
  );
}
