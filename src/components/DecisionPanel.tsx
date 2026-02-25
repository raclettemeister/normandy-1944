import type { Decision, CaptainPosition } from "../types/index.ts";

interface DecisionPanelProps {
  decisions: Decision[];
  onDecision: (decision: Decision) => void;
  secondInCommandComment: string | null;
  isCombatScene: boolean;
  captainPosition: CaptainPosition;
  onCaptainPositionChange: (pos: CaptainPosition) => void;
  disabled: boolean;
}

const POSITIONS: CaptainPosition[] = ["front", "middle", "rear"];

export default function DecisionPanel({
  decisions,
  onDecision,
  secondInCommandComment,
  isCombatScene,
  captainPosition,
  onCaptainPositionChange,
  disabled,
}: DecisionPanelProps) {
  return (
    <div className="decision-panel">
      {secondInCommandComment && (
        <div
          className="second-in-command-comment"
          data-testid="second-in-command-comment"
        >
          {secondInCommandComment}
        </div>
      )}

      {isCombatScene && (
        <div className="captain-position" data-testid="captain-position">
          <span className="captain-position__label">Your position:</span>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              className={`captain-position__option${
                captainPosition === pos
                  ? " captain-position__option--active"
                  : ""
              }`}
              onClick={() => onCaptainPositionChange(pos)}
              disabled={disabled}
            >
              {pos}
            </button>
          ))}
        </div>
      )}

      <div className="decision-list">
        {decisions.map((d) => (
          <button
            key={d.id}
            className="decision-btn"
            data-testid={`decision-${d.id}`}
            onClick={() => onDecision(d)}
            disabled={disabled}
          >
            {d.text}
          </button>
        ))}
      </div>
    </div>
  );
}
