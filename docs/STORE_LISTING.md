# Store Listing Materials

Use the following text when submitting to Chrome Web Store and Edge Add-ons.

---

## Short Description (≤ 132 chars)

```
Set speed once, remembered per site. Scene presets for study, bingeing & listening. Pitch-preserving 0.5x–16x.
```

---

## Detailed Description

**Speeding** remembers your preferred speed for every website — binge a 40-episode drama in half the time, breeze through online lectures, or slow down tricky tutorials, all without chipmunk voices. Set it once and it just works.

Unlike other speed controllers that forget your settings or distort audio, Speeding uses per-site memory and always-on pitch preservation so your content always plays the way you want.

Scene presets make the first run effortless: 16x for course study, 1.25x for series bingeing, 0.75x for foreign listening. Popular platforms — Bilibili, Netflix, Coursera, YouTube, and 40+ more — are pre-matched to a scene. Every preset is editable, and custom scenes are easy to add.

**Key Features:**
- Per-site speed memory — each website remembers its own speed automatically
- Scene presets — 16x course study, 1.25x series bingeing, 0.75x foreign listening, each fully customizable
- Pre-matched sites — Bilibili, Netflix, Coursera, YouTube, and 40+ more auto-select a scene
- "This site", "Scenes", or "All sites" mode — per-domain, per-scene, or global speed
- Pitch-preserving audio — voices and music stay natural at any speed
- Ultra-wide range — from 0.5x slow-mo to 16x hyper-speed
- Works everywhere — Bilibili, YouTube, Netflix, Vimeo, Coursera, and any site with `<video>` elements
- Privacy-first — no tracking, no telemetry, data stored locally only
- One-click popup — no signup, no configuration

---

## Permission Justification

This section explains why each permission is necessary. Copy into the "permission justification" fields during store submission.

### `activeTab`

**Reason**: To adjust `<video>` element playback speed on the current tab only when the user explicitly clicks the extension icon. Without this permission, the extension cannot access the video element's `playbackRate` property.

### `storage`

**Reason**: To save per-site speed preferences locally on the user's device and allow optional cross-device sync via Chrome Sync. When a user sets a custom speed on a website, the extension stores the domain name and speed value so it persists across page reloads and browser restarts. Only domain names (e.g. `youtube.com`), scene names, scene identifiers, and numeric speed values (e.g. `2`) are stored. No personal information, browsing history, or page content is transmitted.

### Content Script on `*://*/*`

**Reason**: Video elements exist on virtually any website — streaming platforms (Bilibili, YouTube, Netflix, Vimeo), online course platforms (Coursera, Udemy), news sites with embedded videos, and personal media servers. Limiting the match pattern to specific domains would break the extension for users on unlisted but legitimate video sites.

The content script ONLY accesses `<video>` element properties (`playbackRate`, `preservesPitch`). It does NOT:
- Read, collect, or transmit page content
- Access user input, form data, or cookies
- Modify DOM beyond video elements
- Communicate with any external server

---

## Privacy Data Disclosure (Chrome Web Store)

When filling the privacy disclosure form:

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

> **Note on stored data**: The extension saves per-site speed preferences (domain + speed value), a mode preference, scene presets and custom scenes (scene name + speed value), site-to-scene bindings (domain + scene identifier), and a local usage counter (date + count only) to `chrome.storage.sync` / `chrome.storage.local`. This is user configuration data and anonymous feature-gating counters, not personal information. It is never transmitted to any external server. It only syncs through Chrome Sync if the user is signed into their Google account. The developer cannot access any of this data.
