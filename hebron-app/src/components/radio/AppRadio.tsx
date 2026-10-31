import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import React from 'react';
import { Label } from '../ui/label';
import { RadioGroupItem, type RadioGroupItemProps } from '../ui/radio-group';

type AppRadioProps = RadioGroupItemProps & {
  label?: React.ReactNode;
  labelClassName?: string;
};

const AppRadio = ({ label, labelClassName, id, size, ...props }: AppRadioProps) => {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const isMobile = useIsMobile();

  return (
    <div className={cn('flex items-center gap-1 md:gap-2')}>
      <RadioGroupItem id={inputId} size={size ? size : isMobile ? 'default' : 'md'} {...props} />
      {label && (
        <Label htmlFor={inputId} className={cn('md:text-md cursor-pointer text-sm font-normal text-neutral-950', labelClassName)}>
          {label}
        </Label>
      )}
    </div>
  );
};

export default AppRadio;
