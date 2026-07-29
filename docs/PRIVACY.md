# Privacy Policy for Speeding

**Last Updated: July 29, 2026**

## Data Collection

**Speeding does not collect, store, or transmit any personal information or user data.**

- No analytics, telemetry, or crash reporting
- No cookies or local storage used for tracking
- No account registration required
- No data is sent to any external server

## Permissions

The extension requests only the following permission:

- **`activeTab`**: Required to interact with `<video>` elements on the current page to adjust playback speed. This permission is only activated when the user clicks the extension icon. The extension does not access any page content beyond video playback state.

## Content Scripts

The extension injects a content script on all URLs (`*://*/*`) to detect and control `<video>` elements. This script:

- Only accesses `<video>` element properties (`playbackRate`, `preservesPitch`)
- Does not read, collect, or transmit page content, user input, or browsing activity

## Third-Party Services

This extension does not use any third-party analytics, advertising, or data processing services.

## Changes to This Policy

Any changes to this privacy policy will be reflected in the extension's store listing and the updated privacy document at the same URL.

## Contact

If you have questions about this privacy policy, please contact: your-email@example.com
