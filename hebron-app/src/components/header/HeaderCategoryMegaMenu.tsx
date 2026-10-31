import type { CategoryRESP } from '@/data/categories/categories.response';
import { useCategoryChildrenQuery } from '@/data/categories/categories.query';
import { cn } from '@/lib/utils';
import { getProductListByCategoryPath } from '@/utils/constants/route.constant';
import { ProductSearchParams } from '@/utils/enums/product.enum';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { CaretRightIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

type HeaderCategoryMegaMenuProps = {
  open: boolean;
  topOffset: number;
  topCategories: CategoryRESP[];
  onClose: () => void;
};

const OVERLAY_TRANSITION = { duration: 0.36, ease: [0.4, 0, 0.2, 1] as const };
const PANEL_TRANSITION = { duration: 0.42, ease: [0.32, 0.72, 0, 1] as const };
const SUBCATEGORY_TRANSITION = { duration: 0.18, ease: 'easeOut' as const };

const categoryItemClassName = (isActive: boolean) =>
  cn(
    'flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors',
    isActive ? 'bg-blue-brand-25 text-blue-brand-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-50',
  );

const HeaderCategoryMegaMenu = ({ open, topOffset, topCategories, onClose }: HeaderCategoryMegaMenuProps) => {
  const navigate = useNavigate();
  const [activeTopCategoryId, setActiveTopCategoryId] = useState<number | null>(null);
  const [activeSecondCategoryId, setActiveSecondCategoryId] = useState<number | null>(null);

  const activeTopCategory = topCategories.find((category) => category.id === activeTopCategoryId) ?? topCategories[0];
  const { data: secondCategories = [] } = useCategoryChildrenQuery(
    open && activeTopCategory?.children.length ? activeTopCategory.slug : undefined,
  );
  const activeSecondCategory = secondCategories.find((category) => category.id === activeSecondCategoryId);
  const { data: thirdCategories = [] } = useCategoryChildrenQuery(
    open && activeSecondCategory?.children.length ? activeSecondCategory.slug : undefined,
  );

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTopCategoryId(topCategories[0]?.id ?? null);
    setActiveSecondCategoryId(null);
  }, [open, topCategories]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const navigateToCategory = (categorySlug: string, categoryId?: number) => {
    const path = getProductListByCategoryPath(categorySlug);
    const search = categoryId === undefined ? '' : `?${ProductSearchParams.CATEGORY_IDS}=${categoryId}`;

    onClose();
    navigate(`${path}${search}`);
  };

  const handleTopCategorySelect = (category: CategoryRESP) => {
    if (!category.children.length) {
      navigateToCategory(category.slug);
      return;
    }

    setActiveTopCategoryId(category.id);
    setActiveSecondCategoryId(null);
  };

  const handleSecondCategorySelect = (category: CategoryRESP) => {
    if (!category.children.length) {
      navigateToCategory(activeTopCategory.slug, category.id);
      return;
    }

    setActiveSecondCategoryId(category.id);
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key='category-menu-overlay'
            type='button'
            aria-label='카테고리 메뉴 닫기'
            className='fixed inset-x-0 bottom-0 z-30 bg-black/40'
            style={{ top: topOffset }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={OVERLAY_TRANSITION}
            onClick={onClose}
          />

          <motion.div
            key='category-menu-panel'
            className='fixed inset-x-0 z-40 overflow-hidden border-b border-neutral-200 bg-white shadow-lg'
            style={{ top: topOffset, transformOrigin: 'top center' }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={PANEL_TRANSITION}>
            <div className='ecommerce-container flex max-h-[min(32rem,calc(100dvh-8rem))] min-h-80'>
              <aside className='flex w-44 shrink-0 flex-col gap-1 overflow-y-auto border-r border-neutral-200 py-4 pr-3 md:w-56'>
                {topCategories.map((category) => {
                  const isActive = category.id === activeTopCategory?.id;
                  const hasChildren = category.children.length > 0;

                  if (!hasChildren) {
                    return (
                      <button
                        key={category.id}
                        type='button'
                        onClick={() => handleTopCategorySelect(category)}
                        className={cn(categoryItemClassName(isActive), 'w-full cursor-pointer')}>
                        <span className='truncate'>{getLocalizedName(category.name)}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={category.id}
                      type='button'
                      onClick={() => handleTopCategorySelect(category)}
                      className={cn(categoryItemClassName(isActive), 'w-full cursor-pointer')}>
                      <span className='truncate'>{getLocalizedName(category.name)}</span>
                      <CaretRightIcon
                        className={cn('size-4 shrink-0', isActive ? 'text-blue-brand-700' : 'text-neutral-500')}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </aside>

              <div className='min-w-0 flex-1 overflow-y-auto px-4 py-4 md:px-6'>
                <AnimatePresence mode='wait'>
                  {activeTopCategory ? (
                    <motion.div
                      key={activeTopCategory.id}
                      className='flex flex-col gap-4'
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={SUBCATEGORY_TRANSITION}>
                      <p className='text-md font-bold text-neutral-950'>{getLocalizedName(activeTopCategory.name)}</p>
                      <div className='flex min-w-0 gap-8'>
                        <ul className='flex min-w-48 flex-col gap-1'>
                          {secondCategories.map((category) => {
                            const hasChildren = category.children.length > 0;
                            const isActive = category.id === activeSecondCategory?.id;

                            return (
                              <li key={category.id}>
                                <button
                                  type='button'
                                  onClick={() => handleSecondCategorySelect(category)}
                                  className={cn(
                                    'text-md flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950',
                                    isActive && 'bg-blue-brand-25 text-blue-brand-700 font-semibold',
                                  )}>
                                  <span className='truncate'>{getLocalizedName(category.name)}</span>
                                  {hasChildren ? <CaretRightIcon className='size-4 shrink-0' aria-hidden /> : null}
                                </button>
                              </li>
                            );
                          })}
                        </ul>

                        <AnimatePresence mode='wait'>
                          {activeSecondCategory ? (
                            <motion.div
                              key={activeSecondCategory.id}
                              className='min-w-48'
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={SUBCATEGORY_TRANSITION}>
                              <p className='text-md mb-1 px-3 py-2.5 font-bold text-neutral-950'>
                                {getLocalizedName(activeSecondCategory.name)}
                              </p>
                              <ul className='flex flex-col gap-1'>
                                {thirdCategories.map((category) => (
                                  <li key={category.id}>
                                    <button
                                      type='button'
                                      onClick={() => navigateToCategory(activeTopCategory.slug, category.id)}
                                      className='text-md block w-full cursor-pointer rounded-md px-3 py-2.5 text-left text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950'>
                                      {getLocalizedName(category.name)}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p
                      key='empty-subcategory'
                      className='text-sm text-neutral-500'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={SUBCATEGORY_TRANSITION}>
                      하위 카테고리가 없습니다.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default HeaderCategoryMegaMenu;
