import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '../../src/locales');

function getJsonFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...getJsonFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.json')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function countKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...countKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('locale key validation', () => {
  const enDir = path.join(LOCALES_DIR, 'en');
  const enFiles = getJsonFiles(enDir);

  it('has English locale files', () => {
    expect(enFiles.length).toBeGreaterThan(0);
  });

  for (const enFile of enFiles) {
    const relativePath = path.relative(enDir, enFile);

    it(`${relativePath}: is valid JSON`, () => {
      const content = fs.readFileSync(enFile, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it(`${relativePath}: has no empty string values`, () => {
      const data = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
      const keys = countKeys(data);
      const emptyKeys = keys.filter(k => {
        const val = k.split('.').reduce((o: unknown, p) => {
          if (o && typeof o === 'object' && !Array.isArray(o)) return (o as Record<string, unknown>)[p];
          return undefined;
        }, data as unknown);
        return val === '';
      });
      expect(emptyKeys, `Empty keys found: ${emptyKeys.join(', ')}`).toHaveLength(0);
    });
  }

  it('French locale files that exist have valid JSON', () => {
    const frDir = path.join(LOCALES_DIR, 'fr');
    const frFiles = getJsonFiles(frDir);
    for (const frFile of frFiles) {
      const content = fs.readFileSync(frFile, 'utf-8');
      expect(() => JSON.parse(content), `Invalid JSON: ${frFile}`).not.toThrow();
    }
  });

  it('French locale files only contain keys that exist in English', () => {
    const frDir = path.join(LOCALES_DIR, 'fr');
    const frFiles = getJsonFiles(frDir);
    for (const frFile of frFiles) {
      const relativePath = path.relative(frDir, frFile);
      const enFile = path.join(enDir, relativePath);
      if (!fs.existsSync(enFile)) continue;

      const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
      const frData = JSON.parse(fs.readFileSync(frFile, 'utf-8'));
      const enKeys = new Set(countKeys(enData));
      const frKeys = countKeys(frData);
      const extraKeys = frKeys.filter(k => !enKeys.has(k));
      expect(extraKeys, `Extra French keys in ${relativePath}: ${extraKeys.join(', ')}`).toHaveLength(0);
    }
  });
});
