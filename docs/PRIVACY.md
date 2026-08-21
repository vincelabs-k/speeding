# Privacy Policy for Speeding

**Last Updated: August 21, 2026**

## Data Collection

**Speeding does not collect, transmit, or sell any personal information or user data to external servers.**

The extension stores the following non-personal configuration data locally on your device:

- **Per-site speed preferences** (domain name + speed value): So your chosen playback speed is remembered for each website you visit.
- **Mode preference** ("This site", "Scenes", or "All sites"): Controls whether speed is remembered per-domain, applied per-scene, or shared globally.
- **Scene presets and custom scenes** (scene name + speed value): Built-in presets for course study (16x), series bingeing (1.25x), and foreign listening (0.75x), plus any scenes you create or edit.
- **Site-to-scene bindings** (domain name + scene identifier): Maps a website to a scene so the right speed is applied automatically.

**Where data is stored:**
- Primarily in `chrome.storage.sync` — allows your preferences to sync across devices when signed into Chrome.
- Falls back to `chrome.storage.local` if the sync storage quota is exceeded.

**Local usage counter:**
- The extension may increment an anonymous usage counter (date + count only) in browser storage to enable in-app features — specifically, showing a store review prompt to users who actively use the extension.
- This counter is never transmitted to any external server. It syncs only through Chrome Sync / Microsoft Sync if the user is signed into their browser account. The developer **cannot access this data** — it remains entirely within Google/Microsoft infrastructure.

**What is NOT collected or transmitted:**
- No analytics, telemetry, or crash reporting (the local counter described above is purely for client-side feature gating, not analytics)
- No cookies or tracking identifiers
- No account registration required
- No data is sent to any external server
- No browsing history, form data, or page content

## Permissions

The extension requests the following permissions:

- **`activeTab`**: Required to interact with `<video>` elements on the current page to adjust playback speed. This permission is only activated when the user clicks the extension icon. The extension does not access any page content beyond video playback state.

- **`storage`**: Required to save your per-site speed preferences, scene presets, and site-to-scene bindings locally and sync them across your Chrome devices via Chrome Sync. Only domain names, scene names, and speed values are stored. No personal identifying information is involved.

## Content Scripts

The extension injects a content script on all URLs (`*://*/*`) to detect and control `<video>` elements. This script:

- Only accesses `<video>` element properties (`playbackRate`, `preservesPitch`)
- Does not read, collect, or transmit page content, user input, or browsing activity

## Third-Party Services

This extension does not use any third-party analytics, advertising, or data processing services.

## Changes to This Policy

Any changes to this privacy policy will be reflected in the extension's store listing and the updated privacy document at the same URL.

## Contact

If you have questions about this privacy policy, please contact: 1093358332@qq.com
