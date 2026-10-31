import {
  buildProductDesignMetadata,
  createProductDesign,
  readProductDesign,
  updateProductDesign,
} from '@/data/design/product-design.service';
import { CART_QUERY_KEYS } from '@/data/cart/cart.query';
import { DesignAPI } from '@/data/design/design.api';
import { uploadFileAPI } from '@/data/files/files.api';
import { useProductDetailBySlugQuery } from '@/data/products/products.query';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { useAuth } from '@/contexts/AuthContext';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { DEFAULT_CART_CONTENT } from '@/utils/helper/guest-cart.helper';
import { buildPrintPdf } from '@/utils/helper/print-pdf.helper';
import { ObjectType, type CardSideData } from '@/utils/types/canvas.types';
import type { DesignLayer } from '@/utils/types/design.type';
import Konva from 'konva';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import AIPhraseAssistantModal from '@/pages/ecommerce/product/components/detail/AIPhraseAssistantModal';
import Canvas from './components/Canvas';
import DesignPreviewDialog from './components/DesignPreviewDialog';
import EditorHeader from './components/EditorHeader';
import EmptyImageFrameDialog from './components/EmptyImageFrameDialog';
import ExportLoadingOverlay from './components/ExportLoadingOverlay';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import Toolbar from './components/Toolbar';

const isImageDataUrl = (value: string) => /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(value);

const getExtensionForMimeType = (mimeType: string) => {
  const subtype = mimeType.split('/')[1]?.toLowerCase();
  if (subtype === 'svg+xml') return 'svg';
  if (subtype === 'jpeg') return 'jpg';
  return subtype || 'png';
};

const imageDataUrlToFile = (dataUrl: string, fileName: string): File => {
  const separatorIndex = dataUrl.indexOf(',');
  if (separatorIndex < 0) throw new Error('Invalid image data URL');

  const header = dataUrl.slice(0, separatorIndex);
  const payload = dataUrl.slice(separatorIndex + 1);
  const mimeType = /^data:([^;,]+)/i.exec(header)?.[1] || 'image/png';
  const bytes = header.toLowerCase().includes(';base64')
    ? Uint8Array.from(atob(payload), (character) => character.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(payload));

  return new File([bytes], `${fileName}.${getExtensionForMimeType(mimeType)}`, { type: mimeType });
};

const CanvasEditor = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productSlug = searchParams.get('product')?.trim() || '';
  const cartItemId = searchParams.get('cartItem')?.trim() || '';
  const designId = searchParams.get('design')?.trim() || cartItemId;
  const returnToCart = searchParams.get('returnTo') === 'cart';
  const selectedOptionIds = searchParams.get('options')?.trim() || '';
  const queryClient = useQueryClient();
  const { data: product, isError: isProductError, isLoading: isProductLoading } = useProductDetailBySlugQuery(productSlug);
  const activeStageRef = useRef<Konva.Stage | null>(null);
  const savedDesignIdRef = useRef<number | null>(null);
  const desktopCanvasContainerRef = useRef<HTMLDivElement>(null);
  const didInitialFitRef = useRef(false);
  const previousCanvasSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [desktopCanvasSize, setDesktopCanvasSize] = useState({ width: 0, height: 0 });
  const [previewImages, setPreviewImages] = useState<{ front: string; back: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [emptyFrameWarningOpen, setEmptyFrameWarningOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isRestoringDesign, setIsRestoringDesign] = useState(Boolean(designId));
  const [hasRestoredDesign, setHasRestoredDesign] = useState(false);
  const [isInitializingTemplate, setIsInitializingTemplate] = useState(true);
  const [templateRenderRequest, setTemplateRenderRequest] = useState(0);
  const { canvasSize, exportPreviewImages, exportToPDF, fitView, isExportLoading, resetEditor, selectedId, trimSelected } =
    useWebEditorStore(
      useShallow((state) => ({
        canvasSize: state.canvasSize,
        exportPreviewImages: state.exportPreviewImages,
        exportToPDF: state.exportToPDF,
        fitView: state.fitView,
        isExportLoading: state.isExportLoading,
        resetEditor: state.resetEditor,
        selectedId: state.selectedId,
        trimSelected: state.trimSelected,
      })),
    );

  useLayoutEffect(() => {
    resetEditor();
    savedDesignIdRef.current = null;
    didInitialFitRef.current = false;
    previousCanvasSizeRef.current = null;

    setPreviewImages(null);
    setHasRestoredDesign(false);
    setIsRestoringDesign(Boolean(designId));
    setIsInitializingTemplate(true);
    setTemplateRenderRequest(0);
  }, [designId, productSlug, resetEditor]);

  useEffect(() => {
    if (!productSlug || isProductError) setIsInitializingTemplate(false);
  }, [isProductError, productSlug]);

  useEffect(() => {
    const container = desktopCanvasContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      setDesktopCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (didInitialFitRef.current || !desktopCanvasSize.width || !desktopCanvasSize.height) return;

    fitView(desktopCanvasSize);
    didInitialFitRef.current = true;
    previousCanvasSizeRef.current = canvasSize;
  }, [canvasSize, desktopCanvasSize, fitView]);

  useEffect(() => {
    if (!designId) return;

    let cancelled = false;
    void readProductDesign(designId)
      .then((design) => {
        if (!cancelled && design) {
          useWebEditorStore.getState().loadDesign(design.state);
          setHasRestoredDesign(true);
          setIsInitializingTemplate(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsRestoringDesign(false);
      });

    return () => {
      cancelled = true;
    };
  }, [designId]);

  useEffect(() => {
    const previousCanvasSize = previousCanvasSizeRef.current;
    if (!didInitialFitRef.current || !desktopCanvasSize.width || !desktopCanvasSize.height) return;

    if (previousCanvasSize && previousCanvasSize.width === canvasSize.width && previousCanvasSize.height === canvasSize.height) {
      return;
    }

    fitView(desktopCanvasSize);
    previousCanvasSizeRef.current = canvasSize;
  }, [canvasSize, desktopCanvasSize, fitView]);

  const handleExportPdf = async () => {
    if (!isAdmin || !activeStageRef.current) return;
    // The store displays the actionable export error; do not leave an unhandled UI promise.
    await exportToPDF(activeStageRef).catch(() => undefined);
  };

  const handleSave = async () => {
    if (!activeStageRef.current || !product) return;

    const editorState = useWebEditorStore.getState();
    const sides = editorState.sidedness === 'DOUBLE' ? [editorState.frontData, editorState.backData] : [editorState.frontData];
    const hasEmptyImageFrame = sides.some((side) =>
      side.objects.some((object) => object.type === 'image' && object.field === 'image_frame' && !object.src.trim()),
    );

    if (hasEmptyImageFrame) {
      setEmptyFrameWarningOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const images = await exportPreviewImages(activeStageRef);
      setPreviewImages(images);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCart = async () => {
    if (!product || !previewImages?.front) return;

    setIsAddingToCart(true);
    const editorState = useWebEditorStore.getState();
    try {
      const printPdf = await buildPrintPdf(editorState);
      printPdf.warnings.forEach((warning) => toast.warning(warning, { duration: 12_000 }));
      const uploadCache = new Map<string, Promise<string>>();
      const uploadImageDataUrl = (dataUrl: string, fileName: string) => {
        const cachedUpload = uploadCache.get(dataUrl);
        if (cachedUpload) return cachedUpload;

        const upload = uploadFileAPI(imageDataUrlToFile(dataUrl, fileName), FileType.DESIGN_GROUP).then((response) => {
          const url = response.data.file.url;
          if (!url) throw new Error('File upload did not return a URL');
          return url;
        });
        uploadCache.set(dataUrl, upload);
        return upload;
      };
      const persistSideImages = async (side: CardSideData, sideName: 'front' | 'back'): Promise<CardSideData> => ({
        ...side,
        objects: await Promise.all(
          side.objects.map(async (object) => {
            if (object.type !== ObjectType.IMAGE || !isImageDataUrl(object.src)) return object;

            return {
              ...object,
              src: await uploadImageDataUrl(object.src, `design-${product.id}-${sideName}-${object.id}`),
            };
          }),
        ),
      });
      const [previewFront, previewBack, frontData, backData] = await Promise.all([
        uploadImageDataUrl(previewImages.front, `design-${product.id}-preview-front`),
        previewImages.back
          ? uploadImageDataUrl(previewImages.back, `design-${product.id}-preview-back`)
          : Promise.resolve(undefined),
        persistSideImages(editorState.frontData, 'front'),
        persistSideImages(editorState.backData, 'back'),
      ]);
      const designState = {
        frontData,
        backData,
        canvasSize: editorState.canvasSize,
        contentSize: editorState.contentSize,
        contentOffset: editorState.contentOffset,
        templateFrameConfig: editorState.templateFrameConfig,
        contentSafeMargin: editorState.contentSafeMargin,
        sideFrames: editorState.sideFrames,
        sidedness: editorState.sidedness,
        previewMode: 'full_canvas' as const,
      };
      const now = new Date().toISOString();
      const itemId = cartItemId || `${product.id}-cart-${Date.now()}`;
      const metadata = buildProductDesignMetadata(product.slug, designState, previewFront, previewBack);
      const designPayload = {
        product_id: product.id,
        title: product.name.ko || product.name.en || product.slug,
        layout_data: {
          background: {
            color: frontData.background.backgroundColor,
            image_url: frontData.background.backgroundImage,
          },
          objects: frontData.objects as unknown as DesignLayer[],
        },
        metadata,
      };
      const existingDesignId = savedDesignIdRef.current ?? (designId ? Number(designId) : null);
      const savedDesign = existingDesignId
        ? await updateProductDesign({ id: existingDesignId, ...designPayload })
        : await createProductDesign(designPayload);
      if (!savedDesign) throw new Error('Design API returned invalid design data');
      savedDesignIdRef.current = Number(savedDesign.id);
      if (!savedDesign.designRevision) throw new Error('Design API did not return an export revision');
      await DesignAPI.uploadPrintPdf(Number(savedDesign.id), savedDesign.designRevision, printPdf.blob);
      const nextDesignId = savedDesign.id;
      const cartItem = {
        id: itemId,
        designId: nextDesignId,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name.ko || product.name.en || product.slug,
        sku: product.sku,
        price: product.selling_price,
        quantity: 1,
        previewFront,
        previewBack,
        content: { ...DEFAULT_CART_CONTENT },
        createdAt: now,
      };

      console.info('[Canvas editor] Saved product design:', { ...cartItem, design: designState });
      if (returnToCart) {
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.detail() });
        navigate(MY_ROUTE.CART, { replace: true });
        return;
      }
      const optionQuery = selectedOptionIds ? `&options=${encodeURIComponent(selectedOptionIds)}` : '';
      navigate(
        `${MY_ROUTE.PRODUCT_LIST}/${encodeURIComponent(product.slug)}?design=${encodeURIComponent(nextDesignId)}${optionQuery}`,
      );
    } catch (error) {
      console.error('[Canvas editor] Cannot add design to cart:', error);
      const detail = error instanceof Error && error.name !== 'AxiosError' ? `\n\n${error.message}` : '';
      window.alert(`인쇄용 PDF와 디자인을 저장하지 못했습니다. 장바구니로 이동하지 않았습니다. 다시 시도해 주세요.${detail}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <div className='flex h-dvh min-h-[640px] min-w-[1024px] flex-col overflow-hidden bg-white'>
        <EditorHeader
          canExportPdf={isAdmin}
          isExporting={isExportLoading}
          isSaving={isSaving}
          onSave={handleSave}
          onExportPdf={handleExportPdf}
          onOpenAI={() => setIsAIModalOpen(true)}
          productName={product?.name.ko || product?.name.en || product?.slug}
        />

        <div className='relative min-h-0 flex-1 overflow-hidden bg-white'>
          <main ref={desktopCanvasContainerRef} className='relative size-full'>
            {desktopCanvasSize.width > 0 && desktopCanvasSize.height > 0 && (
              <Canvas
                width={desktopCanvasSize.width}
                height={desktopCanvasSize.height}
                templateRenderRequest={templateRenderRequest}
                onTemplateRenderReady={() => setIsInitializingTemplate(false)}
                onStageReady={(stage) => {
                  activeStageRef.current = stage;
                }}
              />
            )}

            <div className='absolute inset-y-0 left-0 z-20'>
              {!isRestoringDesign && (
                <SidebarLeft
                  key={`${product?.slug || productSlug}-${designId || 'new'}`}
                  productSlug={product?.slug}
                  autoApplyTemplate={!designId || !hasRestoredDesign}
                  onInitialTemplateResolved={() => setIsInitializingTemplate(false)}
                  onTemplateLoadingChange={setIsInitializingTemplate}
                  onTemplateApplied={() => setTemplateRenderRequest((request) => request + 1)}
                />
              )}
            </div>

            {(selectedId || trimSelected) && (
              <div id='canvas-editor-right-sidebar' className='pointer-events-none absolute top-0 right-0 z-20 w-[219px] p-1.5'>
                <div className='pointer-events-auto'>
                  <SidebarRight />
                </div>
              </div>
            )}

            <Toolbar viewportSize={desktopCanvasSize} rightOffset={selectedId || trimSelected ? 227 : 8} />

            {(isProductLoading || isRestoringDesign || isInitializingTemplate || !productSlug || isProductError) && (
              <div className='absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white text-sm font-medium text-neutral-600'>
                {isProductLoading || isRestoringDesign || isInitializingTemplate ? (
                  <>
                    <span className='size-8 animate-spin rounded-full border-3 border-neutral-200 border-t-neutral-700' />
                    <span>
                      {isProductLoading || isRestoringDesign ? '상품 정보를 불러오는 중입니다.' : '템플릿을 불러오는 중입니다.'}
                    </span>
                  </>
                ) : !productSlug ? (
                  '상품 정보가 없습니다. product 파라미터를 확인해주세요.'
                ) : (
                  '상품 정보를 불러오지 못했습니다.'
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <AIPhraseAssistantModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        title='AI 문구 도우미'
        confirmText='3초만에 문구 생성하기'
      />
      <ExportLoadingOverlay />
      <DesignPreviewDialog
        open={Boolean(previewImages)}
        previewFront={previewImages?.front || ''}
        previewBack={previewImages?.back || undefined}
        isConfirming={isAddingToCart}
        onOpenChange={(open) => !open && setPreviewImages(null)}
        onConfirm={handleConfirmCart}
      />
      <EmptyImageFrameDialog open={emptyFrameWarningOpen} onOpenChange={setEmptyFrameWarningOpen} />
    </>
  );
};

export default CanvasEditor;
