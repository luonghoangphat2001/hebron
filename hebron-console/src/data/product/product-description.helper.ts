const PRODUCT_DESCRIPTION_IMAGE_ORIGIN = 'https://hebron-storage.s3.ap-northeast-2.amazonaws.com';
const LEGACY_IMAGE_HOSTS = new Set(['gpgs.co.kr', 'www.gpgs.co.kr', 'everaward.com', 'www.everaward.com']);

/** Point migrated description images at S3 while preserving their object paths. */
export const normalizeProductDescriptionImages = (html: string): string => {
  if (!html) return html;

  const document = new DOMParser().parseFromString(html, 'text/html');
  let changed = false;

  document.querySelectorAll('img[src]').forEach((image) => {
    const source = image.getAttribute('src') ?? '';
    try {
      const url = new URL(source.startsWith('//') ? `https:${source}` : source);
      if (!['http:', 'https:'].includes(url.protocol) || !LEGACY_IMAGE_HOSTS.has(url.hostname)) return;

      image.setAttribute('src', `${PRODUCT_DESCRIPTION_IMAGE_ORIGIN}${url.pathname}${url.search}${url.hash}`);
      changed = true;
    } catch {
      // Leave relative and invalid URLs unchanged.
    }
  });

  return changed ? document.body.innerHTML : html;
};
