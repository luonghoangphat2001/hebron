import { useCan } from '@/hooks/useMenuAccess';
import { Button } from '@/components/ui/button';
import { Layers, Plus } from 'lucide-react';
import React from 'react';

type Props = {
  icon?: React.ElementType;
  message: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
};

export const SectionEmptyState: React.FC<Props> = ({
  icon: Icon = Layers,
  message,
  description,
  onAction,
  actionLabel,
  actionDisabled = false,
}) => {
  const can = useCan();

  return (
    <div className='bg-muted/10 space-y-2.5 rounded-xl border border-dashed p-8 text-center'>
      <Icon className='text-muted-foreground mx-auto h-8 w-8' />
      <p className='text-muted-foreground text-xs font-medium'>{message}</p>
      {description && <p className='text-muted-foreground/70 text-[11px]'>{description}</p>}
      {onAction && can('register') && (
        <Button size='sm' variant='outline' onClick={onAction} disabled={actionDisabled} className='h-7 gap-1 text-xs'>
          <Plus className='h-3.5 w-3.5' />
          {actionLabel || '추가'}
        </Button>
      )}
    </div>
  );
};

export default SectionEmptyState;
