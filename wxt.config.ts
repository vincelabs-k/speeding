import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'wxt';

export default defineConfig({
  webExt: {
    startUrls: [
      "https://www.bilibili.com/video/",
    ],
    chromiumArgs: ["--user-data-dir=./.chrome-dev-profile"],
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    default_locale: 'en',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    permissions: ['activeTab', 'storage'],
    author: { email: '1093358332@qq.com' },
    privacy_policy_url: 'https://vincelabs-k.github.io/speeding/PRIVACY.html',
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
  },
  hooks: {
    'build:done': (wxt) => {
      if (wxt.config.browser !== 'edge') return;

      const localesDir = join(wxt.config.outDir, '_locales');
      let cleaned = 0;

      try {
        for (const locale of readdirSync(localesDir)) {
          const messagesPath = join(localesDir, locale, 'messages.json');
          const raw = readFileSync(messagesPath, 'utf-8');
          const data = JSON.parse(raw);
          if (data._generated !== undefined) {
            delete data._generated;
            writeFileSync(messagesPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
            cleaned++;
          }
        }
        if (cleaned > 0) {
          console.log(`[Edge build] Stripped _generated from ${cleaned} locale(s)`);
        }
      } catch {
        // _locales directory not found — nothing to clean
      }
    },
  },
});

