import type { Milestone } from "../types/index.ts";

interface OrdersPanelProps {
  milestones: Milestone[];
  onClose: () => void;
}

const OPORD_TEXT = `OPERATION ALBANY — 506th PIR, 2e PELOTON, EASY COMPANY
CLASSIFICATION : SECRET
DATE : 5 JUIN 1944

MISSION : Securiser la sortie de chaussee de Sainte-Marie-du-Mont
afin de permettre la liaison avec les forces amphibies debarquant
a Utah Beach a l'heure H.

CHRONOLOGIE :
  0100 — Saut sur la DZ C. Ralliement a la zone d'assemblage.
  0400 — Assemblage termine. Mouvement vers la zone objectif.
  0600 — HEURE H. Debut des debarquements.
  0900 — Carrefour SECURISE. Etablir le perimetre.
  1200 — Ravitaillement attendu depuis les elements de plage.
  1800 — Releve par la 4th Infantry Division.
  0100 — Fin de la periode operationnelle.

INTENTION DU COMMANDANT : La vitesse est decisive.
Chaque heure de retard laisse a l'ennemi le temps de s'organiser.
Frappez pendant qu'ils sont desorganises. Les hommes qui debarquent
sur cette plage comptent sur nous.`;

export default function OrdersPanel({
  milestones,
  onClose,
}: OrdersPanelProps) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay-panel"
        data-testid="orders-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <span className="overlay-title">Ordres d'operation</span>
          <button className="overlay-close" onClick={onClose}>
            ESC
          </button>
        </div>

        <div className="orders-briefing">{OPORD_TEXT}</div>

        <div>
          {milestones.map((m) => (
            <div key={m.id} className={`milestone milestone--${m.status}`}>
              <span className="milestone__time">{m.time}</span>
              <span className="milestone__desc">{m.description}</span>
              <span className="milestone__status">
                {m.status === "achieved"
                  ? "✓"
                  : m.status === "missed"
                  ? "ECHEC"
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
