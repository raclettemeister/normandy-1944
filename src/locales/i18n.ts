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
import enSoldiers from './en/soldiers.json';
import enOrders from './en/orders.json';
import enAchievements from './en/achievements.json';
import enSecondInCommand from './en/secondInCommand.json';
import frUi from './fr/ui.json';
import frGame from './fr/game.json';
import frScene01 from './fr/scenes/act1_scene01.json';
import frScene02 from './fr/scenes/act1_scene02.json';
import frScene03 from './fr/scenes/act1_scene03.json';
import frScene04 from './fr/scenes/act1_scene04.json';
import frScene05 from './fr/scenes/act1_scene05.json';
import frScene06 from './fr/scenes/act1_scene06.json';
import frScene07 from './fr/scenes/act1_scene07.json';
import frSoldiers from './fr/soldiers.json';
import frOrders from './fr/orders.json';
import frAchievements from './fr/achievements.json';
import frSecondInCommand from './fr/secondInCommand.json';

const enScenes = {
  act1_landing: enScene01,
  act1_finding_north: enScene02,
  act1_first_contact: enScene03,
  act1_the_sergeant: enScene04,
  act1_the_patrol: enScene05,
  act1_the_farmhouse: enScene06,
  act1_the_road: enScene07,
};

const frScenes = {
  act1_landing: frScene01,
  act1_finding_north: frScene02,
  act1_first_contact: frScene03,
  act1_the_sergeant: frScene04,
  act1_the_patrol: frScene05,
  act1_the_farmhouse: frScene06,
  act1_the_road: frScene07,
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
    en: { ui: enUi, game: enGame, scenes: enScenes, soldiers: enSoldiers, orders: enOrders, achievements: enAchievements, secondInCommand: enSecondInCommand },
    fr: { ui: frUi, game: frGame, scenes: frScenes, soldiers: frSoldiers, orders: frOrders, achievements: frAchievements, secondInCommand: frSecondInCommand },
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
