import { useCallback, useEffect, useState } from 'react';

export const useCountDown = (initialSeconds: number, onExpire?: () => void, enabled = true) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!enabled) return;

    if (seconds <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, seconds, onExpire]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return {
    seconds,
    reset,
    isExpired: seconds <= 0,
  };
};
