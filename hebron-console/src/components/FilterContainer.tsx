import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, Filter, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type FilterContainerProps = {
  children: ReactNode;
  onResetFilter: () => void;
};

const FilterContainer = ({ children, onResetFilter }: FilterContainerProps) => {
  const { t: tCommon } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className='w-full p-3'>
      <CardContent className='p-0'>
        <Collapsible className='rounded-md' open={isOpen} onOpenChange={setIsOpen}>
          <div className='flex justify-between px-2.5'>
            <div className='flex items-center gap-2'>
              <Filter className='size-4' />
              <span className='text-lg font-medium'>{tCommon('filter.title')}</span>
              <Button
                size='xs'
                variant='outline'
                className='ml-2'
                onClick={(e) => {
                  e.stopPropagation();
                  onResetFilter();
                }}>
                <RotateCcw /> {tCommon('filter.reset')}
              </Button>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant='outline' className='group w-fit text-base aria-expanded:bg-white'>
                <ChevronDownIcon className='ml-auto group-data-[state=open]:rotate-180' />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className='mt-4 px-2.5'>{children}</CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FilterContainer;
