import { appToast } from '@/components/toast/AppToast';
import { Spinner } from '@/components/ui/spinner';
import { useCreateBrandProductionInquiryMutation } from '@/data/brand-production-inquiry/brand-production-inquiry.query';
import { useProductDetailBySlugQuery } from '@/data/products/products.query';
import ProductInquiryCard from '@/pages/brand/product-inquiry/components/ProductInquiryCard';
import ProductInquiryForm from '@/pages/brand/product-inquiry/components/ProductInquiryForm';
import ProductInquiryPreviewImage from '@/pages/brand/product-inquiry/components/ProductInquiryPreviewImage';
import {
  brandProductInquiryFormSchema,
  type BrandProductInquiryFormValues,
} from '@/schemas/brand-product-inquiry/brand-product-inquiry-form.schema';
import {
  BRAND_PRODUCT_INQUIRY_FORM_DEFAULT_VALUES,
  BRAND_PRODUCT_INQUIRY_PAGE_LABELS,
  mapBrandProductInquiryFormToCreateREQ,
} from '@/utils/constants/brand-product-inquiry.constant';
import { mapProductToInquiryCard } from '@/data/brand-production-inquiry/brand-production-inquiry.service';
import { FileType } from '@/utils/enums/file.enum';
import { ProductType } from '@/utils/enums/product.enum';
import { resolveAttachmentFiles } from '@/utils/helper/file.helper';
import type { BrandProductInquiryImageUploadView } from '@/utils/types/brand-product-inquiry.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

const isProductType = (value: string | null): value is ProductType => Object.values(ProductType).some((type) => type === value);

type ProductInquiryContentSectionProps = {
  submitLabel?: string;
  imageUpload?: BrandProductInquiryImageUploadView;
  previewImageUrl?: string | null;
  productId?: number | null;
};

const ProductInquiryContentSection = ({
  submitLabel,
  imageUpload,
  previewImageUrl,
  productId: propProductId,
}: ProductInquiryContentSectionProps) => {
  const [searchParams] = useSearchParams();
  const typeFromQuery = searchParams.get('type');
  const defaultInquiryType = isProductType(typeFromQuery) ? typeFromQuery : BRAND_PRODUCT_INQUIRY_FORM_DEFAULT_VALUES.inquiryType;

  const productSlug = searchParams.get('product_slug') || searchParams.get('slug') || '';
  const { data: product, isLoading: isLoadingProduct } = useProductDetailBySlugQuery(productSlug);

  const rawProductId = Number(searchParams.get('product_id') || searchParams.get('productId'));
  const queryProductId = Number.isInteger(rawProductId) && rawProductId > 0 ? rawProductId : product?.id;
  const productId = propProductId ?? queryProductId ?? null;

  const cardProduct = useMemo(() => mapProductToInquiryCard(product), [product]);

  const form = useForm<BrandProductInquiryFormValues>({
    resolver: zodResolver(brandProductInquiryFormSchema),
    mode: 'onChange',
    defaultValues: {
      ...BRAND_PRODUCT_INQUIRY_FORM_DEFAULT_VALUES,
      inquiryType: defaultInquiryType,
    },
  });

  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const createMutation = useCreateBrandProductionInquiryMutation();
  const isSubmitting = createMutation.isPending || uploadingAttachments;

  const onSubmit = async (values: BrandProductInquiryFormValues) => {
    if (isSubmitting) return;

    try {
      setUploadingAttachments(true);
      const attachments = await resolveAttachmentFiles(values.attachments, FileType.INQUIRY_ATTACHMENTS, 'url');

      createMutation.mutate(mapBrandProductInquiryFormToCreateREQ(values, attachments, productId), {
        onSuccess: (response) => {
          appToast.success(response.message || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submitSuccess);
          form.reset({
            ...BRAND_PRODUCT_INQUIRY_FORM_DEFAULT_VALUES,
            inquiryType: defaultInquiryType,
          });
        },
        onError: (error) => {
          appToast.error(error.message || BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submitFailed);
        },
      });
    } catch {
      appToast.error(BRAND_PRODUCT_INQUIRY_PAGE_LABELS.submitFailed);
    } finally {
      setUploadingAttachments(false);
    }
  };

  return (
    <section className='mx-auto flex w-full max-w-[1216px] flex-col px-4 pb-12 md:pb-20'>
      <FormProvider {...form}>
        <form
          className='flex flex-col items-start gap-10 lg:flex-row lg:gap-10'
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate>
          <ProductInquiryPreviewImage imageUrl={previewImageUrl} />
          <div className='flex w-full min-w-0 flex-1 flex-col gap-6'>
            {isLoadingProduct && (
              <div className='flex h-36 w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/40'>
                <Spinner className='size-6 text-neutral-500' />
              </div>
            )}
            {cardProduct && <ProductInquiryCard product={cardProduct} />}
            <ProductInquiryForm isSubmitting={isSubmitting} submitLabel={submitLabel} imageUpload={imageUpload} />
          </div>
        </form>
      </FormProvider>
    </section>
  );
};

export default ProductInquiryContentSection;
