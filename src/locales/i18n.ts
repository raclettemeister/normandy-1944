import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUi from './en/ui.json';
import enGame from './en/game.json';
import enScene01 from './en/scenes/act1_scene01.json';
import enScene02 from './en/scenes/act1_scene02.json';
import enScene03 from './en/scenes/act1_scene03.json';
import enScene04 from './en/scenes/act1_scene04.json';
import enScene05 from './en/scenes/act1_scene05.json';
import enScene06 from './en/scenes/act1_scene06.json';
import enScene07 from './en/scenes/act1_scene07.json';
import frUi from './fr/ui.json';
import frGame from './fr/game.json';

const enScenes = {
  act1_landing: enScene01,
  act1_finding_north: enScene02,
  act1_first_contact: enScene03,
  act1_the_sergeant: enScene04,
  act1_the_patrol: enScene05,
  act1_the_farmhouse: enScene06,
  act1_the_road: enScene07,
};

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
    en: { ui: enUi, game: enGame, scenes: enScenes },
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
