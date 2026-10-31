const apiBaseUrl = () => String(import.meta.env.VITE_API_ENDPOINT || import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

const shouldUseDevStorageProxy = (base: string) => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  try {
    return ['localhost', '127.0.0.1'].includes(new URL(base).hostname);
  } catch {
    return false;
  }
};

export const toStorageUrl = (value?: string | null) => {
  if (!value) return '';
  const base = apiBaseUrl();
  const storagePath = (() => {
    try {
      const url = new URL(value);
      return url.pathname.startsWith('/storage/') ? `${url.pathname}${url.search}${url.hash}` : '';
    } catch {
      if (value.startsWith('/storage/')) return value;
      if (value.startsWith('templates/') || value.startsWith('products/') || value.startsWith('backgrounds/')) {
        return `/storage/${value}`;
      }
      return value.startsWith('storage/') ? `/${value}` : '';
    }
  })();

  if (!storagePath) return value;
  if (shouldUseDevStorageProxy(base)) return storagePath;
  return base ? `${base}${storagePath}` : storagePath;
};

export const storageUrlFromPath = (path?: string | null) => {
  if (!path) return '';
  return toStorageUrl(`/storage/${path.replace(/^\/+/, '')}`);
};

export const toStoragePath = (value?: string | null) => {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.pathname.replace(/^\/storage\/?/, '');
  } catch {
    return value.replace(/^\/?storage\/?/, '');
  }
};
