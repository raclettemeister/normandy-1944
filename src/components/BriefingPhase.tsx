import type { SoldierReaction, Soldier } from "../types/index.ts";

interface BriefingPhaseProps {
  secondInCommandReaction: string;
  soldierReactions: SoldierReaction[];
  roster: Soldier[];
  onRevise: () => void;
  onCommit: () => void;
  disabled: boolean;
}

function getSoldierName(roster: Soldier[], soldierId: string): string {
  const soldier = roster.find((s) => s.id === soldierId);
  return soldier ? `${soldier.rank} ${soldier.name}` : soldierId;
}

export default function BriefingPhase({
  secondInCommandReaction,
  soldierReactions,
  roster,
  onRevise,
  onCommit,
  disabled,
}: BriefingPhaseProps) {
  return (
    <div className="briefing-phase" data-testid="briefing-phase">
      <div className="briefing-phase__header">
        <h3>Team Briefing</h3>
      </div>

      <div className="briefing-phase__reactions">
        {secondInCommandReaction && (
          <div className="briefing-reaction briefing-reaction--2ic">
            <span className="briefing-reaction__speaker">Henderson:</span>
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
