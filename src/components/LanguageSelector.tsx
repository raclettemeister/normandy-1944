import { useTranslation } from 'react-i18next';
import { setLanguage } from '../locales/i18n';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="language-selector" data-testid="language-selector">
      <button
        className={`language-selector__btn${current === 'en' ? ' language-selector__btn--active' : ''}`}
        data-testid="language-en"
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        className={`language-selector__btn${current === 'fr' ? ' language-selector__btn--active' : ''}`}
        data-testid="language-fr"
        onClick={() => setLanguage('fr')}
      >
        Français
      </button>
    </div>
  );
}
