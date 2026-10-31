import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/useMenuAccess';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

type RowActionButtonProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
};

const RowActionButton = ({ onView, onEdit, onDelete, children }: RowActionButtonProps) => {
  const { t: tCommon } = useTranslation('common');
  const can = useCan();

  const canEdit = !!onEdit && can('edit');
  const canDelete = !!onDelete && can('delete');

  if (!children && !onView && !canEdit && !canDelete) return null;

  return (
    <div className='text-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {children}
          {onView && (
            <DropdownMenuItem onClick={onView} className='text-black-500! focus:**:text-black-500! cursor-pointer'>
              <Eye /> {tCommon('button.preview') || 'View'}
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem onClick={onEdit} className='cursor-pointer text-blue-500! focus:**:text-blue-500!'>
              <Edit /> {tCommon('button.edit')}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={onDelete} className='cursor-pointer text-red-500! focus:**:text-red-500!'>
              <Trash /> {tCommon('button.delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RowActionButton;
