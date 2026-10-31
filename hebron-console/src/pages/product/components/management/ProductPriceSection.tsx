import FormItem from '@/components/form/FormItem';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Textarea } from '@/components/ui/textarea';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { PRODUCT_PRICE_MAX_DIGITS } from '@/schemas/product/product.schema';
import { formatMoney } from '@/utils/helper/common.helper';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

type MoneyFieldProps = {
  control: Control<ProductUpsertInput>;
  name: keyof ProductUpsertInput;
  label: string;
  error?: string;
  placeholder?: string;
};

/** Displayed as dot-grouped text (780000 -> "780.000") with a ₩ suffix. */
const MoneyField = ({ control, name, label, error, placeholder }: MoneyFieldProps) => (
  <FormItem label={label} error={error} required>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <InputGroup>
          <InputGroupInput
            inputMode='numeric'
            placeholder={placeholder}
            value={formatMoney(field.value as number | undefined)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, PRODUCT_PRICE_MAX_DIGITS);
              field.onChange(digits === '' ? undefined : Number(digits));
            }}
          />
          <InputGroupAddon align='inline-end'>₩</InputGroupAddon>
        </InputGroup>
      )}
    />
  </FormItem>
);

const ProductPriceSection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_price')}</h3>
      <p className='text-muted-foreground text-xs'>{t('modal.price_relation_hint')}</p>
      <div className='grid grid-cols-2 gap-4'>
        <MoneyField
          control={control}
          name='selling_price'
          label={t('modal.field_selling_price')}
          error={errors.selling_price?.message}
          placeholder={t('modal.ph_amount')}
        />
        <MoneyField
          control={control}
          name='supply_price'
          label={t('modal.field_supply_price')}
          error={errors.supply_price?.message}
          placeholder={t('modal.ph_amount')}
        />
        <MoneyField
          control={control}
          name='shipping_fee'
          label={t('modal.field_shipping_fee')}
          error={errors.shipping_fee?.message}
          placeholder={t('modal.ph_amount')}
        />
      </div>
      <FormItem label={t('modal.field_price_content')} error={errors.price_content?.message}>
        <Controller
          control={control}
          name='price_content'
          render={({ field }) => (
            <Textarea {...field} value={field.value ?? ''} rows={3} placeholder={t('modal.ph_price_content')} />
          )}
        />
      </FormItem>
    </section>
  );
};

export default ProductPriceSection;
