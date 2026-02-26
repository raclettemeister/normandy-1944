import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUi from './en/ui.json';
import enGame from './en/game.json';
import frUi from './fr/ui.json';
import frGame from './fr/game.json';

const STORAGE_KEY = 'normandy1944_language';

function getDefaultLanguage(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch { /* localStorage unavailable */ }
  try {
    if (navigator.language.startsWith('fr')) return 'fr';
  } catch { /* navigator unavailable */ }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { ui: enUi, game: enGame },
    fr: { ui: frUi, game: frGame },
  },
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  defaultNS: 'ui',
});

export function setLanguage(lang: 'en' | 'fr'): void {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
  i18n.changeLanguage(lang);
}

export function getLanguage(): 'en' | 'fr' {
  return (i18n.language as 'en' | 'fr') || 'en';
}

export default i18n;
