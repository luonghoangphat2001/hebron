import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MY_PAGE_LIST_ROW_ACTIONS } from '@/utils/constants/my-page.constant';
import { DotsThreeOutlineIcon, EyeIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

type MyPageListRowActionsProps = {
  onViewDetails?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
};

type MyPageListRowActionItemProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

const menuContentClassName = 'w-fit min-w-0 p-1.5';
const menuItemClassName = 'cursor-pointer gap-2 px-3 py-2';

const MyPageListRowActionItem = ({ icon, label, onClick, destructive }: MyPageListRowActionItemProps) => (
  <DropdownMenuItem variant={destructive ? 'destructive' : 'default'} className={menuItemClassName} onClick={onClick}>
    <span className='flex w-4 shrink-0 items-center justify-center' aria-hidden>
      {icon}
    </span>
    <span className={cn('text-sm', destructive ? undefined : 'text-neutral-950')}>{label}</span>
  </DropdownMenuItem>
);

const MyPageListRowActions = ({ onViewDetails, onUpdate, onDelete }: MyPageListRowActionsProps) => {
  const hasViewOnlyAction = Boolean(onViewDetails) && !onUpdate && !onDelete;

  if (hasViewOnlyAction) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon-sm'
        className='size-8 shrink-0 rounded-full border-neutral-200 bg-white'
        aria-label={MY_PAGE_LIST_ROW_ACTIONS.viewDetails}
        onClick={onViewDetails}>
        <EyeIcon className='size-4 text-neutral-500' aria-hidden />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon-sm'
          className='size-8 shrink-0 rounded-full border-neutral-200 bg-white'
          aria-label={MY_PAGE_LIST_ROW_ACTIONS.menu}>
          <DotsThreeOutlineIcon className='size-4 text-neutral-950' weight='bold' aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className={menuContentClassName}>
        {onUpdate ? (
          <MyPageListRowActionItem
            icon={<PencilSimpleIcon className='size-4 text-neutral-500' />}
            label={MY_PAGE_LIST_ROW_ACTIONS.update}
            onClick={onUpdate}
          />
        ) : null}
        {onViewDetails ? (
          <MyPageListRowActionItem
            icon={<EyeIcon className='size-4 text-neutral-500' />}
            label={MY_PAGE_LIST_ROW_ACTIONS.viewDetails}
            onClick={onViewDetails}
          />
        ) : null}
        {onDelete ? (
          <MyPageListRowActionItem
            icon={<TrashIcon className='text-destructive size-4' />}
            label={MY_PAGE_LIST_ROW_ACTIONS.delete}
            onClick={onDelete}
            destructive
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyPageListRowActions;
