import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CategorynNode } from '@/data/category/category.response';
import { indentOf } from '@/hooks/useCategoryTreeDnd';
import { cn } from '@/lib/utils';
import { CategoryStatus } from '@/utils/enums/category.enum';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';

type Props = {
  node: CategorynNode;
  depth: number;
  expanded: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isNestTarget: boolean;
  disabled: boolean;
  /** px the row slides by to open the empty slot — transform only, so the layout never reflows */
  offsetY: number;
  onSelect: () => void;
  onToggle: () => void;
};

const CategoryTreeRow = ({
  node,
  depth,
  expanded,
  isSelected,
  isDragging,
  isNestTarget,
  disabled,
  offsetY,
  onSelect,
  onToggle,
}: Props) => {
  const { setNodeRef: setDropRef } = useDroppable({ id: node.id, disabled });
  const { setNodeRef: setDragRef, attributes, listeners } = useDraggable({ id: node.id, disabled });

  const hasChildren = node.children.length > 0;

  return (
    <div
      ref={setDropRef}
      data-row={node.id}
      style={{ transform: offsetY ? `translateY(${offsetY}px)` : undefined }}
      className='transition-transform duration-200 ease-out'>
      <div
        ref={setDragRef}
        {...attributes}
        {...listeners}
        style={{ paddingLeft: `${indentOf(depth)}px` }}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm transition-colors duration-150 select-none',
          isSelected ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-50',
          isNestTarget && 'bg-blue-100 ring-2 ring-blue-500 ring-inset',
          // where it is leaving from — greyed but still readable, the real content rides the overlay
          isDragging && 'bg-gray-100 opacity-60 grayscale',
        )}
        onClick={onSelect}>
        {hasChildren ? (
          <Button
            variant='ghost'
            size='icon'
            className='h-4 w-4 shrink-0 p-0 hover:bg-transparent'
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}>
            {expanded ? <ChevronDown className='h-3.5 w-3.5' /> : <ChevronRight className='h-3.5 w-3.5' />}
          </Button>
        ) : (
          <span className='h-4 w-4 shrink-0' />
        )}

        <span
          title={node.status.label}
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            node.status.value === CategoryStatus.ACTTIVE ? 'bg-green-500' : 'bg-gray-300',
          )}
        />

        <span className='flex-1 truncate'>{node.name}</span>

        {/* a nest drop does not move the ghost, so the target says so itself */}
        {isNestTarget ? (
          <CornerDownRight className='h-3.5 w-3.5 shrink-0 text-blue-600' />
        ) : (
          hasChildren && (
            <Badge variant='secondary' className='h-4 shrink-0 rounded-full px-1.5 text-xs'>
              {node.children.length}
            </Badge>
          )
        )}
      </div>
    </div>
  );
};

export default CategoryTreeRow;
