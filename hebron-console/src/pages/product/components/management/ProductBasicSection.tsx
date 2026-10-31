import FormItem from '@/components/form/FormItem';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

const ProductBasicSection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_basic')}</h3>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormItem label={t('modal.field_name')} required error={errors.name?.message}>
          <Controller
            control={control}
            name='name'
            render={({ field }) => <Input {...field} placeholder={t('modal.name_placeholder')} />}
          />
        </FormItem>
        <FormItem label={t('modal.field_name_en')} error={errors.name_en?.message}>
          <Controller
            control={control}
            name='name_en'
            render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder={t('modal.ph_name_en')} />}
          />
        </FormItem>
        <FormItem label={t('modal.field_sku')} required error={errors.sku?.message}>
          <Controller
            control={control}
            name='sku'
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('modal.sku_placeholder')}
                className='font-mono'
                onChange={(e) => field.onChange(e.target.value.replace(/\s/g, '_'))}
              />
            )}
          />
        </FormItem>
        <FormItem label={t('modal.field_slug')} error={errors.slug?.message}>
          <Controller
            control={control}
            name='slug'
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('modal.slug_placeholder')}
                onChange={(e) => field.onChange(e.target.value.replace(/\s/g, '_').toLowerCase())}
              />
            )}
          />
        </FormItem>
        <div className='md:col-span-2'>
          <FormItem label={t('modal.field_short_description')} error={errors.short_description?.message}>
            <Controller
              control={control}
              name='short_description'
              render={({ field }) => (
                <Textarea {...field} value={field.value ?? ''} rows={2} placeholder={t('modal.ph_short_description')} />
              )}
            />
          </FormItem>
        </div>
      </div>
    </section>
  );
};

export default ProductBasicSection;
