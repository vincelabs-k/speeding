# Speeding

Video speed controller with pitch-preserving audio — works on Bilibili, YouTube, Vimeo, Netflix, and online course platforms.

## Features

- Adjust playback speed from 0.5x to 16x on any `<video>` element
- Pitch-preserving audio (voices and music stay natural)
- One-click popup UI
- No data collection, no tracking — 100% private

## Install

Available on:

- [Chrome Web Store](#) _(coming soon)_
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

This extension does not collect, store, or transmit any user data. See [docs/PRIVACY.md](./docs/PRIVACY.md) for details.

## License

[Apache 2.0](./LICENSE)
