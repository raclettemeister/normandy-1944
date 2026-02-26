import type { SoldierReaction, Soldier } from "../types/index.ts";

interface BriefingPhaseProps {
  playerPlanText: string;
  secondInCommandReaction: string;
  secondInCommandName: string;
  dmReasoning?: string;
  soldierReactions: SoldierReaction[];
  roster: Soldier[];
  hasSecondInCommand: boolean;
  onRevise: () => void;
  onCommit: () => void;
  disabled: boolean;
}

function getSoldierName(roster: Soldier[], soldierId: string): string {
  const soldier = roster.find((s) => s.id === soldierId);
  return soldier ? `${soldier.rank} ${soldier.name}` : soldierId;
}

export default function BriefingPhase({
  playerPlanText,
  secondInCommandReaction,
  secondInCommandName,
  dmReasoning,
  soldierReactions,
  roster,
  hasSecondInCommand,
  onRevise,
  onCommit,
  disabled,
}: BriefingPhaseProps) {
  const hasSoldiers = roster.length > 0;
  const hasReactions = (hasSecondInCommand && secondInCommandReaction) || soldierReactions.length > 0;
  const showSoloAssessment = !hasSoldiers && dmReasoning;

  return (
    <div className="briefing-phase" data-testid="briefing-phase">
      <div className="briefing-phase__header">
        <h3>{hasSoldiers ? "Team Briefing" : "Your Assessment"}</h3>
      </div>

      {playerPlanText && (
        <div className="briefing-phase__player-plan">
          <span className="briefing-phase__plan-label">Your orders:</span>
          <p className="briefing-phase__plan-text">{playerPlanText}</p>
        </div>
      )}

      {hasReactions && (
        <div className="briefing-phase__reactions">
          {hasSecondInCommand && secondInCommandReaction && (
            <div className="briefing-reaction briefing-reaction--2ic">
              <span className="briefing-reaction__speaker">{secondInCommandName}:</span>
              <span className="briefing-reaction__text">{secondInCommandReaction}</span>
            </div>
          )}

          {soldierReactions.map((reaction) => (
            <div key={reaction.soldierId} className="briefing-reaction">
              <span className="briefing-reaction__speaker">
                {getSoldierName(roster, reaction.soldierId)}:
              </span>
              <span className="briefing-reaction__text">{reaction.text}</span>
            </div>
          ))}
        </div>
      )}

      {showSoloAssessment && (
        <div className="briefing-phase__solo-assessment">
          <span className="briefing-reaction__speaker">Your instinct:</span>
          <span className="briefing-reaction__text">{dmReasoning}</span>
        </div>
      )}

      <div className="briefing-phase__actions">
        <button
          className="btn"
          onClick={onRevise}
          disabled={disabled}
          data-testid="briefing-revise"
        >
          Revise Plan
        </button>
        <button
          className="btn btn--primary"
          onClick={onCommit}
          disabled={disabled}
          data-testid="briefing-commit"
        >
          Execute
        </button>
      </div>
    </div>
  );
}
