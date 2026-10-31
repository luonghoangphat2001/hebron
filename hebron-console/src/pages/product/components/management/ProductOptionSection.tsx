import AppCheckBox from '@/components/checkbox/AppCheckBox';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import FormItem from '@/components/form/FormItem';
import AppMultiSelect from '@/components/select/AppMultiSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptionGroupInfiniteQuery } from '@/data/option-group/option-group.query';
import type { ProductOptionGroups } from '@/data/option-group/option-group.response';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { ExternalLink, Pencil, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
  existingGroups?: ProductOptionGroups[];
  hasUnsavedChanges?: boolean;
};

const ProductOptionSection = ({ control, errors, existingGroups, hasUnsavedChanges }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const [pendingEditUrl, setPendingEditUrl] = useState<string>();
  const optionGroupQuery = useOptionGroupInfiniteQuery(undefined, { refetchOnWindowFocus: true });
  const hasOption = useWatch({ control, name: 'has_option' });

  const optionGroupOptions = useMemo(
    () => (optionGroupQuery.data || []).map((group) => ({ value: Number(group.id), label: group.name })),
    [optionGroupQuery.data],
  );

  const groupById = useMemo(
    () => new Map([...(existingGroups || []), ...(optionGroupQuery.data || [])].map((group) => [Number(group.id), group])),
    [existingGroups, optionGroupQuery.data],
  );

  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-semibold'>{t('modal.section_option')}</h3>
      <Controller
        control={control}
        name='has_option'
        render={({ field }) => (
          <AppCheckBox checked={field.value} onCheckedChange={field.onChange} label={t('modal.has_option')} />
        )}
      />
      {hasOption && (
        <FormItem label={t('modal.field_option_groups')} error={errors.option_group_ids?.message}>
          <Controller
            control={control}
            name='option_group_ids'
            render={({ field }) => (
              <div className='space-y-3'>
                <AppMultiSelect
                  hideBadges
                  options={optionGroupOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('modal.ph_option_groups')}
                  onLoadMore={optionGroupQuery.fetchNextPage}
                  hasMore={optionGroupQuery.hasNextPage}
                  isLoadingMore={optionGroupQuery.isFetchingNextPage}
                />
                {!!field.value?.length && (
                  <ul className='divide-y rounded-lg border'>
                    {field.value.map((id) => {
                      const group = groupById.get(id);
                      const optionNames = (group?.options ?? []).map((option) => option.name).join(', ');

                      return (
                        <li key={id} className='flex items-center gap-2 py-2 pr-2 pl-3'>
                          <div className='min-w-0 flex-1 space-y-0.5'>
                            <div className='flex items-center gap-2'>
                              <span className='truncate text-sm font-medium'>{group?.name ?? `#${id}`}</span>
                              {group?.code && (
                                <span className='text-muted-foreground shrink-0 font-mono text-xs'>{group.code}</span>
                              )}
                              {group?.is_required && <Badge variant='outline'>{t('modal.option_group_required')}</Badge>}
                            </div>
                            {optionNames && (
                              <p className='text-muted-foreground truncate text-xs' title={optionNames}>
                                {t('modal.option_group_options', { count: group?.options.length })}: {optionNames}
                              </p>
                            )}
                          </div>
                          <Button asChild variant='ghost' size='sm' className='text-blue-600 hover:text-blue-700'>
                            <Link
                              to={MY_ROUTE.PRODUCT.OPTION_DETAIL(id)}
                              target='_blank'
                              rel='noreferrer'
                              title={t('modal.edit_option_group')}
                              onClick={(e) => {
                                if (!hasUnsavedChanges) return;
                                e.preventDefault();
                                setPendingEditUrl(MY_ROUTE.PRODUCT.OPTION_DETAIL(id));
                              }}>
                              <Pencil /> {tCommon('button.edit')}
                              <ExternalLink className='size-3 opacity-60' />
                            </Link>
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon-sm'
                            aria-label={t('modal.remove_option_group')}
                            title={t('modal.remove_option_group')}
                            onClick={() => field.onChange(field.value?.filter((v) => v !== id))}>
                            <X />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          />
        </FormItem>
      )}
      <ConfirmDialog
        open={!!pendingEditUrl}
        onOpenChange={(open) => !open && setPendingEditUrl(undefined)}
        title={t('unsaved_changes.title')}
        description={t('unsaved_changes.edit_option_group_description')}
        confirmLabel={t('unsaved_changes.open')}
        onConfirm={() => window.open(pendingEditUrl, '_blank', 'noreferrer')}
        closeOnConfirm
      />
    </section>
  );
};

export default ProductOptionSection;
