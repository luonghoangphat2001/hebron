import { useCan } from '@/hooks/useMenuAccess';
import { Button } from '@/components/ui/button';
import { Edit3, Loader2, Trash2 } from 'lucide-react';
import React from 'react';

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  disabled?: boolean;
  positionClass?: string;
  // show the buttons all the time instead of only on card hover
  alwaysVisible?: boolean;
  variant?: 'ghost' | 'secondary' | 'solid';
  className?: string;
  children?: React.ReactNode;
};

export const SectionCardActions: React.FC<Props> = ({
  onEdit,
  onDelete,
  isDeleting = false,
  disabled = false,
  positionClass = 'top-2.5 right-2.5',
  alwaysVisible = false,
  variant = 'secondary',
  className = '',
  children,
}) => {
  const can = useCan();
  const isGhost = variant === 'ghost';
  const canEdit = !!onEdit && can('edit');
  const canDelete = !!onDelete && can('delete');

  if (!children && !canEdit && !canDelete) return null;

  return (
    <div
      className={`absolute ${positionClass} flex items-center gap-1 transition-opacity ${
        isDeleting || alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      } ${className}`}>
      {children}

      {canEdit && (
        <Button
          type='button'
          size='icon'
          variant={isGhost ? 'ghost' : 'secondary'}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={disabled || isDeleting}
          className={isGhost ? 'h-6 w-6 rounded-full' : 'h-7 w-7 rounded-full shadow-xs'}>
          <Edit3 className={isGhost ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </Button>
      )}

      {canDelete && (
        <Button
          type='button'
          size='icon'
          variant={isGhost ? 'ghost' : 'destructive'}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled || isDeleting}
          className={
            isGhost ? 'text-muted-foreground hover:text-destructive h-6 w-6 rounded-full' : 'h-7 w-7 rounded-full shadow-xs'
          }>
          {isDeleting ? (
            <Loader2 className={isGhost ? 'h-3 w-3 animate-spin' : 'h-3.5 w-3.5 animate-spin'} />
          ) : (
            <Trash2 className={isGhost ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          )}
        </Button>
      )}
    </div>
  );
};

export default SectionCardActions;
