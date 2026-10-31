import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategorynNode } from '@/data/category/category.response';
import { hasCategoryFilter, type CategoryTreeFilterValues } from '@/data/category/category.service';
import { flattenVisibleCategories } from '@/data/category/category.tree';
import { indentOf, useCategoryTreeDnd } from '@/hooks/useCategoryTreeDnd';
import { cn } from '@/lib/utils';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { CornerDownRight } from 'lucide-react';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import CategoryTreeFilters from './CategoryTreeFilters';
import CategoryTreeRow from './CategoryTreeRow';

function collectAllIds(nodes: CategorynNode[], result: Set<number>) {
  for (const node of nodes) {
    result.add(node.id);
    collectAllIds(node.children, result);
  }
}

type Props = {
  categories: CategorynNode[];
  isLoading?: boolean;
  selectedId: number | null;
  onSelect: (item: CategorynNode) => void;
  filters: CategoryTreeFilterValues;
  onFiltersChange: Dispatch<SetStateAction<CategoryTreeFilterValues>>;
};

const CategoryTree = ({ categories, isLoading, selectedId, onSelect, filters, onFiltersChange }: Props) => {
  const { t: tCategory } = useTranslation('category');

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const hasActiveFilter = hasCategoryFilter(filters);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // auto-expand everything while a filter narrows the result set down
  const autoExpandIds = useMemo(() => {
    if (!hasActiveFilter) return new Set<number>();
    const all = new Set<number>();
    collectAllIds(categories, all);
    return all;
  }, [hasActiveFilter, categories]);

  const isExpanded = (id: number) => expandedIds.has(id) || autoExpandIds.has(id);

  const rows = useMemo(
    () => flattenVisibleCategories(categories, isExpanded),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, expandedIds, autoExpandIds],
  );

  // a filtered tree only holds part of each sibling group — renumbering it would rewrite the
  // sort_order of categories that are not on screen, so reordering is off while filtering
  const { listRef, activeNode, ghost, isDragDisabled, offsetOf, isDragging, isNestTarget, dndContextProps } = useCategoryTreeDnd({
    categories,
    rows,
    disabled: hasActiveFilter,
  });

  return (
    <div className='flex h-full w-80 shrink-0 flex-col gap-3 rounded-lg border bg-white p-3'>
      <CategoryTreeFilters filters={filters} onFiltersChange={onFiltersChange} />

      {hasActiveFilter && categories.length > 0 && (
        <p className='text-muted-foreground text-xs italic'>{tCategory('tree.reorder_disabled_by_filter')}</p>
      )}

      <Separator />

      <div ref={listRef} className='no-scrollbar relative min-h-0 flex-1 space-y-0.5 overflow-y-auto'>
        {isLoading ? (
          <CategoryTreeSkeleton />
        ) : categories.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            {tCategory(hasActiveFilter ? 'tree.empty_filtered' : 'tree.empty')}
          </p>
        ) : (
          <DndContext {...dndContextProps}>
            {rows.map(({ node, depth }, index) => (
              <CategoryTreeRow
                key={node.id}
                node={node}
                depth={depth}
                expanded={isExpanded(node.id)}
                isSelected={selectedId === node.id}
                isDragging={isDragging(node.id)}
                isNestTarget={isNestTarget(node.id)}
                disabled={isDragDisabled}
                offsetY={offsetOf(index)}
                onSelect={() => onSelect(node)}
                onToggle={() => toggleExpand(node.id)}
              />
            ))}

            {/*
              Where it will land — lighter than the ghost it leaves behind, and indented to the new
              level. Kept mounted for the whole drag so it glides between slots and fades back onto
              the row it came from when there is nowhere valid to drop.
            */}
            {ghost && (
              <div
                style={{ top: ghost.top, left: ghost.left, height: ghost.height }}
                className={cn(
                  'pointer-events-none absolute right-2 flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-gray-50/80 px-2 text-sm text-gray-400 transition-all duration-200 ease-out',
                  ghost.visible ? 'opacity-100' : 'opacity-0',
                )}>
                <CornerDownRight className='h-3.5 w-3.5 shrink-0' />
                <span className='truncate'>{ghost.name}</span>
              </div>
            )}

            <DragOverlay dropAnimation={null}>
              {activeNode && (
                <div className='rounded-md border border-blue-300 bg-white px-2 py-1.5 text-sm font-medium text-blue-700 shadow-lg'>
                  {activeNode.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

const SKELETON_ROWS = [
  { width: '62%', hasChildren: true },
  { width: '48%', hasChildren: true },
  { width: '70%', hasChildren: false },
  { width: '55%', hasChildren: true },
  { width: '40%', hasChildren: false },
  { width: '65%', hasChildren: true },
  { width: '52%', hasChildren: true },
  { width: '44%', hasChildren: false },
];

const CategoryTreeSkeleton = () => (
  <>
    {SKELETON_ROWS.map(({ width, hasChildren }, i) => (
      <div
        key={i}
        style={{ paddingLeft: `${indentOf(0)}px` }}
        className='flex min-h-8 items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm select-none'>
        {hasChildren ? <Skeleton className='h-3.5 w-3.5 shrink-0' /> : <span className='h-4 w-4 shrink-0' />}
        <Skeleton className='h-2 w-2 shrink-0 rounded-full' />
        <div className='flex-1'>
          <Skeleton className='h-3.5' style={{ width }} />
        </div>
        {hasChildren && <Skeleton className='h-4 w-5 shrink-0 rounded-full' />}
      </div>
    ))}
  </>
);

export default CategoryTree;
