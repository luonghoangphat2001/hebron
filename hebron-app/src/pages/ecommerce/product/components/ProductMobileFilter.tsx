import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { FunnelIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import ProductFilterPanel, { type PriceRangeOption } from './ProductFilterPanel';

type ProductMobileFilterProps = {
  categories: CategoryRESP[];
  selectedCategoryIds: number[];
  selectedPriceRangeValues: string[];
  customPriceFrom?: number;
  customPriceTo?: number;
  onCategoryCheckedChange: (categoryId: number, checked: boolean) => void;
  onPriceRangeChange: (priceRanges: PriceRangeOption[]) => void;
  onCustomPriceRangeApply: (priceFrom: string, priceTo: string) => void;
  onResetFilters: () => void;
};

const ProductMobileFilter = ({
  categories,
  selectedCategoryIds,
  selectedPriceRangeValues,
  customPriceFrom,
  customPriceTo,
  onCategoryCheckedChange,
  onPriceRangeChange,
  onCustomPriceRangeApply,
  onResetFilters,
}: ProductMobileFilterProps) => {
  const { t: tCommon } = useTranslation('common');

  return (
    <Sheet>
      <SheetTrigger asChild className='md:hidden'>
        <Button variant='outline'>
          <FunnelIcon className='size-5' />
          {tCommon('title.filter')}
        </Button>
      </SheetTrigger>
      <SheetContent
        className='w-71! max-w-[calc(100vw-48px)]! gap-0 overflow-hidden border-0! border-l-0! bg-white p-0 shadow-none'
        overlayClassName='bg-black/65 supports-backdrop-filter:backdrop-blur-none'
        showCloseButton={false}>
        <div className='h-full overflow-x-hidden overflow-y-auto overscroll-contain'>
          <ProductFilterPanel
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            selectedPriceRangeValues={selectedPriceRangeValues}
            customPriceFrom={customPriceFrom}
            customPriceTo={customPriceTo}
            onCategoryCheckedChange={onCategoryCheckedChange}
            onPriceRangeChange={onPriceRangeChange}
            onCustomPriceRangeApply={onCustomPriceRangeApply}
            onResetFilters={onResetFilters}
            className='w-full'
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductMobileFilter;
