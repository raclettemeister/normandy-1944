import { useState, useCallback } from "react";
import type { PrepAction } from "../types/index.ts";

interface PrepConversation {
  actionId: string;
  actionText: string;
  response: string;
}

interface PrepPhaseProps {
  prepActions: PrepAction[];
  secondInCommandCompetence: "veteran" | "green";
  onPrepComplete: (timeCostMinutes: number) => void;
  disabled: boolean;
}

export default function PrepPhase({
  prepActions,
  secondInCommandCompetence,
  onPrepComplete,
  disabled,
}: PrepPhaseProps) {
  const [conversations, setConversations] = useState<PrepConversation[]>([]);
  const [totalTimeCost, setTotalTimeCost] = useState(0);

  const usedActionIds = new Set(conversations.map((c) => c.actionId));
  const availableActions = prepActions.filter((a) => !usedActionIds.has(a.id));

  const handleAction = useCallback(
    (action: PrepAction) => {
      const response = secondInCommandCompetence === "veteran"
        ? action.responseVeteran
        : action.responseGreen;

      setConversations((prev) => [
        ...prev,
        { actionId: action.id, actionText: action.text, response },
      ]);
      setTotalTimeCost((prev) => prev + action.timeCost);
    },
    [secondInCommandCompetence]
  );

  return (
    <div className="prep-phase" data-testid="prep-phase">
      <div className="prep-phase__header">
        <h3>Preparation</h3>
        <span className="prep-phase__time-cost">
          Time spent: {totalTimeCost} min
        </span>
      </div>

      {conversations.length > 0 && (
        <div className="prep-phase__conversations">
          {conversations.map((conv) => (
            <div key={conv.actionId} className="prep-conversation">
              <div className="prep-conversation__action">{conv.actionText}</div>
              <div className="prep-conversation__response">{conv.response}</div>
            </div>
          ))}
        </div>
      )}

      {availableActions.length > 0 && (
        <div className="prep-phase__actions">
          {availableActions.map((action) => (
            <button
              key={action.id}
              className="btn prep-action-btn"
              onClick={() => handleAction(action)}
              disabled={disabled}
              data-testid={`prep-action-${action.id}`}
            >
              {action.text}
              <span className="prep-action-btn__cost">~{action.timeCost} min</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="btn btn--primary prep-phase__continue"
        onClick={() => onPrepComplete(totalTimeCost)}
        data-testid="prep-continue"
      >
        {conversations.length === 0 ? "Skip Prep — Go Straight to Plan" : "Proceed to Plan"}
      </button>
    </div>
  );
}
