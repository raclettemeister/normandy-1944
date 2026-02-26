import { describe, it, expect, beforeEach, vi } from 'vitest';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
vi.stubGlobal('localStorage', mockLocalStorage);

import i18n, { setLanguage, getLanguage } from '../../src/locales/i18n';

describe('i18n configuration', () => {
  beforeEach(() => {
    for (const k in store) delete store[k];
    vi.clearAllMocks();
    i18n.changeLanguage('en');
  });

  it('defaults to English', () => {
    expect(getLanguage()).toBe('en');
  });

  it('translates UI keys in English', () => {
    expect(i18n.t('ui:beginOperation')).toBe('Begin Operation');
  });

  it('translates UI keys in French', () => {
    setLanguage('fr');
    expect(i18n.t('ui:beginOperation')).toBe("Commencer l'opération");
  });

  it('falls back to English for missing French keys', () => {
    setLanguage('fr');
    expect(i18n.t('ui:title')).toBe('Normandie 1944');
  });

  it('persists language choice', () => {
    setLanguage('fr');
    expect(store['normandy1944_language']).toBe('fr');
  });

  it('switches language and updates translations', () => {
    expect(i18n.t('ui:orders')).toBe('Orders');
    setLanguage('fr');
    expect(i18n.t('ui:orders')).toBe('Ordres');
    setLanguage('en');
    expect(i18n.t('ui:orders')).toBe('Orders');
  });
});
