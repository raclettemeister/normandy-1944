import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '../src/locales');

const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('Set ANTHROPIC_API_KEY environment variable');
  process.exit(1);
}

const TRANSLATION_PROMPT = `Translate this game text from English to French.
Context: WWII tactical text game, D-Day, 101st Airborne.
Tone: Terse, military, immersive. Short sentences.
Keep in English: soldier names, ranks (SSgt, Sgt, Cpl, PFC, Pvt), weapon names (BAR, MG-42, Gammon bomb), acronyms (OPORD, DZ, PIR, KIA), locations (Sainte-Marie-du-Mont, Utah Beach).
Use "vous" (formal second person) for the player.
Return ONLY the French translation, no explanations.`;

async function translateText(text: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: TRANSLATION_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as { content: { text: string }[] };
  return data.content[0].text;
}

function flattenKeys(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      pairs.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else if (typeof value === 'string') {
      pairs.push([fullKey, value]);
    }
  }
  return pairs;
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string): void {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  return keyPath.split('.').reduce((o: unknown, k) => {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
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

async function main() {
  const targetFile = process.argv[2];
  const enDir = path.join(LOCALES_DIR, 'en');
  const frDir = path.join(LOCALES_DIR, 'fr');

  let enFiles = getJsonFiles(enDir);
  if (targetFile) {
    enFiles = enFiles.filter(f => path.relative(enDir, f).includes(targetFile));
  }

  if (enFiles.length === 0) {
    console.log('No matching files found.');
    return;
  }

  let totalTranslated = 0;

  for (const enFile of enFiles) {
    const relativePath = path.relative(enDir, enFile);
    const frFile = path.join(frDir, relativePath);

    const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
    const enPairs = flattenKeys(enData);

    let frData: Record<string, unknown> = {};
    if (fs.existsSync(frFile)) {
      frData = JSON.parse(fs.readFileSync(frFile, 'utf-8'));
    }

    const missing = enPairs.filter(([key]) => {
      const existing = getNestedValue(frData, key);
      return typeof existing !== 'string' || existing.length === 0;
    });

    if (missing.length === 0) {
      console.log(`  ${relativePath}: already complete`);
      continue;
    }

    console.log(`  ${relativePath}: translating ${missing.length} keys...`);

    const batchSize = 10;
    for (let i = 0; i < missing.length; i += batchSize) {
      const batch = missing.slice(i, i + batchSize);
      const batchText = batch.map(([key, value]) => `[${key}]\n${value}`).join('\n\n');

      try {
        const translated = await translateText(batchText);
        const parts = translated.split(/\[([^\]]+)\]\n/);

        for (let j = 1; j < parts.length; j += 2) {
          const key = parts[j].trim();
          const value = parts[j + 1]?.trim();
          if (key && value) {
            setNestedValue(frData, key, value);
            totalTranslated++;
          }
        }
      } catch (err) {
        console.error(`    Error translating batch: ${err}`);
      }

      if (i + batchSize < missing.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const frFileDir = path.dirname(frFile);
    if (!fs.existsSync(frFileDir)) {
      fs.mkdirSync(frFileDir, { recursive: true });
    }
    fs.writeFileSync(frFile, JSON.stringify(frData, null, 2) + '\n');
    console.log(`    → Wrote ${frFile}`);
  }

  console.log(`\nDone. Translated ${totalTranslated} keys.`);
}

main().catch(console.error);
