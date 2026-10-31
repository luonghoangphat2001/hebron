import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

type RowActionButtonProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

const RowActionButton = ({ onEdit, onDelete }: RowActionButtonProps) => {
  const { t: tCommon } = useTranslation('common');

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
          <DropdownMenuItem onClick={onEdit} className='cursor-pointer text-blue-500! focus:**:text-blue-500!'>
            <Edit /> {tCommon('button.edit')}
          </DropdownMenuItem>
          {onDelete && (
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
