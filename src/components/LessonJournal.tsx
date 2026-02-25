interface LessonJournalProps {
  lessonIds: string[];
  onClose: () => void;
}

export default function LessonJournal({
  lessonIds,
  onClose,
}: LessonJournalProps) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay-panel"
        data-testid="lesson-journal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <span className="overlay-title">Lessons Learned</span>
          <button className="overlay-close" onClick={onClose}>
            ESC
          </button>
        </div>

        {lessonIds.length === 0 ? (
          <p className="lesson-empty">
            No lessons learned yet. Experience teaches — sometimes at a cost.
          </p>
        ) : (
          <div className="lesson-list">
            {lessonIds.map((id) => (
              <div key={id} className="lesson-item">
                <div className="lesson-item__title">{id.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
