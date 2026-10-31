import FormItem from '@/components/form/FormItem';
import { Input } from '@/components/ui/input';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

const ProductSpecificationSection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');

  const specField = (key: keyof NonNullable<ProductUpsertInput['specification']>, label: string, placeholder: string) => (
    <FormItem key={key} label={label} error={errors.specification?.[key]?.message}>
      <Controller
        control={control}
        name={`specification.${key}`}
        render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder={placeholder} />}
      />
    </FormItem>
  );

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_specification')}</h3>
      <div className='grid grid-cols-1 gap-4'>
        {specField('size', t('modal.field_size'), t('modal.ph_size'))}
        {specField('materials', t('modal.field_materials'), t('modal.ph_materials'))}
        {specField('case', t('modal.field_case'), t('modal.ph_case'))}
        {specField('product_period', t('modal.field_product_period'), t('modal.ph_product_period'))}
        {specField('total_product_amount', t('modal.field_total_product_amount'), t('modal.ph_total_product_amount'))}
        {specField('shipping_info', t('modal.field_shipping_info'), t('modal.ph_shipping_info'))}
        {specField('weight', t('modal.field_weight'), t('modal.ph_weight'))}
        {specField('notes', t('modal.field_notes'), t('modal.ph_notes'))}
      </div>
    </section>
  );
};

export default ProductSpecificationSection;
