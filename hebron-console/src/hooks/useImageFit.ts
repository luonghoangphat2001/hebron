import { useEffect, useState } from 'react';

export type ObjectFitMode = 'object-cover' | 'object-contain';

/**
 * Asynchronously inspects image dimensions and calculates optimal object-fit mode.
 */
export const resolveImageFit = (src: string, containerEl?: HTMLElement | null): Promise<ObjectFitMode> =>
  new Promise((resolve) => {
    if (!src) return resolve('object-cover');

    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) return resolve('object-cover');

      const imgRatio = w / h;
      const containerRatio = (containerEl?.clientWidth || w) / (containerEl?.clientHeight || h || 1);
      const ratioDiff = Math.abs(imgRatio - containerRatio) / Math.max(containerRatio, 0.001);

      // Preserve extreme aspect ratios / mismatched ratios with contain, otherwise cover
      resolve(ratioDiff > 0.35 || imgRatio > 2.2 || imgRatio < 0.6 ? 'object-contain' : 'object-cover');
    };
    img.onerror = () => resolve('object-cover');
    img.src = src;
  });

/**
 * Reusable hook to handle async image fit resolution with loading state.
 */
export const useImageFit = (src: string | null | undefined, containerRef?: React.RefObject<HTMLElement | null>) => {
  const [state, setState] = useState<{
    src: string | null | undefined;
    fit: ObjectFitMode;
    isLoading: boolean;
  }>({
    src,
    fit: 'object-cover',
    isLoading: Boolean(src),
  });

  // Synchronize loading state when src prop changes during render
  if (state.src !== src) {
    setState({
      src,
      fit: 'object-cover',
      isLoading: Boolean(src),
    });
  }

  useEffect(() => {
    if (!src) return;

    let isMounted = true;

    resolveImageFit(src, containerRef?.current)
      .then((bestFit) => {
        if (isMounted) {
          setState((prev) => ({ ...prev, fit: bestFit, isLoading: false }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setState((prev) => ({ ...prev, fit: 'object-cover', isLoading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, containerRef]);

  return { fit: state.fit, isLoading: state.isLoading };
};

export default useImageFit;
