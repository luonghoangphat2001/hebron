import FormItem from '@/components/form/FormItem';
import AppMultiSelect from '@/components/select/AppMultiSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { useCategoryInfiniteQuery } from '@/data/category/category.query';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { ProductVisibleRole } from '@/utils/enums/product.enum';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
};

const ToggleField = ({
  control,
  name,
  label,
}: {
  control: Control<ProductUpsertInput>;
  name: 'is_active' | 'is_popular' | 'is_featured' | 'is_top_product';
  label: string;
}) => {
  const id = `toggle-${name}`;

  return (
    <div className='flex items-center gap-2'>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <Switch id={id} checked={field.value} onCheckedChange={field.onChange} />}
      />
      <FieldLabel htmlFor={id} className='cursor-pointer'>
        {label}
      </FieldLabel>
    </div>
  );
};

const VISIBLE_ROLES = [ProductVisibleRole.ALL, ProductVisibleRole.MEMBER, ProductVisibleRole.MANAGER];

/** MEMBER + MANAGER is stored/sent as just [ALL]; the UI expands it back so all three boxes stay ticked. */
const expandRoles = (value: ProductVisibleRole[]) =>
  value.includes(ProductVisibleRole.ALL) ? [ProductVisibleRole.MEMBER, ProductVisibleRole.MANAGER] : value;

const isRoleChecked = (value: ProductVisibleRole[], role: ProductVisibleRole) => {
  const roles = expandRoles(value);
  return role === ProductVisibleRole.ALL
    ? roles.includes(ProductVisibleRole.MEMBER) && roles.includes(ProductVisibleRole.MANAGER)
    : roles.includes(role);
};

const toggleRole = (value: ProductVisibleRole[], role: ProductVisibleRole, checked: boolean): ProductVisibleRole[] => {
  if (role === ProductVisibleRole.ALL) return checked ? [ProductVisibleRole.ALL] : [];

  const roles = new Set(expandRoles(value));
  if (checked) roles.add(role);
  else roles.delete(role);

  return roles.has(ProductVisibleRole.MEMBER) && roles.has(ProductVisibleRole.MANAGER) ? [ProductVisibleRole.ALL] : [...roles];
};

const ProductStatusSection = ({ control, errors }: Props) => {
  const { t } = useTranslation('product');
  const categoryQuery = useCategoryInfiniteQuery();

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_status')}</h3>
      <div className='grid grid-cols-2 gap-4'>
        <ToggleField control={control} name='is_active' label={t('modal.is_active')} />
        <ToggleField control={control} name='is_popular' label={t('modal.is_popular')} />
        <ToggleField control={control} name='is_featured' label={t('modal.is_featured')} />
        <ToggleField control={control} name='is_top_product' label={t('modal.is_top_product')} />
      </div>
      <FormItem label={t('modal.field_categories')} required error={errors.category_ids?.message}>
        <Controller
          control={control}
          name='category_ids'
          render={({ field }) => (
            <AppMultiSelect
              options={categoryQuery.data || []}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('modal.ph_categories')}
              onLoadMore={categoryQuery.fetchNextPage}
              hasMore={categoryQuery.hasNextPage}
              isLoadingMore={categoryQuery.isFetchingNextPage}
            />
          )}
        />
      </FormItem>
      <FormItem label={t('modal.field_visible_roles')} error={errors.visible_roles?.message}>
        <Controller
          control={control}
          name='visible_roles'
          render={({ field }) => (
            <div className='flex flex-wrap items-center gap-4'>
              {VISIBLE_ROLES.map((role) => (
                <label key={role} className='flex cursor-pointer items-center gap-2 text-sm'>
                  <Checkbox
                    checked={isRoleChecked(field.value ?? [], role)}
                    onCheckedChange={(checked) => field.onChange(toggleRole(field.value ?? [], role, checked === true))}
                  />
                  {t(`modal.visible_role.${role}`)}
                </label>
              ))}
            </div>
          )}
        />
      </FormItem>
    </section>
  );
};

export default ProductStatusSection;
