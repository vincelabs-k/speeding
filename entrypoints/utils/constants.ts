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
 * Returns the store review URL for the current browser.
 */
export const getStoreUrl = (): string => {
  if (isEdge()) {
    return EDGE_STORE_URL;
  }
  return `https://chromewebstore.google.com/detail/${CHROME_EXTENSION_ID}/reviews`;
};
