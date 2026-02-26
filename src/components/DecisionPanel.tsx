import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = ((hash >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function DecisionPanel({
  decisions,
  onDecision,
  secondInCommandComment,
  isCombatScene,
  captainPosition,
  onCaptainPositionChange,
  disabled,
}: DecisionPanelProps) {
  const { t } = useTranslation("ui");
  const shuffledDecisions = useMemo(() => {
    if (decisions.length === 0) return decisions;
    const seed = decisions.map(d => d.id).join(",");
    return seededShuffle(decisions, seed);
  }, [decisions]);

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
          <span className="captain-position__label">{t("yourPosition")}</span>
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
              {t(pos)}
            </button>
          ))}
        </div>
      )}

      <div className="decision-list">
        {shuffledDecisions.map((d) => (
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
