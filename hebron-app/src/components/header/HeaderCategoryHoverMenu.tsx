import type { CategoryRESP } from '@/data/categories/categories.response';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

type HeaderCategoryHoverMenuProps = {
  parentCategory: CategoryRESP | null;
  categories: CategoryRESP[];
  topOffset: number;
  anchorLeft: number;
  anchorWidth: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSelect: () => void;
  getCategoryPath: (parentCategory: CategoryRESP, category: CategoryRESP) => string;
  align?: 'start' | 'center';
};

const HeaderCategoryHoverMenu = ({
  parentCategory,
  categories,
  topOffset,
  anchorLeft,
  anchorWidth,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  getCategoryPath,
  align = 'start',
}: HeaderCategoryHoverMenuProps) => {
  if (!parentCategory || categories.length === 0) return null;

  return createPortal(
    <div
      className='fixed z-[60] border border-neutral-200 bg-white py-1 shadow-lg'
      style={{
        top: topOffset,
        left: align === 'center' ? anchorLeft + anchorWidth / 2 : anchorLeft,
        minWidth: anchorWidth,
        transform: align === 'center' ? 'translateX(-50%)' : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}>
      <div role='menu' aria-label={`${getLocalizedName(parentCategory.name)} 하위 카테고리`}>
        {categories.map((category) => (
          <Link
            key={category.id}
            role='menuitem'
            to={getCategoryPath(parentCategory, category)}
            onClick={onSelect}
            className='hover:text-blue-brand-700 block px-4 py-2 text-sm whitespace-nowrap text-neutral-700 transition-colors hover:bg-neutral-50'>
            {getLocalizedName(category.name)}
          </Link>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default HeaderCategoryHoverMenu;
