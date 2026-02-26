import { useState, useCallback, useRef } from "react";
import type { Soldier } from "../types/index.ts";

interface RosterPanelProps {
  roster: Soldier[];
  rosterNotes: Record<string, string>;
  onNoteChange: (soldierId: string, note: string) => void;
  onClose: () => void;
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ");
}

export default function RosterPanel({
  roster,
  rosterNotes,
  onNoteChange,
  onClose,
}: RosterPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleNoteChange = useCallback(
    (soldierId: string, value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onNoteChange(soldierId, value);
      }, 500);
    },
    [onNoteChange]
  );

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay-panel"
        data-testid="roster-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <span className="overlay-title">Platoon Roster</span>
          <button className="overlay-close" onClick={onClose}>
            ESC
          </button>
        </div>

        {roster.length === 0 ? (
          <p className="wiki-empty">
            No soldiers rallied yet. You are alone in the dark.
          </p>
        ) : (
          <div className="roster-list">
            {roster.map((s) => {
              const hasNote = !!(rosterNotes[s.id] && rosterNotes[s.id].trim());
              const isExpanded = expandedId === s.id;
              return (
                <div key={s.id} className="roster-soldier-card">
                  <div className="roster-soldier">
                    <span className="roster-soldier__rank">{s.rank}</span>
                    <span className="roster-soldier__name">
                      {s.name}
                      {s.nickname ? ` "${s.nickname}"` : ""}
                    </span>
                    <span className="roster-soldier__role">
                      {formatRole(s.role)}
                    </span>
                    <span
                      className={`roster-soldier__status roster-soldier__status--${s.status}`}
                    >
                      {s.status}
                    </span>
                    <button
                      className={`roster-note-toggle ${hasNote ? "roster-note-toggle--active" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      title={hasNote ? "Edit note" : "Add note"}
                    >
                      ✎
                    </button>
                  </div>
                  {isExpanded && (
                    <textarea
                      className="roster-note-input"
                      defaultValue={rosterNotes[s.id] ?? ""}
                      onChange={(e) => handleNoteChange(s.id, e.target.value)}
                      placeholder="Personal observations..."
                      rows={3}
                      autoFocus
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
