import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("game");
  const isSolo = state.phase === "solo";
  const alertStatus = getAlertStatus(state.readiness);

  return (
    <div className="status-panel">
      <div className="status-item" data-testid="status-men">
        <span className="status-label">{t("status.men")}</span>
        {isSolo ? (
          <span className="status-value status-value--alone">{t("status.alone")}</span>
        ) : (
          <span className="status-value">{state.men}</span>
        )}
      </div>

      <div className="status-item" data-testid="status-ammo">
        <span className="status-label">{t("status.ammo")}</span>
        <div className="progress-bar">
          <div
            className="progress-fill progress-fill--ammo"
            style={{ width: `${state.ammo}%` }}
          />
        </div>
        <span className="status-value">{state.ammo}%</span>
      </div>

      <div className="status-item" data-testid="status-morale">
        <span className="status-label">{t("status.morale")}</span>
        <div className="progress-bar">
          <div
            className={`progress-fill ${moraleClass(state.morale)}`}
            style={{ width: `${state.morale}%` }}
          />
        </div>
        <span className="status-value">{state.morale}</span>
      </div>

      <div className="status-item" data-testid="status-readiness">
        <span className="status-label">{t("status.enemy")}</span>
        <span className="status-value status-readiness">
          {t(`alertStatus.${alertStatus.toLowerCase()}`)} ({state.readiness})
        </span>
      </div>

      <div className="status-item" data-testid="status-time">
        <span className="status-value status-value--time">
          {formatTime(state.time)} {t("status.timeUnit")}
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
