import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { EditorButtonProps, TextColorPickerProps } from '../types';
import { normalizeColorInputValue } from '../utils';

export function EditorButton({ label, disabledLabel, icon: Icon, onClick, disabled = false, active = false }: EditorButtonProps) {
  const tooltip = disabled && disabledLabel ? disabledLabel : label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex' tabIndex={disabled ? 0 : -1}>
          <Button
            type='button'
            variant={active ? 'secondary' : 'ghost'}
            size='icon-sm'
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active || undefined}
            className={cn(active && 'bg-primary/15 text-foreground hover:bg-primary/20')}>
            <Icon className='size-4' />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarDivider() {
  return <div className='bg-border mx-1 h-6 w-px shrink-0' aria-hidden='true' />;
}

export function TextColorPicker({ value, onChange, disabled = false }: TextColorPickerProps) {
  const { t: tCommon } = useTranslation('common');
  const label = tCommon('editor.text_color');

  return (
    <label
      className={cn(
        'hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-md border transition-colors',
        disabled && 'pointer-events-none opacity-50',
      )}
      title={label}
      aria-label={label}>
      <Palette className='size-4' />
      <input
        type='color'
        value={normalizeColorInputValue(value)}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className='sr-only'
        aria-label={label}
      />
    </label>
  );
}
