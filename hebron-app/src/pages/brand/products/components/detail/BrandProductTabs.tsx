import type { ProductItemRESP } from '@/data/products/products.response';
import type { ShoppingSetting } from '@/data/shopping-settings/shopping-settings.api';
import { useShoppingSettingsQuery } from '@/data/shopping-settings/shopping-settings.query';
import { cn } from '@/lib/utils';
import ProductDescription from '@/pages/ecommerce/product/components/detail/ProductDescription';
import { InfoIcon, QuestionIcon, TruckIcon } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type TabKey = 'info' | `setting-${number}`;

type BrandProductTabsProps = {
  product: ProductItemRESP;
  className?: string;
};

export const BrandProductTabs = ({ product, className }: BrandProductTabsProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tProduct } = useTranslation('product');
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const { data: shoppingSettings = [] } = useShoppingSettingsQuery();

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

  const getSettingIcon = (setting: ShoppingSetting) => {
    if (setting.type === 'Shipment & Delivery Information') return TruckIcon;
    if (setting.type === 'General Precautions') return InfoIcon;
    return QuestionIcon;
  };

  const visibleSettings = shoppingSettings;
  const activeShoppingSetting =
    activeTab === 'info' ? undefined : visibleSettings.find((setting) => `setting-${setting.id}` === activeTab);
  const tabs: Array<{ key: TabKey; label: string; icon: typeof InfoIcon }> = [
    { key: 'info', label: tCommon('title.product_info'), icon: InfoIcon },
    ...visibleSettings.map((setting) => ({
      key: `setting-${setting.id}` as TabKey,
      label: getSettingLabel(setting),
      icon: getSettingIcon(setting),
    })),
  ];

  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <div className='scrollbar-hide flex w-full items-center gap-1 overflow-x-auto rounded-full border border-neutral-800 bg-neutral-950 p-1'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition sm:text-sm md:flex-1 md:px-0',
                isActive ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200',
              )}>
              <Icon className='size-4 shrink-0' weight={isActive ? 'bold' : 'regular'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className='w-full'>
        {activeTab === 'info' && (
          <div className='text-neutral-300 [&_.product-description]:mx-auto'>
            <ProductDescription product={product} />
          </div>
        )}

        {activeShoppingSetting && (
          <div className='app-rich-text-editor__content cursor-default overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 text-sm leading-relaxed text-neutral-300'>
            <div
              className='tiptap'
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeShoppingSetting.content || '') }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProductTabs;
