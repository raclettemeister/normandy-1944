import StreamingText from "./StreamingText";

interface NarrativePanelProps {
  narrative: string;
  outcomeText: string | null;
  outcomeDeltaText?: string | null;
  rallyText: string | null;
  isStreaming?: boolean;
  isLoading?: boolean;
}

export default function NarrativePanel({
  narrative,
  outcomeText,
  outcomeDeltaText = null,
  rallyText,
  isStreaming = false,
  isLoading = false,
}: NarrativePanelProps) {
  return (
    <div className="narrative-panel">
      {isLoading ? (
        <div className="narrative-loading" data-testid="narrative-loading">...</div>
      ) : (
        <>
          <div className="narrative-text" data-testid="narrative">
            {narrative}
          </div>
          {outcomeText && (
            <div className="outcome-text" data-testid="outcome-narrative">
              {isStreaming ? (
                <StreamingText text={outcomeText} isStreaming={isStreaming} />
              ) : (
                outcomeText
              )}
            </div>
          )}
          {outcomeText && outcomeDeltaText && (
            <div className="outcome-delta" data-testid="outcome-delta">
              {outcomeDeltaText}
            </div>
          )}
          {rallyText && <div className="rally-text">{rallyText}</div>}
        </>
      )}
    </div>
  );
}
