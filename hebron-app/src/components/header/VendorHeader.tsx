import { VendorLogo } from '@/assets/svgs';
import HeaderCategoryHoverMenu from '@/components/header/HeaderCategoryHoverMenu';
import { AppInput } from '@/components/input/AppInput';
import { useCategoriesQuery } from '@/data/categories/categories.query';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { VENDOR_ROUTE, getVendorCategoryProductsPath } from '@/utils/constants/route.constant';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { getVendorCategoryLeafCategories, getVendorProductCategories } from '@/utils/helper/vendor-category.helper';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { type SubmitEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

type CategoryHoverMenuPosition = {
  top: number;
  left: number;
  width: number;
};

const CATEGORY_HOVER_CLOSE_DELAY = 50;

const VendorHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const decodedPathname = decodeURIComponent(pathname);
  const [searchKeyword, setSearchKeyword] = useState('');
  const headerRef = useRef<HTMLElement>(null);
  const hoveredCategoryAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const categoryHoverCloseTimeoutRef = useRef<number | null>(null);
  const [hoveredTopCategory, setHoveredTopCategory] = useState<CategoryRESP | null>(null);
  const [categoryHoverMenuPosition, setCategoryHoverMenuPosition] = useState<CategoryHoverMenuPosition | null>(null);
  const { data: categoriesData } = useCategoriesQuery({ root_only: true, with_children: true });
  const topCategories = useMemo(() => getVendorProductCategories(categoriesData?.data.categories ?? []), [categoriesData]);
  const hoveredLeafCategories = useMemo(
    () => getVendorCategoryLeafCategories(hoveredTopCategory ?? undefined),
    [hoveredTopCategory],
  );

  const clearCategoryHoverCloseTimeout = useCallback(() => {
    if (categoryHoverCloseTimeoutRef.current !== null) {
      window.clearTimeout(categoryHoverCloseTimeoutRef.current);
      categoryHoverCloseTimeoutRef.current = null;
    }
  }, []);

  const closeCategoryHoverMenu = useCallback(() => {
    clearCategoryHoverCloseTimeout();
    hoveredCategoryAnchorRef.current = null;
    setHoveredTopCategory(null);
    setCategoryHoverMenuPosition(null);
  }, [clearCategoryHoverCloseTimeout]);

  const updateCategoryHoverMenuPosition = useCallback(() => {
    const anchor = hoveredCategoryAnchorRef.current;
    if (!anchor) return;

    const { bottom, left, width } = anchor.getBoundingClientRect();
    const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? bottom;
    setCategoryHoverMenuPosition({ top: headerBottom, left, width });
  }, []);

  const handleTopCategoryHover = useCallback(
    (category: CategoryRESP, anchor: HTMLAnchorElement) => {
      clearCategoryHoverCloseTimeout();
      hoveredCategoryAnchorRef.current = anchor;
      setHoveredTopCategory(category);
      updateCategoryHoverMenuPosition();
    },
    [clearCategoryHoverCloseTimeout, updateCategoryHoverMenuPosition],
  );

  const scheduleCategoryHoverMenuClose = useCallback(() => {
    clearCategoryHoverCloseTimeout();
    categoryHoverCloseTimeoutRef.current = window.setTimeout(closeCategoryHoverMenu, CATEGORY_HOVER_CLOSE_DELAY);
  }, [clearCategoryHoverCloseTimeout, closeCategoryHoverMenu]);

  useEffect(() => {
    if (!hoveredTopCategory) return;

    window.addEventListener('resize', updateCategoryHoverMenuPosition);
    window.addEventListener('scroll', updateCategoryHoverMenuPosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updateCategoryHoverMenuPosition);
      window.removeEventListener('scroll', updateCategoryHoverMenuPosition);
    };
  }, [hoveredTopCategory, updateCategoryHoverMenuPosition]);

  useEffect(() => clearCategoryHoverCloseTimeout, [clearCategoryHoverCloseTimeout]);

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    navigate(keyword ? `${VENDOR_ROUTE.SEARCH}?q=${encodeURIComponent(keyword)}` : VENDOR_ROUTE.SEARCH);
  };

  return (
    <header ref={headerRef} className='fixed top-0 left-0 z-10 w-full bg-white shadow-sm'>
      <div className='ecommerce-container flex h-18 items-center justify-between'>
        <img src={VendorLogo} alt='vendor' className='cursor-pointer' onClick={() => navigate(VENDOR_ROUTE.HOME)} />
        <div className='flex items-center gap-2 sm:gap-3'>
          <form className='hidden md:block' onSubmit={handleSearch}>
            <AppInput
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder='상품명을 입력하세요!'
              aria-label='상품 검색'
              containerClassName='w-60'
              className='h-9 rounded-full border-neutral-300 pl-4 placeholder:text-neutral-500'
              rightIcon={
                <button type='submit' aria-label='검색' className='grid cursor-pointer place-items-center text-red-600'>
                  <MagnifyingGlassIcon weight='bold' />
                </button>
              }
            />
          </form>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='md:hidden'
            aria-label='검색'
            onClick={() => navigate(VENDOR_ROUTE.SEARCH)}>
            <MagnifyingGlassIcon className='size-5' />
          </Button>
          <Button variant='outline' onClick={() => navigate(VENDOR_ROUTE.PRODUCT_INQUIRY)}>
            고객센터
          </Button>
        </div>
      </div>
      <nav className='border-t border-neutral-200 bg-neutral-50' aria-label='제품 카테고리'>
        <div className='ecommerce-container scrollbar-hide flex h-12 items-center gap-5 overflow-x-auto md:justify-center md:gap-8'>
          {topCategories.map((category) => {
            const categoryPath = getVendorCategoryProductsPath(category.slug);
            const isActive = decodedPathname === decodeURIComponent(categoryPath);
            const isHovering = category.id === hoveredTopCategory?.id;

            return (
              <Link
                key={category.id}
                to={categoryPath}
                aria-current={isActive ? 'page' : undefined}
                aria-haspopup='menu'
                aria-expanded={category.id === hoveredTopCategory?.id && hoveredLeafCategories.length > 0}
                onMouseEnter={(event) => handleTopCategoryHover(category, event.currentTarget)}
                onMouseLeave={scheduleCategoryHoverMenuClose}
                onFocus={(event) => handleTopCategoryHover(category, event.currentTarget)}
                onBlur={scheduleCategoryHoverMenuClose}
                onClick={closeCategoryHoverMenu}
                className={cn(
                  'md:text-md shrink-0 text-sm font-semibold text-neutral-950 transition-colors hover:text-red-500',
                  (isActive || isHovering) && 'md:text-md shrink-0 text-sm text-red-500',
                )}>
                {getLocalizedName(category.name)}
              </Link>
            );
          })}
        </div>
      </nav>

      {categoryHoverMenuPosition ? (
        <HeaderCategoryHoverMenu
          parentCategory={hoveredTopCategory}
          categories={hoveredLeafCategories}
          topOffset={categoryHoverMenuPosition.top}
          anchorLeft={categoryHoverMenuPosition.left}
          anchorWidth={categoryHoverMenuPosition.width}
          onMouseEnter={clearCategoryHoverCloseTimeout}
          onMouseLeave={scheduleCategoryHoverMenuClose}
          onSelect={closeCategoryHoverMenu}
          align='center'
          getCategoryPath={(parentCategory, category) =>
            `${getVendorCategoryProductsPath(parentCategory.slug)}?category_id=${category.id}`
          }
        />
      ) : null}
    </header>
  );
};

export default VendorHeader;
