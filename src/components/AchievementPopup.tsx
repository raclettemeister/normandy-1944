import type { Achievement } from "../types/index.ts";

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export default function AchievementPopup({
  achievement,
  onDismiss,
}: AchievementPopupProps) {
  return (
    <div
      className="achievement-popup"
      data-testid="achievement-popup"
      onClick={onDismiss}
      role="status"
    >
      <span className="achievement-popup__icon">{achievement.icon}</span>
      <div className="achievement-popup__info">
        <span className="achievement-popup__label">Succes debloque</span>
        <span className="achievement-popup__title">{achievement.title}</span>
        <span className="achievement-popup__desc">
          {achievement.description}
        </span>
      </div>
    </div>
  );
}
