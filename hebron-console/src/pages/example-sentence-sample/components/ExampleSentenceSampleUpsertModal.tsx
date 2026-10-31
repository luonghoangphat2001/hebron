import AppDialog from '@/components/dialog/AppDialog';
import FormItem from '@/components/form/FormItem';
import AppSelect from '@/components/select/AppSelect';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import { appToast } from '@/components/toast/AppToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  useExampleSentenceSampleCategoryInfiniteQuery,
  useExampleSentenceSampleCreateMutation,
  useExampleSentenceSampleDetailQuery,
  useExampleSentenceSampleUpdateMutation,
} from '@/data/example-sentence-sample/example-sentence-sample.query';
import {
  transformExampleSentenceSampleInputToUpsertREQ,
  transformExampleSentenceSampleRESPToInput,
} from '@/data/example-sentence-sample/example-sentence-sample.service';
import useDebounce from '@/hooks/useDebounce';
import {
  exampleSentenceSampleInputDefault,
  exampleSentenceSampleUpsertSchema,
  type ExampleSentenceSampleInput,
} from '@/schemas/example-sentence-sample/example-sentence-sample.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export type ExampleSentenceSampleUpsertMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  sampleId: number | null;
  mode: ExampleSentenceSampleUpsertMode;
};

const ExampleSentenceSampleUpsertModal = ({ open, setOpen, sampleId, mode }: Props) => {
  const { t: tContent } = useTranslation('content');
  const { t: tCommon } = useTranslation('common');
  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';
  const [categoryKeyword, setCategoryKeyword] = useState('');
  const [debouncedCategoryKeyword, setDebouncedCategoryKeyword] = useState('');
  const handleCategorySearch = useCallback((value: string) => setDebouncedCategoryKeyword(value.trim()), []);
  useDebounce(categoryKeyword, handleCategorySearch);
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isFetching: isCategoryFetching,
    hasNextPage: hasMoreCategories,
    fetchNextPage: fetchNextCategoryPage,
    isFetchingNextPage: isFetchingMoreCategories,
  } = useExampleSentenceSampleCategoryInfiniteQuery({
    keyword: debouncedCategoryKeyword || undefined,
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExampleSentenceSampleInput>({
    mode: 'all',
    defaultValues: exampleSentenceSampleInputDefault,
    resolver: zodResolver(exampleSentenceSampleUpsertSchema) as Resolver<ExampleSentenceSampleInput>,
  });
  const { data: detail, isLoading: isDetailLoading } = useExampleSentenceSampleDetailQuery(
    open && sampleId ? sampleId : undefined,
  );
  const { mutate: create, isPending: isCreating } = useExampleSentenceSampleCreateMutation();
  const { mutate: update, isPending: isUpdating } = useExampleSentenceSampleUpdateMutation();

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const categoryOptions = useMemo(() => {
    const options = (categoryData?.categories || []).map((category) => ({ value: category.id, label: category.name }));
    if (detail?.category && !options.some((option) => option.value === detail.category.id)) {
      options.unshift({ value: detail.category.id, label: detail.category.name });
    }
    return options;
  }, [categoryData?.categories, detail?.category]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoryKeyword('');
    setDebouncedCategoryKeyword('');
    if (sampleId && detail) {
      reset(transformExampleSentenceSampleRESPToInput(detail));
    } else if (mode === 'create') {
      reset(exampleSentenceSampleInputDefault);
    }
  }, [detail, mode, open, reset, sampleId]);

  const onCreate = (input: ExampleSentenceSampleInput) => {
    create(transformExampleSentenceSampleInputToUpsertREQ(input), {
      onSuccess: () => {
        setOpen(false);
        appToast.success(tCommon('notify.success_create'));
      },
      onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_create')),
    });
  };

  const onUpdate = (input: ExampleSentenceSampleInput) => {
    if (!sampleId || !isDirty) return;
    update(
      { id: sampleId, ...transformExampleSentenceSampleInputToUpsertREQ(input) },
      {
        onSuccess: () => {
          setOpen(false);
          appToast.success(tCommon('notify.success_update'));
        },
        onError: (error) => appToast.error(error.response?.data.message || tCommon('notify.fail_update')),
      },
    );
  };

  const title =
    mode === 'create'
      ? tContent('sample.modal_create')
      : mode === 'edit'
        ? tContent('sample.modal_edit')
        : tContent('sample.modal_detail');

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      onOk={isReadonly ? undefined : handleSubmit(isEdit ? onUpdate : onCreate)}
      okDisabled={isEdit && !isDirty}
      loading={isCreating || isUpdating}
      contentLoading={!!sampleId && isDetailLoading}
      textCancel={isReadonly ? tCommon('button.close') : undefined}
      className='sm:max-w-4xl'>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <FormItem label={tContent('sample.field_title')} required={!isReadonly} error={errors.title?.message}>
            <Controller
              control={control}
              name='title'
              render={({ field }) => <Input {...field} disabled={isReadonly} placeholder={tContent('sample.ph_title')} />}
            />
          </FormItem>
          <FormItem label={tContent('sample.field_category')} required={!isReadonly} error={errors.category_id?.message}>
            <Controller
              control={control}
              name='category_id'
              render={({ field }) => (
                <AppSelect
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={tContent('filter.ph_select_category')}
                  disabled={isReadonly}
                  showSearch
                  onSearch={setCategoryKeyword}
                  onLoadMore={() => fetchNextCategoryPage()}
                  hasMore={hasMoreCategories}
                  isLoading={isCategoryLoading || (isCategoryFetching && !isFetchingMoreCategories)}
                  isLoadingMore={isFetchingMoreCategories}
                />
              )}
            />
          </FormItem>
        </div>
        <div className='flex gap-6'>
          <Controller
            control={control}
            name='is_active'
            render={({ field }) => (
              <label className='flex items-center gap-2 text-sm'>
                <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(!!value)} disabled={isReadonly} />
                {tContent('sample.field_active')}
              </label>
            )}
          />
          {/* Featured is omitted from the create/update payload; the backend defaults it to false.
          <Controller
            control={control}
            name='is_featured'
            render={({ field }) => (
              <label className='flex items-center gap-2 text-sm'>
                <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(!!value)} disabled={isReadonly} />
                {tContent('sample.field_featured')}
              </label>
            )}
          /> */}
        </div>
        <FormItem label={tContent('sample.field_content')} required={!isReadonly} error={errors.content?.message}>
          <Controller
            control={control}
            name='content'
            render={({ field }) => (
              <AppRichTextEditor
                value={field.value}
                onValueChange={field.onChange}
                placeholder={tContent('sample.ph_content')}
                minHeight={220}
                disabled={isReadonly}
                isInvalid={!!errors.content}
              />
            )}
          />
        </FormItem>
      </div>
    </AppDialog>
  );
};

export default ExampleSentenceSampleUpsertModal;
