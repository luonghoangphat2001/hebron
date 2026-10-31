import { getTransformedBackgroundGeometry } from '@/utils/helper/background-transform.helper';
import type { BackgroundTransform } from '@/utils/types/canvas.types';
import { useSnapshot } from '@/hooks/useSnapshot';
import { useCanvasFonts } from '@/hooks/useCanvasFonts';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { CANVAS_VIEW_OFFSET, DEFAULT_GRID_SIZE } from '@/utils/constants/canvas-editor.constant';
import { snapCanvasPosition, snapToGrid } from '@/utils/helper/canvas.helper';
import { ObjectType, type CanvasObject, type CardSide, type ShapeObject } from '@/utils/types/canvas.types';
import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ellipse, Group, Image as KonvaImage, Text as KonvaText, Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { useShallow } from 'zustand/react/shallow';
import TrimControls from './TrimControls';
import BackgroundControls from './BackgroundControls';

const getStarPoints = (width: number, height: number, pointCount = 5, innerRatio = 0.44) => {
  const points: number[] = [];
  const centerX = width / 2;
  const centerY = height / 2;

  for (let index = 0; index < pointCount * 2; index += 1) {
    const radiusRatio = index % 2 === 0 ? 1 : innerRatio;
    const angle = -Math.PI / 2 + (index * Math.PI) / pointCount;

    points.push(centerX + Math.cos(angle) * centerX * radiusRatio, centerY + Math.sin(angle) * centerY * radiusRatio);
  }

  return points;
};

const useLoadedImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => setImage(img);
    img.src = src;

    return () => {
      img.onload = null;
    };
  }, [src]);

  return image;
};

const formatMeasurement = (value: number) => String(Math.round(value * 10) / 10);

interface CanvasProps {
  width: number;
  height: number;
  onStageReady?: (stage: Konva.Stage) => void;
  /** Incremented after a template is applied, so readiness can wait for its background. */
  templateRenderRequest?: number;
  onTemplateRenderReady?: () => void;
}

const Canvas = ({ width, height, onStageReady, templateRenderRequest = 0, onTemplateRenderReady }: CanvasProps) => {
  const { t } = useTranslation('common');
  const backgroundSelected = useWebEditorStore((state) => state.backgroundSelected);
  const {
    activeSide,
    frontData,
    backData,
    updateThumbnail,
    selectedId,
    zoom,
    fitZoom,
    pan,
    gridEnabled,
    rulersEnabled,
    snapToGrid: snapToGridEnabled,
    snapToCenter,
    snapToEdges,
    snapToObjects,
    snapToSafeArea,
    selectObject,
    setInspectorPreview,
    updateObject,
    deleteObject,
    duplicateObject,
    undo,
    redo,
    setPan,
    setZoom,
    canvasSize,
    contentSize,
    contentOffset,
    contentSafeMargin,
    templateFrameConfig,
    resolveTemplateFrame,
  } = useWebEditorStore(
    useShallow((state) => ({
      activeSide: state.activeSide,
      frontData: state.frontData,
      backData: state.backData,
      updateThumbnail: state.updateThumbnail,
      selectedId: state.selectedId,
      zoom: state.zoom,
      fitZoom: state.fitZoom,
      pan: state.pan,
      gridEnabled: state.gridEnabled,
      rulersEnabled: state.rulersEnabled,
      snapToGrid: state.snapToGrid,
      snapToCenter: state.snapToCenter,
      snapToEdges: state.snapToEdges,
      snapToObjects: state.snapToObjects,
      snapToSafeArea: state.snapToSafeArea,
      selectObject: state.selectObject,
      setInspectorPreview: state.setInspectorPreview,
      updateObject: state.updateObject,
      deleteObject: state.deleteObject,
      duplicateObject: state.duplicateObject,
      undo: state.undo,
      redo: state.redo,
      setPan: state.setPan,
      setZoom: state.setZoom,
      canvasSize: state.canvasSize,
      contentSize: state.contentSize,
      contentOffset: state.contentOffset,
      contentSafeMargin: state.contentSafeMargin,
      templateFrameConfig: state.templateFrameConfig,
      resolveTemplateFrame: state.resolveTemplateFrame,
    })),
  );
  const stageRef = useRef<Konva.Stage>(null);
  const frontLayerRef = useRef<Konva.Layer>(null);
  const backLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const versionRef = useRef({ front: 0, back: 0 });
  const snapshotCacheRef = useRef<{ front?: string; back?: string }>({});
  const contentChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transformSessionRef = useRef<{
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation: number;
  } | null>(null);
  const commitTransformRef = useRef<() => void>(() => undefined);
  const [snapLines, setSnapLines] = useState<{ vertical: number[]; horizontal: number[] }>({
    vertical: [],
    horizontal: [],
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [hoveredBounds, setHoveredBounds] = useState<{ x: number; y: number; width: number; height: number; rotation: number }>();

  // Get data for both sides
  const frontObjects = frontData.objects;
  const frontBackground = frontData.background;
  const backObjects = backData?.objects;
  const backBackground = backData?.background;
  const fontKey = JSON.stringify(
    [...frontObjects, ...(backObjects || [])].filter((object) => object.type === ObjectType.TEXT).map((object) => object),
  );
  useCanvasFonts(stageRef, fontKey);

  // Current side data for convenience
  const currentObjects = activeSide === 'front' ? frontObjects : backObjects;
  const currentBackground = activeSide === 'front' ? frontBackground : backBackground;
  const latestTemplateRenderRequestRef = useRef(templateRenderRequest);
  const completedTemplateRenderRequestRef = useRef(0);
  const onTemplateRenderReadyRef = useRef(onTemplateRenderReady);

  useEffect(() => {
    latestTemplateRenderRequestRef.current = templateRenderRequest;
    onTemplateRenderReadyRef.current = onTemplateRenderReady;
  }, [onTemplateRenderReady, templateRenderRequest]);

  const notifyTemplateRenderReady = useCallback(() => {
    if (!templateRenderRequest || completedTemplateRenderRequestRef.current === templateRenderRequest) return;

    const requestId = templateRenderRequest;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (latestTemplateRenderRequestRef.current !== requestId || completedTemplateRenderRequestRef.current === requestId) {
          return;
        }

        completedTemplateRenderRequestRef.current = requestId;
        onTemplateRenderReadyRef.current?.();
      });
    });
  }, [templateRenderRequest]);

  // Templates without a background image still need one paint before the editor can be revealed.
  useEffect(() => {
    if (templateRenderRequest && !currentBackground.backgroundImage) {
      notifyTemplateRenderReady();
    }
  }, [currentBackground.backgroundImage, notifyTemplateRenderReady, templateRenderRequest]);

  const scale = zoom;
  const scaledCardWidth = canvasSize.width * scale;
  const scaledCardHeight = canvasSize.height * scale;
  const offsetX = (width - scaledCardWidth) / 2 + pan.x + CANVAS_VIEW_OFFSET.x;
  const offsetY = (height - scaledCardHeight) / 2 + pan.y + CANVAS_VIEW_OFFSET.y;
  const inverseScale = 1 / Math.max(scale, 0.01);
  const selectedObject = currentObjects.find((object) => object.id === selectedId);
  const pageWidthMm = templateFrameConfig?.pageWidth
    ? templateFrameConfig.pageUnit === 'px'
      ? (templateFrameConfig.pageWidth / 96) * 25.4
      : templateFrameConfig.pageWidth
    : undefined;
  const pageHeightMm = templateFrameConfig?.pageHeight
    ? templateFrameConfig.pageUnit === 'px'
      ? (templateFrameConfig.pageHeight / 96) * 25.4
      : templateFrameConfig.pageHeight
    : undefined;
  const cutLabel = pageWidthMm && pageHeightMm ? `${formatMeasurement(pageWidthMm)} × ${formatMeasurement(pageHeightMm)} mm` : '';
  const cutLabelWidth = Math.max(88, cutLabel.length * 9 + 12) * inverseScale;
  const guideLabelHeight = 22 * inverseScale;
  const guideFontSize = 16 * inverseScale;
  // This guide layer is not scaled; use screen pixels directly.
  const guideStrokeWidth = 2;
  const guideDash = [10, 7];
  const millimetersPerCanvasPixel = pageHeightMm ? pageHeightMm / contentSize.height : 25.4 / 96;
  const safeInsetX = Math.min(contentSize.width / 2, contentSafeMargin);
  const safeInsetY = Math.min(contentSize.height / 2, contentSafeMargin);
  const hoveredObject = currentObjects.find((object) => object.id === hoveredObjectId && object.visible);

  // Use refs for bounds to avoid recreating callback
  const boundsRef = useRef({ x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight });

  // Update bounds ref in effect
  useEffect(() => {
    boundsRef.current = { x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight };
  }, [offsetX, offsetY, scaledCardWidth, scaledCardHeight]);

  const getCardBounds = useCallback(() => boundsRef.current, []);

  const handleSnapshotGenerated = useCallback(
    (side: CardSide, dataURL: string, version?: number) => {
      if (version !== undefined && version !== versionRef.current[side]) {
        // Stale snapshot - drop it
        return;
      }

      // Cache snapshot
      snapshotCacheRef.current[side] = dataURL;

      // Always update thumbnail - cache handles stale updates
      updateThumbnail(side, dataURL);

      // Mark sync as complete
    },
    [updateThumbnail],
  );

  // Snapshot system - imperative, event-driven
  const { requestSnapshot: originalRequestSnapshot } = useSnapshot(stageRef, transformerRef, {
    onSnapshotGenerated: handleSnapshotGenerated,
    debounceMs: 0,
    getCardBounds,
  });

  // Wrap requestSnapshot to add version tracking
  const requestSnapshot = useCallback(
    (side: CardSide) => {
      // Increment version for this side
      const version = ++versionRef.current[side];

      // Pass version through config
      originalRequestSnapshot(side, { version });
    },
    [originalRequestSnapshot],
  );

  // Keep requestSnapshot ref stable for useEffect
  const requestSnapshotRef = useRef(requestSnapshot);

  useEffect(() => {
    requestSnapshotRef.current = requestSnapshot;
  }, [requestSnapshot]);

  // Handle object drag
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    // Apply grid snapping
    if (snapToGridEnabled) {
      newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
      newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
    }

    const otherObjects = currentObjects.filter((o) => o.id !== obj.id).map((o) => ({ position: o.position, size: o.size }));
    const snapped = snapCanvasPosition({ x: newX, y: newY }, obj.size, otherObjects, {
      canvasSize: contentSize,
      safeMargin: contentSafeMargin,
      snapToCenter,
      snapToEdges,
      snapToObjects,
      snapToSafeArea,
    });

    setSnapLines(snapped.lines);
    newX = snapped.position.x;
    newY = snapped.position.y;

    node.position({ x: newX, y: newY });
    if (hoveredObjectId === obj.id) {
      const rect = node.getClientRect({ relativeTo: node.getParent() || undefined, skipShadow: false, skipStroke: false });
      setHoveredBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, rotation: node.rotation() });
    }
    setInspectorPreview({
      id: obj.id,
      position: { x: newX, y: newY },
      size: obj.size,
    });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    updateObject(obj.id, {
      position: { x: node.x(), y: node.y() },
    });
    if (hoveredObjectId === obj.id) {
      const rect = node.getClientRect({ relativeTo: node.getParent() || undefined, skipShadow: false, skipStroke: false });
      setHoveredBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, rotation: node.rotation() });
    }
    setInspectorPreview(null);
    setSnapLines({ vertical: [], horizontal: [] });

    // Request snapshot after drag (debounced)
    requestSnapshot(activeSide);
  };

  // Handle transform
  const getTransformedObjectValues = (node: Konva.Node) => ({
    position: { x: node.x(), y: node.y() },
    size: {
      width: Math.max(5, node.width() * node.scaleX()),
      height: Math.max(5, node.height() * node.scaleY()),
    },
  });

  const getTransformContext = () => {
    const node = transformerRef.current?.nodes()[0];
    const object = currentObjects.find((item) => item.id === selectedId);

    if (!node || !object) return null;
    return { node, object };
  };

  const handleNodeTransformStart = (e: Konva.KonvaEventObject<Event>, object: CanvasObject) => {
    const values = getTransformedObjectValues(e.target);
    transformSessionRef.current = {
      id: object.id,
      ...values,
      rotation: e.target.rotation(),
    };
  };

  const handleNodeTransform = (e: Konva.KonvaEventObject<Event>, object: CanvasObject) => {
    const values = getTransformedObjectValues(e.target);
    const preview = { id: object.id, ...values };

    transformSessionRef.current = {
      ...preview,
      rotation: e.target.rotation(),
    };
    setInspectorPreview(preview);
  };

  const handleTransformerTransformStart = () => {
    const context = getTransformContext();
    if (!context) return;

    const values = getTransformedObjectValues(context.node);
    transformSessionRef.current = {
      id: context.object.id,
      ...values,
      rotation: context.node.rotation(),
    };
  };

  const handleTransformerTransform = () => {
    const context = getTransformContext();
    if (!context) return;

    const values = getTransformedObjectValues(context.node);
    const preview = { id: context.object.id, ...values };
    transformSessionRef.current = {
      ...preview,
      rotation: context.node.rotation(),
    };
    setInspectorPreview(preview);
  };

  const commitTransformerTransform = () => {
    const session = transformSessionRef.current;
    if (!session) return;

    const context = getTransformContext();
    const canReadNode = context?.object.id === session.id;
    const values = canReadNode ? getTransformedObjectValues(context.node) : { position: session.position, size: session.size };
    const rotation = canReadNode ? context.node.rotation() : session.rotation;

    transformSessionRef.current = null;

    if (canReadNode) {
      context.node.scaleX(1);
      context.node.scaleY(1);
      context.node.position(values.position);
      context.node.width(values.size.width);
      context.node.height(values.size.height);
    }

    updateObject(session.id, {
      ...values,
      rotation,
    });
    setInspectorPreview(null);

    requestSnapshot(activeSide);
  };

  useEffect(() => {
    commitTransformRef.current = commitTransformerTransform;
  });

  useEffect(() => {
    const commitTransform = () => commitTransformRef.current();
    let pointerUpFrame: number | null = null;
    const commitTransformAfterPointerUp = () => {
      if (pointerUpFrame !== null) cancelAnimationFrame(pointerUpFrame);
      pointerUpFrame = requestAnimationFrame(() => {
        pointerUpFrame = null;
        commitTransform();
      });
    };

    window.addEventListener('pointerup', commitTransformAfterPointerUp);
    window.addEventListener('mouseup', commitTransform);
    window.addEventListener('touchend', commitTransform);

    return () => {
      window.removeEventListener('pointerup', commitTransformAfterPointerUp);
      window.removeEventListener('mouseup', commitTransform);
      window.removeEventListener('touchend', commitTransform);
      if (pointerUpFrame !== null) cancelAnimationFrame(pointerUpFrame);
    };
  }, []);

  // Keep panRef in sync with pan state
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Generate snapshot when background or objects change
  useEffect(() => {
    // Clear existing timer
    if (contentChangeTimerRef.current) {
      clearTimeout(contentChangeTimerRef.current);
    }

    // Debounced snapshot request when content changes
    const timer = setTimeout(() => {
      requestSnapshotRef.current(activeSide);
      contentChangeTimerRef.current = null;
    }, 300);

    contentChangeTimerRef.current = timer;

    return () => {
      if (contentChangeTimerRef.current) {
        clearTimeout(contentChangeTimerRef.current);
        contentChangeTimerRef.current = null;
      }
    };
  }, [
    currentBackground.backgroundColor,
    currentBackground.backgroundImage,
    currentBackground.backgroundTransform,
    currentObjects,
    activeSide,
    contentOffset,
    contentSize,
  ]);

  // Generate snapshot for new side after layout is committed
  useEffect(() => {
    // Apply cached snapshot if available (instant preview)
    const cached = snapshotCacheRef.current[activeSide];
    if (cached) {
      updateThumbnail(activeSide, cached);
    }

    // Generate fresh snapshot for new side after visibility toggle
    requestSnapshotRef.current(activeSide);
  }, [activeSide, updateThumbnail]);

  // Attach transformer to selected object
  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const activeLayer = activeSide === 'front' ? frontLayerRef.current : backLayerRef.current;

    if (!activeLayer) return;

    let animationFrameId: number | null = null;
    let attempts = 0;
    let cancelled = false;

    const attachTransformer = () => {
      if (cancelled) return;

      if (selectedId) {
        const node = activeLayer.findOne(`#${selectedId}`);
        if (node) {
          transformer.nodes([node]);
          activeLayer.batchDraw();
          return;
        }

        if (attempts < 60) {
          attempts += 1;
          animationFrameId = requestAnimationFrame(attachTransformer);
        }
      } else {
        transformer.nodes([]);
        activeLayer.batchDraw();
      }
    };

    attachTransformer();

    return () => {
      cancelled = true;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, [selectedId, activeSide, frontObjects, backObjects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches('input, textarea, select, [role="textbox"]') ||
          Boolean(target.closest('[contenteditable="true"]')));

      // Let editable controls and IME composition handle their own keyboard events.
      if (isEditableTarget || e.isComposing || e.defaultPrevented) return;

      // Enable pan mode with Space key
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'grab';
        }
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') useWebEditorStore.getState().selectBackground(false);

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !e.repeat) {
        deleteObject(selectedId);
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        undo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Redo
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        redo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Duplicate
      if (e.ctrlKey && e.key === 'd' && selectedId) {
        duplicateObject(selectedId);
        e.preventDefault();
      }

      // Deselect
      if (e.key === 'Escape') {
        selectObject(null);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Disable pan mode when Space key is released
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, deleteObject, undo, redo, duplicateObject, selectObject, isSpacePressed, activeSide]);

  useEffect(() => {
    const container = stageRef?.current?.container();
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;

      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Calculate mouse position relative to stage
      const mousePointTo = {
        x: (pointer.x - offsetX) / oldScale,
        y: (pointer.y - offsetY) / oldScale,
      };

      // Zoom factor
      const scaleBy = 1.02;
      const direction = e.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Clamp zoom
      const clampedScale = Math.max(fitZoom * 0.1, Math.min(fitZoom * 5, newScale));

      // Calculate new pan to keep mouse position fixed
      const newPan = {
        x: pointer.x - mousePointTo.x * clampedScale - (width - canvasSize.width * clampedScale) / 2 - CANVAS_VIEW_OFFSET.x,
        y: pointer.y - mousePointTo.y * clampedScale - (height - canvasSize.height * clampedScale) / 2 - CANVAS_VIEW_OFFSET.y,
      };

      setZoom(clampedScale);
      setPan(newPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, fitZoom, pan, offsetX, offsetY, width, height, setZoom, setPan, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const panState = {
      isPanning: false,
      startPan: { x: 0, y: 0 },
      startPointer: { x: 0, y: 0 },
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const isPrimaryButton = e.evt.button === 0;
      const isEmptyCanvas = e.target === stage;
      const shouldPan = e.evt.button === 1 || (isPrimaryButton && (isSpacePressed || isEmptyCanvas));

      // Drag empty canvas directly, or use Space + drag / middle mouse from anywhere.
      if (shouldPan) {
        panState.isPanning = true;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          panState.startPointer = { x: pointer.x, y: pointer.y };
          panState.startPan = { ...panRef.current };
        }
        stage.container().style.cursor = 'grabbing';
        e.evt.preventDefault();
      }
    };

    const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!panState.isPanning) return;

      const pointer = stage.getPointerPosition();
      if (pointer) {
        const dx = pointer.x - panState.startPointer.x;
        const dy = pointer.y - panState.startPointer.y;

        const newPan = {
          x: panState.startPan.x + dx,
          y: panState.startPan.y + dy,
        };

        // Cancel any pending animation frame
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame for smooth updates
        rafRef.current = requestAnimationFrame(() => {
          setPan(newPan);
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (panState.isPanning) {
        panState.isPanning = false;
        stage.container().style.cursor = 'grab';
      }
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    stage.on('mouseleave', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.off('mouseleave', handleMouseUp);

      // Clean up any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [setPan, isSpacePressed]);

  return (
    <div className='relative h-full w-full overflow-hidden bg-transparent'>
      <Stage
        ref={(node) => {
          // Only update if stage instance changed
          if (stageRef.current !== node) {
            stageRef.current = node;
            if (node && onStageReady) {
              onStageReady(node);
            }
          }
        }}
        width={width}
        height={height}
        onMouseDown={(e) => {
          // Deselect when clicking on empty space
          if (e.target === e.target.getStage()) {
            selectObject(null);
          }
        }}>
        <Layer>
          {/* Canvas background (white card) */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={scaledCardWidth}
            height={scaledCardHeight}
            fill={currentBackground.backgroundColor}
            listening={false}
          />

          {/* Background Image */}
          {currentBackground.backgroundImage && (
            <CanvasBackgroundImage
              key={`${activeSide}-${currentBackground.id}-${currentBackground.backgroundImage}`}
              src={currentBackground.backgroundImage}
              x={offsetX}
              y={offsetY}
              width={(currentBackground.previewSize?.width ?? canvasSize.width) * scale}
              height={(currentBackground.previewSize?.height ?? canvasSize.height) * scale}
              backgroundTransform={currentBackground.backgroundTransform}
              canvasScale={scale}
              backgroundSize={currentBackground.backgroundSize || 'cover'}
              onNaturalSize={currentBackground.preserveFrameOnImageLoad ? undefined : resolveTemplateFrame}
              onImageReady={notifyTemplateRenderReady}
            />
          )}
          {rulersEnabled && (
            <>
              <Rect
                x={offsetX + contentOffset.x * scale}
                y={offsetY + contentOffset.y * scale}
                width={contentSize.width * scale}
                height={contentSize.height * scale}
                stroke='#ef4444'
                strokeWidth={guideStrokeWidth}
                dash={guideDash}
                listening={false}
              />
              {cutLabel && (
                <Group listening={false}>
                  <Rect
                    x={offsetX + (contentOffset.x + contentSize.width) * scale - cutLabelWidth * scale}
                    y={Math.max(offsetY, offsetY + contentOffset.y * scale - guideLabelHeight * scale)}
                    width={cutLabelWidth * scale}
                    height={guideLabelHeight * scale}
                    fill='#ef4444'
                  />
                  <KonvaText
                    x={offsetX + (contentOffset.x + contentSize.width) * scale - cutLabelWidth * scale}
                    y={Math.max(offsetY, offsetY + contentOffset.y * scale - guideLabelHeight * scale) + 2}
                    width={cutLabelWidth * scale}
                    height={guideLabelHeight * scale}
                    text={cutLabel}
                    fontSize={guideFontSize * scale}
                    fontStyle='bold'
                    fill='#ffffff'
                    align='center'
                  />
                </Group>
              )}
              {contentSafeMargin > 0 && (
                <Group listening={false}>
                  <Rect
                    x={offsetX + (contentOffset.x + safeInsetX) * scale}
                    y={offsetY + (contentOffset.y + safeInsetY) * scale}
                    width={Math.max(0, (contentSize.width - safeInsetX * 2) * scale)}
                    height={Math.max(0, (contentSize.height - safeInsetY * 2) * scale)}
                    stroke='#14b8a6'
                    strokeWidth={guideStrokeWidth}
                    dash={guideDash}
                  />
                  <Line
                    points={[
                      offsetX + (contentOffset.x + contentSize.width - safeInsetX) * scale,
                      offsetY + (contentOffset.y + safeInsetY) * scale + 11,
                      offsetX + (contentOffset.x + contentSize.width - safeInsetX) * scale + 26,
                      offsetY + (contentOffset.y + safeInsetY) * scale + 11,
                    ]}
                    stroke='#14b8a6'
                    strokeWidth={guideStrokeWidth}
                  />
                  <KonvaText
                    x={offsetX + (contentOffset.x + contentSize.width - safeInsetX) * scale + 29}
                    y={offsetY + (contentOffset.y + safeInsetY) * scale}
                    width={90}
                    height={22}
                    text={t('canvas.safe_line')}
                    fontSize={16}
                    fontStyle='bold'
                    fill='#14b8a6'
                  />
                </Group>
              )}
            </>
          )}
          {/* Grid */}
          {gridEnabled && (
            <>
              {Array.from({ length: Math.ceil(contentSize.width / DEFAULT_GRID_SIZE) }).map((_, i) => {
                const x = i * DEFAULT_GRID_SIZE * scale;
                return (
                  <Line
                    key={`grid-v-${i}`}
                    points={[
                      offsetX + contentOffset.x * scale + x,
                      offsetY + contentOffset.y * scale,
                      offsetX + contentOffset.x * scale + x,
                      offsetY + (contentOffset.y + contentSize.height) * scale,
                    ]}
                    stroke='#e0e0e0'
                    strokeWidth={0.5}
                    listening={false}
                  />
                );
              })}
              {Array.from({ length: Math.ceil(contentSize.height / DEFAULT_GRID_SIZE) }).map((_, i) => {
                const y = i * DEFAULT_GRID_SIZE * scale;
                return (
                  <Line
                    key={`grid-h-${i}`}
                    points={[
                      offsetX + contentOffset.x * scale,
                      offsetY + contentOffset.y * scale + y,
                      offsetX + (contentOffset.x + contentSize.width) * scale,
                      offsetY + contentOffset.y * scale + y,
                    ]}
                    stroke='#e0e0e0'
                    strokeWidth={0.5}
                    listening={false}
                  />
                );
              })}
            </>
          )}
        </Layer>

        {/* Front Objects Layer */}
        <Layer
          ref={frontLayerRef}
          x={offsetX + contentOffset.x * scale}
          y={offsetY + contentOffset.y * scale}
          scaleX={scale}
          scaleY={scale}
          visible={activeSide === 'front'}
          listening={activeSide === 'front'}>
          {renderObjects(frontObjects)}
        </Layer>
        {/* Back Objects Layer */}
        <Layer
          ref={backLayerRef}
          x={offsetX + contentOffset.x * scale}
          y={offsetY + contentOffset.y * scale}
          scaleX={scale}
          scaleY={scale}
          visible={activeSide === 'back'}
          listening={activeSide === 'back'}>
          {renderObjects(backObjects)}
        </Layer>

        {/* Snap lines and Transformer on top */}
        <Layer x={offsetX + contentOffset.x * scale} y={offsetY + contentOffset.y * scale} scaleX={scale} scaleY={scale}>
          {/* Snap lines */}
          {snapLines.vertical.map((x, i) => (
            <Line
              key={`snap-v-${i}`}
              points={[x, 0, x, contentSize.height]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}
          {snapLines.horizontal.map((y, i) => (
            <Line
              key={`snap-h-${i}`}
              points={[0, y, contentSize.width, y]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}

          {hoveredObject && hoveredBounds ? (
            <Group x={hoveredBounds.x} y={hoveredBounds.y} rotation={hoveredBounds.rotation} listening={false}>
              {hoveredObject.id !== selectedId ? (
                <Rect
                  width={hoveredBounds.width}
                  height={hoveredBounds.height}
                  stroke='#6366f1'
                  strokeWidth={1.5 * inverseScale}
                />
              ) : null}
              <Rect
                x={Math.max(0, hoveredBounds.width - Math.max(88, 132 * inverseScale))}
                y={-guideLabelHeight}
                width={Math.max(88, 132 * inverseScale)}
                height={guideLabelHeight}
                fill='#ef4444'
              />
              <KonvaText
                x={Math.max(0, hoveredBounds.width - Math.max(88, 132 * inverseScale))}
                y={-guideLabelHeight + 2 * inverseScale}
                width={Math.max(88, 132 * inverseScale)}
                height={guideLabelHeight}
                text={`${formatMeasurement(hoveredBounds.width * millimetersPerCanvasPixel)} × ${formatMeasurement(
                  hoveredBounds.height * millimetersPerCanvasPixel,
                )} mm`}
                fontSize={guideFontSize}
                fontStyle='bold'
                fill='#ffffff'
                align='center'
              />
            </Group>
          ) : null}

          {backgroundSelected && currentBackground.backgroundImage && (
            <Group
              x={-(offsetX + contentOffset.x * scale) / scale}
              y={-(offsetY + contentOffset.y * scale) / scale}
              scaleX={1 / scale}
              scaleY={1 / scale}>
              <BackgroundControls
                key={`${activeSide}-${currentBackground.id}-${currentBackground.backgroundImage}`}
                background={currentBackground}
                panning={isSpacePressed}
                x={offsetX}
                y={offsetY}
                scale={scale}
              />
            </Group>
          )}
          {/* Transformer */}
          {selectedId && (
            <Transformer
              ref={transformerRef}
              rotateEnabled
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
              rotationSnapTolerance={5}
              anchorSize={3 * inverseScale}
              anchorStrokeWidth={0.5 * inverseScale}
              borderStrokeWidth={0.5 * inverseScale}
              borderStroke='#6366f1'
              anchorStroke='#6366f1'
              anchorFill='#ffffff'
              enabledAnchors={
                selectedObject?.type === ObjectType.TEXT
                  ? ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
                  : undefined
              }
              boundBoxFunc={(oldBox, newBox) => {
                const minimumWidth = selectedObject?.type === ObjectType.TEXT ? 20 * scale : 5;
                return Math.abs(newBox.width) < minimumWidth || Math.abs(newBox.height) < 5 ? oldBox : newBox;
              }}
              onTransformStart={handleTransformerTransformStart}
              onTransform={handleTransformerTransform}
              onTransformEnd={commitTransformerTransform}
            />
          )}
        </Layer>
        <TrimControls x={offsetX} y={offsetY} scale={scale} />
      </Stage>
    </div>
  );

  function setObjectHover(object: CanvasObject, node: Konva.Node) {
    const rect = node.getClientRect({ relativeTo: node.getParent() || undefined, skipShadow: false, skipStroke: false });
    setHoveredObjectId(object.id);
    setHoveredBounds({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, rotation: object.rotation });
  }

  function clearObjectHover(objectId: string) {
    setHoveredObjectId((current) => {
      if (current !== objectId) return current;
      setHoveredBounds(undefined);
      return null;
    });
  }

  function renderObjects(objects: CanvasObject[]) {
    return objects
      ?.filter((obj) => obj.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((obj) => {
        if (obj.type === ObjectType.TEXT) {
          return (
            <KonvaText
              key={obj.id}
              id={obj.id}
              name='editor-text'
              x={obj.position.x}
              y={obj.position.y}
              text={obj.content}
              fontSize={obj.fontSize}
              fontFamily={obj.fontFamily}
              fontStyle={`${obj.fontStyle} ${obj.fontWeight}`}
              textDecoration={obj.textDecoration}
              fill={obj.color}
              stroke={obj.stroke}
              strokeWidth={obj.strokeWidth}
              shadowColor={obj.shadowColor}
              shadowBlur={obj.shadowBlur}
              shadowOffsetX={obj.shadowOffsetX}
              shadowOffsetY={obj.shadowOffsetY}
              shadowOpacity={obj.shadowOpacity}
              align={obj.align}
              width={obj.size.width}
              lineHeight={obj.lineHeight}
              letterSpacing={obj.letterSpacing}
              rotation={obj.rotation}
              opacity={obj.opacity}
              draggable={!obj.locked}
              onClick={() => selectObject(obj.id)}
              onTap={() => selectObject(obj.id)}
              onMouseEnter={(event) => setObjectHover(obj, event.currentTarget)}
              onMouseLeave={() => clearObjectHover(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformStart={(e) => handleNodeTransformStart(e, obj)}
              onTransform={(e) => handleNodeTransform(e, obj)}
              onTransformEnd={commitTransformerTransform}
            />
          );
        }

        if (obj.type === ObjectType.IMAGE) {
          return (
            <CanvasImage
              key={obj.id}
              obj={obj}
              inverseScale={inverseScale}
              isHovered={hoveredObjectId === obj.id}
              onSelect={() => selectObject(obj.id)}
              onReplaceImage={(src, originalWidth, originalHeight) =>
                updateObject(obj.id, { src, originalWidth, originalHeight })
              }
              onHoverChange={(hovered, node) => (hovered ? setObjectHover(obj, node) : clearObjectHover(obj.id))}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformStart={(e) => handleNodeTransformStart(e, obj)}
              onTransform={(e) => handleNodeTransform(e, obj)}
              onTransformEnd={commitTransformerTransform}
            />
          );
        }

        if (obj.type === ObjectType.SHAPE) {
          return (
            <CanvasShape
              key={obj.id}
              obj={obj}
              onSelect={() => selectObject(obj.id)}
              onHoverChange={(hovered, node) => (hovered ? setObjectHover(obj, node) : clearObjectHover(obj.id))}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformStart={(e) => handleNodeTransformStart(e, obj)}
              onTransform={(e) => handleNodeTransform(e, obj)}
              onTransformEnd={commitTransformerTransform}
            />
          );
        }

        return null;
      });
  }
};

export default Canvas;

function CanvasShape({
  obj,
  onSelect,
  onHoverChange,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
}: {
  obj: ShapeObject;
  onSelect: () => void;
  onHoverChange: (hovered: boolean, node: Konva.Node) => void;
  onDragMove: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformStart: (event: Konva.KonvaEventObject<Event>) => void;
  onTransform: (event: Konva.KonvaEventObject<Event>) => void;
  onTransformEnd: () => void;
}) {
  const fillImage = useLoadedImage(obj.fillImageUrl || '');
  const { width, height } = obj.size;
  const shapeStyle = {
    fill: fillImage ? undefined : obj.fill,
    fillPatternImage: fillImage || undefined,
    fillPatternRepeat: 'no-repeat' as const,
    fillPatternScaleX: fillImage ? width / Math.max(fillImage.width, 1) : undefined,
    fillPatternScaleY: fillImage ? height / Math.max(fillImage.height, 1) : undefined,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
  };
  const polygonSides = Math.max(3, Math.min(12, obj.polygonSides || 5));
  const polygonPoints = Array.from({ length: polygonSides }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / polygonSides;
    return [width / 2 + (Math.cos(angle) * width) / 2, height / 2 + (Math.sin(angle) * height) / 2];
  }).flat();

  return (
    <Group
      id={obj.id}
      x={obj.position.x}
      y={obj.position.y}
      width={width}
      height={height}
      rotation={obj.rotation}
      opacity={obj.opacity}
      draggable={!obj.locked}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={(event) => onHoverChange(true, event.currentTarget)}
      onMouseLeave={(event) => onHoverChange(false, event.currentTarget)}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformStart={onTransformStart}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}>
      {obj.shapeType === 'rectangle' ? <Rect {...shapeStyle} width={width} height={height} /> : null}
      {obj.shapeType === 'roundedRectangle' ? (
        <Rect {...shapeStyle} width={width} height={height} cornerRadius={obj.cornerRadius || 12} />
      ) : null}
      {obj.shapeType === 'circle' ? (
        <Ellipse {...shapeStyle} x={width / 2} y={height / 2} radiusX={width / 2} radiusY={height / 2} />
      ) : null}
      {obj.shapeType === 'doubleRectangle' ? (
        <>
          <Rect {...shapeStyle} width={width} height={height} />
          <Rect
            {...shapeStyle}
            x={3}
            y={3}
            width={Math.max(0, width - 6)}
            height={Math.max(0, height - 6)}
            fill='transparent'
            fillPatternImage={undefined}
          />
        </>
      ) : null}
      {obj.shapeType === 'triangle' ? (
        <Line {...shapeStyle} points={[width / 2, 0, width, height, 0, height]} closed lineJoin='round' />
      ) : null}
      {obj.shapeType === 'star' ? <Line {...shapeStyle} points={getStarPoints(width, height)} closed lineJoin='round' /> : null}
      {obj.shapeType === 'polygon' ? <Line {...shapeStyle} points={polygonPoints} closed lineJoin='round' /> : null}
      {obj.shapeType === 'line' ? (
        <Line points={[0, height / 2, width, height / 2]} stroke={obj.stroke} strokeWidth={obj.strokeWidth} />
      ) : null}
    </Group>
  );
}

// Image component with loading
function CanvasImage({
  obj,
  inverseScale,
  isHovered,
  onSelect,
  onReplaceImage,
  onHoverChange,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
}: {
  obj: CanvasObject & { type: ObjectType.IMAGE };
  inverseScale: number;
  isHovered: boolean;
  onSelect: () => void;
  onReplaceImage: (src: string, originalWidth: number, originalHeight: number) => void;
  onHoverChange: (hovered: boolean, node: Konva.Node) => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformStart: (e: Konva.KonvaEventObject<Event>) => void;
  onTransform: (e: Konva.KonvaEventObject<Event>) => void;
  onTransformEnd: () => void;
}) {
  const image = useLoadedImage(obj.src);
  const maskImage = useLoadedImage(obj.maskImageUrl || '');
  const customMaskedImage = useMemo(() => {
    if (obj.maskShape !== 'custom' || !maskImage || typeof document === 'undefined') return null;

    const width = Math.max(1, Math.round(obj.size.width));
    const height = Math.max(1, Math.round(obj.size.height));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;

    if (image) {
      const imageRatio = image.width / Math.max(image.height, 1);
      const renderWidth = width;
      const renderHeight = width / imageRatio;
      context.drawImage(image, (width - renderWidth) / 2, (height - renderHeight) / 2, renderWidth, renderHeight);
    } else {
      context.fillStyle = '#f1f5f9';
      context.fillRect(0, 0, width, height);
    }

    const rawMaskCanvas = document.createElement('canvas');
    rawMaskCanvas.width = width;
    rawMaskCanvas.height = height;
    const rawMaskContext = rawMaskCanvas.getContext('2d');
    if (!rawMaskContext) return null;
    rawMaskContext.drawImage(maskImage, 0, 0, width, height);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskContext = maskCanvas.getContext('2d');
    if (!maskContext) return null;

    try {
      const imageData = rawMaskContext.getImageData(0, 0, width, height);
      const data = imageData.data;
      const corners = [0, (width - 1) * 4, width * (height - 1) * 4, (width * height - 1) * 4];
      const cornerAlpha = corners.reduce((sum, index) => sum + data[index + 3], 0) / corners.length;
      const cornerLuminance =
        corners.reduce((sum, index) => sum + (data[index] + data[index + 1] + data[index + 2]) / 3, 0) / corners.length;
      const transparentOutside = cornerAlpha < 32;
      const invertLuminance = !transparentOutside && cornerLuminance > 160;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      for (let index = 0; index < data.length; index += 4) {
        const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
        const colorDistance = Math.abs(luminance - cornerLuminance);
        const alpha = transparentOutside
          ? data[index + 3]
          : colorDistance < 18
            ? 0
            : invertLuminance
              ? 255 - luminance
              : luminance;
        const pixel = index / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
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
        const sourceWidth = Math.min(width - sourceX, maxX - minX + padding * 2 + 1);
        const sourceHeight = Math.min(height - sourceY, maxY - minY + padding * 2 + 1);
        maskContext.drawImage(rawMaskCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
      } else {
        maskContext.drawImage(rawMaskCanvas, 0, 0);
      }
    } catch {
      maskContext.drawImage(rawMaskCanvas, 0, 0);
    }

    context.globalCompositeOperation = 'destination-in';
    context.drawImage(maskCanvas, 0, 0);
    context.globalCompositeOperation = 'source-over';
    return canvas;
  }, [image, maskImage, obj.maskShape, obj.size.height, obj.size.width]);

  if (obj.type !== ObjectType.IMAGE) return null;

  const canReplaceImage = obj.field === 'image_frame';
  const isInteractive = obj.interactive || canReplaceImage;
  const clipFunc = (context: Konva.Context) => {
    context.beginPath();
    if (obj.maskShape === 'circle') {
      context.ellipse(obj.size.width / 2, obj.size.height / 2, obj.size.width / 2, obj.size.height / 2, 0, 0, Math.PI * 2);
    } else {
      context.rect(0, 0, obj.size.width, obj.size.height);
    }
    context.closePath();
  };

  const imageRatio = image ? image.width / Math.max(image.height, 1) : 1;
  const renderWidth = obj.size.width;
  const renderHeight = obj.size.width / imageRatio;
  const openImagePicker = (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        const uploadedImage = new window.Image();
        uploadedImage.onload = () =>
          onReplaceImage(reader.result as string, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
        uploadedImage.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <Group
      id={obj.id}
      x={obj.position.x}
      y={obj.position.y}
      width={obj.size.width}
      height={obj.size.height}
      clipFunc={obj.maskShape && obj.maskShape !== 'none' ? clipFunc : undefined}
      rotation={obj.rotation}
      opacity={obj.opacity}
      listening={isInteractive}
      draggable={isInteractive && !obj.locked}
      onClick={onSelect}
      onTap={onSelect}
      onMouseEnter={(event) => onHoverChange(true, event.currentTarget)}
      onMouseLeave={(event) => onHoverChange(false, event.currentTarget)}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformStart={onTransformStart}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}>
      {customMaskedImage ? (
        <KonvaImage image={customMaskedImage} width={obj.size.width} height={obj.size.height} />
      ) : image ? (
        <KonvaImage
          image={image}
          x={(obj.size.width - renderWidth) / 2}
          y={(obj.size.height - renderHeight) / 2}
          width={renderWidth}
          height={renderHeight}
          crop={
            obj.cropWidth > 0 && obj.cropHeight > 0
              ? {
                  x: obj.cropX,
                  y: obj.cropY,
                  width: obj.cropWidth,
                  height: obj.cropHeight,
                }
              : undefined
          }
        />
      ) : (
        <Rect width={obj.size.width} height={obj.size.height} fill='#f1f5f9' />
      )}
      {canReplaceImage && (!image || isHovered) ? (
        <Group
          name='image-replace-control'
          x={obj.size.width / 2}
          y={obj.size.height / 2}
          onClick={openImagePicker}
          onTap={openImagePicker}
          onMouseEnter={(event) => {
            const container = event.target.getStage()?.container();
            if (container) container.style.cursor = 'pointer';
          }}
          onMouseLeave={(event) => {
            const container = event.target.getStage()?.container();
            if (container) container.style.cursor = '';
          }}>
          <Ellipse
            radiusX={18 * inverseScale}
            radiusY={18 * inverseScale}
            fill='#ffffff'
            stroke='#d1d5db'
            strokeWidth={inverseScale}
            shadowColor='#000000'
            shadowBlur={image ? 4 * inverseScale : 0}
            shadowOpacity={image ? 0.18 : 0}
          />
          <KonvaText
            x={-12 * inverseScale}
            y={(image ? -11 : -14) * inverseScale}
            width={24 * inverseScale}
            height={28 * inverseScale}
            text={image ? '✎' : '+'}
            fontSize={(image ? 21 : 26) * inverseScale}
            fill='#6b7280'
            align='center'
          />
        </Group>
      ) : null}
    </Group>
  );
}

// Background Image component to handle sizing ('cover' vs 'contain')
function CanvasBackgroundImage({
  src,
  x,
  y,
  width,
  height,
  backgroundSize = 'cover',
  backgroundTransform,
  canvasScale = 1,
  onNaturalSize,
  onImageReady,
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  backgroundTransform?: BackgroundTransform;
  canvasScale?: number;
  onNaturalSize?: (size: { width: number; height: number }) => void;
  onImageReady?: () => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageReadyRef = useRef(onImageReady);
  useEffect(() => {
    imageReadyRef.current = onImageReady;
  }, [onImageReady]);

  useEffect(() => {
    let isCurrent = true;
    const nextImage = new window.Image();
    nextImage.crossOrigin = 'Anonymous';

    nextImage.onload = () => {
      if (isCurrent) setImage(nextImage);
    };
    nextImage.onerror = () => {
      // Keep the existing blank-background fallback, but do not leave the editor loading forever.
      if (isCurrent) imageReadyRef.current?.();
    };
    nextImage.src = src;

    return () => {
      isCurrent = false;
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [src]);

  useEffect(() => {
    if (!image) return;
    onNaturalSize?.({ width: image.naturalWidth, height: image.naturalHeight });
  }, [image, onNaturalSize]);

  useEffect(() => {
    if (image) onImageReady?.();
  }, [image, onImageReady]);

  if (!image) return null;

  // Calculate rendering size and position
  let renderWidth = width;
  let renderHeight = height;
  let renderX = x;
  let renderY = y;
  let crop: { x: number; y: number; width: number; height: number } | undefined;

  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;

  if (backgroundSize === 'cover') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      const scaledWidth = image.height * canvasRatio;
      crop = {
        x: (image.width - scaledWidth) / 2,
        y: 0,
        width: scaledWidth,
        height: image.height,
      };
    } else {
      // Image is taller than canvas ratio
      const scaledHeight = image.width / canvasRatio;
      crop = {
        x: 0,
        y: (image.height - scaledHeight) / 2,
        width: image.width,
        height: scaledHeight,
      };
    }
  } else if (backgroundSize === 'contain') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      renderHeight = width / imageRatio;
      renderY = y + (height - renderHeight) / 2;
    } else {
      // Image is taller than canvas ratio
      renderWidth = height * imageRatio;
      renderX = x + (width - renderWidth) / 2;
    }
  }

  const transformed = getTransformedBackgroundGeometry(
    { width: image.naturalWidth, height: image.naturalHeight },
    backgroundTransform,
  );
  if (transformed) {
    renderX = x + transformed.x * canvasScale;
    renderY = y + transformed.y * canvasScale;
    renderWidth = transformed.width * canvasScale;
    renderHeight = transformed.height * canvasScale;
    crop = undefined;
  }

  return (
    <KonvaImage
      id='canvas-background-image'
      x={renderX}
      y={renderY}
      width={renderWidth}
      height={renderHeight}
      image={image}
      crop={crop}
      listening={false}
    />
  );
}
