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

export default function StatusPanel({ state }: StatusPanelProps) {
  const isSolo = state.phase === "solo";
  const alertStatus = getAlertStatus(state.readiness);

  return (
    <div className="status-panel">
      <div className="status-item" data-testid="status-men">
        <span className="status-label">Men</span>
        {isSolo ? (
          <span className="status-value status-value--alone">ALONE</span>
        ) : (
          <span className="status-value">{state.men}</span>
        )}
      </div>

      <div className="status-item" data-testid="status-ammo">
        <span className="status-label">Ammo</span>
        <div className="progress-bar">
          <div
            className="progress-fill progress-fill--ammo"
            style={{ width: `${state.ammo}%` }}
          />
        </div>
        <span className="status-value">{state.ammo}%</span>
      </div>

      <div className="status-item" data-testid="status-morale">
        <span className="status-label">Morale</span>
        <div className="progress-bar">
          <div
            className={`progress-fill ${moraleClass(state.morale)}`}
            style={{ width: `${state.morale}%` }}
          />
        </div>
        <span className="status-value">{state.morale}</span>
      </div>

      <div className="status-item" data-testid="status-readiness">
        <span className="status-label">Enemy</span>
        <span className="status-value status-readiness">
          {alertStatus} ({state.readiness})
        </span>
      </div>

      <div className="status-item" data-testid="status-time">
        <span className="status-value status-value--time">
          {formatTime(state.time)} hrs
        </span>
      </div>

      {state.difficulty === "medium" && (
        <div className="status-row">
          <span className="status-label">Reveal Tokens</span>
          <span className="status-value" data-testid="reveal-token-count">
            {state.revealTokensRemaining}
          </span>
        </div>
      )}
    </div>
  );
}
