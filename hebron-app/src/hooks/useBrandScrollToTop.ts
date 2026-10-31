import { useLenis } from 'lenis/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useBrandScrollToTop = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, lenis]);
};
