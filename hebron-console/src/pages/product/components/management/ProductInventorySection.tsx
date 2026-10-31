import { BLOCKED_NUMBER_KEYS } from '@/utils/constants/common.constant';
import AppCheckBox from '@/components/checkbox/AppCheckBox';
import FormItem from '@/components/form/FormItem';
import { Input } from '@/components/ui/input';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

type NumberFieldProps = {
  control: Control<ProductUpsertInput>;
  name: keyof ProductUpsertInput;
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
};

/** type=number still accepts these as valid keystrokes — none of them are meaningful for a quantity. */

const NumberField = ({ control, name, label, error, required, placeholder }: NumberFieldProps) => (
  <FormItem label={label} error={error} required={required}>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          type='number'
          min={0}
          placeholder={placeholder}
          value={(field.value as number | undefined) ?? ''}
          onKeyDown={(e) => BLOCKED_NUMBER_KEYS.includes(e.key) && e.preventDefault()}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      )}
    />
  </FormItem>
);

const ProductInventorySection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_inventory')}</h3>
      <div className='grid grid-cols-2 gap-4'>
        <NumberField
          control={control}
          name='stock_quantity'
          label={t('modal.field_stock_quantity')}
          error={errors.stock_quantity?.message}
          placeholder={t('modal.ph_quantity')}
          required
        />
        <NumberField
          control={control}
          name='min_quantity'
          label={t('modal.field_min_quantity')}
          error={errors.min_quantity?.message}
          placeholder={t('modal.ph_quantity')}
          required
        />
        <div>
          <NumberField
            control={control}
            name='max_quantity'
            label={t('modal.field_max_quantity')}
            error={errors.max_quantity?.message}
            placeholder={t('modal.ph_quantity')}
            required
          />
          <p className='text-muted-foreground mt-1 text-xs'>{t('modal.max_quantity_hint')}</p>
        </div>
        {/*
        <NumberField
          control={control}
          name='sort_order'
          label={t('modal.field_sort_order')}
          error={errors.sort_order?.message}
          placeholder={t('modal.ph_quantity')}
        /> */}
      </div>
      <Controller
        control={control}
        name='stock_inventory_enabled'
        render={({ field }) => (
          <AppCheckBox
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('modal.stock_inventory_enabled')}
            description={t('modal.stock_inventory_enabled_hint')}
          />
        )}
      />
    </section>
  );
};

export default ProductInventorySection;
