import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { appToast } from '@/components/toast/AppToast';
import { DesignAPI } from '@/data/design/design.api';
import type { ProductItemRESP } from '@/data/products/products.response';
import { cn } from '@/lib/utils';
import { resolveStorageUrl } from '@/utils/helper/canvas.helper';
import { buildPrintPdf, downloadPrintPdf } from '@/utils/helper/print-pdf.helper';
import { downloadByUrl } from '@/utils/helper/file.helper';
import type { ProductDesign } from '@/utils/helper/guest-cart.helper';
import { ArrowsOutSimpleIcon, DownloadSimpleIcon, SelectionPlusIcon } from '@phosphor-icons/react';
import type { MouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ProductLeftProps = {
  product: ProductItemRESP;
  productDesign?: ProductDesign;
  isAdmin: boolean;
};

// Canvas stores S3 template backgrounds behind the API's /template-assets
// proxy so Konva can export them safely. That URL is already complete and
// must not be reinterpreted as a /storage path on the product page.
const resolveDesignAssetUrl = (source?: string) => {
  if (!source) return '';
  return source.includes('/template-assets/') ? source : resolveStorageUrl(source);
};

const getFileExtension = (path: string) => {
  const cleanPath = path.split(/[?#]/)[0];
  const fileName = cleanPath.split('/').pop() || '';
  const extensionIndex = fileName.lastIndexOf('.');
  return extensionIndex > 0 ? fileName.slice(extensionIndex) : '';
};

const ProductLeft = ({ product, productDesign, isAdmin }: ProductLeftProps) => {
  const { t: tCommon } = useTranslation('common');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadMode, setDownloadMode] = useState<'design' | 'ai' | null>(null);
  const [failedDesignBackground, setFailedDesignBackground] = useState<string | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const designPreview = productDesign?.previewFront;
  const designPreviewBack = productDesign?.previewBack;
  const productImages = useMemo(
    () => [
      ...(designPreview ? [resolveDesignAssetUrl(designPreview)] : []),
      ...(designPreviewBack ? [resolveDesignAssetUrl(designPreviewBack)] : []),
      ...[...new Set([product.first_image, ...(product.images ?? [])].filter((image): image is string => Boolean(image)))].map(
        resolveStorageUrl,
      ),
    ],
    [designPreview, designPreviewBack, product.first_image, product.images],
  );
  const selectedImage = productImages[selectedImageIndex] ?? productImages[0];
  const designBackground = productDesign?.state.frontData.background.backgroundImage;
  const frontFrame = productDesign?.state.sideFrames?.front;
  const designCanvasSize = frontFrame?.canvasSize || productDesign?.state.canvasSize;
  const designContentSize = frontFrame?.contentSize || productDesign?.state.contentSize || designCanvasSize;
  const designContentOffset = frontFrame?.contentOffset || productDesign?.state.contentOffset || { x: 0, y: 0 };
  const hasDesignBackground = Boolean(designBackground && failedDesignBackground !== designBackground);
  const isFullCanvasDesignPreview = productDesign?.state.previewMode === 'full_canvas';
  const designPreviewCount = Number(Boolean(designPreview)) + Number(Boolean(designPreviewBack));
  const showCompositeDesign = Boolean(designPreview && selectedImageIndex === 0 && !isFullCanvasDesignPreview);
  const showFullCanvasDesignPreview = isFullCanvasDesignPreview && selectedImageIndex < designPreviewCount;
  const aiFile = product.file_ai?.find((file) => getFileExtension(file.name).toLowerCase() === '.ai');

  const renderDesign = () => {
    const isPortrait = !designCanvasSize || designCanvasSize.width <= designCanvasSize.height;

    return (
      <span className='flex size-full items-center justify-center overflow-hidden bg-neutral-100'>
        <span
          className='relative block max-h-full max-w-full overflow-hidden'
          style={{
            aspectRatio: designCanvasSize ? `${designCanvasSize.width} / ${designCanvasSize.height}` : undefined,
            height: isPortrait ? '100%' : undefined,
            width: isPortrait ? undefined : '100%',
          }}>
          {hasDesignBackground && designBackground && (
            <img
              src={resolveDesignAssetUrl(designBackground)}
              alt=''
              className='absolute inset-0 size-full object-fill'
              aria-hidden
              onError={() => setFailedDesignBackground(designBackground)}
            />
          )}
          {hasDesignBackground && designPreview && designCanvasSize && designContentSize && (
            <img
              src={resolveDesignAssetUrl(designPreview)}
              alt='design-preview'
              className='absolute object-fill'
              style={{
                left: `${(designContentOffset.x / designCanvasSize.width) * 100}%`,
                top: `${(designContentOffset.y / designCanvasSize.height) * 100}%`,
                width: `${(designContentSize.width / designCanvasSize.width) * 100}%`,
                height: `${(designContentSize.height / designCanvasSize.height) * 100}%`,
              }}
            />
          )}
          {!hasDesignBackground && designPreview && (
            <img src={resolveDesignAssetUrl(designPreview)} alt='design-preview' className='size-full object-contain p-2' />
          )}
        </span>
      </span>
    );
  };

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [designPreview, designPreviewBack, product.images, product.first_image]);

  const handleDragStart = (event: MouseEvent<HTMLDivElement>) => {
    if (!thumbnailsRef.current) return;

    setIsDragging(true);
    hasDraggedRef.current = false;
    const isVertical = window.matchMedia('(min-width: 768px)').matches;
    dragStartXRef.current = isVertical ? event.pageY : event.pageX;
    scrollStartLeftRef.current = isVertical ? thumbnailsRef.current.scrollTop : thumbnailsRef.current.scrollLeft;
  };

  const handleDragMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !thumbnailsRef.current) return;

    const isVertical = window.matchMedia('(min-width: 768px)').matches;
    const distance = (isVertical ? event.pageY : event.pageX) - dragStartXRef.current;

    if (Math.abs(distance) > 4) {
      hasDraggedRef.current = true;
    }

    if (isVertical) {
      thumbnailsRef.current.scrollTop = scrollStartLeftRef.current - distance;
    } else {
      thumbnailsRef.current.scrollLeft = scrollStartLeftRef.current - distance;
    }
    event.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleThumbnailClick = (index: number) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    setSelectedImageIndex(index);
  };

  const handleDesignDownload = async () => {
    if (!isAdmin || !productDesign || downloadMode) return;

    setDownloadMode('design');
    try {
      const { state } = productDesign;

      if (state.sideFrames) {
        const result = await buildPrintPdf({
          frontData: state.frontData,
          backData: state.backData,
          sideFrames: state.sideFrames,
          sidedness: state.sidedness,
        });
        result.warnings.forEach((warning) => appToast.warning(warning));
        downloadPrintPdf(result.blob, `${product.slug}-print.pdf`);
        return;
      }

      // Legacy designs do not retain the print frame needed by the client-side
      // exporter, so continue using their existing server-generated PDF.
      const blob = await DesignAPI.downloadPrintPdf(Number(productDesign.id));
      downloadPrintPdf(blob, `${product.slug}-print.pdf`);
    } catch (error) {
      console.error('[Product details] Cannot download design:', error);
      window.alert('인쇄 PDF를 다운로드하지 못했습니다. 이전 디자인이라면 에디터에서 다시 저장한 후 시도해 주세요.');
    } finally {
      setDownloadMode(null);
    }
  };

  const handleAiDownload = async () => {
    if (downloadMode) return;
    if (!aiFile) {
      appToast.warning('AI 파일이 설정되지 않았습니다.');
      return;
    }

    setDownloadMode('ai');
    try {
      await downloadByUrl({
        name: aiFile.name,
        url: aiFile.url,
      });
    } finally {
      setDownloadMode(null);
    }
  };

  return (
    <section className='w-full space-y-3'>
      <div className='space-y-3 md:flex md:items-stretch md:gap-3 md:space-y-0'>
        <div className='relative order-1 aspect-square overflow-hidden rounded-lg bg-neutral-100 md:order-2 md:min-w-0 md:flex-1'>
          {showCompositeDesign
            ? renderDesign()
            : selectedImage && (
                <img
                  src={selectedImage}
                  alt='product-name'
                  className={`size-full ${showFullCanvasDesignPreview ? 'object-contain' : 'object-cover'}`}
                />
              )}
          {productImages.length > 0 && (
            <div className='absolute right-3 bottom-3 flex items-center gap-1.5 text-xs text-white'>
              <span className='rounded bg-black/50 px-2 py-1'>
                {selectedImageIndex + 1} / {productImages.length}
              </span>
              <button
                type='button'
                aria-label='Expand product image'
                onClick={() => setIsImagePreviewOpen(true)}
                className='flex size-6 items-center justify-center rounded bg-black/50 hover:bg-black/70'>
                <ArrowsOutSimpleIcon className='size-4' />
              </button>
            </div>
          )}
        </div>
        <div
          ref={thumbnailsRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className={`scrollbar-hide order-2 flex gap-3 overflow-x-auto select-none md:order-1 md:w-20 md:shrink-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
          {productImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type='button'
              onClick={() => handleThumbnailClick(index)}
              className={`size-20 shrink-0 cursor-pointer overflow-hidden rounded-md border ${selectedImageIndex === index ? 'border-blue-brand' : 'border-transparent'}`}>
              {designPreview && index === 0 && !isFullCanvasDesignPreview ? (
                renderDesign()
              ) : (
                <img
                  src={image}
                  alt='product-name'
                  draggable={false}
                  className={`size-20 ${isFullCanvasDesignPreview && index < designPreviewCount ? 'object-contain' : 'object-cover'}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-3 md:flex-row'>
        {isAdmin && (
          <Button
            variant='outline'
            className='flex-1'
            disabled={!productDesign || downloadMode !== null}
            loading={downloadMode === 'design'}
            onClick={() => void handleDesignDownload()}>
            <SelectionPlusIcon className='size-5' />
            {tCommon('button.download_custom_die_line')}
          </Button>
        )}
        <Button
          variant='outline'
          className={cn(isAdmin ? 'flex-1' : 'mx-auto w-50')}
          disabled={downloadMode !== null}
          loading={downloadMode === 'ai'}
          onClick={() => void handleAiDownload()}>
          <DownloadSimpleIcon className='size-5' />
          {'AI 파일 다운로드'}
        </Button>
      </div>
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className='max-w-[calc(100vw-4rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-5xl'>
          <DialogTitle className='sr-only'>Product image preview</DialogTitle>
          <div className='flex h-[min(80dvh,52rem)] items-center justify-center overflow-hidden rounded-lg bg-neutral-100'>
            {showCompositeDesign
              ? renderDesign()
              : selectedImage && <img src={selectedImage} alt='product-name' className='size-full object-contain' />}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductLeft;
