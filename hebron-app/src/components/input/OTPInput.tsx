import { cn } from '@/lib/utils';
import { useRef } from 'react';

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
};

const OTPInput = ({ value, onChange, length = 6, disabled, className }: OTPInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const values = Array.from({ length }, (_, index) => value[index] ?? '');

  const updateValue = (nextValues: string[]) => {
    onChange(nextValues.join('').slice(0, length));
  };

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '');

    if (!digit) return;

    const nextValues = [...values];
    nextValues[index] = digit[digit.length - 1];
    updateValue(nextValues);

    inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();

      const nextValues = [...values];

      if (nextValues[index]) {
        nextValues[index] = '';
        updateValue(nextValues);
        return;
      }

      inputRefs.current[index - 1]?.focus();
      nextValues[index - 1] = '';
      updateValue(nextValues);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    onChange(pasted);

    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {values.map((item, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={item}
          disabled={disabled}
          inputMode='numeric'
          maxLength={1}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className='focus:border-brand-strong size-12 rounded-md border border-neutral-200 bg-white text-center text-lg font-semibold text-neutral-950 outline-none focus:border-2 disabled:bg-neutral-50'
        />
      ))}
    </div>
  );
};

export default OTPInput;
