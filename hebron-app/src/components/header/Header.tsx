import { Logo } from '@/assets/images';
import HeaderCategoryHoverMenu from '@/components/header/HeaderCategoryHoverMenu';
import HeaderCategoryMegaMenu from '@/components/header/HeaderCategoryMegaMenu';
import HeaderNotificationPopover from '@/components/header/notification/HeaderNotificationPopover';
import { AppInput } from '@/components/input/AppInput';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCartQuery } from '@/data/cart/cart.query';
import { useCategoriesQuery } from '@/data/categories/categories.query';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { useMyPageMobileNav } from '@/pages/ecommerce/my-page/context/MyPageMobileNavContext';
import AIPhraseAssistantModal from '@/pages/ecommerce/product/components/detail/AIPhraseAssistantModal';
import { MY_ROUTE, ROUTE_NAME, getMyPageOrdersPath, getProductListByCategoryPath } from '@/utils/constants/route.constant';
import { ProductSearchParams } from '@/utils/enums/product.enum';
import { getLeafCategories, getLocalizedName } from '@/utils/helper/product-picker.helper';
import { HandbagIcon, ListIcon, MagicWandIcon, MagnifyingGlassIcon, TruckIcon, UserIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type SubmitEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const headerIconButtonClassName = 'shrink-0 rounded-sm text-neutral-950 hover:bg-neutral-100';

const HeaderIconButton = ({ className, children, ...props }: ComponentProps<typeof Button>) => (
  <Button type='button' variant='ghost' size='icon-sm' className={cn(headerIconButtonClassName, className)} {...props}>
    {children}
  </Button>
);

const headerTextActionClassName =
  'h-auto rounded-sm px-0 py-0 text-xs font-normal whitespace-nowrap text-neutral-950 hover:bg-transparent hover:font-semibold sm:text-sm md:text-md';

const CATEGORIES_LIST_PARAMS = {
  with_children: true,
  root_only: true,
} as const;
const CATEGORY_HOVER_CLOSE_DELAY = 50;
const HIDDEN_TOP_CATEGORY_NAMES = new Set(['간편결제', '기타제품']);

type CategoryHoverMenuPosition = {
  top: number;
  left: number;
  width: number;
};

const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const decodedPathname = decodeURIComponent(pathname);
  //const scrolled = useScrolled();
  const { isAdmin, isLoggedIn } = useAuth();
  const { setOpen: setMyPageNavOpen } = useMyPageMobileNav();
  const headerRef = useRef<HTMLElement>(null);
  const hoveredCategoryAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const categoryHoverCloseTimeoutRef = useRef<number | null>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [aiPhraseAssistantOpen, setAiPhraseAssistantOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [menuTopOffset, setMenuTopOffset] = useState(0);
  const [hoveredTopCategory, setHoveredTopCategory] = useState<CategoryRESP | null>(null);
  const [categoryHoverMenuPosition, setCategoryHoverMenuPosition] = useState<CategoryHoverMenuPosition | null>(null);
  const isCheckoutPaymentProcessing = pathname === MY_ROUTE.CHECKOUT_SUCCESS;

  const { data: categoriesData } = useCategoriesQuery(CATEGORIES_LIST_PARAMS);
  const { data: cartItems = [] } = useCartQuery({ enabled: isLoggedIn && !isCheckoutPaymentProcessing });
  const topCategories = (categoriesData?.data.categories ?? []).filter(
    (category) => !HIDDEN_TOP_CATEGORY_NAMES.has(category.name.ko ?? ''),
  );
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const hoveredLeafCategories = useMemo(
    () => getLeafCategories(hoveredTopCategory?.children ?? []).filter((category) => category.is_active),
    [hoveredTopCategory],
  );

  const updateMenuTopOffset = useCallback(() => {
    if (!headerRef.current) return;

    setMenuTopOffset(headerRef.current.getBoundingClientRect().bottom);
  }, []);

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
    updateMenuTopOffset();
  }, [categoryMenuOpen, updateMenuTopOffset]);

  useEffect(() => {
    if (!categoryMenuOpen) return;

    window.addEventListener('resize', updateMenuTopOffset);
    window.addEventListener('scroll', updateMenuTopOffset, { passive: true });

    return () => {
      window.removeEventListener('resize', updateMenuTopOffset);
      window.removeEventListener('scroll', updateMenuTopOffset);
    };
  }, [categoryMenuOpen, updateMenuTopOffset]);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryMenuOpen(false);
    closeCategoryHoverMenu();
  }, [closeCategoryHoverMenu, pathname]);

  const handleCategoryMenuToggle = () => {
    setCategoryMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(updateMenuTopOffset);
      }
      return next;
    });
  };

  const handleUserClick = () => {
    navigate(ROUTE_NAME.MY_PAGE);
  };

  const handleMyPageMenuClick = () => {
    setMyPageNavOpen(true);
  };

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    navigate(keyword ? `${MY_ROUTE.SEARCH}?q=${encodeURIComponent(keyword)}` : MY_ROUTE.SEARCH);
  };

  return (
    <header ref={headerRef} className='fixed inset-x-0 top-0 z-50 w-full overflow-x-hidden bg-white pb-0 sm:pb-2'>
      <div
        className={cn(
          'ecommerce-container flex w-full min-w-0 flex-col gap-3 transition-all md:gap-4',
          'h-auto py-3 md:h-37 md:py-0',
        )}>
        <div className={cn('flex items-center justify-between transition-all', 'md:mt-2')}>
          <Button
            type='button'
            variant='ghost'
            className='h-auto min-w-0 shrink rounded-sm p-0 hover:bg-transparent'
            onClick={() => navigate(MY_ROUTE.HOME)}>
            <img src={Logo} className='h-14 w-auto max-w-56 object-contain object-left md:h-20 md:max-w-none' alt='logo' />
          </Button>

          <div className='flex shrink-0 items-center gap-1 md:gap-3'>
            <HeaderIconButton
              aria-label='장바구니'
              className='relative'
              disabled={isAdmin}
              onClick={() => navigate(MY_ROUTE.CART)}>
              <HandbagIcon className='size-5 md:size-6' />
              {cartItemCount > 0 && (
                <span className='bg-blue-brand absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white'>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </HeaderIconButton>
            {!isLoggedIn ? (
              <>
                <Link
                  to={MY_ROUTE.ORDER_INQUIRY}
                  className='md:text-md text-xs whitespace-nowrap text-neutral-950 transition-all hover:font-semibold sm:text-sm'>
                  주문조회
                </Link>
                <Button
                  type='button'
                  variant='ghost'
                  className={headerTextActionClassName}
                  onClick={() => navigate(MY_ROUTE.LOGIN)}>
                  로그인
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  className={headerTextActionClassName}
                  onClick={() => navigate(MY_ROUTE.REGISTER)}>
                  회원가입
                </Button>
                <HeaderIconButton aria-label='검색' className='md:hidden' onClick={() => navigate(MY_ROUTE.SEARCH)}>
                  <MagnifyingGlassIcon className='size-5' />
                </HeaderIconButton>
              </>
            ) : (
              <div className='flex items-center gap-1 md:gap-3'>
                <HeaderIconButton aria-label='배송조회' disabled={isAdmin} onClick={() => navigate(getMyPageOrdersPath())}>
                  <TruckIcon className='size-5 md:size-6' />
                </HeaderIconButton>
                <HeaderNotificationPopover />
                <HeaderIconButton aria-label='검색' className='md:hidden' onClick={() => navigate(MY_ROUTE.SEARCH)}>
                  <MagnifyingGlassIcon className='size-5' />
                </HeaderIconButton>
                <HeaderIconButton aria-label='마이페이지' onClick={handleUserClick}>
                  <UserIcon className='size-5 md:size-6' />
                </HeaderIconButton>
                <HeaderIconButton aria-label='마이페이지 메뉴' className='md:hidden' onClick={handleMyPageMenuClick}>
                  <ListIcon className='size-5 md:size-6' />
                </HeaderIconButton>
              </div>
            )}
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
          </div>
        </div>

        <div className={cn('flex w-full min-w-0 items-center justify-between gap-2 bg-white')}>
          <div className='flex min-w-0 flex-1 items-center gap-2 md:gap-6'>
            <Button
              type='button'
              variant='ghost'
              size='icon-lg'
              aria-label='카테고리 메뉴'
              aria-expanded={categoryMenuOpen}
              className={cn('shrink-0 rounded-sm bg-neutral-100', categoryMenuOpen && 'bg-neutral-200')}
              onClick={handleCategoryMenuToggle}>
              <ListIcon className='size-5 text-neutral-950 md:size-6' />
            </Button>

            <nav
              className='scrollbar-hide hidden min-w-0 flex-1 flex-nowrap gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain md:flex md:gap-6'
              aria-label='상품 카테고리'>
              {topCategories.map((category) => {
                const categoryPath = getProductListByCategoryPath(category.slug);
                const isActive = decodedPathname === categoryPath;
                const isHovering = category.id === hoveredTopCategory?.id;

                return (
                  <Link
                    key={category.id}
                    to={categoryPath}
                    aria-current={isActive ? 'page' : undefined}
                    aria-haspopup='menu'
                    aria-expanded={isHovering && hoveredLeafCategories.length > 0}
                    onMouseEnter={(event) => handleTopCategoryHover(category, event.currentTarget)}
                    onMouseLeave={scheduleCategoryHoverMenuClose}
                    onFocus={(event) => handleTopCategoryHover(category, event.currentTarget)}
                    onBlur={scheduleCategoryHoverMenuClose}
                    className={cn(
                      'after:bg-blue-brand-700 hover:text-blue-brand-700 relative shrink-0 px-1 text-sm whitespace-nowrap after:absolute after:right-1 after:bottom-0 after:left-1 after:h-0.5 after:opacity-0 after:transition-opacity hover:font-semibold hover:after:opacity-100 md:px-2.5 md:text-lg',
                      (isActive || isHovering) && 'text-blue-brand-700 font-semibold after:opacity-100',
                    )}>
                    {getLocalizedName(category.name)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className='flex shrink-0 gap-2'>
            <Button variant='outline' size='xs' asChild>
              <Link to={ROUTE_NAME.EXAMPLE_SAMPLES}>예문샘플</Link>
            </Button>
            <Button variant='outline' size='xs'>
              고객센터
            </Button>
            <Button size='xs' onClick={() => setAiPhraseAssistantOpen(true)}>
              <MagicWandIcon className='size-3.5' weight='duotone' aria-hidden />
              AI 문구 도우미
            </Button>
            {/* <Button variant='default' size='xs'>
              셀프 디자인
            </Button> */}
          </div>
        </div>
      </div>

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
          getCategoryPath={(parentCategory, category) =>
            `${getProductListByCategoryPath(parentCategory.slug)}?${ProductSearchParams.CATEGORY_IDS}=${category.id}`
          }
        />
      ) : null}

      <HeaderCategoryMegaMenu
        open={categoryMenuOpen}
        topOffset={menuTopOffset}
        topCategories={topCategories}
        onClose={() => setCategoryMenuOpen(false)}
      />
      <AIPhraseAssistantModal
        open={aiPhraseAssistantOpen}
        onOpenChange={setAiPhraseAssistantOpen}
        title='AI 문구 도우미'
        confirmText='3초만에 문구 생성하기'
      />
    </header>
  );
};

export default Header;
