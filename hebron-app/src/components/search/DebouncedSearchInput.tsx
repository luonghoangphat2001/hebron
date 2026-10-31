import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 600;

type DebouncedSearchInputProps = {
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
  defaultValue?: string;
  placeholder?: string;
  'aria-label': string;
  className?: string;
  inputClassName?: string;
};

const DebouncedSearchInput = ({
  onDebouncedChange,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  defaultValue = '',
  placeholder,
  'aria-label': ariaLabel,
  className,
  inputClassName,
}: DebouncedSearchInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const onDebouncedChangeRef = useRef(onDebouncedChange);
  const hasUserChangedValueRef = useRef(false);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    if (!hasUserChangedValueRef.current) return;

    const emit = debounce(() => {
      onDebouncedChangeRef.current(value);
    }, debounceMs);

    emit();

    return () => emit.cancel();
  }, [value, debounceMs]);

  return (
    <div className={cn('relative min-w-0', className)}>
      <MagnifyingGlassIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400' />
      <Input
        value={value}
        onChange={(event) => {
          hasUserChangedValueRef.current = true;
          setValue(event.target.value);
        }}
        placeholder={placeholder}
        className={cn('h-10 pl-9', inputClassName)}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default DebouncedSearchInput;
