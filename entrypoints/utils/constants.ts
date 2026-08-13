/**
 * Runtime browser detection — checks UA for Edge identifier.
 * Chrome: not matched → defaults to Chrome Web Store URL.
 */
export const isEdge = (): boolean => navigator.userAgent.includes('Edg/');

/**
 * Known Chrome Web Store extension ID.
 */
export const CHROME_EXTENSION_ID = 'odgdahfgpkmljkbecelajkobpleeioif';

/**
 * Known Edge Add-ons store URL.
 */
export const EDGE_STORE_URL =
  'https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc';

/**
 * utm_source for the popup rating button (see docs/utm-sources.md).
 */
const RATING_UTM_SOURCE = 'popup_rating';

/**
 * Appends a utm_source query parameter to a store URL.
 */
const appendUtm = (url: string, source: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_source=${encodeURIComponent(source)}`;
};

/**
 * Returns the store review URL for the current browser.
 */
export const getStoreUrl = (): string => {
  const url = isEdge()
    ? EDGE_STORE_URL
    : `https://chromewebstore.google.com/detail/${CHROME_EXTENSION_ID}/reviews`;
  return appendUtm(url, RATING_UTM_SOURCE);
};
