import type { Soldier } from "../types/index.ts";

interface RosterPanelProps {
  roster: Soldier[];
  onClose: () => void;
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ");
}

export default function RosterPanel({ roster, onClose }: RosterPanelProps) {
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
            {roster.map((s) => (
              <div key={s.id} className="roster-soldier">
                <span className="roster-soldier__rank">{s.rank}</span>
                <span className="roster-soldier__name">
                  {s.name}
                  {s.nickname ? ` "${s.nickname}"` : ""}
                </span>
                <span className="roster-soldier__role">{formatRole(s.role)}</span>
                <span
                  className={`roster-soldier__status roster-soldier__status--${s.status}`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
