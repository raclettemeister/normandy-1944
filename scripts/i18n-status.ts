import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '../src/locales');
const SOURCE_LANG = 'en';
const TARGET_LANG = 'fr';

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

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  return keyPath.split('.').reduce((o: unknown, k) => {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

const enDir = path.join(LOCALES_DIR, SOURCE_LANG);
const frDir = path.join(LOCALES_DIR, TARGET_LANG);
const enFiles = getJsonFiles(enDir);

let totalEn = 0;
let totalFr = 0;

console.log(`\nTranslation status (${SOURCE_LANG} → ${TARGET_LANG}):\n`);

for (const enFile of enFiles) {
  const relativePath = path.relative(enDir, enFile);
  const frFile = path.join(frDir, relativePath);

  const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
  const enKeys = countKeys(enData);

  let frTranslated = 0;

  if (fs.existsSync(frFile)) {
    const frData = JSON.parse(fs.readFileSync(frFile, 'utf-8'));
    frTranslated = enKeys.filter(k => {
      const value = getNestedValue(frData, k);
      return typeof value === 'string' && value.length > 0;
    }).length;
  }

  const pct = enKeys.length > 0 ? Math.round((frTranslated / enKeys.length) * 100) : 0;
  const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));

  console.log(`  ${relativePath.padEnd(30)} ${bar} ${String(pct).padStart(3)}%  (${frTranslated}/${enKeys.length})`);

  totalEn += enKeys.length;
  totalFr += frTranslated;
}

const totalPct = totalEn > 0 ? Math.round((totalFr / totalEn) * 100) : 0;
console.log(`\n  ${'Overall'.padEnd(30)} ${totalPct}% complete (${totalFr}/${totalEn} keys)\n`);
