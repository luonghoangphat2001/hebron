import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useId } from 'react';

type Props = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
};

export default function AppCheckBox({ checked, onCheckedChange, label, description, disabled, className, required, id }: Props) {
  const generatedId = useId();

  const finalId = id || generatedId;

  return (
    <div className={cn('flex items-start gap-2', disabled && 'opacity-50', className)}>
      <Checkbox
        id={finalId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange?.(!!value)}
        className='mt-0.5 shadow-sm'
      />

      <div className='space-y-1'>
        {label && (
          <FieldLabel htmlFor={finalId} className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}>
            {label}

            {required && <span className='ml-1 text-red-500'>*</span>}
          </FieldLabel>
        )}

        {description && <p className='text-muted-foreground text-sm'>{description}</p>}
      </div>
    </div>
  );
}
