import Can from '@/components/Can';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';
import PageTitle from '@/components/PageTitle';
import { appToast } from '@/components/toast/AppToast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { urlToAttachmentValue } from '@/data/banner/banner.service';
import { useProductCreateMutation, useProductUpdateMutation } from '@/data/product/product.query';
import type { ProductCreateREQ } from '@/data/product/product.request';
import type { Product } from '@/data/product/product.response';
import { normalizeProductDescriptionImages } from '@/data/product/product-description.helper';
import {
  buildProductUpdateREQ,
  resolveProductAiFile,
  resolveProductImages,
  transformProductRESPToInput,
  productAiFileToAttachment,
} from '@/data/product/product.service';
import { productUpsertInputDefault, productUpsertSchema, type ProductUpsertInput } from '@/schemas/product/product.schema';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { isAuthenticated } from '@/utils/helper/local-storagte.helper';
import { getErrorMessage, setServerFieldErrors } from '@/utils/helper/noti-error.helper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Pencil, Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import ProductBasicSection from './ProductBasicSection';
import ProductDescriptionSection from './ProductDescriptionSection';
import ProductImageSection from './ProductImageSection';
import ProductAiFileSection from './ProductAiFileSection';
import ProductInventorySection from './ProductInventorySection';
import ProductOptionSection from './ProductOptionSection';
import ProductPriceSection from './ProductPriceSection';
import ProductSpecificationSection from './ProductSpecificationSection';
import ProductStatusSection from './ProductStatusSection';
import ProductTemplateSection from './ProductTemplateSection';

type Props = {
  title: string;
  /** Undefined = create mode */
  productId?: number;
  existing?: Product;
  /** Detail view: same layout, every control disabled. */
  readOnly?: boolean;
};

const resolveProduct: Resolver<ProductUpsertInput> = zodResolver(productUpsertSchema) as Resolver<ProductUpsertInput>;

const ProductForm = ({ title, productId, existing, readOnly }: Props) => {
  const { t } = useTranslation('product');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const isEdit = productId !== undefined;

  const [attachments, setAttachments] = useState<AttachmentFileValue[]>(() =>
    (existing?.images || []).flatMap((url) => urlToAttachmentValue(url) ?? []),
  );
  const [aiFile, setAiFile] = useState<AttachmentFileValue | undefined>(() => productAiFileToAttachment(existing?.file_ai?.[0]));
  const [isUploading, setIsUploading] = useState(false);
  const [isDescriptionUploading, setIsDescriptionUploading] = useState(false);
  const descriptionValidationRef = useRef<string | null>(null);
  const descriptionFlushRef = useRef<(() => string | null) | null>(null);
  const [filesVersion, setFilesVersion] = useState(0);
  const [savedFilesVersion, setSavedFilesVersion] = useState(0);
  const filesDirty = filesVersion !== savedFilesVersion;
  const allowLeaveRef = useRef(false);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    getFieldState,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductUpsertInput>({
    mode: 'all',
    defaultValues: existing ? transformProductRESPToInput(existing) : productUpsertInputDefault,
    // These hidden prices follow supply price before validation and submission.
    resolver: (values, context, options) =>
      resolveProduct(
        { ...values, brand_site_price: values.supply_price, plain_site_price: values.supply_price },
        context,
        options,
      ),
  });

  const { mutate: mutateCreate, isPending: isCreating } = useProductCreateMutation();
  const { mutate: mutateUpdate, isPending: isUpdating } = useProductUpdateMutation();

  const syncedProductRef = useRef(existing);
  useEffect(() => {
    if (!existing || existing === syncedProductRef.current) return;
    syncedProductRef.current = existing;
    reset(transformProductRESPToInput(existing), {
      keepDirtyValues: true,
      keepDirty: true,
      keepErrors: true,
      keepTouched: true,
      keepIsSubmitted: true,
      keepSubmitCount: true,
    });
  }, [existing, reset]);

  const busy = isCreating || isUpdating || isUploading || isDescriptionUploading;
  const hasUnsavedChanges = !readOnly && (isDirty || filesDirty);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && !allowLeaveRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAuthenticated()) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const changeAttachments = (value: AttachmentFileValue[]) => {
    setAttachments(value);
    setFilesVersion((v) => v + 1);
  };
  const changeAiFile = (value?: AttachmentFileValue) => {
    setAiFile(value);
    setFilesVersion((v) => v + 1);
  };

  /** Field-level errors (slug/sku taken, specification.case too long) land on the inputs; anything else is a toast. */
  const onError = (error: unknown, fallback: string) => {
    if (!setServerFieldErrors(error, setError)) appToast.error(getErrorMessage(error, fallback));
  };

  const onSubmit = async (input: ProductUpsertInput) => {
    if (busy || descriptionValidationRef.current) return;
    const submitted = getValues();
    const submittedFilesVersion = filesVersion;

    let images: string[];
    let fileAi: string[];
    try {
      setIsUploading(true);
      [images, fileAi] = await Promise.all([resolveProductImages(attachments), resolveProductAiFile(aiFile)]);
    } catch (error) {
      appToast.error(getErrorMessage(error, tCommon('notify.fail_upload')));
      return;
    } finally {
      setIsUploading(false);
    }

    const values: ProductUpsertInput = {
      ...input,
      description:
        (submitted.description ?? '') === (existing?.description ?? '') ||
        new DOMParser().parseFromString(existing?.description ?? '', 'text/html').querySelector('.view_design_wrap') !== null
          ? submitted.description
          : normalizeProductDescriptionImages(submitted.description ?? ''),
      images,
      file_ai: fileAi,
    };

    if (isEdit && existing) {
      mutateUpdate(buildProductUpdateREQ(productId, values, existing), {
        onSuccess: () => {
          appToast.success(tCommon('notify.success_update'));
          const editedWhileSaving = JSON.stringify(getValues()) !== JSON.stringify(submitted);
          reset(submitted, { keepValues: true, keepDirty: editedWhileSaving });
          setSavedFilesVersion(submittedFilesVersion);
        },
        onError: (error) => onError(error, tCommon('notify.fail_update')),
      });
      return;
    }

    mutateCreate(values as ProductCreateREQ, {
      onSuccess: () => {
        appToast.success(tCommon('notify.success_create'));
        allowLeaveRef.current = true;
        navigate(MY_ROUTE.PRODUCT.LIST);
      },
      onError: (error) => onError(error, tCommon('notify.fail_create')),
    });
  };

  const onDescriptionValidationChange = useCallback(
    (error: string | null) => {
      descriptionValidationRef.current = error;
      if (error) setError('description', { type: 'everaward', message: error });
      else if (getFieldState('description').error?.type === 'everaward') clearErrors('description');
    },
    [clearErrors, getFieldState, setError],
  );

  const onDescriptionFlushReady = useCallback((flush: () => string | null) => {
    descriptionFlushRef.current = flush;
  }, []);

  const save = async () => {
    // Tiptap publishes onUpdate in a microtask; let it reach RHF before validation.
    await Promise.resolve();
    const error = descriptionFlushRef.current?.() ?? descriptionValidationRef.current;
    if (error) {
      onDescriptionValidationChange(error);
      return;
    }
    await handleSubmit(onSubmit)();
  };

  return (
    <main className='space-y-6 pb-16 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-6 lg:space-y-0 lg:pb-0'>
      <PageTitle
        title={title}
        returnLink={MY_ROUTE.PRODUCT.LIST}
        extra={
          isEdit &&
          (readOnly ? (
            <Can action='edit'>
              <Button asChild variant='outline'>
                <Link to={MY_ROUTE.PRODUCT.EDIT(productId)}>
                  <Pencil /> {tCommon('button.edit')}
                </Link>
              </Button>
            </Can>
          ) : (
            <Button asChild variant='outline'>
              <Link to={MY_ROUTE.PRODUCT.DETAIL(productId)}>
                <Eye /> {tCommon('button.detail')}
              </Link>
            </Button>
          ))
        }
      />
      {!readOnly && (
        <Can action={productId ? 'edit' : 'register'}>
          <Button loading={busy} disabled={busy} onClick={save} className='fixed right-6 bottom-2 z-10 shadow-lg'>
            <Save /> {tCommon('button.save')}
          </Button>
        </Can>
      )}
      <fieldset
        disabled={readOnly}
        className='grid items-start gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch lg:overflow-hidden'>
        <div className='scrollbar-thin space-y-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2'>
          <ProductBasicSection control={control} errors={errors} />

          <Separator />

          <ProductOptionSection control={control} errors={errors} existingGroups={existing?.option_groups} />

          <Separator />

          <ProductImageSection
            attachments={attachments}
            onChange={changeAttachments}
            uploading={isUploading}
            readOnly={readOnly}
          />

          <Separator />

          <ProductAiFileSection attachment={aiFile} onChange={changeAiFile} uploading={isUploading} readOnly={readOnly} />

          <Separator />

          <ProductTemplateSection control={control} errors={errors} />

          <Separator />

          <ProductDescriptionSection
            key={productId ?? 'new'}
            control={control}
            errors={errors}
            readOnly={readOnly}
            initialDescription={existing ? (existing.description ?? '') : isEdit ? undefined : ''}
            onImageUploadingChange={setIsDescriptionUploading}
            onValidationChange={onDescriptionValidationChange}
            onFlushReady={onDescriptionFlushReady}
          />
        </div>

        <div className='scrollbar-thin space-y-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:pb-16'>
          <ProductStatusSection control={control} errors={errors} />

          <Separator />

          <ProductPriceSection control={control} errors={errors} />

          <Separator />

          <ProductInventorySection control={control} errors={errors} />

          <Separator />

          <ProductSpecificationSection control={control} errors={errors} />
        </div>
      </fieldset>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title={t('unsaved_changes.title')}
        description={t('unsaved_changes.description')}
        confirmLabel={t('unsaved_changes.leave')}
        cancelLabel={t('unsaved_changes.stay')}
        onConfirm={() => blocker.proceed?.()}
        variant='destructive'
      />
    </main>
  );
};

export default ProductForm;
