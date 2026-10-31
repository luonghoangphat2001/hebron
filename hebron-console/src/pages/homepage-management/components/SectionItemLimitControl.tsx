import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  limit: number;
  onChange: (limit: number) => void;
  options?: number[];
  disabled?: boolean;
  label?: string;
  className?: string;
};

export const SectionItemLimitControl: React.FC<Props> = ({
  limit,
  onChange,
  options = [4, 8, 12, 16],
  disabled = false,
  label,
  className,
}) => {
  const { t: tContent } = useTranslation('content');
  const [val, setVal] = useState<string>('');

  const handleCustomApply = () => {
    const num = parseInt(val, 10);
    if (num > 0 && num !== limit) {
      onChange(num);
    }
    setVal('');
  };

  return (
    <div className={cn('bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 shadow-2xs', className)}>
      <div className='flex items-center gap-2'>
        <Flame className='h-4 w-4 text-rose-500' />
        <span className='text-foreground text-xs font-semibold'>{label || tContent('homepage.display_item_limit')}:</span>
      </div>

      <div className='flex items-center gap-1.5'>
        {options.map((opt) => (
          <Button
            key={opt}
            type='button'
            size='sm'
            variant={limit === opt ? 'default' : 'outline'}
            onClick={() => onChange(opt)}
            disabled={disabled}
            className='h-7 px-2.5 font-mono text-xs font-semibold'>
            {opt}
          </Button>
        ))}

        <Input
          type='number'
          min={1}
          max={100}
          value={val || (options.includes(limit) ? '' : limit)}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleCustomApply}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomApply()}
          placeholder={tContent('homepage.custom_limit')}
          disabled={disabled}
          className='h-7 w-20 px-2 text-center font-mono text-xs'
        />
      </div>
    </div>
  );
};

export default SectionItemLimitControl;
