# Speeding — Auto-speed for Every Site

> The speed extension built for people who want to set it once and forget it.

Set speed once per site, never touch it again. Open YouTube — auto 0.75x for foreign-language listening. Open Udemy — auto 16x for course study. Open a course lecture — your last speed is already applied. A lightweight popup and Alt+↑/↓ shortcuts handle adjustments — no floating OSD overlay to fight with.

## Features

- **Per-site auto-speed** — each site remembers its own speed setting
- **Scene presets** — 16x course study, 1.25x series bingeing, 0.75x foreign listening, editable and expandable
- **Pre-matched sites** — Bilibili, Netflix, Coursera, YouTube, and 40+ more auto-select a scene
- **"This site", "Scenes", or "All sites"** modes — per-domain, per-scene, or global control
- **0.5x – 16x** with 0.25x steps on any HTML5 video
- **Pitch-preserving audio** — voices stay natural at any speed
- **Privacy-first** — zero tracking, zero telemetry

## Who is this for?

- 📚 Online course learners (Udemy, Coursera, Bilibili courses)
- 📺 Binge-watchers who always watch at 2x
- 🙅 Anyone tired of complex shortcuts and floating on-screen controllers

## Who should use Video Speed Controller instead?

- Power users who want 20+ customizable keyboard shortcuts
- Users who need **per-tab** (not per-site) speed memory
- Users who prefer a floating OSD controller

**Speeding stays intentionally minimal. If you want a full-featured controller, VSC is the better choice.**

## Why Speeding

Most video speed controllers forget your settings when you switch tabs. Speeding remembers your speed per site and keeps audio pitch natural by default — no configuration, no signup, no tracking.

## Install

Available on:

- [Chrome Web Store](https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=github_readme)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=github_readme)

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

Speeding stores only your speed preferences (domain + speed value), scene presets, and site-to-scene bindings in Chrome's local storage. No analytics, no tracking, no external servers. See [docs/PRIVACY.md](./docs/PRIVACY.md) for details.

## License

[Apache 2.0](./LICENSE)
