import AppSelect from '@/components/select/AppSelect';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import type { ProductItemRESP } from '@/data/products/products.response';
import { cn } from '@/lib/utils';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import { formatPrice } from '@/utils/helper/common.helper';
import { downloadByUrl } from '@/utils/helper/file.helper';
import { getLocalizedName } from '@/utils/helper/product-picker.helper';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type BrandProductRightProps = {
  product: ProductItemRESP;
  className?: string;
};

const getSelectedOptionsFromParams = (product: ProductItemRESP, optionsParam: string) => {
  const optionIds = optionsParam
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Number.isFinite);

  return Object.fromEntries(
    (product.option_groups ?? []).flatMap((group) => {
      const option = group.options.find((item) => optionIds.includes(item.id));
      return option ? [[group.id, option.id]] : [];
    }),
  ) as Record<number, number | undefined>;
};

export const BrandProductRight = ({ product, className }: BrandProductRightProps) => {
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const optionsParam = searchParams.get('options')?.trim() || '';

  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | undefined>>(() =>
    getSelectedOptionsFromParams(product, optionsParam),
  );
  const [isDownloadingAi, setIsDownloadingAi] = useState(false);

  const title = getLocalizedName(product.name);
  const categoryNames = product.categories
    .map((category) => getLocalizedName(category.name))
    .filter(Boolean)
    .join(', ');

  const optionGroups = product.option_groups ?? [];
  const aiFile = product.file_ai?.[0];

  useEffect(() => {
    setSelectedOptions(getSelectedOptionsFromParams(product, optionsParam));
  }, [optionsParam, product]);

  const handleOptionChange = (groupId: number, value?: number) => {
    const nextOptions = { ...selectedOptions, [groupId]: value };
    setSelectedOptions(nextOptions);

    const nextSearchParams = new URLSearchParams(searchParams);
    const optionValues = Object.values(nextOptions).filter((v): v is number => Boolean(v));
    if (optionValues.length) {
      nextSearchParams.set('options', optionValues.join(','));
    } else {
      nextSearchParams.delete('options');
    }
    setSearchParams(nextSearchParams, { replace: true });
  };

  const priceContent = product.price_content?.trim();
  const displayPrice = priceContent || formatPrice(product.supply_price ?? 0);
  const shouldShowPrice = (product.supply_price ?? 0) > 0;

  const productInfoItems = [
    { label: tCommon('title.size'), value: product.specification?.size || '-' },
    { label: tCommon('title.material'), value: product.specification?.materials || '-' },
    { label: tCommon('title.case'), value: product.specification?.case || '-' },
    { label: tCommon('title.stock_quantity'), value: `${product.stock_quantity || 0}개` },
    {
      label: tCommon('title.shipping_information'),
      value: product.specification?.product_period || product.specification?.shipping_info || '제작기간 5~7일 / 상담 후 확정',
    },
  ];

  const handleAiDownload = async () => {
    if (isDownloadingAi) return;
    if (!aiFile) {
      appToast.warning('AI 파일이 설정되지 않았습니다.');
      return;
    }

    setIsDownloadingAi(true);
    try {
      await downloadByUrl({ name: aiFile.name, url: aiFile.url });
    } finally {
      setIsDownloadingAi(false);
    }
  };

  const handleInquiry = () => {
    navigate(`${BRAND_ROUTE.PRODUCT_INQUIRY}?product_id=${product.id}&product_slug=${encodeURIComponent(product.slug)}`);
  };

  return (
    <div className={cn('flex flex-1 flex-col gap-6 text-white', className)}>
      {/* Product name and categories follow the Mall product-detail hierarchy. */}
      <div className='flex flex-col gap-1.5'>
        <h2 className='text-2xl font-bold text-white md:text-3xl'>{title}</h2>
        {categoryNames && <p className='text-sm text-neutral-400'>{categoryNames}</p>}
      </div>

      {/* Price */}
      {shouldShowPrice && <div className='text-3xl font-bold text-[#eef2f9] md:text-4xl'>{displayPrice}</div>}

      {/* Specifications Table */}
      <div className='flex flex-col gap-3.5 py-2'>
        {productInfoItems.map((item) => (
          <div key={item.label} className='flex items-center justify-between gap-4 text-sm md:justify-start md:gap-10'>
            <span className='font-medium text-neutral-400 md:w-24 md:shrink-0'>{item.label}</span>
            <span className='text-right font-bold text-neutral-50 md:text-left'>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className='h-px w-full bg-neutral-800' />

      {/* Option Groups using AppSelect with dark variant */}
      {optionGroups.length > 0 && (
        <div className='flex flex-col gap-4'>
          {optionGroups.map((group) => (
            <AppSelect
              key={group.id}
              variant='dark'
              label={group.name}
              required={group.is_required}
              labelPlacement='responsive'
              value={selectedOptions[group.id]}
              placeholder={tCommon('placeholder.please_select_option')}
              options={group.options.map((option) => ({
                value: option.id,
                label: `${option.name}${option.additional_brand_site_price === 0 ? '' : ` (+${formatPrice(option.additional_brand_site_price)})`}`,
              }))}
              onChange={(value) => handleOptionChange(group.id, value)}
              containerClassName='gap-2 md:gap-10 md:items-center'
              labelClassName='text-neutral-400 font-medium md:w-24'
              className='h-10 border-neutral-800 bg-neutral-900 text-neutral-50'
            />
          ))}
        </div>
      )}
      {optionGroups.length > 0 && <div className='h-px w-full bg-neutral-800' />}

      {/* Action Buttons */}
      <div className='flex flex-row gap-2 pt-2 sm:gap-3.5'>
        <Button
          type='button'
          variant='outline'
          size='lg'
          onClick={() => void handleAiDownload()}
          disabled={isDownloadingAi}
          loading={isDownloadingAi}
          className='h-12 flex-1 cursor-pointer rounded-[360px] border-neutral-700 bg-white px-2 font-semibold text-neutral-500 transition hover:bg-white/90 sm:px-4'>
          <DownloadSimpleIcon className='size-4.5' weight='bold' />
          <span className='truncate text-sm sm:text-base'>AI 파일 다운로드</span>
        </Button>

        <Button
          type='button'
          size='lg'
          onClick={handleInquiry}
          className='h-12 flex-1 cursor-pointer rounded-[360px] px-2 font-semibold text-white transition sm:px-4'>
          <span className='truncate text-sm sm:text-base'>문의하기</span>
        </Button>
      </div>
    </div>
  );
};

export default BrandProductRight;
