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
    description: 'Video speed controller with pitch-preserving audio. Works on Bilibili, YouTube, Vimeo, Netflix, and online course platforms.',
    permissions: ['activeTab'],
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
});

