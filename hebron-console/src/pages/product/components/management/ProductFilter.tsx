import FilterContainer from '@/components/FilterContainer';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { Input } from '@/components/ui/input';
import { useProductCategoryOptionsQuery } from '@/data/product/product.query';
import type { ProductListREQ } from '@/data/product/product.request';
import useDebounce from '@/hooks/useDebounce';
import { ProductAvailability, ProductStatus } from '@/utils/enums/product.enum';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filter: ProductListREQ;
  handleFilterChange: (patch: Partial<ProductListREQ>) => void;
};

const ProductFilter = ({ filter, handleFilterChange }: Props) => {
  const { t } = useTranslation('product');
  const [searchTerm, setSearchTerm] = useState(filter.search_term || '');
  const [productName, setProductName] = useState(filter.product_name || '');
  const [productCode, setProductCode] = useState(filter.product_code || '');

  const { data: categoryOptions } = useProductCategoryOptionsQuery();

  const statusOptions = useMemo(() => Object.values(ProductStatus).map((value) => ({ value, label: t(`status.${value}`) })), [t]);
  const availabilityOptions = useMemo(
    () => Object.values(ProductAvailability).map((value) => ({ value, label: t(`availability.${value}`) })),
    [t],
  );

  const handleTextFiltersChange = useCallback(
    (value: { searchTerm: string; productName: string; productCode: string }) =>
      handleFilterChange({
        search_term: value.searchTerm || undefined,
        product_name: value.productName || undefined,
        product_code: value.productCode || undefined,
      }),
    [handleFilterChange],
  );

  useDebounce({ searchTerm, productName, productCode }, handleTextFiltersChange);

  const handleReset = () => {
    setSearchTerm('');
    setProductName('');
    setProductCode('');
    handleFilterChange({
      search_term: undefined,
      product_name: undefined,
      product_code: undefined,
      category_id: undefined,
      status: undefined,
      availability: undefined,
    });
  };

  return (
    <FilterContainer onResetFilter={handleReset}>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <FormItem label={t('filter.search_term')}>
          <Input
            placeholder={t('filter.search_term_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormItem>
        <FormItem label={t('filter.product_name')}>
          <Input
            placeholder={t('filter.product_name_placeholder')}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </FormItem>
        <FormItem label={t('filter.product_code')}>
          <Input
            placeholder={t('filter.product_code_placeholder')}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
          />
        </FormItem>
        <FormItem label={t('filter.category')}>
          <AppSelect
            showSearch
            options={categoryOptions || []}
            value={filter.category_id}
            onChange={(v) => handleFilterChange({ category_id: v })}
            placeholder={t('filter.all')}
          />
        </FormItem>
        <FormItem label={t('filter.status')}>
          <AppSelect
            options={statusOptions}
            value={filter.status}
            onChange={(v) => handleFilterChange({ status: v })}
            placeholder={t('filter.all')}
          />
        </FormItem>
        <FormItem label={t('filter.availability')}>
          <AppSelect
            options={availabilityOptions}
            value={filter.availability}
            onChange={(v) => handleFilterChange({ availability: v })}
            placeholder={t('filter.all')}
          />
        </FormItem>
      </div>
    </FilterContainer>
  );
};

export default ProductFilter;
