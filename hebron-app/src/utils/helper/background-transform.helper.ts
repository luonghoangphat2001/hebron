import type { BackgroundTransform, Size } from '../types/canvas.types';

/** Saved template transforms use natural-image pixels, independent of canvas bounds. */
export const normalizeBackgroundTransform = (transform?: Partial<BackgroundTransform>): BackgroundTransform | undefined => {
  if (!transform) return undefined;
  const finite = (value: number | undefined, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return { x: finite(transform.x, 0), y: finite(transform.y, 0), scale: Math.max(0.01, finite(transform.scale, 1)) };
};

export const getTransformedBackgroundGeometry = (image: Size, transform?: Partial<BackgroundTransform>) => {
  const normalized = normalizeBackgroundTransform(transform);
  if (!normalized) return undefined;
  return { x: normalized.x, y: normalized.y, width: image.width * normalized.scale, height: image.height * normalized.scale };
};

/** Converts the legacy fit mode to the same editable natural-image transform. */
export const getEditableBackgroundTransform = (
  image: Size,
  bounds: Size,
  mode: 'cover' | 'contain' | 'fill' = 'contain',
  transform?: BackgroundTransform,
): BackgroundTransform => {
  const saved = normalizeBackgroundTransform(transform);
  if (saved) return saved;
  const scale =
    mode === 'cover'
      ? Math.max(bounds.width / image.width, bounds.height / image.height)
      : Math.min(bounds.width / image.width, bounds.height / image.height);
  return { x: (bounds.width - image.width * scale) / 2, y: (bounds.height - image.height * scale) / 2, scale };
};
