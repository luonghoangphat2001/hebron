import type { ShoppingSetting } from '@/data/shopping-settings/shopping-settings.api';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type ProductTabKey = 'info' | `setting-${number}`;

type ProductTabsProps = {
  activeTab: ProductTabKey;
  onTabChange: (tab: ProductTabKey) => void;
  settings: ShoppingSetting[];
  className?: string;
};

const ProductTabs = ({ activeTab, onTabChange, settings, className }: ProductTabsProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tProduct } = useTranslation('product');
  const getSettingLabel = (setting: ShoppingSetting) => {
    switch (setting.type) {
      case 'General Precautions':
        return tProduct('shopping_setting.precaution');
      case 'General Production Guide':
        return tProduct('shopping_setting.production_guide');
      case 'Shipment & Delivery Information':
        return tProduct('shopping_setting.shipping');
      case 'User Guide':
        return tProduct('shopping_setting.usage_guide');
      default:
        return setting.title || setting.type;
    }
  };
  const productTabs: Array<{ key: ProductTabKey; label: string }> = [
    { key: 'info', label: tCommon('title.product_info') },
    ...settings.map((setting) => ({
      key: `setting-${setting.id}` as const,
      label: getSettingLabel(setting),
    })),
  ];

  return (
    <div className={cn('border-b border-neutral-200 bg-white', className)}>
      <div className='scrollbar-hide -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0'>
        <div className='flex w-max lg:w-full' role='tablist' aria-label='Product information tabs'>
          {productTabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  'text-md flex h-14 shrink-0 cursor-pointer items-center justify-center border-b-2 px-8 whitespace-nowrap transition-all lg:min-w-0 lg:flex-1',
                  isActive
                    ? 'border-brand text-brand -mb-px font-bold'
                    : 'border-transparent font-normal text-neutral-500 hover:text-neutral-700',
                )}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
