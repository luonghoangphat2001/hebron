import { useEffect, useRef, useState } from 'react';

export function useMobileFooterDock<T extends HTMLElement = HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const updateDockState = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerBottom = container.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;
      const footer = document.querySelector('.ecommerce-shell footer');
      const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;

      const containerEndReached = containerBottom <= viewportHeight;
      const footerReached = footerTop <= viewportHeight;

      setIsDocked(containerEndReached || footerReached);
    };

    updateDockState();
    window.addEventListener('scroll', updateDockState, { passive: true });
    window.addEventListener('resize', updateDockState);

    return () => {
      window.removeEventListener('scroll', updateDockState);
      window.removeEventListener('resize', updateDockState);
    };
  }, []);

  return { containerRef, isDocked };
}

export function useMyPageFormMobileFooterDock() {
  const { containerRef, isDocked } = useMobileFooterDock<HTMLFormElement>();

  return { containerRef, formRef: containerRef, isDocked };
}
