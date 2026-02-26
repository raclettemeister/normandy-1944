import { useState, useCallback } from "react";
import type {
  Decision,
  Difficulty,
  CaptainPosition,
} from "../types/index.ts";
import FreeTextInput from "./FreeTextInput";
import DecisionPanel from "./DecisionPanel";

interface PlanPhaseProps {
  difficulty: Difficulty;
  decisions: Decision[];
  revealTokensRemaining: number;
  onSubmitPrompt: (text: string) => void;
  initialPromptText?: string;
  onSelectDecision: (decision: Decision) => void;
  onRevealTokenUsed: () => void;
  secondInCommandComment: string | null;
  isCombatScene: boolean;
  captainPosition: CaptainPosition;
  onCaptainPositionChange: (pos: CaptainPosition) => void;
  disabled: boolean;
  loading: boolean;
}

export default function PlanPhase({
  difficulty,
  decisions,
  revealTokensRemaining,
  onSubmitPrompt,
  initialPromptText,
  onSelectDecision,
  onRevealTokenUsed,
  secondInCommandComment,
  isCombatScene,
  captainPosition,
  onCaptainPositionChange,
  disabled,
  loading,
}: PlanPhaseProps) {
  const [decisionsRevealed, setDecisionsRevealed] = useState(false);

  const showDecisions =
    difficulty === "easy" || (difficulty === "medium" && decisionsRevealed);

  const canReveal = difficulty === "medium" && !decisionsRevealed && revealTokensRemaining > 0;

  const handleReveal = useCallback(() => {
    setDecisionsRevealed(true);
    onRevealTokenUsed();
  }, [onRevealTokenUsed]);

  const showPromptInput = difficulty !== "easy";

  return (
    <div className="plan-phase" data-testid="plan-phase">
      <div className="plan-phase__header">
        <h3>Votre plan</h3>
      </div>

      {showPromptInput && (
        <>
          <FreeTextInput
            onSubmit={onSubmitPrompt}
            disabled={disabled}
            loading={loading}
            initialText={initialPromptText}
          />
          {showDecisions && (
            <div className="decision-separator">ou choisissez une action predefinie</div>
          )}
        </>
      )}

      {canReveal && (
        <button
          className="btn plan-phase__reveal-btn"
          onClick={handleReveal}
          disabled={disabled}
          data-testid="reveal-decisions-btn"
        >
          Reveler les decisions ({revealTokensRemaining} jetons restants)
        </button>
      )}

      {isCombatScene && (
        <div className="plan-phase__captain-position" data-testid="captain-position-selector">
          <span>Votre position :</span>
          {(["front", "middle", "rear"] as const).map((pos) => (
            <button
              key={pos}
              className={`btn btn--small ${captainPosition === pos ? "btn--active" : ""}`}
              onClick={() => onCaptainPositionChange(pos)}
              disabled={disabled}
            >
              {pos === "front" ? "avant" : pos === "middle" ? "centre" : "arriere"}
            </button>
          ))}
        </div>
      )}

      {showDecisions && (
        <DecisionPanel
          decisions={decisions}
          onDecision={onSelectDecision}
          secondInCommandComment={secondInCommandComment}
          isCombatScene={isCombatScene}
          captainPosition={captainPosition}
          onCaptainPositionChange={onCaptainPositionChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
