import { resizePrintFrame } from './physicalPrintFrame';
import { prepareStageText } from '@/utils/helper/canvas-text-renderer';
import { resolveFontFamily, resolveFontWeight } from '@/utils/helper/editor-fonts';
import type { TemplateBackgroundTransform, TemplateLayer, TemplateShapeType } from '@/data/product-catalog/product-catalog.types';
import { useCanvasFonts } from '@/hooks/useCanvasFonts';
import { templateAssetUrl as toStorageUrl } from './templateAssetUrl';
import type Konva from 'konva';
import { Ellipse, Group as LayerGroup, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type DrawResult = {
  type: TemplateShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

type CutFrameChange = {
  x: number;
  y: number;
  width: number;
  height: number;
  deltaX?: number;
  deltaY?: number;
};

type CutFrameStart = {
  widthMm?: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TemplateCanvasViewState = {
  zoom: number;
  pan: { x: number; y: number };
};

export type TemplateSnapSettings = {
  grid: boolean;
  center: boolean;
  edges: boolean;
  objects: boolean;
  safeArea: boolean;
};

const cutResizeStarts = new WeakMap<Konva.Node, CutFrameStart>();

const formatMmLabel = (value?: number) => {
  if (value === undefined || Number.isNaN(Number(value))) return '';
  return String(Math.round(Number(value) * 10) / 10);
};

const POINT_TO_PIXEL = 96 / 72;
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5] as const;

export type TemplateCanvasHandle = {
  stage: () => Konva.Stage | null;
  contentSize: () => { width: number; height: number };
  toPreviewFile: (fileName?: string) => Promise<File>;
};

type Props = {
  layers: TemplateLayer[];
  canvasWidth: number;
  canvasHeight: number;
  bleed: number;
  safeMarginMm: number;
  cutOffset?: { x: number | null; y: number | null };
  cutFrameSize?: { width: number | null; height: number | null };
  pageWidthMm?: number;
  pageHeightMm?: number;
  safetyLabel?: string;
  foldLines: number;
  backgroundUrl?: string;
  backgroundTransform?: TemplateBackgroundTransform;
  onBackgroundTransformChange?: (transform: TemplateBackgroundTransform) => void;
  selectedIds: string[];
  interactive?: boolean;
  fixedScale?: number;
  drawingShape?: TemplateShapeType | null;
  gridEnabled?: boolean;
  onGridToggle?: () => void;
  snapSettings?: TemplateSnapSettings;
  viewState?: TemplateCanvasViewState;
  onViewStateChange?: (state: TemplateCanvasViewState) => void;
  onSelect?: (id: string | null, additive?: boolean) => void;
  onMarqueeSelect?: (ids: string[]) => void;
  onPasteAt?: (position: { x: number; y: number }) => void;
  onChange?: (id: string, patch: Partial<TemplateLayer>) => void;
  onChanges?: (patches: Array<{ id: string; patch: Partial<TemplateLayer> }>) => void;
  onDraw?: (result: DrawResult) => void;
  onCutOffsetChange?: (offset: { x: number; y: number; deltaX?: number; deltaY?: number }) => void;
  onCutResizeChange?: (frame: CutFrameChange) => void;
  onCutActiveChange?: (active: boolean) => void;
  onCutInteractionStart?: () => void;
  onCutInteractionEnd?: () => void;
};

const Checkerboard = ({ layer }: { layer: TemplateLayer }) => (
  <>
    <Rect width={layer.width} height={layer.height} fill='#f1f5f9' />
    <Line points={[0, 0, layer.width, layer.height]} stroke='#cbd5e1' />
    <Line points={[layer.width, 0, 0, layer.height]} stroke='#cbd5e1' />
  </>
);

const ImageClip = ({ layer, children }: { layer: TemplateLayer; children: ReactNode }) => (
  <LayerGroup
    clipFunc={(context) => {
      context.beginPath();
      if (layer.mask_shape === 'circle') {
        context.ellipse(layer.width / 2, layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
      } else {
        context.rect(0, 0, layer.width, layer.height);
      }
      context.closePath();
    }}>
    {children}
  </LayerGroup>
);

const ImageNode = ({ layer }: { layer: TemplateLayer }) => {
  const [image] = useImage(toStorageUrl(layer.image_url), 'anonymous');
  const [maskImage] = useImage(toStorageUrl(layer.mask_image_url), 'anonymous');
  const maskedImage = useMemo(() => {
    if (!maskImage || layer.mask_shape !== 'custom' || typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(layer.width));
    canvas.height = Math.max(1, Math.round(layer.height));
    const context = canvas.getContext('2d');
    if (!context) return null;
    const drawFullWidth = (target: CanvasRenderingContext2D, source: HTMLImageElement | HTMLCanvasElement) => {
      const sourceRatio = source.width / Math.max(source.height, 1);
      const renderWidth = canvas.width;
      const renderHeight = canvas.width / Math.max(sourceRatio, 0.01);
      target.drawImage(source, (canvas.width - renderWidth) / 2, (canvas.height - renderHeight) / 2, renderWidth, renderHeight);
    };
    const rawMaskCanvas = document.createElement('canvas');
    rawMaskCanvas.width = canvas.width;
    rawMaskCanvas.height = canvas.height;
    const rawMaskContext = rawMaskCanvas.getContext('2d');
    if (!rawMaskContext) return null;
    rawMaskContext.drawImage(maskImage, 0, 0, canvas.width, canvas.height);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskContext = maskCanvas.getContext('2d');
    if (!maskContext) return null;

    try {
      const imageData = rawMaskContext.getImageData(0, 0, rawMaskCanvas.width, rawMaskCanvas.height);
      const data = imageData.data;
      const cornerIndexes = [
        0,
        (rawMaskCanvas.width - 1) * 4,
        rawMaskCanvas.width * (rawMaskCanvas.height - 1) * 4,
        (rawMaskCanvas.width * rawMaskCanvas.height - 1) * 4,
      ];
      const cornerAlpha = cornerIndexes.reduce((sum, index) => sum + data[index + 3], 0) / Math.max(1, cornerIndexes.length);
      const cornerLuminance =
        cornerIndexes.reduce((sum, index) => sum + (data[index] + data[index + 1] + data[index + 2]) / 3, 0) /
        Math.max(1, cornerIndexes.length);
      const hasTransparentOutside = cornerAlpha < 32;
      const invertLuminance = !hasTransparentOutside && cornerLuminance > 160;
      let minX = rawMaskCanvas.width;
      let minY = rawMaskCanvas.height;
      let maxX = -1;
      let maxY = -1;

      for (let index = 0; index < data.length; index += 4) {
        const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
        const colorDistance = Math.abs(luminance - cornerLuminance);
        const alpha = hasTransparentOutside
          ? data[index + 3]
          : colorDistance < 18
            ? 0
            : invertLuminance
              ? 255 - luminance
              : luminance;
        const pixel = index / 4;
        const x = pixel % rawMaskCanvas.width;
        const y = Math.floor(pixel / rawMaskCanvas.width);
        if (alpha > 24) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
        data[index + 3] = Math.max(0, Math.min(255, alpha));
      }
      rawMaskContext.putImageData(imageData, 0, 0);
      if (maxX >= minX && maxY >= minY) {
        const padding = 2;
        const sourceX = Math.max(0, minX - padding);
        const sourceY = Math.max(0, minY - padding);
        const sourceWidth = Math.min(rawMaskCanvas.width - sourceX, maxX - minX + padding * 2 + 1);
        const sourceHeight = Math.min(rawMaskCanvas.height - sourceY, maxY - minY + padding * 2 + 1);
        maskContext.drawImage(
          rawMaskCanvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          maskCanvas.width,
          maskCanvas.height,
        );
      } else {
        maskContext.drawImage(rawMaskCanvas, 0, 0);
      }
    } catch {
      // If the browser marks the mask image as tainted, fall back to the source alpha channel.
      maskContext.drawImage(rawMaskCanvas, 0, 0);
    }

    if (image) {
      drawFullWidth(context, image);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(maskCanvas, 0, 0);
    } else {
      context.fillStyle = '#e2e8f0';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(maskCanvas, 0, 0);
    }
    context.globalCompositeOperation = 'source-over';
    return canvas;
  }, [image, layer.height, layer.mask_shape, layer.width, maskImage]);
  if (maskedImage) return <KonvaImage image={maskedImage} width={layer.width} height={layer.height} />;
  if (layer.mask_shape === 'custom') return <Checkerboard layer={layer} />;
  if (!image)
    return (
      <ImageClip layer={layer}>
        <Checkerboard layer={layer} />
      </ImageClip>
    );
  if (layer.mask_shape === 'none') return <KonvaImage image={image} width={layer.width} height={layer.height} />;

  const imageRatio = image.width / Math.max(image.height, 1);
  const renderWidth = layer.width;
  const renderHeight = layer.width / Math.max(imageRatio, 0.01);
  const renderX = (layer.width - renderWidth) / 2;
  const renderY = (layer.height - renderHeight) / 2;

  return (
    <ImageClip layer={layer}>
      <KonvaImage image={image} x={renderX} y={renderY} width={renderWidth} height={renderHeight} />
    </ImageClip>
  );
};

const ShapeNode = ({ layer }: { layer: TemplateLayer }) => {
  const [fillImage] = useImage(toStorageUrl(layer.fill_image_url), 'anonymous');
  const common = {
    fill: fillImage ? undefined : layer.color,
    fillPatternImage: fillImage,
    fillPatternRepeat: 'no-repeat' as const,
    fillPatternScaleX: fillImage ? layer.width / Math.max(fillImage.width, 1) : undefined,
    fillPatternScaleY: fillImage ? layer.height / Math.max(fillImage.height, 1) : undefined,
    stroke: layer.stroke_color,
    strokeWidth: layer.stroke_width,
  };
  if (layer.shape_type === 'ellipse')
    return <Ellipse x={layer.width / 2} y={layer.height / 2} radiusX={layer.width / 2} radiusY={layer.height / 2} {...common} />;
  if (layer.shape_type === 'roundedRectangle')
    return <Rect width={layer.width} height={layer.height} cornerRadius={12} {...common} />;
  if (layer.shape_type === 'doubleRectangle')
    return (
      <>
        <Rect width={layer.width} height={layer.height} {...common} />
        <Rect
          x={3}
          y={3}
          width={Math.max(0, layer.width - 6)}
          height={Math.max(0, layer.height - 6)}
          {...common}
          fill='transparent'
          fillPatternImage={undefined}
        />
      </>
    );
  if (layer.shape_type === 'star') {
    const points = Array.from({ length: 10 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const radius = index % 2 === 0 ? 1 : 0.42;
      return [
        layer.width / 2 + (Math.cos(angle) * layer.width * radius) / 2,
        layer.height / 2 + (Math.sin(angle) * layer.height * radius) / 2,
      ];
    }).flat();
    return <Line points={points} closed lineJoin='round' {...common} />;
  }
  if (layer.shape_type === 'triangle' || layer.shape_type === 'polygon') {
    const sides = layer.shape_type === 'triangle' ? 3 : Math.max(3, Math.min(12, layer.polygon_sides));
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / sides;
      return [layer.width / 2 + (Math.cos(angle) * layer.width) / 2, layer.height / 2 + (Math.sin(angle) * layer.height) / 2];
    }).flat();
    return <Line points={points} closed {...common} />;
  }
  if (layer.shape_type === 'line')
    return <Line points={[0, 0, layer.width, 0]} stroke={layer.stroke_color} strokeWidth={Math.max(1, layer.stroke_width)} />;
  return <Rect width={layer.width} height={layer.height} {...common} />;
};

const SnapGuides = ({
  vertical,
  horizontal,
  width,
  height,
}: {
  vertical: number[];
  horizontal: number[];
  width: number;
  height: number;
}) => (
  <>
    {vertical.map((x) => (
      <Line
        key={`v-${x}`}
        name='editor-only'
        points={[x, 0, x, height]}
        stroke='#0ea5e9'
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />
    ))}
    {horizontal.map((y) => (
      <Line
        key={`h-${y}`}
        name='editor-only'
        points={[0, y, width, y]}
        stroke='#0ea5e9'
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />
    ))}
  </>
);

export const TemplateCanvas = forwardRef<TemplateCanvasHandle, Props>(function TemplateCanvas(
  {
    layers,
    canvasWidth: storedCanvasWidth,
    canvasHeight: storedCanvasHeight,
    bleed,
    safeMarginMm,
    cutOffset,
    cutFrameSize,
    pageWidthMm,
    pageHeightMm,
    safetyLabel,
    foldLines,
    backgroundUrl,
    backgroundTransform = { x: 0, y: 0, scale: 1 },
    onBackgroundTransformChange,
    selectedIds,
    interactive = true,
    fixedScale,
    drawingShape,
    gridEnabled = false,
    onGridToggle,
    snapSettings = { grid: false, center: true, edges: true, objects: true, safeArea: true },
    viewState,
    onViewStateChange,
    onSelect,
    onMarqueeSelect,
    onPasteAt,
    onChange,
    onChanges,
    onDraw,
    onCutOffsetChange,
    onCutResizeChange,
    onCutActiveChange,
    onCutInteractionStart,
    onCutInteractionEnd,
  },
  ref,
) {
  const { t: tTemplate } = useTranslation('template');
  const [editingBackground, setEditingBackground] = useState(false);
  const backgroundRef = useRef<Konva.Image>(null);
  const backgroundBoundsRef = useRef<Konva.Rect>(null);
  const backgroundTransformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const fontKey = JSON.stringify(layers.filter((layer) => layer.type === 'text').map((layer) => layer));
  useCanvasFonts(stageRef, fontKey);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});
  const [container, setContainer] = useState({ width: 800, height: 600 });
  const [guides, setGuides] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });
  const [drawStart, setDrawStart] = useState<{ x: number; y: number }>();
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number }>();
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number }>();
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number }>();
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
  const [hoveredLayerBounds, setHoveredLayerBounds] = useState<{ width: number; height: number }>();
  const [backgroundImage] = useImage(backgroundUrl || '', 'anonymous');
  useEffect(() => {
    setEditingBackground(false);
  }, [backgroundUrl, drawingShape, interactive]);
  const updateCutLineActive = (active: boolean) => {
    onCutActiveChange?.(active);
  };
  const dragState = useRef<
    | {
        primaryId: string;
        start: { x: number; y: number };
        positions: Record<string, { x: number; y: number }>;
      }
    | undefined
  >(undefined);
  const backgroundRatio = backgroundImage
    ? backgroundImage.width / Math.max(backgroundImage.height, 1)
    : backgroundUrl
      ? 4 / 3
      : storedCanvasWidth / Math.max(storedCanvasHeight, 1);
  const hasCutLine = Boolean(backgroundImage) || (storedCanvasWidth > 0 && storedCanvasHeight > 0);
  const defaultBackgroundWidth = backgroundImage ? backgroundImage.width : backgroundUrl ? 560 : storedCanvasWidth + bleed * 2;
  const defaultBackgroundHeight = backgroundImage
    ? backgroundImage.height
    : backgroundUrl
      ? defaultBackgroundWidth / Math.max(backgroundRatio, 0.1)
      : storedCanvasHeight + bleed * 2;
  const backgroundFrameWidth = Math.max(1, defaultBackgroundWidth);
  const backgroundFrameHeight = Math.max(1, defaultBackgroundHeight);
  const defaultCutFrame = backgroundImage
    ? pageWidthMm && pageHeightMm && pageWidthMm > 0 && pageHeightMm > 0
      ? { width: backgroundFrameWidth * 0.8, height: (backgroundFrameWidth * 0.8 * pageHeightMm) / pageWidthMm }
      : { width: backgroundFrameWidth * 0.8, height: backgroundFrameHeight * 0.8 }
    : { width: storedCanvasWidth, height: storedCanvasHeight };
  // Explicit stored frames retain their geometry until the user edits them.
  const canvasWidth = Math.max(1, cutFrameSize?.width ?? defaultCutFrame.width);
  const canvasHeight = Math.max(1, cutFrameSize?.height ?? defaultCutFrame.height);
  const defaultCutOffsetX = backgroundUrl ? Math.max(0, (backgroundFrameWidth - canvasWidth) / 2) : bleed;
  const defaultCutOffsetY = backgroundUrl ? Math.max(0, (backgroundFrameHeight - canvasHeight) / 2) : bleed;
  const cutOffsetX = Math.max(0, cutOffset?.x ?? defaultCutOffsetX);
  const cutOffsetY = Math.max(0, cutOffset?.y ?? defaultCutOffsetY);
  // Grow the working surface without stretching the background or artwork.
  const artLeft = Math.min(0, backgroundTransform.x);
  const artTop = Math.min(0, backgroundTransform.y);
  const artRight = Math.max(
    backgroundFrameWidth,
    cutOffsetX + canvasWidth,
    backgroundTransform.x + backgroundFrameWidth * backgroundTransform.scale,
  );
  const artBottom = Math.max(
    backgroundFrameHeight,
    cutOffsetY + canvasHeight,
    backgroundTransform.y + backgroundFrameHeight * backgroundTransform.scale,
  );
  const artWidth = artRight - artLeft;
  const artHeight = artBottom - artTop;
  const maxCutOffsetX = Math.max(0, artRight - canvasWidth);
  const maxCutOffsetY = Math.max(0, artBottom - canvasHeight);
  const cutLabel = hasCutLine
    ? `${formatMmLabel(pageWidthMm ?? Math.round(canvasWidth))} × ${formatMmLabel(pageHeightMm ?? Math.round(canvasHeight))} mm`
    : '';
  const cutLabelScreenWidth = Math.max(88, cutLabel.length * 9 + 12);
  const safeLabelText = safetyLabel || 'Safe line';
  const safeLabelWidth = Math.max(46, safeLabelText.length * 12 + 8);
  // Layer geometry uses the cutline's vertical scale as the canonical mm-to-pixel
  // conversion. Apply the same single scale on both axes so a safety margin is
  // visually equal on all four sides even if the visual frame ratio differs from
  // its business width/height metadata.
  const safeArea = pageHeightMm && pageHeightMm > 0 ? (safeMarginMm / pageHeightMm) * canvasHeight : 0;
  const safeAreaX = Math.min(canvasWidth / 2, safeArea);
  const safeAreaY = Math.min(canvasHeight / 2, safeArea);
  const safeRectWidth = Math.max(0, canvasWidth - safeAreaX * 2);
  const safeRectHeight = Math.max(0, canvasHeight - safeAreaY * 2);
  const guideTopPadding = 14;
  const guideRightPadding = Math.max(96, safeLabelWidth + 28);
  const stageWidth = artWidth + guideRightPadding;
  const stageHeight = artHeight + guideTopPadding;
  const canvasOffsetX = -artLeft;
  const canvasOffsetY = guideTopPadding - artTop;
  const viewportWidth = fixedScale ? stageWidth * fixedScale : Math.max(360, container.width);
  const viewportHeight = fixedScale ? stageHeight * fixedScale : 540;
  const baseScale =
    fixedScale ||
    Math.max(0.2, Math.min(3, (viewportWidth - 48) / Math.max(artWidth, 1), (viewportHeight - 48) / Math.max(stageHeight, 1)));
  const fontRenderScale =
    storedCanvasWidth > 0 && storedCanvasHeight > 0
      ? Math.max(0.1, Math.min(canvasWidth / storedCanvasWidth, canvasHeight / storedCanvasHeight))
      : 1 / Math.max(baseScale, 0.01);
  const [localViewState, setLocalViewState] = useState<TemplateCanvasViewState>({ zoom: 1, pan: { x: 0, y: 0 } });
  const currentViewState = viewState || localViewState;
  const zoom = currentViewState.zoom;
  const pan = currentViewState.pan;
  const updateViewState = useCallback(
    (next: TemplateCanvasViewState) => {
      if (!viewState) setLocalViewState(next);
      onViewStateChange?.(next);
    },
    [onViewStateChange, viewState],
  );
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panState = useRef<{ pointer: { x: number; y: number }; pan: { x: number; y: number }; moved: boolean } | undefined>(
    undefined,
  );
  const cutDragLast = useRef<{ x: number; y: number } | undefined>(undefined);
  const scale = baseScale * zoom;
  const inverseScale = 1 / Math.max(scale, 0.01);
  // Labels, hit areas and handles are viewport UI and remain screen-stable.
  // Cut/safe strokes belong to the artwork, so they scale with the canvas.
  const cutHandleSize = 6 * inverseScale;
  const cutHitSize = 18 * inverseScale;
  const cutLabelWidth = cutLabelScreenWidth * inverseScale;
  const cutLabelHeight = 22 * inverseScale;
  const cutLabelTextInset = 6 * inverseScale;
  const cutLabelFontSize = 16 * inverseScale;
  const guideStrokeWidth = 2.5;
  const guideDash = [10, 7];
  const safeLabelRenderWidth = safeLabelWidth * inverseScale;
  const safeLabelHeight = 22 * inverseScale;
  const safeLabelFontSize = 16 * inverseScale;
  const safeLabelGap = 26 * inverseScale;
  const centeredOrigin = {
    x: Math.max(24, (viewportWidth - artWidth * scale) / 2),
    y: Math.max(24, (viewportHeight - stageHeight * scale) / 2),
  };
  const viewportOrigin = {
    x: centeredOrigin.x + pan.x,
    y: centeredOrigin.y + pan.y,
  };

  useImperativeHandle(
    ref,
    () => ({
      stage: () => stageRef.current,
      contentSize: () => ({ width: canvasWidth, height: canvasHeight }),
      toPreviewFile: async (fileName = 'template-preview.png') => {
        const stage = stageRef.current;
        if (!stage) throw new Error('Template canvas is not ready.');
        await prepareStageText(stage);

        // Export at the artwork's natural pixel size, independent of editor zoom/pan.
        const editorNodes = stage.find('.editor-only');
        const backgroundNodes = stage.find('.preview-background');
        const previewSurfaceNodes = stage.find('.preview-surface');
        editorNodes.forEach((node) => node.hide());
        backgroundNodes.forEach((node) => node.hide());
        previewSurfaceNodes.forEach((node) => node.show());
        stage.batchDraw();
        try {
          const canvas = stage.toCanvas({
            x: viewportOrigin.x + (canvasOffsetX + cutOffsetX) * scale,
            y: viewportOrigin.y + (canvasOffsetY + cutOffsetY) * scale,
            width: canvasWidth * scale,
            height: canvasHeight * scale,
            pixelRatio: 1 / Math.max(scale, 0.01),
          });
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob(
              (value) => (value ? resolve(value) : reject(new Error('Unable to render template preview.'))),
              'image/png',
            ),
          );
          return new File([blob], fileName, { type: 'image/png' });
        } finally {
          editorNodes.forEach((node) => node.show());
          backgroundNodes.forEach((node) => node.show());
          previewSurfaceNodes.forEach((node) => node.hide());
          stage.batchDraw();
        }
      },
    }),
    [canvasHeight, canvasOffsetX, canvasOffsetY, canvasWidth, cutOffsetX, cutOffsetY, scale, viewportOrigin.x, viewportOrigin.y],
  );

  useEffect(() => {
    if (fixedScale || !containerRef.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setContainer({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fixedScale]);

  useEffect(() => {
    if (!interactive || !onCutResizeChange || !hasCutLine) return;
    // Cutline geometry is shared by front/back. Switching to a side without a
    // background must not clamp the existing frame to that side's fallback
    // canvas and write the smaller values back into the template form.
    const hasStoredFrame =
      cutOffset?.x != null && cutOffset?.y != null && cutFrameSize?.width != null && cutFrameSize?.height != null;
    if (hasStoredFrame) return;
    // Wait for the real image dimensions. Persisting the temporary fallback
    // frame would make the cutline jump after the image finishes loading.
    if (backgroundUrl && !backgroundImage) return;

    const x = cutOffsetX;
    const y = cutOffsetY;
    const width = canvasWidth;
    const height = canvasHeight;
    const positionIsCurrent = cutOffset?.x === x && cutOffset?.y === y;
    const sizeIsCurrent = cutFrameSize?.width === width && cutFrameSize?.height === height;
    if (positionIsCurrent && sizeIsCurrent) return;

    onCutResizeChange({ x, y, width, height, deltaX: 0, deltaY: 0 });
  }, [
    backgroundImage,
    backgroundUrl,
    canvasHeight,
    canvasWidth,
    cutFrameSize?.height,
    cutFrameSize?.width,
    cutOffset?.x,
    cutOffset?.y,
    cutOffsetX,
    cutOffsetY,
    hasCutLine,
    interactive,
    onCutResizeChange,
  ]);

  useEffect(() => {
    if (!interactive || !transformerRef.current) return;
    const nodes = selectedIds.map((id) => nodeRefs.current[id]).filter(Boolean) as Konva.Node[];
    transformerRef.current.nodes(nodes.filter((node) => !layers.find((item) => item.layer_id === node.id())?.locked));
    transformerRef.current.getLayer()?.batchDraw();
  }, [interactive, layers, selectedIds]);

  const singleTextSelected =
    selectedIds.length === 1 && layers.find((layer) => layer.layer_id === selectedIds[0])?.type === 'text';

  const snapNode = useCallback(
    (node: Konva.Node, layer: TemplateLayer) => {
      if (snapSettings.grid) {
        node.position({ x: Math.round(node.x() / 10) * 10, y: Math.round(node.y() / 10) * 10 });
      }
      const vertical: number[] = [];
      const horizontal: number[] = [];
      if (snapSettings.center) {
        vertical.push(canvasWidth / 2);
        horizontal.push(canvasHeight / 2);
      }
      if (snapSettings.edges) {
        vertical.push(0, canvasWidth);
        horizontal.push(0, canvasHeight);
      }
      if (snapSettings.safeArea && (safeAreaX || safeAreaY)) {
        vertical.push(safeAreaX, canvasWidth - safeAreaX);
        horizontal.push(safeAreaY, canvasHeight - safeAreaY);
      }
      if (snapSettings.objects) {
        layers
          .filter((item) => item.visible && item.layer_id !== layer.layer_id && !selectedIds.includes(item.layer_id))
          .forEach((item) => {
            vertical.push(item.position_x, item.position_x + item.width / 2, item.position_x + item.width);
            horizontal.push(item.position_y, item.position_y + item.height / 2, item.position_y + item.height);
          });
      }
      const xValues = [node.x(), node.x() + layer.width / 2, node.x() + layer.width];
      const yValues = [node.y(), node.y() + layer.height / 2, node.y() + layer.height];
      let x = node.x();
      let y = node.y();
      let verticalGuides: number[] = [];
      let horizontalGuides: number[] = [];
      const threshold = 8 * inverseScale;
      for (const target of vertical) {
        const index = xValues.findIndex((value) => Math.abs(value - target) <= threshold);
        if (index >= 0) {
          x += target - xValues[index];
          verticalGuides = [target];
          break;
        }
      }
      for (const target of horizontal) {
        const index = yValues.findIndex((value) => Math.abs(value - target) <= threshold);
        if (index >= 0) {
          y += target - yValues[index];
          horizontalGuides = [target];
          break;
        }
      }
      node.position({ x, y });
      setGuides({ vertical: verticalGuides, horizontal: horizontalGuides });
    },
    [canvasHeight, canvasWidth, inverseScale, layers, safeAreaX, safeAreaY, selectedIds, snapSettings],
  );

  const contentPointer = () => {
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    return {
      x: (pointer.x - viewportOrigin.x) / scale - canvasOffsetX - cutOffsetX,
      y: (pointer.y - viewportOrigin.y) / scale - canvasOffsetY - cutOffsetY,
    };
  };

  const setZoomAtPointer = (nextZoom: number, pointer?: { x: number; y: number }) => {
    const clampedZoom = Math.max(0.25, Math.min(5, nextZoom));
    const target = pointer || { x: viewportWidth / 2, y: viewportHeight / 2 };
    const world = {
      x: (target.x - viewportOrigin.x) / scale,
      y: (target.y - viewportOrigin.y) / scale,
    };
    const nextScale = baseScale * clampedZoom;
    const nextCenteredOrigin = {
      x: Math.max(24, (viewportWidth - artWidth * nextScale) / 2),
      y: Math.max(24, (viewportHeight - stageHeight * nextScale) / 2),
    };
    updateViewState({
      zoom: clampedZoom,
      pan: {
        x: target.x - world.x * nextScale - nextCenteredOrigin.x,
        y: target.y - world.y * nextScale - nextCenteredOrigin.y,
      },
    });
  };

  const resetViewport = () => {
    updateViewState({ zoom: 1, pan: { x: 0, y: 0 } });
  };

  useEffect(() => {
    if (!interactive) return;
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (event.code === 'Escape') setEditingBackground(false);
      if (event.code === 'Space') {
        event.preventDefault();
        setSpacePressed(true);
      }
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpacePressed(false);
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [interactive]);

  const finishDraw = () => {
    if (!drawingShape || !drawStart || !drawEnd || !onDraw) return;
    const dx = drawEnd.x - drawStart.x;
    const dy = drawEnd.y - drawStart.y;
    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
    if (drawingShape === 'line') {
      onDraw({
        type: drawingShape,
        x: drawStart.x,
        y: drawStart.y,
        width: Math.max(5, Math.hypot(dx, dy)),
        height: 1,
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
      });
    } else {
      onDraw({
        type: drawingShape,
        x: Math.min(drawStart.x, drawEnd.x),
        y: Math.min(drawStart.y, drawEnd.y),
        width: Math.max(5, Math.abs(dx)),
        height: Math.max(5, Math.abs(dy)),
      });
    }
    setDrawStart(undefined);
    setDrawEnd(undefined);
  };

  const finishMarquee = () => {
    if (!marqueeStart || !marqueeEnd) return;
    const left = Math.min(marqueeStart.x, marqueeEnd.x);
    const right = Math.max(marqueeStart.x, marqueeEnd.x);
    const top = Math.min(marqueeStart.y, marqueeEnd.y);
    const bottom = Math.max(marqueeStart.y, marqueeEnd.y);
    if (right - left > 3 || bottom - top > 3) {
      onMarqueeSelect?.(
        layers
          .filter(
            (layer) =>
              !layer.locked &&
              layer.visible &&
              layer.position_x >= left &&
              layer.position_y >= top &&
              layer.position_x + layer.width <= right &&
              layer.position_y + layer.height <= bottom,
          )
          .map((layer) => layer.layer_id),
      );
    } else {
      onSelect?.(null);
    }
    setMarqueeStart(undefined);
    setMarqueeEnd(undefined);
  };

  const startLayerDrag = (node: Konva.Node, layerId: string) => {
    const ids = selectedIds.includes(layerId) ? selectedIds : [layerId];
    dragState.current = {
      primaryId: layerId,
      start: { x: node.x(), y: node.y() },
      positions: Object.fromEntries(
        ids.map((id) => {
          const target = nodeRefs.current[id];
          return [id, { x: target?.x() || 0, y: target?.y() || 0 }];
        }),
      ),
    };
  };

  const moveLayerDrag = (node: Konva.Node, layer: TemplateLayer) => {
    const drag = dragState.current;
    if (!drag || Object.keys(drag.positions).length <= 1) {
      snapNode(node, layer);
      return;
    }
    // Snap the primary node first, then apply the same delta to every selected
    // node so a multi-selection behaves as one rigid group.
    snapNode(node, layer);
    const dx = node.x() - drag.start.x;
    const dy = node.y() - drag.start.y;
    Object.entries(drag.positions).forEach(([id, position]) => {
      if (id === drag.primaryId) return;
      nodeRefs.current[id]?.position({ x: position.x + dx, y: position.y + dy });
    });
    node.getLayer()?.batchDraw();
  };

  const finishLayerDrag = (node: Konva.Node, layerId: string) => {
    const drag = dragState.current;
    const ids = drag ? Object.keys(drag.positions) : [layerId];
    const patches = ids.flatMap((id) => {
      const target = id === layerId ? node : nodeRefs.current[id];
      return target
        ? [{ id, patch: { position_x: Math.round(target.x()), position_y: Math.round(target.y()) } as Partial<TemplateLayer> }]
        : [];
    });
    if (onChanges) onChanges(patches);
    else patches.forEach(({ id, patch }) => onChange?.(id, patch));
    dragState.current = undefined;
    setGuides({ vertical: [], horizontal: [] });
  };

  const getResizedCutFrame = (
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    x: number,
    y: number,
    start: CutFrameStart,
  ) => {
    const frame = resizePrintFrame(corner, x, y, start);
    return { ...frame, deltaX: frame.x - cutOffsetX, deltaY: frame.y - cutOffsetY };
  };

  return (
    <div ref={containerRef} className='relative h-[540px] w-full overflow-hidden bg-slate-100'>
      {!fixedScale ? (
        <div className='absolute top-3 right-3 z-10 flex items-center gap-1 rounded-md border bg-white/90 p-1 text-xs shadow-sm'>
          {interactive && backgroundImage && onBackgroundTransformChange ? (
            <button
              type='button'
              aria-pressed={editingBackground}
              className={`rounded px-2 py-1 ${editingBackground ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'}`}
              onClick={() => {
                setEditingBackground((current) => !current);
                onSelect?.(null);
                updateCutLineActive(false);
              }}>
              {tTemplate('template.editor.move_background')}
            </button>
          ) : null}
          <button
            type='button'
            className='rounded px-2 py-1 hover:bg-slate-100'
            onClick={() => setZoomAtPointer([...ZOOM_LEVELS].reverse().find((level) => level < zoom - 0.001) ?? ZOOM_LEVELS[0])}
            aria-label='Zoom out'>
            -
          </button>
          <button type='button' className='min-w-12 rounded px-2 py-1 hover:bg-slate-100' onClick={resetViewport}>
            {Math.round(zoom * 100)}%
          </button>
          <button
            type='button'
            className='rounded px-2 py-1 hover:bg-slate-100'
            onClick={() =>
              setZoomAtPointer(ZOOM_LEVELS.find((level) => level > zoom + 0.001) ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1])
            }
            aria-label='Zoom in'>
            +
          </button>
          <select
            className='h-7 rounded border border-slate-200 bg-white px-1'
            aria-label='Zoom level'
            value={String(zoom)}
            onChange={(event) => setZoomAtPointer(Number(event.target.value))}>
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {Math.round(level * 100)}%
              </option>
            ))}
          </select>
          <button type='button' className='rounded px-2 py-1 hover:bg-slate-100' onClick={resetViewport} title='Fit view'>
            Fit
          </button>
          {onGridToggle ? (
            <button
              type='button'
              className={`rounded px-2 py-1 ${gridEnabled ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`}
              onClick={onGridToggle}
              title='Toggle grid'>
              Grid
            </button>
          ) : null}
        </div>
      ) : null}
      <div className='shadow-xl'>
        <Stage
          ref={stageRef}
          width={viewportWidth}
          height={viewportHeight}
          onWheel={(event) => {
            if (fixedScale || (!event.evt.ctrlKey && !event.evt.metaKey)) return;
            event.evt.preventDefault();
            const pointer = stageRef.current?.getPointerPosition() || undefined;
            setZoomAtPointer(zoom * (event.evt.deltaY > 0 ? 0.9 : 1.1), pointer);
          }}
          onMouseDown={(event) => {
            if (!interactive) return;
            if (editingBackground && !spacePressed) return;
            if (drawingShape) {
              const point = contentPointer();
              if (point) {
                setDrawStart(point);
                setDrawEnd(point);
              }
              return;
            }
            if (event.target === event.target.getStage() || event.target.hasName('canvas-background')) {
              updateCutLineActive(false);
              setHoveredLayerId(null);
              const pointer = stageRef.current?.getPointerPosition();
              if (pointer && spacePressed) {
                panState.current = { pointer, pan, moved: false };
                setIsPanning(true);
                return;
              }
              const point = contentPointer();
              if (point) {
                setMarqueeStart(point);
                setMarqueeEnd(point);
              }
            }
          }}
          onMouseMove={() => {
            if (isPanning) {
              const pointer = stageRef.current?.getPointerPosition();
              const state = panState.current;
              if (!pointer || !state) return;
              const dx = pointer.x - state.pointer.x;
              const dy = pointer.y - state.pointer.y;
              state.moved ||= Math.abs(dx) > 2 || Math.abs(dy) > 2;
              updateViewState({ zoom, pan: { x: state.pan.x + dx, y: state.pan.y + dy } });
              setMarqueeStart(undefined);
              setMarqueeEnd(undefined);
              return;
            }
            const point = contentPointer();
            if (!point) return;
            if (drawStart) setDrawEnd(point);
            if (marqueeStart) setMarqueeEnd(point);
          }}
          onMouseUp={() => {
            if (isPanning) {
              if (!panState.current?.moved) onSelect?.(null);
              panState.current = undefined;
              setIsPanning(false);
              setMarqueeStart(undefined);
              setMarqueeEnd(undefined);
              return;
            }
            if (drawStart) finishDraw();
            else finishMarquee();
          }}
          onContextMenu={(event) => {
            if (!interactive) return;
            event.evt.preventDefault();
            const point = contentPointer();
            if (point) onPasteAt?.(point);
          }}>
          <Layer listening={interactive} x={viewportOrigin.x} y={viewportOrigin.y} scaleX={scale} scaleY={scale}>
            <LayerGroup x={canvasOffsetX} y={canvasOffsetY}>
              <Rect
                name='canvas-background preview-background'
                x={artLeft}
                y={artTop}
                width={artWidth}
                height={artHeight}
                fill={backgroundUrl ? '#ffffff' : bleed > 0 ? '#fee2e2' : '#ffffff'}
              />
              {backgroundImage ? (
                <KonvaImage
                  ref={backgroundRef}
                  name='canvas-background preview-background'
                  image={backgroundImage}
                  x={backgroundTransform.x}
                  y={backgroundTransform.y}
                  width={backgroundFrameWidth * backgroundTransform.scale}
                  height={backgroundFrameHeight * backgroundTransform.scale}
                  listening={false}
                />
              ) : null}
              <Rect
                name='preview-surface'
                x={cutOffsetX}
                y={cutOffsetY}
                width={canvasWidth}
                height={canvasHeight}
                fill='#ffffff'
                visible={false}
                listening={false}
              />
              {hasCutLine ? (
                <>
                  <Rect
                    name='canvas-background preview-background'
                    x={cutOffsetX}
                    y={cutOffsetY}
                    width={canvasWidth}
                    height={canvasHeight}
                    fill={backgroundImage ? undefined : '#fff'}
                  />
                  <Rect
                    name='editor-only'
                    x={cutOffsetX}
                    y={cutOffsetY}
                    width={canvasWidth}
                    height={canvasHeight}
                    stroke='#ef4444'
                    strokeWidth={guideStrokeWidth}
                    dash={guideDash}
                    listening={false}
                  />
                  <Rect
                    name='editor-only'
                    x={Math.max(cutOffsetX + 2, cutOffsetX + canvasWidth - cutLabelWidth)}
                    y={Math.max(0, cutOffsetY - cutLabelHeight)}
                    width={cutLabelWidth}
                    height={cutLabelHeight}
                    fill='#ef4444'
                    listening={false}
                  />
                  <Text
                    name='editor-only'
                    x={Math.max(cutOffsetX + cutLabelTextInset, cutOffsetX + canvasWidth - cutLabelWidth + cutLabelTextInset)}
                    y={Math.max(inverseScale, cutOffsetY - cutLabelHeight + 2 * inverseScale)}
                    width={cutLabelWidth - cutLabelTextInset * 2}
                    height={cutLabelHeight - 2 * inverseScale}
                    text={cutLabel}
                    fontSize={cutLabelFontSize}
                    fontStyle='bold'
                    fill='#ffffff'
                    align='center'
                    listening={false}
                  />
                  {safeMarginMm > 0 ? (
                    <>
                      <Rect
                        name='editor-only'
                        x={cutOffsetX + safeAreaX}
                        y={cutOffsetY + safeAreaY}
                        width={safeRectWidth}
                        height={safeRectHeight}
                        stroke='#14b8a6'
                        strokeWidth={guideStrokeWidth}
                        dash={guideDash}
                        listening={false}
                      />
                      <Line
                        name='editor-only'
                        points={[
                          cutOffsetX + safeAreaX + safeRectWidth,
                          cutOffsetY + safeAreaY + safeLabelHeight / 2,
                          cutOffsetX + safeAreaX + safeRectWidth + safeLabelGap,
                          cutOffsetY + safeAreaY + safeLabelHeight / 2,
                        ]}
                        stroke='#14b8a6'
                        strokeWidth={guideStrokeWidth}
                        listening={false}
                      />
                      <Text
                        name='editor-only'
                        x={cutOffsetX + safeAreaX + safeRectWidth + safeLabelGap + 3 * inverseScale}
                        y={cutOffsetY + safeAreaY}
                        width={safeLabelRenderWidth}
                        height={safeLabelHeight}
                        text={safeLabelText}
                        fontSize={safeLabelFontSize}
                        fontStyle='bold'
                        fill='#14b8a6'
                        align='left'
                        listening={false}
                      />
                    </>
                  ) : null}
                  {Array.from({ length: foldLines }, (_, index) => (
                    <Line
                      key={index}
                      name='editor-only'
                      points={[
                        cutOffsetX + (canvasWidth * (index + 1)) / (foldLines + 1),
                        cutOffsetY,
                        cutOffsetX + (canvasWidth * (index + 1)) / (foldLines + 1),
                        cutOffsetY + canvasHeight,
                      ]}
                      stroke='#8b5cf6'
                      dash={[5, 4]}
                      listening={false}
                    />
                  ))}
                  {interactive && !editingBackground && onCutOffsetChange && !drawingShape ? (
                    <LayerGroup
                      name='editor-only'
                      x={cutOffsetX}
                      y={cutOffsetY}
                      draggable
                      onMouseDown={() => updateCutLineActive(true)}
                      onClick={() => updateCutLineActive(true)}
                      onDragStart={() => {
                        updateCutLineActive(true);
                        onCutInteractionStart?.();
                        cutDragLast.current = { x: cutOffsetX, y: cutOffsetY };
                      }}
                      onDragMove={(event) => {
                        const x = Math.min(Math.max(0, event.target.x()), maxCutOffsetX);
                        const y = Math.min(Math.max(0, event.target.y()), maxCutOffsetY);
                        const previous = cutDragLast.current || { x: cutOffsetX, y: cutOffsetY };
                        event.target.position({ x, y });
                        onCutOffsetChange({
                          x: Math.round(x),
                          y: Math.round(y),
                          deltaX: x - previous.x,
                          deltaY: y - previous.y,
                        });
                        cutDragLast.current = { x, y };
                      }}
                      onDragEnd={(event) => {
                        const x = Math.min(Math.max(0, event.target.x()), maxCutOffsetX);
                        const y = Math.min(Math.max(0, event.target.y()), maxCutOffsetY);
                        const previous = cutDragLast.current || { x: cutOffsetX, y: cutOffsetY };
                        event.target.position({ x, y });
                        onCutOffsetChange({
                          x: Math.round(x),
                          y: Math.round(y),
                          deltaX: x - previous.x,
                          deltaY: y - previous.y,
                        });
                        cutDragLast.current = undefined;
                        onCutInteractionEnd?.();
                      }}
                      onMouseEnter={(event) => {
                        const container = event.target.getStage()?.container();
                        if (container) container.style.cursor = 'move';
                      }}
                      onMouseLeave={(event) => {
                        const container = event.target.getStage()?.container();
                        if (container) container.style.cursor = '';
                      }}>
                      <Rect
                        name='cut-line-hit'
                        x={0}
                        y={-cutHitSize / 2}
                        width={canvasWidth}
                        height={cutHitSize}
                        fill='rgba(239,68,68,0.01)'
                      />
                      <Rect
                        name='cut-line-hit'
                        x={0}
                        y={canvasHeight - cutHitSize / 2}
                        width={canvasWidth}
                        height={cutHitSize}
                        fill='rgba(239,68,68,0.01)'
                      />
                      <Rect
                        name='cut-line-hit'
                        x={-cutHitSize / 2}
                        y={0}
                        width={cutHitSize}
                        height={canvasHeight}
                        fill='rgba(239,68,68,0.01)'
                      />
                      <Rect
                        name='cut-line-hit'
                        x={canvasWidth - cutHitSize / 2}
                        y={0}
                        width={cutHitSize}
                        height={canvasHeight}
                        fill='rgba(239,68,68,0.01)'
                      />
                    </LayerGroup>
                  ) : null}
                  {interactive && !editingBackground && onCutResizeChange && !drawingShape
                    ? (
                        [
                          ['top-left', cutOffsetX, cutOffsetY],
                          ['top-right', cutOffsetX + canvasWidth, cutOffsetY],
                          ['bottom-left', cutOffsetX, cutOffsetY + canvasHeight],
                          ['bottom-right', cutOffsetX + canvasWidth, cutOffsetY + canvasHeight],
                        ] as const
                      ).map(([corner, x, y]) => (
                        <Rect
                          key={corner}
                          name='editor-only'
                          x={x - cutHandleSize / 2}
                          y={y - cutHandleSize / 2}
                          width={cutHandleSize}
                          height={cutHandleSize}
                          fill='#ffffff'
                          stroke='#ef4444'
                          strokeWidth={1.5}
                          draggable
                          onDragStart={(event) => {
                            updateCutLineActive(true);
                            onCutInteractionStart?.();
                            cutResizeStarts.set(event.target, {
                              x: cutOffsetX,
                              y: cutOffsetY,
                              width: canvasWidth,
                              height: canvasHeight,
                              widthMm: pageWidthMm,
                            });
                          }}
                          onDragMove={(event) => {
                            const start = cutResizeStarts.get(event.target) || {
                              x: cutOffsetX,
                              y: cutOffsetY,
                              width: canvasWidth,
                              height: canvasHeight,
                              widthMm: pageWidthMm,
                            };
                            onCutResizeChange?.(
                              getResizedCutFrame(
                                corner,
                                event.target.x() + cutHandleSize / 2,
                                event.target.y() + cutHandleSize / 2,
                                start,
                              ),
                            );
                          }}
                          onDragEnd={(event) => {
                            const start = cutResizeStarts.get(event.target) || {
                              x: cutOffsetX,
                              y: cutOffsetY,
                              width: canvasWidth,
                              height: canvasHeight,
                              widthMm: pageWidthMm,
                            };
                            onCutResizeChange?.(
                              getResizedCutFrame(
                                corner,
                                event.target.x() + cutHandleSize / 2,
                                event.target.y() + cutHandleSize / 2,
                                start,
                              ),
                            );
                            cutResizeStarts.delete(event.target);
                            onCutInteractionEnd?.();
                          }}
                          onMouseEnter={(event) => {
                            const container = event.target.getStage()?.container();
                            if (container)
                              container.style.cursor = `${corner.includes('top') ? 'n' : 's'}${corner.includes('left') ? 'w' : 'e'}-resize`;
                          }}
                          onMouseLeave={(event) => {
                            const container = event.target.getStage()?.container();
                            if (container) container.style.cursor = '';
                          }}
                        />
                      ))
                    : null}
                </>
              ) : null}
            </LayerGroup>
          </Layer>
          <Layer listening={!editingBackground} x={viewportOrigin.x} y={viewportOrigin.y} scaleX={scale} scaleY={scale}>
            <LayerGroup x={canvasOffsetX + cutOffsetX} y={canvasOffsetY + cutOffsetY}>
              {gridEnabled
                ? Array.from({ length: Math.ceil(canvasWidth / 10) + 1 }, (_, index) => (
                    <Line
                      key={`grid-v-${index}`}
                      name='editor-only'
                      points={[index * 10, 0, index * 10, canvasHeight]}
                      stroke='#cbd5e1'
                      strokeWidth={0.5 * inverseScale}
                      listening={false}
                    />
                  ))
                : null}
              {gridEnabled
                ? Array.from({ length: Math.ceil(canvasHeight / 10) + 1 }, (_, index) => (
                    <Line
                      key={`grid-h-${index}`}
                      name='editor-only'
                      points={[0, index * 10, canvasWidth, index * 10]}
                      stroke='#cbd5e1'
                      strokeWidth={0.5 * inverseScale}
                      listening={false}
                    />
                  ))
                : null}
              {layers.map((layer) => (
                <KonvaNode
                  key={layer.layer_id}
                  layer={layer}
                  fontRenderScale={fontRenderScale}
                  nodeRef={(node) => {
                    nodeRefs.current[layer.layer_id] = node;
                  }}
                  selected={selectedIds.includes(layer.layer_id)}
                  interactive={interactive}
                  onSelect={(additive) => {
                    updateCutLineActive(false);
                    onSelect?.(layer.layer_id, additive);
                  }}
                  onDragStart={(node) => {
                    updateCutLineActive(false);
                    startLayerDrag(node, layer.layer_id);
                  }}
                  onDrag={(node) => moveLayerDrag(node, layer)}
                  onChange={(patch) => onChange?.(layer.layer_id, patch)}
                  onDragEnd={(node) => finishLayerDrag(node, layer.layer_id)}
                  onHoverChange={(hovered, bounds) => {
                    setHoveredLayerId(hovered ? layer.layer_id : null);
                    setHoveredLayerBounds(hovered ? bounds : undefined);
                  }}
                />
              ))}
              <SnapGuides vertical={guides.vertical} horizontal={guides.horizontal} width={canvasWidth} height={canvasHeight} />
              {hoveredLayerId
                ? layers
                    .filter((layer) => layer.layer_id === hoveredLayerId)
                    .map((layer) => {
                      // Element geometry uses one uniform canvas unit. Using an
                      // independent X/Y conversion distorts physical sizes when
                      // the visual cut frame and its metadata have different
                      // aspect ratios (a pixel-perfect circle would no longer be
                      // reported as a circle). The vertical cutline scale is the
                      // canonical mm-per-pixel scale for both dimensions.
                      const mmPerPixel =
                        pageHeightMm && canvasHeight > 0
                          ? pageHeightMm / canvasHeight
                          : pageWidthMm && canvasWidth > 0
                            ? pageWidthMm / canvasWidth
                            : 1;
                      const physicalWidth = (hoveredLayerBounds?.width ?? layer.width) * mmPerPixel;
                      const physicalHeight = (hoveredLayerBounds?.height ?? layer.height) * mmPerPixel;
                      const label = `${formatMmLabel(physicalWidth)} × ${formatMmLabel(physicalHeight)} mm`;
                      const labelWidth = Math.max(88, label.length * 9 + 12) * inverseScale;
                      const labelHeight = 22 * inverseScale;
                      const labelInset = 6 * inverseScale;
                      const labelFontSize = 16 * inverseScale;
                      return (
                        <LayerGroup
                          key={`${layer.layer_id}-size-label`}
                          name='editor-only'
                          x={layer.position_x}
                          y={layer.position_y}
                          rotation={layer.rotation}
                          listening={false}>
                          <Rect
                            x={Math.max(0, layer.width - labelWidth)}
                            y={-labelHeight}
                            width={labelWidth}
                            height={labelHeight}
                            fill='#ef4444'
                          />
                          <Text
                            x={Math.max(labelInset, layer.width - labelWidth + labelInset)}
                            y={-labelHeight + 2 * inverseScale}
                            width={labelWidth - labelInset * 2}
                            height={labelHeight - 2 * inverseScale}
                            text={label}
                            fontSize={labelFontSize}
                            fontStyle='bold'
                            fill='#ffffff'
                            align='center'
                          />
                        </LayerGroup>
                      );
                    })
                : null}
              {drawStart && drawEnd && drawingShape === 'line' ? (
                <Line
                  name='editor-only'
                  points={[drawStart.x, drawStart.y, drawEnd.x, drawEnd.y]}
                  stroke='#6366f1'
                  strokeWidth={2}
                  dash={[4, 3]}
                  listening={false}
                />
              ) : drawStart && drawEnd ? (
                <Rect
                  name='editor-only'
                  x={Math.min(drawStart.x, drawEnd.x)}
                  y={Math.min(drawStart.y, drawEnd.y)}
                  width={Math.abs(drawEnd.x - drawStart.x)}
                  height={Math.abs(drawEnd.y - drawStart.y)}
                  stroke='#6366f1'
                  fill='rgba(99,102,241,.08)'
                  dash={[4, 3]}
                  listening={false}
                />
              ) : marqueeStart && marqueeEnd ? (
                <Rect
                  name='editor-only'
                  x={Math.min(marqueeStart.x, marqueeEnd.x)}
                  y={Math.min(marqueeStart.y, marqueeEnd.y)}
                  width={Math.abs(marqueeEnd.x - marqueeStart.x)}
                  height={Math.abs(marqueeEnd.y - marqueeStart.y)}
                  stroke='#6366f1'
                  fill='rgba(99,102,241,.08)'
                  dash={[4, 3]}
                  listening={false}
                />
              ) : null}
            </LayerGroup>
          </Layer>
          {interactive && !editingBackground ? (
            <Layer name='editor-only' x={viewportOrigin.x} y={viewportOrigin.y} scaleX={scale} scaleY={scale}>
              <LayerGroup x={canvasOffsetX + cutOffsetX} y={canvasOffsetY + cutOffsetY}>
                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                  rotationSnapTolerance={5}
                  anchorSize={3 * inverseScale}
                  anchorStrokeWidth={0.5 * inverseScale}
                  borderStroke='#6366f1'
                  borderStrokeWidth={0.5 * inverseScale}
                  anchorStroke='#6366f1'
                  enabledAnchors={
                    singleTextSelected
                      ? ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
                      : undefined
                  }
                  boundBoxFunc={(oldBox, newBox) => {
                    const minimumWidth = singleTextSelected ? 20 * scale : 5;
                    return Math.abs(newBox.width) < minimumWidth || Math.abs(newBox.height) < 5 ? oldBox : newBox;
                  }}
                />
              </LayerGroup>
            </Layer>
          ) : null}
          {interactive && editingBackground && backgroundImage && onBackgroundTransformChange ? (
            <Layer name='editor-only' x={viewportOrigin.x} y={viewportOrigin.y} scaleX={scale} scaleY={scale}>
              <LayerGroup x={canvasOffsetX} y={canvasOffsetY}>
                <Rect
                  ref={(node) => {
                    backgroundBoundsRef.current = node;
                    if (node) backgroundTransformerRef.current?.nodes([node]);
                  }}
                  x={backgroundTransform.x}
                  y={backgroundTransform.y}
                  width={backgroundFrameWidth * backgroundTransform.scale}
                  height={backgroundFrameHeight * backgroundTransform.scale}
                  fill='rgba(0,0,0,0.001)'
                  stroke='#6366f1'
                  strokeWidth={inverseScale}
                  draggable={!spacePressed}
                  listening={!spacePressed}
                  onMouseDown={(event) => {
                    event.cancelBubble = true;
                  }}
                  onDragMove={(event) => {
                    backgroundRef.current?.position(event.target.position());
                  }}
                  onDragEnd={(event) => {
                    onBackgroundTransformChange({ ...backgroundTransform, x: event.target.x(), y: event.target.y() });
                  }}
                  onTransform={(event) => {
                    const node = event.target;
                    backgroundRef.current?.setAttrs({
                      image: backgroundImage,
                      x: node.x(),
                      y: node.y(),
                      width: node.width() * node.scaleX(),
                      height: node.height() * node.scaleY(),
                    });
                  }}
                  onTransformEnd={(event) => {
                    const node = event.target;
                    const nextScale = Math.max(0.01, backgroundTransform.scale * node.scaleX());
                    node.scale({ x: 1, y: 1 });
                    onBackgroundTransformChange({ x: node.x(), y: node.y(), scale: nextScale });
                  }}
                />
                <Transformer
                  ref={(node) => {
                    backgroundTransformerRef.current = node;
                    if (node && backgroundBoundsRef.current) node.nodes([backgroundBoundsRef.current]);
                  }}
                  listening={!spacePressed}
                  rotateEnabled={false}
                  flipEnabled={false}
                  keepRatio
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  anchorSize={8 * inverseScale}
                  borderStroke='#6366f1'
                  boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                />
              </LayerGroup>
            </Layer>
          ) : null}
        </Stage>
      </div>
    </div>
  );
});

function KonvaNode({
  layer,
  fontRenderScale,
  nodeRef,
  selected,
  interactive,
  onSelect,
  onDragStart,
  onDrag,
  onChange,
  onDragEnd,
  onHoverChange,
}: {
  layer: TemplateLayer;
  fontRenderScale: number;
  nodeRef: (node: Konva.Group | null) => void;
  selected: boolean;
  interactive: boolean;
  onSelect: (additive: boolean) => void;
  onDragStart: (node: Konva.Node) => void;
  onDrag: (node: Konva.Node) => void;
  onChange: (patch: Partial<TemplateLayer>) => void;
  onDragEnd: (node: Konva.Node) => void;
  onHoverChange: (hovered: boolean, bounds?: { width: number; height: number }) => void;
}) {
  const { t } = useTranslation('template');
  const [hoverBounds, setHoverBounds] = useState<{ x: number; y: number; width: number; height: number }>();
  const measureHoverBounds = (node: Konva.Group) => {
    const rect = node.getClientRect({ relativeTo: node, skipShadow: false, skipStroke: false });
    setHoverBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    return { width: rect.width, height: rect.height };
  };
  return (
    <LayerGroup
      ref={nodeRef}
      id={layer.layer_id}
      x={layer.position_x}
      y={layer.position_y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={interactive && !layer.locked}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect(event.evt.shiftKey || event.evt.ctrlKey || event.evt.metaKey);
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect(false);
      }}
      onDragStart={(event) => onDragStart(event.target)}
      onDragMove={(event) => onDrag(event.target)}
      onDragEnd={(event) => onDragEnd(event.target)}
      onMouseEnter={(event) => {
        const bounds = measureHoverBounds(event.currentTarget as Konva.Group);
        onHoverChange(true, bounds);
        const container = event.target.getStage()?.container();
        if (container && interactive && !layer.locked) container.style.cursor = 'move';
      }}
      onMouseLeave={(event) => {
        setHoverBounds(undefined);
        onHoverChange(false);
        const container = event.target.getStage()?.container();
        if (container) container.style.cursor = '';
      }}
      onTransformEnd={(event) => {
        const node = event.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const patch: Partial<TemplateLayer> = {
          position_x: Math.round(node.x()),
          position_y: Math.round(node.y()),
          width: Math.max(5, Math.round(layer.width * scaleX)),
          rotation: Math.round(node.rotation()),
        };
        if (layer.type === 'text') {
          patch.height = Math.max(5, Math.round(layer.height * scaleY));
          patch.font_size = Math.max(1, Math.round(layer.font_size * Math.abs(scaleY) * 10) / 10);
        } else {
          patch.height = Math.max(5, Math.round(layer.height * scaleY));
        }
        onChange(patch);
      }}>
      {layer.type === 'text' ? (
        <Text
          width={layer.width}
          text={layer.default_value || layer.field_key || t('template.editor.default_text')}
          name='editor-text'
          fontFamily={resolveFontFamily(layer.font_family)}
          fontSize={layer.font_size * POINT_TO_PIXEL * fontRenderScale}
          fontStyle={String(resolveFontWeight(layer.font_family, layer.font_weight))}
          lineHeight={layer.line_height}
          fill={layer.color}
          align={layer.align}
          stroke={layer.stroke_color}
          strokeWidth={layer.stroke_width}
          shadowColor={layer.shadow_color}
          shadowBlur={layer.shadow_blur}
          shadowOffsetX={layer.shadow_offset_x}
          shadowOffsetY={layer.shadow_offset_y}
          shadowOpacity={layer.shadow_opacity}
        />
      ) : layer.type === 'image' ? (
        <ImageNode layer={layer} />
      ) : (
        <ShapeNode layer={layer} />
      )}
      {hoverBounds && !selected ? (
        <Rect
          name='editor-only'
          x={hoverBounds.x}
          y={hoverBounds.y}
          width={hoverBounds.width}
          height={hoverBounds.height}
          stroke='#6366f1'
          strokeWidth={1.5}
          listening={false}
        />
      ) : null}
    </LayerGroup>
  );
}
