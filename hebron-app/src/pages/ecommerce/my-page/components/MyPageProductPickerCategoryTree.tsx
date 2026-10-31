import type { CategoryRESP } from '@/data/categories/categories.response';
import type { I18nLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { CaretRightIcon } from '@phosphor-icons/react';

const DEPTH_PADDING_CLASS = ['', 'pl-2', 'pl-4', 'pl-6', 'pl-8', 'pl-10'] as const;

type MyPageProductPickerCategoryTreeProps = {
  categories: CategoryRESP[];
  activeCategoryId: number | null;
  expandedIds: Set<number>;
  lang: I18nLanguage;
  onSelect: (categoryId: number) => void;
  onToggleExpand: (categoryId: number) => void;
};

type CategoryTreeNodeProps = {
  category: CategoryRESP;
  depth: number;
  activeCategoryId: number | null;
  expandedIds: Set<number>;
  lang: I18nLanguage;
  onSelect: (categoryId: number) => void;
  onToggleExpand: (categoryId: number) => void;
};

const getActiveChildren = (category: CategoryRESP) => (category.children ?? []).filter((child) => child.is_active);

const CategoryTreeNode = ({
  category,
  depth,
  activeCategoryId,
  expandedIds,
  lang,
  onSelect,
  onToggleExpand,
}: CategoryTreeNodeProps) => {
  const children = getActiveChildren(category);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isActive = category.id === activeCategoryId;
  const depthPaddingClass = DEPTH_PADDING_CLASS[Math.min(depth, DEPTH_PADDING_CLASS.length - 1)];

  return (
    <li className='flex flex-col gap-0.5'>
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-md transition-colors',
          depthPaddingClass,
          isActive ? 'bg-blue-brand-25' : 'hover:bg-neutral-50',
        )}>
        <button
          type='button'
          onClick={() => onSelect(category.id)}
          className={cn(
            'min-w-0 flex-1 cursor-pointer truncate px-2 py-2 text-left text-sm',
            isActive ? 'text-blue-brand-700 font-semibold' : 'text-neutral-700',
          )}>
          {getLocalizedName(category.name, lang)}
        </button>

        {hasChildren ? (
          <button
            type='button'
            onClick={() => onToggleExpand(category.id)}
            className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100'
            aria-expanded={isExpanded}
            aria-label={isExpanded ? '하위 카테고리 접기' : '하위 카테고리 펼치기'}>
            <CaretRightIcon
              className={cn(
                'size-4 transition-transform',
                isExpanded && 'rotate-90',
                isActive ? 'text-blue-brand-700' : 'text-neutral-500',
              )}
              aria-hidden
            />
          </button>
        ) : (
          <span className='size-7 shrink-0' aria-hidden />
        )}
      </div>

      {hasChildren && isExpanded ? (
        <ul className='flex flex-col gap-0.5'>
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              depth={depth + 1}
              activeCategoryId={activeCategoryId}
              expandedIds={expandedIds}
              lang={lang}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

const MyPageProductPickerCategoryTree = ({
  categories,
  activeCategoryId,
  expandedIds,
  lang,
  onSelect,
  onToggleExpand,
}: MyPageProductPickerCategoryTreeProps) => {
  return (
    <ul className='flex flex-col gap-0.5'>
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          depth={0}
          activeCategoryId={activeCategoryId}
          expandedIds={expandedIds}
          lang={lang}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </ul>
  );
};

export default MyPageProductPickerCategoryTree;
