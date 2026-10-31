import { useEffect, useRef } from 'react';

const useDebounce = <T>(value: T, onChange: (v: T) => void, delay = 400): void => {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const id = setTimeout(() => onChange(value), delay);
    return () => clearTimeout(id);
  }, [value, delay, onChange]);
};

export default useDebounce;
