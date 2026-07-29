# Store Listing Materials

Use the following text when submitting to Chrome Web Store and Edge Add-ons.

---

## Short Description (≤ 132 chars)

```
Video speed controller with pitch-preserving audio. Works on Bilibili, YouTube, Vimeo, Netflix, and online course platforms.
```

---

## Detailed Description

**Speeding** lets you control video playback speed on virtually any website while keeping audio pitch natural. Perfect for binge-watching series, speeding through online courses, or slowing down tutorials.

**Key Features:**
- Adjust speed from 0.25x to 16x on any `<video>` element
- Pitch-preserving audio — voices and music sound natural at any speed
- Works on Bilibili, YouTube, Vimeo, Netflix, and most online course platforms
- Simple one-click popup UI — no configuration needed
- Lightweight and privacy-first — no data collection, no tracking

---

## Permission Justification

This section explains why each permission is necessary. Copy into the "permission justification" fields during store submission.

### `activeTab`

**Reason**: To adjust `<video>` element playback speed on the current tab only when the user explicitly clicks the extension icon. Without this permission, the extension cannot access the video element's `playbackRate` property.

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
