import { useTranslation } from "react-i18next";
import type { Milestone } from "../types/index.ts";

interface OrdersPanelProps {
  milestones: Milestone[];
  onClose: () => void;
}

const OPORD_TEXT = `OPERATION ALBANY — 506th PIR, 2nd PLATOON, EASY COMPANY
CLASSIFICATION: SECRET
DATE: 5 JUNE 1944

MISSION: Secure causeway exit at Sainte-Marie-du-Mont
to enable linkup with seaborne forces landing Utah
Beach at H-Hour.

TIMELINE:
  0100 — Drop on DZ C. Rally at assembly area.
  0400 — Assembly complete. Move to objective area.
  0600 — H-HOUR. Beach landings begin.
  0900 — Crossroads SECURED. Establish perimeter.
  1200 — Resupply expected from beach elements.
  1800 — Relief from 4th Infantry Division.
  0100 — End of operational period.

COMMANDER'S INTENT: Speed is critical. Every hour of
delay gives the enemy time to organize. Strike while
they are confused. The men landing on that beach are
counting on us.`;

export default function OrdersPanel({
  milestones,
  onClose,
}: OrdersPanelProps) {
  const { t } = useTranslation("ui");
  const { t: tGame } = useTranslation("game");
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay-panel"
        data-testid="orders-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-header">
          <span className="overlay-title">{t("battleOrders")}</span>
          <button className="overlay-close" onClick={onClose}>
            {t("close")}
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
                  ? tGame("milestoneStatus.achieved")
                  : m.status === "missed"
                  ? tGame("milestoneStatus.missed")
                  : tGame("milestoneStatus.pending")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
