# Store Listing Example — Speeding Extension

This is a real-world example of a store listing for a browser extension called "Speeding".
Use it as a style reference when writing store listing copy.

---

## Short Description (≤ 132 chars Chrome, ≤ 120 chars Edge)

```
Set speed once, remembered per site. Pitch-preserving audio at 0.5x–16x. Works on YouTube, Bilibili, Netflix & more.
```

> Note: This is 120 chars — designed to satisfy both Chrome (132) and Edge (120) limits.

---

## Detailed Description

**Speeding** remembers your preferred speed for every website — binge a 40-episode drama in half the time, breeze through online lectures, or slow down tricky tutorials, all without chipmunk voices. Set it once and it just works.

Unlike other speed controllers that forget your settings or distort audio, Speeding uses per-site memory and always-on pitch preservation so your content always plays the way you want.

**Key Features:**
- Per-site speed memory — each website remembers its own speed automatically
- "This site" / "All sites" mode — choose per-domain or global speed
- Pitch-preserving audio — voices and music stay natural at any speed
- Ultra-wide range — from 0.5x slow-mo to 16x hyper-speed
- Works everywhere — YouTube, Bilibili, Netflix, Vimeo, Coursera, and any site with video
- Privacy-first — no tracking, no telemetry, data stored locally only
- One-click popup — no signup, no configuration

---

## Permission Justification

### `activeTab`

**Reason**: To adjust video playback speed on the current tab when the user clicks the extension icon. Without this permission, the extension cannot access the video element's `playbackRate` property.

### `storage`

**Reason**: To save per-site speed preferences locally on the user's device and allow optional cross-device sync. When a user sets a custom speed on a website, the extension stores the domain name and speed value so it persists across page reloads and browser restarts.

**Data stored**: Domain names (e.g. `youtube.com`) and numeric speed values (e.g. `2`).
**Data NOT stored**: Personal information, browsing history, page content.

### Content Script on `*://*/*`

**Reason**: Video elements exist on virtually any website — streaming platforms, online course platforms, news sites with embedded videos, and personal media servers. Limiting the match pattern to specific domains would break the extension for users on unlisted but legitimate video sites.

The content script **only** accesses video element properties (`playbackRate`, `preservesPitch`). It does **NOT**:
- Read, collect, or transmit page content
- Access user input, form data, or cookies
- Modify DOM beyond video elements
- Communicate with any external server

---

## Privacy Disclosure

| Question | Answer |
|----------|--------|
| Does the extension collect personal info? | No |
| Does it collect browsing activity? | No |
| Does it collect website content? | No |
| Does it use cookies? | No |
| Does it handle financial/payment info? | No |
| Does it collect authentication info? | No |
| Does it collect personal communications? | No |
| Does it collect location data? | No |
| Does it collect user input? | No |

> **Stored data note**: Per-site speed preferences (domain + speed value), mode preference, and local usage counter. Stored in `chrome.storage.sync` / `chrome.storage.local`. Never transmitted to external servers. Developer cannot access any of this data.
