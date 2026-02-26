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

function formatStatus(status: Soldier["status"]): string {
  switch (status) {
    case "active":
      return "actif";
    case "wounded":
      return "blesse";
    case "KIA":
      return "KIA";
    case "missing":
      return "disparu";
  }
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
          <span className="overlay-title">Effectifs du peloton</span>
          <button className="overlay-close" onClick={onClose}>
            ESC
          </button>
        </div>

        {roster.length === 0 ? (
          <p className="wiki-empty">
            Aucun soldat rallie pour l'instant. Vous etes seul dans la nuit.
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
                      {formatStatus(s.status)}
                    </span>
                    <button
                      className={`roster-note-toggle ${hasNote ? "roster-note-toggle--active" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      title={hasNote ? "Modifier la note" : "Ajouter une note"}
                    >
                      ✎
                    </button>
                  </div>
                  {isExpanded && (
                    <textarea
                      className="roster-note-input"
                      defaultValue={rosterNotes[s.id] ?? ""}
                      onChange={(e) => handleNoteChange(s.id, e.target.value)}
                      placeholder="Observations personnelles..."
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
