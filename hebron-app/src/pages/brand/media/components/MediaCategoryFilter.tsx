import { CareUp } from '@/assets/images';
import { AppAccordion } from '@/components/accordion/AppAccordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export type MediaCategoryOption = {
  id?: number;
  value: string;
  label: string;
  count?: number;
};

type MediaCategoryFilterProps = {
  options: MediaCategoryOption[];
  selectedCategoryId?: number;
  onSelectCategory: (categoryId?: number) => void;
};

const MediaCategoryFilter = ({ options, selectedCategoryId, onSelectCategory }: MediaCategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (options.length === 0) return null;

  const currentValue = selectedCategoryId !== undefined ? String(selectedCategoryId) : 'all';

  return (
    <div className='flex flex-col gap-3'>
      <AppAccordion
        open={isOpen}
        onOpenChange={setIsOpen}
        className='overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900'>
        <AppAccordion.Trigger className='justify-between px-4 py-3'>
          <span className='text-md font-semibold text-white'>Categories</span>
          <img
            src={CareUp}
            alt=''
            aria-hidden
            className={cn('size-3.5 shrink-0 transition-transform duration-200', !isOpen && 'rotate-180')}
          />
        </AppAccordion.Trigger>

        <AppAccordion.Content className='border-t border-neutral-800 px-4 pt-3 pb-4'>
          <RadioGroup
            value={currentValue}
            onValueChange={(val) => onSelectCategory(val === 'all' ? undefined : Number(val))}
            className='flex flex-col gap-3'>
            <label
              htmlFor='cat-all'
              onClick={() => onSelectCategory(undefined)}
              className='flex cursor-pointer items-center justify-between gap-3'>
              <span className='flex min-w-0 items-center gap-3'>
                <RadioGroupItem value='all' id='cat-all' className='border-neutral-600 bg-neutral-950' />
                <span className='text-md text-white'>전체</span>
              </span>
            </label>

            {options.map((option) => {
              const optionId = option.id ?? Number(option.value);
              const valStr = String(optionId);

              return (
                <label
                  key={optionId}
                  htmlFor={`cat-${optionId}`}
                  onClick={() => onSelectCategory(optionId)}
                  className='flex cursor-pointer items-center justify-between gap-3'>
                  <span className='flex min-w-0 items-center gap-3'>
                    <RadioGroupItem value={valStr} id={`cat-${optionId}`} className='border-neutral-600 bg-neutral-950' />
                    <span className='text-md text-white'>{option.label}</span>
                  </span>
                  {option.count != null && <span className='shrink-0 text-sm text-neutral-500'>({option.count})</span>}
                </label>
              );
            })}
          </RadioGroup>
        </AppAccordion.Content>
      </AppAccordion>
    </div>
  );
};

export default MediaCategoryFilter;
