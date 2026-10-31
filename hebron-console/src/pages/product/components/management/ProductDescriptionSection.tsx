import FormItem from '@/components/form/FormItem';
import { EverawardDescriptionEditor } from '@/components/shared/everaward-description-editor';
import { useEffect, useState } from 'react';
import { AppRichTextEditor } from '@/components/shared/app-rich-text-editor';
import type { ProductUpsertInput } from '@/schemas/product/product.schema';
import { FileType } from '@/utils/enums/file.enum';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type Props = {
  control: Control<ProductUpsertInput>;
  errors: FieldErrors<ProductUpsertInput>;
  readOnly?: boolean;
  initialDescription?: string;
  onImageUploadingChange: (uploading: boolean) => void;
  onValidationChange: (error: string | null) => void;
  onFlushReady: (flush: () => string | null) => void;
};

const ProductDescriptionSection = ({
  control,
  errors,
  readOnly,
  initialDescription,
  onImageUploadingChange,
  onValidationChange,
  onFlushReady,
}: Props) => {
  // Decide once from the loaded product, never from the editable draft.
  const [usesEveraward, setUsesEveraward] = useState<boolean | null>(() =>
    initialDescription === undefined
      ? null
      : new DOMParser().parseFromString(initialDescription, 'text/html').querySelector('.view_design_wrap') !== null,
  );
  if (usesEveraward === null && initialDescription !== undefined) {
    setUsesEveraward(
      new DOMParser().parseFromString(initialDescription, 'text/html').querySelector('.view_design_wrap') !== null,
    );
  }
  const { t } = useTranslation('product');

  useEffect(
    () => () => {
      onFlushReady(() => null);
      onValidationChange(null);
      onImageUploadingChange(false);
    },
    [onFlushReady, onValidationChange, onImageUploadingChange],
  );

  return (
    <section className='space-y-4'>
      <FormItem label={t('modal.field_description')} error={errors.description?.message}>
        <Controller
          control={control}
          name='description'
          render={({ field }) =>
            usesEveraward === null ? (
              <></>
            ) : usesEveraward ? (
              <EverawardDescriptionEditor
                value={field.value ?? ''}
                onValueChange={field.onChange}
                onImageUploadingChange={onImageUploadingChange}
                onValidationChange={onValidationChange}
                onFlushReady={onFlushReady}
                readOnly={readOnly}
              />
            ) : (
              <AppRichTextEditor
                value={field.value ?? ''}
                onValueChange={field.onChange}
                placeholder={t('modal.ph_description')}
                minHeight={240}
                imageUploadMode='immediate'
                imageFileType={FileType.PRODUCT_IMAGES}
                onImageUploadingChange={onImageUploadingChange}
                readOnly={readOnly}
              />
            )
          }
        />
      </FormItem>
    </section>
  );
};

export default ProductDescriptionSection;
