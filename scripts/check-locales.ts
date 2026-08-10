/**
 * Validates that public/_locales/ matches the source translations/messages.ts.
 * Run: bun run scripts/check-locales.ts
 * Exit code 1 if any generated file differs from source.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const TMP_DIR = join(tmpdir(), `i18n-check-${Date.now()}`);

function runGenerateTo(tmpDir: string): void {
  // Reuse the same generation logic by running the script with an env override
  const scriptPath = join(import.meta.dir, 'generate-locales.ts');
  execSync(`bun run "${scriptPath}"`, {
    env: { ...process.env, I18N_OUTPUT_DIR: tmpDir },
    stdio: 'pipe',
  });
}

function check(): void {
  // We compare by directly reading the source and building the expected output in-memory,
  // then diff against the actual files on disk.
  const { messages, placeholderMessages, placeholders, LOCALES } = require('../translations/messages');

  let hasErrors = false;

  for (const locale of LOCALES) {
    const expected: Record<string, unknown> = {
      _generated: 'Auto-generated from translations/messages.ts — DO NOT EDIT',
    };

    for (const [key, localeMap] of Object.entries(messages)) {
      const text = (localeMap as Record<string, string>)[locale];
      if (text !== undefined) {
        expected[key] = { message: text };
      }
    }

    for (const [key, localeMap] of Object.entries(placeholderMessages)) {
      const text = (localeMap as Record<string, string>)[locale];
      if (text !== undefined) {
        const ph = placeholders[key];
        expected[key] = ph
          ? { message: text, placeholders: ph }
          : { message: text };
      }
    }

    const actualPath = join(import.meta.dir, '..', 'public', '_locales', locale, 'messages.json');
    if (!existsSync(actualPath)) {
      console.error(`  ✘ ${locale}/messages.json — MISSING`);
      hasErrors = true;
      continue;
    }

    const actual = JSON.parse(readFileSync(actualPath, 'utf-8'));
    const expectedJson = JSON.stringify(expected, null, 2);
    const actualJson = JSON.stringify(actual, null, 2);

    if (expectedJson !== actualJson) {
      console.error(`  ✘ ${locale}/messages.json — MISMATCH (may have been manually edited)`);
      hasErrors = true;
    } else {
      console.log(`  ✔ ${locale}/messages.json`);
    }
  }

  if (hasErrors) {
    console.error('\nERROR: _locales/ files do not match translations/messages.ts.');
    console.error('Run "bun run generate:i18n" to regenerate them.');
    process.exit(1);
  }

  console.log('\nAll locale files are in sync with translations/messages.ts.');
}

check();
