import StreamingText from "./StreamingText";

interface InterludeScreenProps {
  beatText: string;
  narrativeText: string | null;
  objectiveReminder?: string;
  isStreaming: boolean;
  onContinue: () => void;
}

export default function InterludeScreen({
  beatText,
  narrativeText,
  objectiveReminder,
  isStreaming,
  onContinue,
}: InterludeScreenProps) {
  const displayText = narrativeText ?? beatText;

  return (
    <div className="interlude-screen">
      <div className="interlude-content">
        <div className="interlude-beat">{beatText}</div>
        {narrativeText && (
          <div className="interlude-narrative">
            {isStreaming ? <StreamingText text={displayText} isStreaming={isStreaming} /> : displayText}
          </div>
        )}
        {objectiveReminder && (
          <div className="interlude-objective">
            <span className="interlude-objective__label">Objectif :</span>
            {" "}{objectiveReminder}
          </div>
        )}
      </div>
      <div className="interlude-action">
        <button
          className="btn btn--primary interlude-continue"
          onClick={onContinue}
          disabled={isStreaming}
        >
          {isStreaming ? "..." : "Continuer"}
        </button>
      </div>
    </div>
  );
}
