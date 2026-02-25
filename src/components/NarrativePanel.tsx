interface NarrativePanelProps {
  narrative: string;
  outcomeText: string | null;
  rallyText: string | null;
}

export default function NarrativePanel({
  narrative,
  outcomeText,
  rallyText,
}: NarrativePanelProps) {
  return (
    <div className="narrative-panel">
      <div className="narrative-text" data-testid="narrative">
        {narrative}
      </div>
      {outcomeText && (
        <div className="outcome-text" data-testid="outcome-narrative">
          {outcomeText}
        </div>
      )}
      {rallyText && <div className="rally-text">{rallyText}</div>}
    </div>
  );
}
