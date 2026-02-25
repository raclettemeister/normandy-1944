interface WikiPanelProps {
  onClose: () => void;
}

export default function WikiPanel({ onClose }: WikiPanelProps) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay-panel"
        data-testid="wiki-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <span className="overlay-title">Field Manual</span>
          <button className="overlay-close" onClick={onClose}>
            ESC
          </button>
        </div>

        <p className="wiki-empty">
          No field manual entries available yet. Entries unlock as you encounter
          equipment, tactics, and units during operations.
        </p>
      </div>
    </div>
  );
}
