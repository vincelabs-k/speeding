/**
 * Generates public/_locales/{locale}/messages.json from translations/messages.ts.
 * Run: bun run scripts/generate-locales.ts
 */

import { LOCALES, messages, placeholderMessages, placeholders, type Locale } from '../translations/messages';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = join(import.meta.dir, '..', 'public', '_locales');
const GENERATED_TAG = 'Auto-generated from translations/messages.ts — DO NOT EDIT';

type ChromeMsg =
  | { message: string }
  | { message: string; placeholders: Record<string, { content: string; example: string }> };

interface ChromeMessages {
  _generated: string;
  [key: string]: ChromeMsg | string;
}

function generate(): void {
  for (const locale of LOCALES) {
    const result: ChromeMessages = {
      _generated: GENERATED_TAG,
    };

    // Simple messages
    for (const [key, localeMap] of Object.entries(messages)) {
      const text = (localeMap as Record<string, string>)[locale];
      if (text !== undefined) {
        result[key] = { message: text };
      }
    }

    // Placeholder messages
    for (const [key, localeMap] of Object.entries(placeholderMessages)) {
      const text = (localeMap as Record<string, string>)[locale];
      if (text !== undefined) {
        const ph = placeholders[key];
        if (ph) {
          result[key] = { message: text, placeholders: ph };
        } else {
          console.warn(`Warning: key "${key}" has no placeholder definitions`);
          result[key] = { message: text };
        }
      }
    }

    const dir = join(OUTPUT_DIR, locale);
    mkdirSync(dir, { recursive: true });

    const json = JSON.stringify(result, null, 2) + '\n';
    writeFileSync(join(dir, 'messages.json'), json, 'utf-8');
    console.log(`  ✔ ${locale}/messages.json`);
  }
}

generate();
console.log('\nAll locale files generated successfully.');
