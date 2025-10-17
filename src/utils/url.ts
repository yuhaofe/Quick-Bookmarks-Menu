
/**
 * Get Favicon URL from chrome
 * @param u target url
 * @returns favicon url
 */
export function faviconURL(u: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}