import { useCan } from '@/hooks/useMenuAccess';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  icon: React.ElementType;
  badgeText?: string | number;
  badgeVariant?: 'outline' | 'default' | 'secondary';
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  createDisabled?: boolean;
  children?: React.ReactNode;
};

export const SectionHeader: React.FC<Props> = ({
  title,
  icon: Icon,
  badgeText,
  badgeVariant = 'outline',
  onSave,
  isSaving = false,
  saveLabel,
  saveDisabled = false,
  onCreate,
  createLabel,
  createDisabled = false,
  children,
}) => {
  const { t: tCommon } = useTranslation('common');
  const can = useCan();

  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div className='flex items-center gap-2'>
        <Icon className='text-primary h-4 w-4 shrink-0' />
        <h4 className='text-foreground text-sm font-semibold'>{title}</h4>
        {badgeText !== undefined && (
          <Badge variant={badgeVariant} className='font-mono text-[10px]'>
            {badgeText}
          </Badge>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {children}

        {onCreate && can('register') && (
          <Button
            size='sm'
            onClick={onCreate}
            disabled={createDisabled || isSaving}
            className='h-8 gap-1.5 text-xs font-semibold'>
            <Plus className='h-3.5 w-3.5' />
            {createLabel || tCommon('button.create')}
          </Button>
        )}

        {onSave && can('edit') && (
          <Button
            size='sm'
            variant='default'
            onClick={onSave}
            disabled={saveDisabled || isSaving}
            className='h-8 gap-1.5 text-xs font-semibold'>
            {isSaving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : null}
            {saveLabel || tCommon('button.save')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
