import { AppCheckbox } from '@/components/checkbox/AppCheckbox';
import { AppInput } from '@/components/input/AppInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { CategoryRESP } from '@/data/categories/categories.response';
import { cn } from '@/lib/utils';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { ArrowsClockwiseIcon, CaretUpIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PriceRangeOption = {
  value: string;
  label: string;
  from?: number;
  to?: number;
};

type FilterGroup = {
  title: string;
  value: string;
  items: { id?: number; label: string; productsCount?: number; priceRange?: Omit<PriceRangeOption, 'label'> }[];
};

const priceRangeFilterGroup: FilterGroup = {
  title: '가격대',
  value: 'price-range',
  items: [
    { label: '~5만원', priceRange: { value: 'under-50000', to: 50_000 } },
    { label: '5만~10만원', priceRange: { value: '50000-100000', from: 50_000, to: 100_000 } },
    { label: '10만~20만원', priceRange: { value: '100000-200000', from: 100_000, to: 200_000 } },
    { label: '20만~50만원', priceRange: { value: '200000-500000', from: 200_000, to: 500_000 } },
    { label: '50만원~', priceRange: { value: 'over-500000', from: 500_000 } },
  ],
};

type ProductFilterPanelProps = {
  categories: CategoryRESP[];
  selectedCategoryIds: number[];
  selectedPriceRangeValues: string[];
  customPriceFrom?: number;
  customPriceTo?: number;
  onCategoryCheckedChange: (categoryId: number, checked: boolean) => void;
  onPriceRangeChange: (priceRanges: PriceRangeOption[]) => void;
  onCustomPriceRangeApply: (priceFrom: string, priceTo: string) => void;
  onResetFilters: () => void;
  className?: string;
};

type PriceRangeInputsProps = {
  initialPriceFrom?: number;
  initialPriceTo?: number;
  minimumPlaceholder: string;
  maximumPlaceholder: string;
  applyLabel: string;
  onApply: (priceFrom: string, priceTo: string) => void;
};

const PriceRangeInputs = ({
  initialPriceFrom,
  initialPriceTo,
  minimumPlaceholder,
  maximumPlaceholder,
  applyLabel,
  onApply,
}: PriceRangeInputsProps) => {
  const [priceFrom, setPriceFrom] = useState(initialPriceFrom?.toString() ?? '');
  const [priceTo, setPriceTo] = useState(initialPriceTo?.toString() ?? '');

  return (
    <div className='flex items-center gap-1'>
      <AppInput
        containerClassName='min-w-0'
        placeholder={minimumPlaceholder}
        inputMode='numeric'
        min={0}
        type='number'
        value={priceFrom}
        onChange={(event) => setPriceFrom(event.target.value)}
      />
      <span className='text-sm text-neutral-500'>~</span>
      <AppInput
        containerClassName='min-w-0'
        placeholder={maximumPlaceholder}
        inputMode='numeric'
        min={0}
        type='number'
        value={priceTo}
        onChange={(event) => setPriceTo(event.target.value)}
      />
      <Button variant='outline' className='w-14.25' onClick={() => onApply(priceFrom, priceTo)}>
        {applyLabel}
      </Button>
    </div>
  );
};

const ProductFilterPanel = ({
  categories,
  selectedCategoryIds,
  selectedPriceRangeValues,
  customPriceFrom,
  customPriceTo,
  onCategoryCheckedChange,
  onPriceRangeChange,
  onCustomPriceRangeApply,
  onResetFilters,
  className,
}: ProductFilterPanelProps) => {
  const { t: tCommon } = useTranslation('common');
  const [priceInputResetKey, setPriceInputResetKey] = useState(0);
  const filterGroups: FilterGroup[] = [
    ...categories
      .filter((category) => Boolean(category.has_children ?? (category.children && category.children.length > 0)))
      .map((category) => ({
        title: getLocalizedName(category.name),
        value: category.slug,
        items: category.children.map((child) => ({
          id: child.id,
          label: getLocalizedName(child.name),
          productsCount: child.products_count,
        })),
      })),
    priceRangeFilterGroup,
  ];

  return (
    <section className={cn('w-71 px-4 md:w-60 lg:w-65 xl:w-71', className)}>
      <div className='flex items-center justify-between py-3'>
        <h2 className='text-lg font-medium'>{tCommon('title.filter')}</h2>
        <Button
          size='xs'
          variant='outline'
          onClick={() => {
            setPriceInputResetKey((currentKey) => currentKey + 1);
            onResetFilters();
          }}>
          <ArrowsClockwiseIcon size={20} /> {tCommon('button.full_unlock')}
        </Button>
      </div>
      <div className='mt-3 mb-4 h-px bg-neutral-200'></div>
      <div className='space-y-4'>
        <Accordion
          key={filterGroups.map((item) => item.value).join('|')}
          type='multiple'
          defaultValue={filterGroups.map((item) => item.value)}
          className='gap-4'>
          {filterGroups.map((item) => (
            <AccordionItem className='border-neutral-200' key={item.value} value={item.value}>
              <AccordionTrigger className='cursor-pointer px-2 py-3 hover:no-underline *:data-[slot=accordion-trigger-icon]:hidden'>
                <span className='text-md font-semibold'>{item.title}</span>
                <CaretUpIcon
                  weight='bold'
                  className='ml-auto size-5 shrink-0 rotate-180 text-neutral-950 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-0'
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-3'>
                  {item.items.map((option) => (
                    <div key={option.id ?? option.label} className='flex items-center justify-between px-2 py-1.5'>
                      <AppCheckbox
                        label={option.label}
                        size='lg'
                        labelClassName='text-md'
                        checked={
                          option.id != null
                            ? selectedCategoryIds.includes(option.id)
                            : option.priceRange
                              ? selectedPriceRangeValues.includes(option.priceRange.value)
                              : undefined
                        }
                        onCheckedChange={(checked) => {
                          if (option.id != null) onCategoryCheckedChange(option.id, checked === true);
                          if (option.priceRange) {
                            const nextSelectedValues =
                              checked === true
                                ? [...new Set([...selectedPriceRangeValues, option.priceRange.value])]
                                : selectedPriceRangeValues.filter((value) => value !== option.priceRange?.value);

                            onPriceRangeChange(
                              priceRangeFilterGroup.items.flatMap(({ label, priceRange }) =>
                                priceRange && nextSelectedValues.includes(priceRange.value) ? [{ ...priceRange, label }] : [],
                              ),
                            );
                          }
                        }}
                      />
                      {option.productsCount != null && <span className='text-sm text-neutral-500'>({option.productsCount})</span>}
                    </div>
                  ))}
                  {item.value === 'price-range' && (
                    <PriceRangeInputs
                      key={`${customPriceFrom ?? ''}-${customPriceTo ?? ''}-${selectedPriceRangeValues.join('|')}-${priceInputResetKey}`}
                      initialPriceFrom={customPriceFrom}
                      initialPriceTo={customPriceTo}
                      minimumPlaceholder={tCommon('title.minimum')}
                      maximumPlaceholder={tCommon('title.maximum')}
                      applyLabel={tCommon('button.apply')}
                      onApply={onCustomPriceRangeApply}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default ProductFilterPanel;
