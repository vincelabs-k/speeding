# Speeding — Auto-speed for Every Site

> The speed extension built for people who DON'T want a controller.

Set speed once per site, never touch it again. Open YouTube — auto 2x. Open Udemy — auto 1.5x. Open a podcast — your last speed is already applied. No popup, no OSD, no keyboard shortcuts to memorize.

## Features

- **Per-site auto-speed** — each site remembers its own speed setting
- **"This site" or "All sites"** modes for flexible control
- **0.5x – 16x** with 0.25x steps on any HTML5 video or audio
- **Pitch-preserving audio** — voices stay natural at any speed
- **Podcasts & audiobooks** — works on audio-only players too
- **Privacy-first** — zero tracking, zero data collection

## Who is this for?

- 📚 Online course learners (Udemy, Coursera, Bilibili courses)
- 🎧 Podcast & audiobook listeners
- 📺 Binge-watchers who always watch at 2x
- 🙅 Anyone tired of keyboard shortcuts and on-screen controllers

## Who should use Video Speed Controller instead?

- Power users who want 20+ customizable keyboard shortcuts
- Users who need **per-tab** (not per-site) speed memory
- Users who prefer a floating OSD controller

**Speeding is intentionally simple. If you want a controller, VSC is the better choice.**

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
