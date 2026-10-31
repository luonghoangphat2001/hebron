import aiFilePage from '@/assets/images/canvas-editor/ai-file-page.svg';
import frameStar from '@/assets/images/canvas-editor/frame-star.svg';
import frameTriangle from '@/assets/images/canvas-editor/frame-triangle.svg';
import uploadFolderAccent from '@/assets/images/canvas-editor/upload-folder-accent.svg';
import uploadFolderBase from '@/assets/images/canvas-editor/upload-folder-base.svg';
import uploadFolderDetail from '@/assets/images/canvas-editor/upload-folder-detail.svg';
import uploadFolderEdge from '@/assets/images/canvas-editor/upload-folder-edge.svg';
import uploadFolderFront from '@/assets/images/canvas-editor/upload-folder-front.svg';
import uploadFolderLines from '@/assets/images/canvas-editor/upload-folder-lines.svg';
import uploadFolderPageDetail from '@/assets/images/canvas-editor/upload-folder-page-detail.svg';
import uploadFolderPage from '@/assets/images/canvas-editor/upload-folder-page.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalligraphiesQuery } from '@/data/calligraphies/calligraphies.query';
import type { CalligraphyType } from '@/data/calligraphies/calligraphies.request';
import { templatesAPI } from '@/data/templates/templates.api';
import { useTemplatesQuery } from '@/data/templates/templates.query';
import { cn } from '@/lib/utils';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { ObjectType, type CanvasObject } from '@/utils/types/canvas.types';
import type { Template } from '@/utils/types/design.response';
import { resolveCanvasAssetUrl, resolveStorageUrl } from '@/utils/helper/canvas.helper';
import { fontPreviewStack } from '@/utils/helper/editor-fonts';
import {
  CaretDownIcon,
  CaretUpIcon,
  EyeIcon,
  EyeSlashIcon,
  FrameCornersIcon,
  HashStraightIcon,
  KanbanIcon,
  LayoutIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ScribbleIcon,
  TextTIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import TemplateCardSkeleton from './TemplateCardSkeleton';
import TextTabContent from './TextTabContent';
import FreeEditSettings from './FreeEditSettings';
import BackgroundTabContent from './BackgroundTabContent';

const tools = [
  { id: 'template', label: '템플릿', icon: LayoutIcon },
  { id: 'background', label: '배경', icon: LayoutIcon },
  { id: 'layer', label: '레이어', icon: KanbanIcon },
  { id: 'text', label: '텍스트', icon: TextTIcon },
  { id: 'upload', label: '업로드', icon: UploadSimpleIcon },
  { id: 'frame', label: '프레임', icon: FrameCornersIcon },
  { id: 'calligraphy', label: '캘리', icon: ScribbleIcon },
] as const;

const fontPreviews = [
  { id: 'nanum-myeongjo', name: 'Nanum Myeongjo', family: 'Nanum Myeongjo' },
  { id: 'nanum-gothic', name: 'Nanum Gothic', family: 'Nanum Gothic' },
  { id: 'pretendard', name: 'Pretendard', family: 'Pretendard' },
  { id: 'nanum-gothic-coding', name: 'Nanum Gothic Coding', family: 'Nanum Gothic Coding' },
] as const;

const frameShapes = [
  { id: 'rectangle', label: '사각형', shapeType: 'rectangle' },
  { id: 'rounded-rectangle', label: '둥근 사각형', shapeType: 'roundedRectangle' },
  { id: 'circle', label: '원', shapeType: 'circle' },
  { id: 'double-rectangle', label: '이중 사각형', shapeType: 'doubleRectangle' },
  { id: 'triangle', label: '삼각형', shapeType: 'triangle' },
  { id: 'star', label: '별', shapeType: 'star' },
] as const;

function FrameShapePreview({ id }: { id: (typeof frameShapes)[number]['id'] }) {
  if (id === 'triangle') {
    return <img src={frameTriangle} alt='' className='h-[75px] w-[86.603px]' draggable={false} aria-hidden />;
  }

  if (id === 'star') {
    return <img src={frameStar} alt='' className='h-[88px] w-[92px]' draggable={false} aria-hidden />;
  }

  if (id === 'double-rectangle') {
    return (
      <span className='relative size-20 border border-neutral-500' aria-hidden>
        <span className='absolute inset-[2px] border border-neutral-500' />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'size-20 border border-neutral-500',
        id === 'rounded-rectangle' && 'rounded-xl',
        id === 'circle' && 'rounded-full',
      )}
      aria-hidden
    />
  );
}

function UploadFolderIllustration() {
  const pieces = [
    { src: uploadFolderBase, className: 'inset-[18.31%_6.06%_2.18%_8%]' },
    { src: uploadFolderPage, className: 'inset-[1.77%_11.19%_27.05%_13.14%]' },
    { src: uploadFolderPageDetail, className: 'inset-[1.77%_11.8%_27.66%_13.14%]' },
    { src: uploadFolderLines, className: 'inset-[15.14%_23.49%_48.61%_25.44%]' },
    { src: uploadFolderAccent, className: 'inset-[39.08%_55.64%_48.09%_31.52%]' },
    { src: uploadFolderEdge, className: 'inset-[18.31%_6.06%_47.03%_88.81%]' },
    { src: uploadFolderFront, className: 'inset-[37.36%_0_1.77%_0]' },
    { src: uploadFolderDetail, className: 'inset-[72.29%_17.59%_19.25%_19.53%]' },
  ] as const;

  return (
    <span className='relative block size-10 shrink-0 overflow-hidden' aria-hidden>
      {pieces.map((piece) => (
        <span key={piece.src} className={cn('absolute', piece.className)}>
          <img src={piece.src} alt='' className='absolute inset-0 size-full max-w-none' draggable={false} />
        </span>
      ))}
    </span>
  );
}

type UploadedAsset = {
  id: string;
  name: string;
  type: string;
  badge: string;
  preview?: string;
  originalWidth?: number;
  originalHeight?: number;
};

type SidebarTemplate = {
  id: number;
  label: string;
  preview: string | null;
  template: Template;
};

const preloadTemplateAssets = async (template: Template) => {
  const assets = [
    template.background?.image_url,
    template.layout_config?.background?.front_image_url,
    template.layout_config?.background?.back_image_url,
    ...(template.layout_config?.layers.flatMap((layer) => [layer.image_url, layer.mask_image_url]) ?? []),
  ].filter((source): source is string => Boolean(source));

  await Promise.all(
    [...new Set(assets)].map(
      (source) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = resolveStorageUrl(source);
        }),
    ),
  );
};

const waitForTemplatePaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

function getLayerLabel(layer: CanvasObject) {
  if (layer.label) return layer.label;
  if (layer.type === ObjectType.TEXT) return layer.content || '텍스트';
  if (layer.type === ObjectType.IMAGE) return '이미지';
  return '프레임';
}

export default function SidebarLeft({
  productSlug,
  autoApplyTemplate = true,
  onInitialTemplateResolved,
  onTemplateLoadingChange,
  onTemplateApplied,
}: {
  productSlug?: string;
  autoApplyTemplate?: boolean;
  onInitialTemplateResolved?: () => void;
  onTemplateLoadingChange?: (isLoading: boolean) => void;
  onTemplateApplied?: () => void;
}) {
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]['id']>('template');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);
  const [activeFont, setActiveFont] = useState<(typeof fontPreviews)[number]['id']>(fontPreviews[0].id);
  const [activeFrame, setActiveFrame] = useState<(typeof frameShapes)[number]['id'] | null>(null);
  const [activeCalligraphy, setActiveCalligraphy] = useState<number | null>(null);
  const [isCalligraphyImageError, setIsCalligraphyImageError] = useState(false);
  const [calligraphySearch, setCalligraphySearch] = useState('');
  const [calligraphyType, setCalligraphyType] = useState<CalligraphyType>('calligraphy');
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [loadingTemplateId, setLoadingTemplateId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoAppliedProductRef = useRef<string | null>(null);
  const initialTemplateResolvedProductRef = useRef<string | null>(null);
  const activeSide = useWebEditorStore((state) => state.activeSide);
  const frontObjects = useWebEditorStore((state) => state.frontData.objects);
  const backObjects = useWebEditorStore((state) => state.backData.objects);
  const selectedId = useWebEditorStore((state) => state.selectedId);
  const setTemplate = useWebEditorStore((state) => state.setTemplate);
  const updateObject = useWebEditorStore((state) => state.updateObject);
  const reorderObject = useWebEditorStore((state) => state.reorderObject);
  const selectObject = useWebEditorStore((state) => state.selectObject);
  const addText = useWebEditorStore((state) => state.addText);
  const addImage = useWebEditorStore((state) => state.addImage);
  const addShape = useWebEditorStore((state) => state.addShape);
  const editorLayers = activeSide === 'front' ? frontObjects : backObjects;
  const orderedEditorLayers = useMemo(() => [...editorLayers].sort((a, b) => b.zIndex - a.zIndex), [editorLayers]);
  const selectedText = editorLayers.find(
    (object): object is Extract<CanvasObject, { type: ObjectType.TEXT }> =>
      object.id === selectedId && object.type === ObjectType.TEXT,
  );
  const shouldLoadTemplates = Boolean(productSlug);
  const templateQueryParams = useMemo(
    () => ({
      page: 1,
      per_page: 100,
      product_slug: productSlug,
    }),
    [productSlug],
  );
  const {
    data: templateResponse,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = useTemplatesQuery(templateQueryParams, {
    enabled: shouldLoadTemplates,
  });
  const apiTemplates = templateResponse?.data.templates ?? [];
  const sidebarTemplates: SidebarTemplate[] = apiTemplates.map((template) => ({
    id: template.id,
    label: template.name,
    preview: template.front_preview_url || template.preview_images[0] || template.back_preview_url || null,
    template,
  }));
  const calligraphyQueryParams = useMemo(
    () => ({
      q: calligraphySearch.trim() || undefined,
      type: calligraphyType,
      page: 1,
      per_page: 100,
    }),
    [calligraphySearch, calligraphyType],
  );
  const {
    data: calligraphyResponse,
    isError: isCalligraphyError,
    isLoading: isCalligraphyLoading,
  } = useCalligraphiesQuery(calligraphyQueryParams, activeTool === 'calligraphy' && isPanelOpen);
  const calligraphies = useMemo(() => {
    const search = calligraphySearch.trim().toLocaleLowerCase();
    return (calligraphyResponse?.data.calligraphies ?? []).filter((item) => {
      const matchesType = item.type === calligraphyType;
      const matchesSearch = !search || `${item.text ?? ''} ${item.type_label}`.toLocaleLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  }, [calligraphyResponse, calligraphySearch, calligraphyType]);

  useEffect(
    () =>
      useWebEditorStore.subscribe((state, previousState) => {
        if (!state.selectedId || state.selectedId === previousState.selectedId) return;
        const objects = state.activeSide === 'front' ? state.frontData.objects : state.backData.objects;
        const selectedObject = objects.find((object) => object.id === state.selectedId);
        if (selectedObject?.type !== ObjectType.TEXT) return;

        setActiveTool('text');
        setIsPanelOpen(true);
      }),
    [],
  );

  const handleTemplateSelect = useCallback(
    async (template: SidebarTemplate) => {
      setActiveTemplate(template.id);
      setLoadingTemplateId(template.id);
      onTemplateLoadingChange?.(true);

      let selectedTemplate = template.template;
      let didApplyTemplate = false;
      try {
        const response = await templatesAPI.getDetail(Number(template.id));
        selectedTemplate = response.data.template;
      } catch {
        // The list response can already include the layout, so preserve the existing fallback.
      }

      try {
        await preloadTemplateAssets(selectedTemplate);
        if (selectedTemplate.layout_config) {
          setTemplate(selectedTemplate);
          didApplyTemplate = true;
          onTemplateApplied?.();
        }
        await waitForTemplatePaint();
      } finally {
        setLoadingTemplateId(null);
        // CanvasEditor keeps the overlay until Canvas has painted the actual background image.
        if (!didApplyTemplate) onTemplateLoadingChange?.(false);
      }
    },
    [onTemplateApplied, onTemplateLoadingChange, setTemplate],
  );

  const resolveInitialTemplate = useCallback(() => {
    if (!productSlug || initialTemplateResolvedProductRef.current === productSlug) return;

    initialTemplateResolvedProductRef.current = productSlug;
    requestAnimationFrame(() => {
      setIsPanelOpen(true);
      onInitialTemplateResolved?.();
    });
  }, [onInitialTemplateResolved, productSlug]);

  useEffect(() => {
    const firstTemplate = sidebarTemplates[0];
    if (!autoApplyTemplate || !productSlug || isTemplateLoading) return;
    if (initialTemplateResolvedProductRef.current === productSlug) return;

    if (!firstTemplate || isTemplateError) {
      resolveInitialTemplate();
      return;
    }

    if (autoAppliedProductRef.current === productSlug) return;

    autoAppliedProductRef.current = productSlug;
    void handleTemplateSelect(firstTemplate);
  }, [
    autoApplyTemplate,
    handleTemplateSelect,
    isTemplateError,
    isTemplateLoading,
    productSlug,
    resolveInitialTemplate,
    sidebarTemplates,
  ]);

  const handleFontSelect = (font: (typeof fontPreviews)[number]) => {
    setActiveFont(font.id);
    addText(undefined, {
      content: '감사패 수여',
      fontFamily: font.family,
      fontWeight: '700',
    });
  };

  const handleLayerVisibilityToggle = (layer: CanvasObject) => {
    const nextVisible = !layer.visible;
    updateObject(layer.id, { visible: nextVisible });

    if (!nextVisible && selectedId === layer.id) {
      selectObject(null);
    }
  };

  const activeToolLabel = tools.find((tool) => tool.id === activeTool)?.label;

  const handleToolClick = (toolId: (typeof tools)[number]['id']) => {
    useWebEditorStore.getState().selectBackground(false);
    if (toolId === activeTool) {
      setIsPanelOpen((isOpen) => !isOpen);
      return;
    }

    setActiveTool(toolId);
    setIsPanelOpen(true);
  };

  const addUploadedFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file, index) => {
      const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const isVector = extension === 'AI';
      const asset = {
        id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
        name: file.name,
        type: isVector ? '벡터 파일' : '이미지 파일',
        badge: extension,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result !== 'string') return;
          setUploadedAssets((current) => [...current, { ...asset, preview: reader.result as string }]);

          const image = new Image();
          image.onload = () =>
            setUploadedAssets((current) =>
              current.map((currentAsset) =>
                currentAsset.id === asset.id
                  ? { ...currentAsset, originalWidth: image.naturalWidth, originalHeight: image.naturalHeight }
                  : currentAsset,
              ),
            );
          image.src = reader.result;
        };

        reader.readAsDataURL(file);
      } else {
        setUploadedAssets((current) => [...current, asset]);
      }
    });
  };

  const handleUploadedAssetSelect = (asset: UploadedAsset) => {
    if (!asset.preview || !asset.originalWidth || !asset.originalHeight) return;
    addImage(asset.preview, asset.originalWidth, asset.originalHeight);
  };

  const handleCalligraphySelect = (id: number, source: string) => {
    const canvasSource = resolveCanvasAssetUrl(source);
    setIsCalligraphyImageError(false);
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => {
      setActiveCalligraphy(id);
      addImage(canvasSource, image.naturalWidth, image.naturalHeight);
    };
    image.onerror = () => setIsCalligraphyImageError(true);
    image.src = canvasSource;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) addUploadedFiles(event.target.files);
    event.target.value = '';
  };

  const handleUploadDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingUpload(false);
    if (event.dataTransfer.files?.length) addUploadedFiles(event.dataTransfer.files);
  };

  const panelTitle =
    activeTool === 'template'
      ? '템플릿 선택'
      : activeTool === 'upload'
        ? '이미지 / 로고'
        : activeTool === 'frame'
          ? '프레임 / 모양틀'
          : activeTool === 'calligraphy'
            ? '캘리그라피'
            : activeToolLabel;

  return (
    <div className='flex h-full shrink-0 p-1.5 pr-0'>
      <nav
        aria-label='에디터 도구'
        className='flex h-full w-14 shrink-0 flex-col items-center rounded-lg border border-neutral-200 bg-white pt-2'>
        {tools.map(({ id, label, icon: Icon }) => {
          const isActive = activeTool === id;

          return (
            <button
              key={id}
              type='button'
              aria-pressed={isActive}
              aria-expanded={isActive && isPanelOpen}
              aria-controls='canvas-editor-left-panel'
              onClick={() => handleToolClick(id)}
              className={cn(
                'flex w-10 cursor-pointer flex-col items-center justify-center gap-1 rounded-md p-2 text-xs leading-[18px] transition-colors',
                isActive
                  ? 'bg-neutral-100 font-medium text-neutral-950'
                  : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700',
              )}>
              <Icon className='size-5' weight='duotone' aria-hidden />
              <span className='whitespace-nowrap'>{label}</span>
            </button>
          );
        })}
      </nav>

      <div
        id='canvas-editor-left-panel'
        aria-hidden={!isPanelOpen}
        inert={!isPanelOpen}
        className={cn(
          'h-full shrink-0 overflow-hidden transition-[width,margin,opacity] duration-200 ease-in-out',
          isPanelOpen ? 'ml-1.5 w-[272px] opacity-100' : 'pointer-events-none ml-0 w-0 opacity-0',
        )}>
        <aside className='flex h-full w-[272px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white'>
          <header className='flex h-12 shrink-0 items-center px-3'>
            <h2 className='text-md font-semibold text-neutral-950'>{panelTitle}</h2>
          </header>

          {activeTool === 'template' ? (
            <div className='grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-3 pt-0'>
              {isTemplateLoading && (
                <>
                  {Array.from({ length: 8 }, (_, index) => (
                    <TemplateCardSkeleton key={index} />
                  ))}
                  <span className='sr-only'>템플릿을 불러오는 중입니다.</span>
                </>
              )}

              {!isTemplateLoading && isTemplateError && (
                <p className='col-span-2 px-2 py-2 text-center text-xs leading-5 text-neutral-400'>
                  API 템플릿을 불러오지 못했습니다.
                </p>
              )}

              {!isTemplateLoading && !isTemplateError && sidebarTemplates.length === 0 && <FreeEditSettings />}

              {!isTemplateLoading &&
                sidebarTemplates.map((template) => {
                  const isActive = activeTemplate === template.id;
                  const isApplying = loadingTemplateId === template.id;

                  return (
                    <button
                      key={template.id}
                      type='button'
                      aria-pressed={isActive}
                      disabled={Boolean(loadingTemplateId)}
                      onClick={() => handleTemplateSelect(template)}
                      className='group flex min-w-0 cursor-pointer flex-col items-start gap-1 text-left'>
                      <span
                        className={cn(
                          'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100 p-4 transition',
                          isActive ? 'bg-neutral-100' : 'group-hover:ring-1 group-hover:ring-neutral-300',
                        )}>
                        {template.preview ? (
                          <img
                            src={template.preview}
                            alt=''
                            className='h-full w-full object-contain'
                            draggable={false}
                            aria-hidden
                          />
                        ) : (
                          <TemplateCardSkeleton showLabel={false} />
                        )}
                        {isApplying && (
                          <span className='absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-neutral-500'>
                            적용 중
                          </span>
                        )}
                      </span>
                      <span className='w-full px-1.5 text-xs leading-[18px] text-neutral-950'>{template.label}</span>
                    </button>
                  );
                })}
            </div>
          ) : activeTool === 'background' ? (
            <BackgroundTabContent />
          ) : activeTool === 'layer' ? (
            <div className='flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-1'>
              {orderedEditorLayers.map((layer, index) => {
                const isVisible = layer.visible;
                const label = getLayerLabel(layer);
                const isSelectable =
                  layer.type !== ObjectType.IMAGE || layer.field === 'image_frame' || Boolean(layer.interactive);
                const isTopLayer = index === 0;
                const isBottomLayer = index === orderedEditorLayers.length - 1;

                return (
                  <div
                    key={layer.id}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-md p-2',
                      selectedId === layer.id && 'bg-neutral-100',
                      !isVisible && 'text-neutral-400',
                    )}>
                    <button
                      type='button'
                      disabled={isTopLayer}
                      className='flex size-4 shrink-0 cursor-pointer items-center justify-center hover:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-30'
                      aria-label={`${label} 레이어 앞으로 이동`}
                      onClick={() => reorderObject(layer.id, 'up')}>
                      <CaretUpIcon className='size-4' aria-hidden />
                    </button>
                    <button
                      type='button'
                      disabled={isBottomLayer}
                      className='flex size-4 shrink-0 cursor-pointer items-center justify-center hover:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-30'
                      aria-label={`${label} 레이어 뒤로 이동`}
                      onClick={() => reorderObject(layer.id, 'down')}>
                      <CaretDownIcon className='size-4' aria-hidden />
                    </button>
                    <button
                      type='button'
                      disabled={!isSelectable}
                      className='flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left disabled:cursor-default'
                      aria-label={`${label} 레이어 선택`}
                      aria-pressed={selectedId === layer.id}
                      onClick={() => selectObject(layer.id)}>
                      <HashStraightIcon className='mt-px size-4 shrink-0' aria-hidden />
                      <span className='min-w-0 flex-1 truncate text-xs leading-[18px]'>{label}</span>
                    </button>
                    <button
                      type='button'
                      className='flex size-4 shrink-0 cursor-pointer items-center justify-center hover:text-neutral-500'
                      aria-label={`${label} ${isVisible ? '숨기기' : '표시하기'}`}
                      aria-pressed={isVisible}
                      onClick={() => handleLayerVisibilityToggle(layer)}>
                      {isVisible ? (
                        <EyeIcon className='size-4' weight='duotone' aria-hidden />
                      ) : (
                        <EyeSlashIcon className='size-4' weight='duotone' aria-hidden />
                      )}
                    </button>
                  </div>
                );
              })}
              {editorLayers.length === 0 && (
                <p className='px-2 py-4 text-center text-xs leading-5 text-neutral-400'>표시할 레이어가 없습니다.</p>
              )}
            </div>
          ) : activeTool === 'text' ? (
            selectedText ? (
              <TextTabContent object={selectedText} />
            ) : (
              <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-1'>
                <Button
                  variant='outline'
                  size='xs'
                  className='w-full rounded-full border-neutral-200 bg-white font-normal text-neutral-700 shadow-none hover:bg-neutral-100'
                  onClick={() => addText()}>
                  <PlusIcon className='size-4' aria-hidden />
                  텍스트 추가
                </Button>

                <div className='flex flex-col gap-1.5'>
                  {fontPreviews.map((font) => (
                    <button
                      key={font.id}
                      type='button'
                      aria-pressed={activeFont === font.id}
                      onClick={() => handleFontSelect(font)}
                      className='flex w-full cursor-pointer flex-col items-start justify-end gap-0.5 rounded-lg border border-neutral-200 bg-white p-2 text-left hover:bg-neutral-50'
                      style={{ fontFamily: fontPreviewStack(font.family) }}>
                      <span className='text-sm leading-5 text-neutral-500'>{font.name}</span>
                      <span className='text-md leading-6 font-bold text-neutral-950'>감사패 수여</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : activeTool === 'upload' ? (
            <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-1'>
              <div
                role='button'
                tabIndex={0}
                aria-label='이미지 또는 로고 파일 업로드'
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingUpload(true);
                }}
                onDragLeave={() => setIsDraggingUpload(false)}
                onDrop={handleUploadDrop}
                className={cn(
                  'flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-neutral-200 px-6 py-4 transition-colors',
                  isDraggingUpload && 'border-brand bg-red-50',
                )}>
                <div className='flex w-full flex-col items-center gap-3'>
                  <UploadFolderIllustration />
                  <div className='flex w-full flex-col items-center gap-1 text-sm leading-5'>
                    <p className='text-neutral-500'>
                      <span className='font-medium text-[#e60013]'>클릭하여</span> 파일을 드래그
                    </p>
                    <p className='w-full text-center text-neutral-500'>PNG · JPG · AI 지원</p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                accept='.png,.jpg,.jpeg,.ai,image/png,image/jpeg,application/postscript'
                multiple
                onChange={handleFileChange}
              />

              <div className='flex flex-col gap-1.5'>
                {uploadedAssets.map((asset) => (
                  <button
                    type='button'
                    key={asset.id}
                    disabled={!asset.preview || !asset.originalWidth || !asset.originalHeight}
                    onClick={() => handleUploadedAssetSelect(asset)}
                    className='flex w-full cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 text-left hover:bg-neutral-50 disabled:cursor-default disabled:hover:bg-white'>
                    {asset.preview ? (
                      <span className='size-12 shrink-0 overflow-hidden rounded-md bg-neutral-100' aria-hidden>
                        <img src={asset.preview} alt='' className='size-full object-contain' draggable={false} />
                      </span>
                    ) : (
                      <span className='relative size-8 shrink-0' aria-hidden>
                        <span className='absolute inset-y-0 right-[10%] left-[10%]'>
                          <img src={aiFilePage} alt='' className='absolute inset-0 size-full max-w-none' draggable={false} />
                        </span>
                        <span className='absolute inset-x-[10%] top-[57.5%] bottom-[15%] text-center text-[6px] leading-none font-bold text-white'>
                          {asset.badge}
                        </span>
                      </span>
                    )}
                    <span className='flex min-w-0 flex-col items-start gap-0.5 text-sm leading-5'>
                      <span className='max-w-full truncate font-bold text-neutral-950'>{asset.name}</span>
                      <span className='text-neutral-500'>{asset.type}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : activeTool === 'frame' ? (
            <div className='grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-3'>
              {frameShapes.map((frame) => (
                <button
                  key={frame.id}
                  type='button'
                  aria-label={frame.label}
                  aria-pressed={activeFrame === frame.id}
                  onClick={() => {
                    setActiveFrame(frame.id);
                    addShape(frame.shapeType);
                  }}
                  className='flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-neutral-100 p-4 transition hover:bg-neutral-200'>
                  <FrameShapePreview id={frame.id} />
                </button>
              ))}
            </div>
          ) : activeTool === 'calligraphy' ? (
            <div className='flex min-h-0 flex-1 flex-col gap-2 p-3'>
              <div className='relative'>
                <MagnifyingGlassIcon className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-neutral-400' />
                <Input
                  value={calligraphySearch}
                  onChange={(event) => setCalligraphySearch(event.target.value)}
                  placeholder='검색'
                  aria-label='캘리그라피 검색'
                  className='h-8 border-neutral-200 bg-white pl-8 shadow-none'
                />
              </div>
              <Select value={calligraphyType} onValueChange={(value) => setCalligraphyType(value as CalligraphyType)}>
                <SelectTrigger className='h-8 w-full border-neutral-200 bg-white shadow-none' aria-label='캘리그라피 유형 필터'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position='popper' align='start' className='w-(--radix-select-trigger-width)'>
                  <SelectItem value='calligraphy'>캘리그라피</SelectItem>
                  <SelectItem value='smog_only'>스모그 전용</SelectItem>
                  <SelectItem value='wood_case_gold_only'>목함·순금 전용</SelectItem>
                </SelectContent>
              </Select>

              <div className='grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pt-1 pr-1'>
                {isCalligraphyImageError && (
                  <p role='alert' className='col-span-2 py-2 text-center text-xs text-red-500'>
                    캘리그라피 이미지를 불러오지 못했습니다. 다시 시도해 주세요.
                  </p>
                )}
                {isCalligraphyLoading &&
                  Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className='aspect-square animate-pulse rounded-lg bg-slate-300' />
                  ))}
                {!isCalligraphyLoading && isCalligraphyError && (
                  <p className='col-span-2 py-6 text-center text-xs text-red-500'>캘리그라피를 불러오지 못했습니다.</p>
                )}
                {!isCalligraphyLoading && !isCalligraphyError && calligraphies.length === 0 && (
                  <p className='col-span-2 py-6 text-center text-xs text-neutral-400'>표시할 캘리그라피가 없습니다.</p>
                )}
                {!isCalligraphyLoading &&
                  calligraphies.map((item) => {
                    const source = resolveStorageUrl(item.image_url || item.image_path);
                    return (
                      <button
                        key={item.id}
                        type='button'
                        aria-label={item.text || item.type_label || `캘리그라피 ${item.id}`}
                        aria-pressed={activeCalligraphy === item.id}
                        onClick={() => handleCalligraphySelect(item.id, source)}
                        className={cn(
                          'flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-300 p-3 transition hover:ring-2 hover:ring-slate-400',
                          activeCalligraphy === item.id && 'ring-2 ring-neutral-950',
                        )}>
                        <img
                          src={source}
                          crossOrigin='anonymous'
                          alt=''
                          className='size-full object-contain'
                          loading='lazy'
                          draggable={false}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className='flex flex-1 items-center justify-center px-6 text-center text-xs leading-5 text-neutral-400'>
              {activeToolLabel} 도구를 선택했습니다.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
