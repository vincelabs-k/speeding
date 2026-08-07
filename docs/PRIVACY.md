# Privacy Policy for Speeding

**Last Updated: August 7, 2026**

## Data Collection

**Speeding does not collect, transmit, or sell any personal information or user data to external servers.**

The extension stores the following non-personal configuration data locally on your device:

- **Per-site speed preferences** (domain name + speed value): So your chosen playback speed is remembered for each website you visit.
- **Mode preference** ("This site" or "All sites"): Controls whether speed is remembered per-domain or shared globally.

**Where data is stored:**
- Primarily in `chrome.storage.sync` — allows your preferences to sync across devices when signed into Chrome.
- Falls back to `chrome.storage.local` if the sync storage quota is exceeded.

**What is NOT collected or transmitted:**
- No analytics, telemetry, or crash reporting
- No cookies or tracking identifiers
- No account registration required
- No data is sent to any external server
- No browsing history, form data, or page content

## Permissions

The extension requests the following permissions:

- **`activeTab`**: Required to interact with `<video>` elements on the current page to adjust playback speed. This permission is only activated when the user clicks the extension icon. The extension does not access any page content beyond video playback state.

- **`storage`**: Required to save your per-site speed preferences locally and sync them across your Chrome devices via Chrome Sync. Only domain names and speed values are stored. No personal identifying information is involved.

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
