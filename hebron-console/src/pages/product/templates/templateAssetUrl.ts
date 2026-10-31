import { toStorageUrl } from '@/utils/helper/storage-url.helper';

const apiBaseUrl = () => String(import.meta.env?.VITE_API_ENDPOINT || import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

// Only template/background objects are supported by the API asset proxy.
// Other S3 assets (including calligraphies) use the bucket's CORS-enabled URL.
export const templateAssetUrl = (value?: string | null) => {
  if (!value) return '';
  if (/^(blob:|data:)/i.test(value)) return value;
  try {
    const url = new URL(value, typeof window === 'undefined' ? undefined : window.location.origin);
    if (/\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i.test(url.hostname)) {
      if (/^\/(templates|backgrounds)\//.test(url.pathname)) {
        if (import.meta.env?.DEV) return `/__template_assets${url.pathname}${url.search}`;
        const base = apiBaseUrl();
        const path = url.pathname.replace(/^\/+/, '');
        return base ? `${base}/template-assets/${path}${url.search}` : value;
      }
      const isSigned = [...url.searchParams.keys()].some((key) => /^(x-amz-|awsaccesskeyid$|signature$)/i.test(key));
      if (url.pathname.startsWith('/calligraphies/') && !isSigned) {
        // Separate canvas-readable requests from old non-CORS thumbnail cache entries.
        // Keep this key stable across the picker, size probe, canvas, and reloads.
        url.searchParams.set('canvas_cors', 'v1');
        return url.href;
      }
    }
  } catch {
    // Let the existing storage resolver handle relative and legacy values.
  }
  return /^(https?:\/\/|\/\/)/i.test(value) ? value : toStorageUrl(value);
};
