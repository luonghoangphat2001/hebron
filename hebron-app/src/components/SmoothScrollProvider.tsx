import { cancelFrame, frame, useReducedMotion } from 'framer-motion';
import { ReactLenis, type LenisRef } from 'lenis/react';
import { useEffect, useRef, type ReactNode } from 'react';

import 'lenis/dist/lenis.css';

type SmoothScrollProviderProps = {
  children: ReactNode;
};

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const shouldReduceMotion = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        // Continuous inertia — no duration (duration = sticky stop between sections)
        lerp: shouldReduceMotion ? 1 : 0.09,
        smoothWheel: !shouldReduceMotion,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.4,
        syncTouch: false,
        overscroll: true,
        allowNestedScroll: true,
      }}>
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
