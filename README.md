# Speeding

Set speed once, remembered per site — pitch-preserving audio at 0.5x–16x.

## Features

- Per-site speed memory — set it once, never touch it again
- "This site" and "All sites" modes for flexible speed management
- Adjust playback speed from 0.5x to 16x on any `<video>` element
- Pitch-preserving audio — voices and music stay natural even at 8x
- Works on YouTube, Bilibili, Netflix, Vimeo, Coursera, and more
- Privacy-first — zero tracking, zero external servers

## Why Speeding

Most video speed controllers forget your settings when you switch tabs. Speeding remembers your speed per site and keeps audio pitch natural by default — no configuration, no signup, no tracking.

## Install

Available on:

- [Chrome Web Store](https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=ext_ntp_promo_1p)
- [Edge Add-ons](#) _(coming soon)_

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Package as zip
bun run zip
```

## Tech Stack

- [WXT](https://wxt.dev) — Browser extension framework
- React 19 + TypeScript
- Tailwind CSS v4

## Privacy

Speeding stores only your speed preferences (domain + speed value) in Chrome's local storage. No analytics, no tracking, no external servers. See [docs/PRIVACY.md](./docs/PRIVACY.md) for details.

## License

[Apache 2.0](./LICENSE)
