import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'wxt';

export default defineConfig({
  webExt: {
    startUrls: [
      "https://www.bilibili.com/video/",

    ],
  },
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: 'Speeding',
    description: 'Video speed controller with pitch-preserving audio — perfect for binge-watching and online courses.',
    permissions: ['activeTab'],
  },
});

