import { getTransformedBackgroundGeometry, normalizeBackgroundTransform } from '@/utils/helper/background-transform.helper';
import { resolveTextFont } from '@/utils/helper/editor-fonts';
import { prepareStageText } from '@/utils/helper/canvas-text-renderer';
import {
  CANVAS_VIEW_OFFSET,
  CARD_SIZE_MM,
  CARD_SIZE_PX,
  DEFAULT_IMAGE_OBJECT,
  DEFAULT_SHAPE_OBJECT,
  DEFAULT_TEXT_OBJECT,
  DEFAULT_ZOOM,
  FIT_SCREEN_PADDING,
  MAX_HISTORY_SIZE,
  MAX_ZOOM,
  MIN_ZOOM,
  SAFE_MARGIN_MM,
  SAFE_MARGIN_PX,
} from '@/utils/constants/canvas-editor.constant';
import { generateId, resolveCanvasAssetUrl, transformToUrl } from '@/utils/helper/canvas.helper';
import {
  buildPrintPdf,
  downloadPrintPdf,
  hasPhysicalPrintAspect,
  normalizePhysicalPrintFrame,
} from '@/utils/helper/print-pdf.helper';
import { toast } from 'sonner';
import {
  ObjectType,
  type BackgroundObject,
  type CanvasObject,
  type CanvasState,
  type CardSide,
  type CardSideData,
  type ImageObject,
  type Position,
  type ShapeObject,
  type ShapeType,
  type Size,
  type SnapshotThumbnails,
  type TextObject,
} from '@/utils/types/canvas.types';
import type { Layer, Template } from '@/utils/types/design.response';
import Konva from 'konva';
import { create } from 'zustand';

interface HistoryEntry {
  side?: CardSide;
  objects: CanvasObject[];
  background: BackgroundObject;
  frame?: SideFrameState;
}

export type SideFrameState = {
  canvasSize: Size;
  contentSize: Size;
  contentOffset: Position;
  templateFrameConfig: TemplateFrameConfig | null;
  contentSafeMargin: number;
};

interface InspectorPreview {
  id: string;
  position: Position;
  size: Size;
}

export interface TemplateFrameConfig {
  cutOffsetX?: number;
  cutOffsetY?: number;
  cutWidth?: number;
  cutHeight?: number;
  pageWidth?: number;
  pageHeight?: number;
  pageUnit?: 'mm' | 'px';
  safeMargin?: number;
}

type TextOverrides = Partial<Omit<TextObject, 'id' | 'zIndex' | 'type' | 'position'>>;

interface WebEditorState extends Omit<CanvasState, 'objects' | 'background'> {
  // EDITOR DATA (source of truth)
  activeSide: CardSide;
  frontData: CardSideData;
  backData: CardSideData;

  // UI ARTIFACTS (ephemeral, not in history)
  thumbnails: SnapshotThumbnails;
  isExportLoading: boolean;
  isDirty: boolean;
  canvasSize: { width: number; height: number };
  fitZoom: number;
  contentSize: { width: number; height: number };
  contentOffset: Position;
  templateFrameConfig: TemplateFrameConfig | null;
  contentSafeMargin: number;
  sideFrames: Record<CardSide, SideFrameState>;
  sidedness: 'SINGLE' | 'DOUBLE';
  inspectorPreview: InspectorPreview | null;
  backgroundSelected: boolean;
  selectBackground: (selected: boolean) => void;
  trimSelected: boolean;
  selectTrim: () => void;
  updateTrimFrame: (frame: { x: number; y: number; width: number; height: number }, recordHistory?: boolean) => void;

  // History (granular undo/redo for current side)
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Actions - Side Management
  switchSide: (side: CardSide) => void;
  updateThumbnail: (side: CardSide, dataURL: string) => void;

  // Actions - Object Management
  addObject: (object: Omit<CanvasObject, 'id' | 'zIndex'>) => string;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => string | null;
  reorderObject: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;

  // Actions - Text
  addText: (position?: Position, overrides?: TextOverrides) => string;
  updateText: (id: string, updates: Partial<TextObject>) => void;

  // Actions - Image
  addImage: (src: string, originalWidth: number, originalHeight: number, position?: Position) => string;
  updateImage: (id: string, updates: Partial<ImageObject>) => void;

  // Actions - Shape
  addShape: (shapeType: ShapeType, position?: Position) => string;
  updateShape: (id: string, updates: Partial<ShapeObject>) => void;

  // Actions - Background
  updateBackground: (updates: Partial<BackgroundObject>) => void;

  // Actions - Selection
  selectObject: (id: string | null) => void;
  setInspectorPreview: (preview: InspectorPreview | null) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Actions - View
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  fitView: (viewportSize: Size) => void;
  resetView: () => void;
  resolveTemplateFrame: (backgroundSize: Size) => void;

  // Actions - Settings
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToCenter: () => void;
  toggleSnapToEdges: () => void;
  toggleSnapToObjects: () => void;
  toggleSnapToSafeArea: () => void;

  // Actions - Export Loading
  setExportLoading: (loading: boolean) => void;

  // Actions - Load
  resetEditor: () => void;
  updateFreeEditFrame: (widthMm: number, heightMm: number, safeMarginMm: number, syncDimensions?: boolean) => void;
  loadDesign: (data: {
    frontData: CardSideData;
    backData: CardSideData;
    canvasSize?: { width: number; height: number };
    contentSize?: { width: number; height: number };
    contentOffset?: Position;
    templateFrameConfig?: TemplateFrameConfig | null;
    contentSafeMargin?: number;
    sideFrames?: Record<CardSide, SideFrameState>;
    sidedness?: 'SINGLE' | 'DOUBLE';
  }) => void;
  setTemplate: (template: Template) => void;

  updateFields: (values: Record<string, unknown>) => void;

  // Utility
  clearCanvas: () => void;
  getSelectedObject: () => CanvasObject | null;

  // Getters for current side (computed)
  getCurrentObjects: () => CanvasObject[];
  getCurrentBackground: () => BackgroundObject;

  //export
  exportImages: (stageRef: React.RefObject<Konva.Stage | null>) => Promise<{ front: string; back: string }>;
  exportToPDF: (stageRef: React.RefObject<Konva.Stage | null>) => Promise<void>;
  exportPreviewImages: (stageRef: React.RefObject<Konva.Stage | null>) => Promise<{ front: string; back: string }>;
}

const createDefaultBackground = (): BackgroundObject => ({
  id: generateId(),
  type: ObjectType.BACKGROUND,
  backgroundColor: '#FFFFFF',
  backgroundSize: 'contain',
});

const createFreeEditFrame = (
  widthMm: number = CARD_SIZE_MM.width,
  heightMm: number = CARD_SIZE_MM.height,
  safeMarginMm: number = SAFE_MARGIN_MM,
): SideFrameState => {
  // Free edit has no template/background to supply its coordinate system.
  // Use the same 96-DPI canvas units as template text and measurement labels.
  const size = { width: (widthMm * 96) / 25.4, height: (heightMm * 96) / 25.4 };
  return {
    canvasSize: size,
    contentSize: size,
    contentOffset: { x: 0, y: 0 },
    contentSafeMargin: (safeMarginMm * 96) / 25.4,
    templateFrameConfig: {
      pageWidth: widthMm,
      pageHeight: heightMm,
      pageUnit: 'mm',
      cutWidth: size.width,
      cutHeight: size.height,
      cutOffsetX: 0,
      cutOffsetY: 0,
      safeMargin: safeMarginMm,
    },
  };
};

const getNextZIndex = (objects: CanvasObject[]): number => {
  if (objects.length === 0) return 0;
  return Math.max(...objects.map((obj) => obj.zIndex)) + 1;
};

export const useWebEditorStore = create<WebEditorState>((set, get) => ({
  // EDITOR DATA - Initial state
  activeSide: 'front',
  frontData: {
    objects: [],
    background: createDefaultBackground(),
  },
  backData: {
    objects: [],
    background: createDefaultBackground(),
  },

  ...createFreeEditFrame(),
  fitZoom: DEFAULT_ZOOM,
  sideFrames: {
    front: createFreeEditFrame(),
    back: createFreeEditFrame(),
  },
  sidedness: 'DOUBLE',
  // UI ARTIFACTS - Initial state
  thumbnails: {
    front: null,
    back: null,
  },
  isSyncing: false,
  pendingSyncTimer: null,
  isExportLoading: false,
  isDirty: false,
  inspectorPreview: null,
  backgroundSelected: false,
  trimSelected: false,
  selectBackground: (selected) =>
    set(
      selected
        ? { backgroundSelected: true, selectedId: null, trimSelected: false, inspectorPreview: null }
        : { backgroundSelected: false },
    ),
  selectTrim: () => set({ backgroundSelected: false, trimSelected: true, selectedId: null, inspectorPreview: null }),
  updateTrimFrame: (next, recordHistory = true) => {
    if (!Object.values(next).every(Number.isFinite)) return;
    set((state) => {
      const frame = state.sideFrames[state.activeSide];
      const width = Math.min(frame.canvasSize.width, Math.max(1, next.width));
      const height = Math.min(frame.canvasSize.height, Math.max(1, next.height));
      const x = Math.min(frame.canvasSize.width - width, Math.max(0, next.x));
      const y = Math.min(frame.canvasSize.height - height, Math.max(0, next.y));
      if (
        x === frame.contentOffset.x &&
        y === frame.contentOffset.y &&
        width === frame.contentSize.width &&
        height === frame.contentSize.height
      )
        return state;
      const oldConfig = frame.templateFrameConfig;
      const unit = oldConfig?.pageUnit === 'px' ? 25.4 / 96 : 1;
      const pixelsPerMm = oldConfig?.pageWidth ? frame.contentSize.width / (oldConfig.pageWidth * unit) : 96 / 25.4;
      const config = {
        ...oldConfig,
        cutOffsetX: x,
        cutOffsetY: y,
        cutWidth: width,
        cutHeight: height,
        ...(width !== frame.contentSize.width || height !== frame.contentSize.height
          ? {
              pageWidth: width / pixelsPerMm,
              pageHeight: height / pixelsPerMm,
              pageUnit: 'mm' as const,
              safeMargin: (oldConfig?.safeMargin ?? 0) * unit,
            }
          : {}),
      };
      const nextFrame: SideFrameState = {
        ...frame,
        contentOffset: { x, y },
        contentSize: { width, height },
        templateFrameConfig: config,
        contentSafeMargin: config.pageHeight ? ((config.safeMargin ?? 0) / config.pageHeight) * height : 0,
      };
      const data = state.activeSide === 'front' ? state.frontData : state.backData;
      return {
        ...nextFrame,
        sideFrames: { ...state.sideFrames, [state.activeSide]: nextFrame },
        past: recordHistory
          ? [...state.past, { objects: data.objects, background: data.background, frame, side: state.activeSide }].slice(
              -MAX_HISTORY_SIZE,
            )
          : state.past,
        future: [],
        isDirty: true,
      };
    });
  },

  // View state
  selectedId: null,
  zoom: DEFAULT_ZOOM,
  pan: { x: 0, y: 0 },
  gridEnabled: false,
  rulersEnabled: true,
  snapToGrid: false,
  snapToCenter: true,
  snapToEdges: true,
  snapToObjects: true,
  snapToSafeArea: true,
  past: [],
  future: [],

  // Utility Getters
  getCurrentObjects: () => {
    const state = get();
    return state.activeSide === 'front' ? state.frontData.objects : state.backData.objects;
  },

  getCurrentBackground: () => {
    const state = get();
    return state.activeSide === 'front' ? state.frontData.background : state.backData.background;
  },

  // Side Management
  switchSide: (side) => {
    set((state) => {
      if (state.sidedness !== 'DOUBLE' && side === 'back') return state;
      const frame = state.sideFrames[side];
      return {
        activeSide: side,
        backgroundSelected: false,
        trimSelected: false,
        selectedId: null,
        inspectorPreview: null,
        canvasSize: frame.canvasSize,
        contentSize: frame.contentSize,
        contentOffset: frame.contentOffset,
        templateFrameConfig: frame.templateFrameConfig,
        contentSafeMargin: frame.contentSafeMargin,
      };
    });
  },

  updateThumbnail: (side, dataURL) => {
    set((state) => ({
      thumbnails: {
        ...state.thumbnails,
        [side]: dataURL,
      },
    }));
  },

  // Object Management
  addObject: (object) => {
    const state = get();
    const id = generateId();
    const currentObjects = state.getCurrentObjects();
    // const currentBackground = state.getCurrentBackground();

    const newObject = {
      ...(object.type === ObjectType.TEXT ? resolveTextFont(object as TextObject) : object),
      id,
      zIndex: getNextZIndex(currentObjects),
    } as CanvasObject;

    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          objects: [...currentData.objects, newObject],
        },
        selectedId: id,
        past,
        future: [],
        isDirty: true,
      };
    });

    return id;
  },

  updateObject: (id, updates) => {
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const objectIndex = currentData.objects.findIndex((obj) => obj.id === id);
      if (objectIndex === -1) return state;

      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      const updatedObjects = [...currentData.objects];
      updatedObjects[objectIndex] = {
        ...updatedObjects[objectIndex],
        ...updates,
      } as CanvasObject;
      if (updatedObjects[objectIndex].type === ObjectType.TEXT)
        updatedObjects[objectIndex] = resolveTextFont(updatedObjects[objectIndex] as TextObject);

      return {
        [sideKey]: {
          ...currentData,
          objects: updatedObjects,
        },
        past,
        future: [],
        isDirty: true,
      };
    });
  },

  deleteObject: (id) => {
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          objects: currentData.objects.filter((obj) => obj.id !== id),
        },
        selectedId: state.selectedId === id ? null : state.selectedId,
        inspectorPreview: state.inspectorPreview?.id === id ? null : state.inspectorPreview,
        past,
        future: [],
        isDirty: true,
      };
    });
  },

  duplicateObject: (id) => {
    const state = get();
    const currentObjects = state.getCurrentObjects();
    const object = currentObjects.find((obj) => obj.id === id);
    if (!object) return null;

    const newId = generateId();
    const duplicated = {
      ...object,
      id: newId,
      position: {
        x: object.position.x + 20,
        y: object.position.y + 20,
      },
      zIndex: getNextZIndex(currentObjects),
    };

    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          objects: [...currentData.objects, duplicated],
        },
        selectedId: newId,
        past,
        future: [],
        isDirty: true,
      };
    });

    return newId;
  },

  reorderObject: (id, direction) => {
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const index = currentData.objects.findIndex((obj) => obj.id === id);
      if (index === -1) return state;

      const objects = [...currentData.objects];
      const [object] = objects.splice(index, 1);

      let newIndex = index;
      switch (direction) {
        case 'up':
          newIndex = Math.min(index + 1, objects.length);
          break;
        case 'down':
          newIndex = Math.max(index - 1, 0);
          break;
        case 'top':
          newIndex = objects.length;
          break;
        case 'bottom':
          newIndex = 0;
          break;
      }

      objects.splice(newIndex, 0, object);

      // Reassign zIndex based on new order
      const reorderedObjects = objects.map((obj, i) => ({
        ...obj,
        zIndex: i,
      }));

      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          objects: reorderedObjects,
        },
        past,
        future: [],
        isDirty: true,
      };
    });
  },

  // Text Actions
  addText: (position, overrides) => {
    const state = get();
    const frame = state.templateFrameConfig;
    const pageToPixel = (value: number) => (frame?.pageUnit === 'mm' ? (value * 96) / 25.4 : value);
    const pageWidthPx = frame?.pageWidth ? pageToPixel(frame.pageWidth) : 0;
    const pageHeightPx = frame?.pageHeight ? pageToPixel(frame.pageHeight) : 0;
    const fontRenderScale =
      pageWidthPx > 0 && pageHeightPx > 0
        ? Math.max(0.1, Math.min(state.contentSize.width / pageWidthPx, state.contentSize.height / pageHeightPx))
        : 1;
    const size = overrides?.size ?? {
      width: Math.max(160, Math.round(state.contentSize.width * 0.45 * 10) / 10),
      height: Math.max(48, Math.round(state.contentSize.height * 0.12 * 10) / 10),
    };
    const pos = position || {
      x: (state.contentSize.width - size.width) / 2,
      y: (state.contentSize.height - size.height) / 2,
    };

    const textObject: Omit<TextObject, 'id' | 'zIndex'> = {
      type: ObjectType.TEXT,
      ...DEFAULT_TEXT_OBJECT,
      content: 'Text',
      fontSize: 16 * (96 / 72) * fontRenderScale,
      fontRenderScale,
      ...overrides,
      position: pos,
      size,
    };

    return get().addObject(textObject);
  },

  updateText: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Image Actions
  addImage: (src, originalWidth, originalHeight, position) => {
    const state = get();
    const aspectRatio = originalWidth / originalHeight;
    const maxWidth = state.canvasSize.width * 0.4;
    const maxHeight = state.canvasSize.height * 0.4;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const pos = position || {
      x: (state.canvasSize.width - width) / 2,
      y: (state.canvasSize.height - height) / 2,
    };

    const imageObject: Omit<ImageObject, 'id' | 'zIndex'> = {
      type: ObjectType.IMAGE,
      ...DEFAULT_IMAGE_OBJECT,
      interactive: true,
      src,
      originalWidth,
      originalHeight,
      position: pos,
      size: { width, height },
      cropWidth: originalWidth,
      cropHeight: originalHeight,
    };

    return get().addObject(imageObject);
  },

  updateImage: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Shape Actions
  addShape: (shapeType, position) => {
    const state = get();
    const defaultSize = shapeType === 'line' ? { width: 100, height: 2 } : { width: 100, height: 100 };
    const pos = position || {
      x: state.canvasSize.width / 2 - defaultSize.width / 2,
      y: state.canvasSize.height / 2 - defaultSize.height / 2,
    };

    const shapeObject: Omit<ShapeObject, 'id' | 'zIndex'> = {
      type: ObjectType.SHAPE,
      ...DEFAULT_SHAPE_OBJECT,
      fill: 'transparent',
      stroke: '#737373',
      strokeWidth: 1,
      shapeType,
      position: pos,
      size: defaultSize,
    };

    return get().addObject(shapeObject);
  },

  updateShape: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Background Actions
  updateBackground: (updates) => {
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          background: {
            ...currentData.background,
            ...updates,
          },
        },
        past,
        future: [],
        isDirty: true,
      };
    });
  },

  // Selection
  selectObject: (id) => {
    set({ selectedId: id, backgroundSelected: false, trimSelected: false, inspectorPreview: null });
  },

  setInspectorPreview: (inspectorPreview) => {
    set({ inspectorPreview });
  },

  // History
  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const side = previous.side ?? state.activeSide;
      const sideKey = side === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const frame = state.sideFrames[side];

      return {
        ...(previous.frame ?? frame),
        activeSide: side,
        sideFrames: { ...state.sideFrames, [side]: previous.frame ?? frame },
        [sideKey]: {
          objects: previous.objects,
          background: previous.background,
        },
        past: newPast,
        future: [{ objects: currentData.objects, background: currentData.background, frame, side }, ...state.future].slice(
          0,
          MAX_HISTORY_SIZE,
        ),
        selectedId: null,
        inspectorPreview: null,
        isDirty: true,
        backgroundSelected: false,
        trimSelected: false,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;

      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const side = next.side ?? state.activeSide;
      const sideKey = side === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const frame = state.sideFrames[side];

      return {
        ...(next.frame ?? frame),
        activeSide: side,
        sideFrames: { ...state.sideFrames, [side]: next.frame ?? frame },
        [sideKey]: {
          objects: next.objects,
          background: next.background,
        },
        past: [...state.past, { objects: currentData.objects, background: currentData.background, frame, side }].slice(
          -MAX_HISTORY_SIZE,
        ),
        future: newFuture,
        selectedId: null,
        inspectorPreview: null,
        isDirty: true,
        backgroundSelected: false,
        trimSelected: false,
      };
    });
  },

  clearHistory: () => {
    set({ past: [], future: [] });
  },

  // View
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.01, Math.min(5, zoom)) });
  },

  setPan: (pan) => {
    set({ pan });
  },

  fitView: (viewportSize) => {
    const { canvasSize } = get();
    if (!viewportSize.width || !viewportSize.height || !canvasSize.width || !canvasSize.height) return;

    const availableWidth = Math.max(1, viewportSize.width - FIT_SCREEN_PADDING.horizontal);
    const availableHeight = Math.max(1, viewportSize.height - FIT_SCREEN_PADDING.vertical);
    const zoom = Math.max(MIN_ZOOM, Math.min(availableWidth / canvasSize.width, availableHeight / canvasSize.height, MAX_ZOOM));

    set({
      zoom,
      fitZoom: zoom,
      pan: {
        x: -CANVAS_VIEW_OFFSET.x,
        y: -CANVAS_VIEW_OFFSET.y,
      },
    });
  },

  resetView: () => {
    const { fitZoom } = get();
    set({ zoom: fitZoom, pan: { x: 0, y: 0 } });
  },

  resolveTemplateFrame: (backgroundSize) => {
    const { templateFrameConfig, activeSide } = get();
    if (!templateFrameConfig || backgroundSize.width <= 0 || backgroundSize.height <= 0) return;

    const cutWidth = Math.min(Math.max(1, templateFrameConfig.cutWidth ?? backgroundSize.width * 0.8), backgroundSize.width);
    const cutHeight = Math.min(Math.max(1, templateFrameConfig.cutHeight ?? backgroundSize.height * 0.8), backgroundSize.height);
    const defaultX = (backgroundSize.width - cutWidth) / 2;
    const defaultY = (backgroundSize.height - cutHeight) / 2;
    const cutX = Math.max(0, templateFrameConfig.cutOffsetX ?? defaultX);
    const cutY = Math.max(0, templateFrameConfig.cutOffsetY ?? defaultY);

    const resolvedFrame: SideFrameState = {
      canvasSize: {
        width: Math.max(backgroundSize.width, cutX + (templateFrameConfig.cutWidth ?? cutWidth)) || backgroundSize.width,
        height: Math.max(backgroundSize.height, cutY + (templateFrameConfig.cutHeight ?? cutHeight)) || backgroundSize.height,
      },
      contentSize: { width: templateFrameConfig.cutWidth ?? cutWidth, height: templateFrameConfig.cutHeight ?? cutHeight },
      contentOffset: { x: cutX, y: cutY },
      templateFrameConfig,
      contentSafeMargin:
        templateFrameConfig.safeMargin !== undefined && templateFrameConfig.pageHeight
          ? Math.max(
              0,
              (templateFrameConfig.safeMargin / templateFrameConfig.pageHeight) * (templateFrameConfig.cutHeight ?? cutHeight),
            )
          : 0,
    };
    set((state) => {
      const key = activeSide === 'front' ? 'frontData' : 'backData';
      return {
        ...resolvedFrame,
        [key]: {
          ...state[key],
          background: { ...state[key].background, previewSize: state[key].background.previewSize ?? backgroundSize },
        },
        sideFrames: { ...state.sideFrames, [activeSide]: resolvedFrame },
      };
    });
  },

  // Settings
  toggleGrid: () => {
    set((state) => {
      const gridEnabled = !state.gridEnabled;
      return { gridEnabled, snapToGrid: gridEnabled };
    });
  },

  toggleRulers: () => {
    set((state) => ({ rulersEnabled: !state.rulersEnabled }));
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },

  toggleSnapToCenter: () => {
    set((state) => ({ snapToCenter: !state.snapToCenter }));
  },

  toggleSnapToEdges: () => {
    set((state) => ({ snapToEdges: !state.snapToEdges }));
  },

  toggleSnapToObjects: () => {
    set((state) => ({ snapToObjects: !state.snapToObjects }));
  },

  toggleSnapToSafeArea: () => {
    set((state) => ({ snapToSafeArea: !state.snapToSafeArea }));
  },

  // Export Loading
  setExportLoading: (loading) => {
    set({ isExportLoading: loading });
  },

  // Utility
  clearCanvas: () => {
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const past = [
        ...state.past,
        { objects: currentData.objects, background: currentData.background, side: state.activeSide },
      ].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          objects: [],
          background: createDefaultBackground(),
        },
        selectedId: null,
        inspectorPreview: null,
        past,
        backgroundSelected: false,
        trimSelected: false,
        future: [],
      };
    });
  },

  getSelectedObject: () => {
    const state = get();
    if (!state.selectedId) return null;
    const currentObjects = state.getCurrentObjects();
    return currentObjects.find((obj) => obj.id === state.selectedId) || null;
  },

  exportImages: async (stageRef: React.RefObject<Konva.Stage | null>) => {
    const stage = stageRef.current;
    if (!stage) throw new Error('Stage not found');

    const { activeSide, switchSide } = get();
    const images: { front: string; back: string } = { front: '', back: '' };

    get().setExportLoading(true);
    get().selectObject(null);

    const originalSide = activeSide;
    const oldWidth = stage.width();
    const oldHeight = stage.height();

    const layers = stage.getLayers();
    const bgLayer = layers[0];
    const transformerLayer = layers[3];

    const layerStates = layers.map((layer) => ({
      layer,
      x: layer.x(),
      y: layer.y(),
      scaleX: layer.scaleX(),
      scaleY: layer.scaleY(),
      visible: layer.visible(),
    }));

    const oldTransformerLayerVisible = transformerLayer?.visible() ?? true;
    transformerLayer?.visible(false);
    const editorOnlyStates = stage.find('.editor-only').map((node) => ({ node, visible: node.visible() }));
    editorOnlyStates.forEach(({ node }) => node.hide());

    const waitForRenderedSide = async (side: CardSide, backgroundSource?: string) => {
      const sideLayer = layers[side === 'front' ? 1 : 2];
      const expectedBackgroundUrl = backgroundSource ? new URL(backgroundSource, window.location.href).href : '';
      const timeoutAt = Date.now() + 5000;

      while (Date.now() < timeoutAt) {
        const backgroundNode = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
        const renderedImage = backgroundNode?.image() as HTMLImageElement | undefined;
        const renderedBackgroundUrl = renderedImage
          ? new URL(renderedImage.currentSrc || renderedImage.src, window.location.href).href
          : '';
        const backgroundReady =
          !backgroundSource || (Boolean(renderedImage?.complete) && renderedBackgroundUrl === expectedBackgroundUrl);

        if (sideLayer?.visible() && backgroundReady) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
          stage.batchDraw();
          return;
        }

        await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
      }
    };

    const captureSide = async (side: CardSide) => {
      switchSide(side);

      const sideData = side === 'front' ? get().frontData : get().backData;
      const imageSources = [
        sideData.background.backgroundImage,
        ...sideData.objects.flatMap((object) => (object.type === ObjectType.IMAGE ? [object.src, object.maskImageUrl] : [])),
      ].filter((source): source is string => Boolean(source));
      await Promise.all(
        imageSources.map(
          (source) =>
            new Promise<void>((resolve) => {
              const image = new window.Image();
              image.crossOrigin = 'Anonymous';
              const timeout = window.setTimeout(resolve, 5000);
              const finish = () => {
                window.clearTimeout(timeout);
                resolve();
              };
              image.onload = finish;
              image.onerror = finish;
              image.src = source;
              if (image.complete) finish();
            }),
        ),
      );

      // Wait for the target side (including its own background) to be mounted
      // in Konva. A fixed delay can capture the previous side when switching.
      await waitForRenderedSide(side, sideData.background.backgroundImage);

      const sideFrame = get().sideFrames[side];
      const { canvasSize: stateCanvasSize, contentSize, contentOffset } = sideFrame;

      stage.width(contentSize.width);
      stage.height(contentSize.height);

      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
        layer.scaleX(1);
        layer.scaleY(1);
      });
      bgLayer.x(-contentOffset.x);
      bgLayer.y(-contentOffset.y);

      // Hide grid lines during export
      const gridLines = (bgLayer.find('Line') || []) as unknown as Konva.Line[];
      const gridLineStates = gridLines.map((line) => ({
        line,
        visible: line.visible(),
      }));
      gridLines.forEach((line) => line.visible(false));

      // Handle background rect - ensure it fits and has export border
      const bgRect = bgLayer.findOne('Rect') as Konva.Rect | undefined;
      let originalStroke, originalStrokeWidth, originalStrokeEnabled, originalBgRectPos;
      if (bgRect) {
        originalBgRectPos = { x: bgRect.x(), y: bgRect.y(), width: bgRect.width(), height: bgRect.height() };
        originalStroke = bgRect.stroke();
        originalStrokeWidth = bgRect.strokeWidth();
        originalStrokeEnabled = bgRect.strokeEnabled();

        bgRect.x(0);
        bgRect.y(0);
        bgRect.width(stateCanvasSize.width);
        bgRect.height(stateCanvasSize.height);
        bgRect.strokeEnabled(false);
      }

      const bgImage = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
      const originalBgImageAttrs = bgImage ? { ...bgImage.getAttrs() } : undefined;
      if (bgImage) {
        const image = bgImage.image() as HTMLImageElement | undefined;
        const transformed = getTransformedBackgroundGeometry(
          { width: image?.naturalWidth || image?.width || 0, height: image?.naturalHeight || image?.height || 0 },
          sideData.background.backgroundTransform,
        );
        // Saved transforms use natural-image pixels. Layer positioning above
        // handles the print crop or the full-canvas preview independently.
        const geometry = transformed ?? { x: 0, y: 0, width: stateCanvasSize.width, height: stateCanvasSize.height };
        bgImage.position(geometry);
        bgImage.size(geometry);
        if (transformed) bgImage.crop({ x: 0, y: 0, width: 0, height: 0 });
      }

      const backgroundDecorationStates = bgLayer.getChildren().map((node) => ({ node, visible: node.visible() }));
      backgroundDecorationStates.forEach(({ node }) => {
        if (node !== bgRect && node !== bgImage) node.visible(false);
      });
      const replaceControlStates = stage.find('.image-replace-control').map((node) => ({ node, visible: node.visible() }));
      replaceControlStates.forEach(({ node }) => node.visible(false));

      try {
        stage.batchDraw();
        await new Promise((resolve) => setTimeout(resolve, 50));

        await prepareStageText(stage);
        return stage.toDataURL({
          pixelRatio: 3,
          mimeType: 'image/png',
          x: 0,
          y: 0,
          width: contentSize.width,
          height: contentSize.height,
        });
      } finally {
        backgroundDecorationStates.forEach(({ node, visible }) => node.visible(visible));
        replaceControlStates.forEach(({ node, visible }) => node.visible(visible));

        // Restore grid lines
        gridLineStates.forEach(({ line, visible }) => {
          line.visible(visible);
        });

        // Restore bgRect
        if (bgRect && originalBgRectPos) {
          bgRect.x(originalBgRectPos.x);
          bgRect.y(originalBgRectPos.y);
          bgRect.width(originalBgRectPos.width);
          bgRect.height(originalBgRectPos.height);
          bgRect.stroke(originalStroke);
          bgRect.strokeWidth(originalStrokeWidth);
          bgRect.strokeEnabled(originalStrokeEnabled);
        }

        // Restore attributes introduced during export too, including an absent crop.
        if (bgImage && originalBgImageAttrs) {
          for (const key of Object.keys(bgImage.getAttrs())) {
            if (!(key in originalBgImageAttrs)) bgImage.setAttr(key, undefined);
          }
          bgImage.setAttrs(originalBgImageAttrs);
        }
      }
    };

    try {
      images.front = await captureSide('front');
      if (get().sidedness === 'DOUBLE') {
        images.back = await captureSide('back');
      }

      // Restore stage and layers
      stage.width(oldWidth);
      stage.height(oldHeight);

      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });

      transformerLayer?.visible(oldTransformerLayerVisible);
      switchSide(originalSide);

      stage.batchDraw();
      get().setExportLoading(false);

      return images;
    } catch (error) {
      // Emergency Restore
      stage.width(oldWidth);
      stage.height(oldHeight);
      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });
      transformerLayer?.visible(oldTransformerLayerVisible);
      switchSide(originalSide);
      get().setExportLoading(false);
      throw error;
    } finally {
      editorOnlyStates.forEach(({ node, visible }) => node.visible(visible));
      stage.batchDraw();
    }
  },

  exportPreviewImages: async (stageRef: React.RefObject<Konva.Stage | null>) => {
    const stage = stageRef.current;
    if (!stage) throw new Error('Stage not found');

    const { activeSide, switchSide } = get();
    const images: { front: string; back: string } = { front: '', back: '' };

    get().setExportLoading(true);
    get().selectObject(null);

    const originalSide = activeSide;
    const oldWidth = stage.width();
    const oldHeight = stage.height();

    const layers = stage.getLayers();
    const bgLayer = layers[0];
    const transformerLayer = layers[3];

    const layerStates = layers.map((layer) => ({
      layer,
      x: layer.x(),
      y: layer.y(),
      scaleX: layer.scaleX(),
      scaleY: layer.scaleY(),
      visible: layer.visible(),
    }));

    const oldTransformerLayerVisible = transformerLayer?.visible() ?? true;
    transformerLayer?.visible(false);
    const editorOnlyStates = stage.find('.editor-only').map((node) => ({ node, visible: node.visible() }));
    editorOnlyStates.forEach(({ node }) => node.hide());

    const waitForRenderedSide = async (side: CardSide, backgroundSource?: string) => {
      const sideLayer = layers[side === 'front' ? 1 : 2];
      const expectedBackgroundUrl = backgroundSource ? new URL(backgroundSource, window.location.href).href : '';
      const timeoutAt = Date.now() + 5000;

      while (Date.now() < timeoutAt) {
        const backgroundNode = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
        const renderedImage = backgroundNode?.image() as HTMLImageElement | undefined;
        const renderedBackgroundUrl = renderedImage
          ? new URL(renderedImage.currentSrc || renderedImage.src, window.location.href).href
          : '';
        const backgroundReady =
          !backgroundSource || (Boolean(renderedImage?.complete) && renderedBackgroundUrl === expectedBackgroundUrl);

        if (sideLayer?.visible() && backgroundReady) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
          stage.batchDraw();
          return;
        }

        await new Promise<void>((resolve) => window.setTimeout(resolve, 16));
      }
    };

    const captureSide = async (side: CardSide) => {
      switchSide(side);

      const sideData = side === 'front' ? get().frontData : get().backData;
      const imageSources = [
        sideData.background.backgroundImage,
        ...sideData.objects.flatMap((object) => (object.type === ObjectType.IMAGE ? [object.src, object.maskImageUrl] : [])),
      ].filter((source): source is string => Boolean(source));
      await Promise.all(
        imageSources.map(
          (source) =>
            new Promise<void>((resolve) => {
              const image = new window.Image();
              image.crossOrigin = 'Anonymous';
              const timeout = window.setTimeout(resolve, 5000);
              const finish = () => {
                window.clearTimeout(timeout);
                resolve();
              };
              image.onload = finish;
              image.onerror = finish;
              image.src = source;
              if (image.complete) finish();
            }),
        ),
      );

      // Wait for the target side (including its own background) to be mounted
      // in Konva. A fixed delay can capture the previous side when switching.
      await waitForRenderedSide(side, sideData.background.backgroundImage);

      const { canvasSize: stateCanvasSize, contentOffset } = get().sideFrames[side];

      stage.width(stateCanvasSize.width);
      stage.height(stateCanvasSize.height);

      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
        layer.scaleX(1);
        layer.scaleY(1);
      });
      // Objects are stored in the print-area coordinate system. For a full
      // canvas preview, place them back at that area's offset.
      layers[1]?.position(contentOffset);
      layers[2]?.position(contentOffset);

      // Hide grid lines during export
      const gridLines = (bgLayer.find('Line') || []) as unknown as Konva.Line[];
      const gridLineStates = gridLines.map((line) => ({
        line,
        visible: line.visible(),
      }));
      gridLines.forEach((line) => line.visible(false));

      // Handle background rect - ensure it fits and has export border
      const bgRect = bgLayer.findOne('Rect') as Konva.Rect | undefined;
      let originalStroke, originalStrokeWidth, originalStrokeEnabled, originalBgRectPos;
      if (bgRect) {
        originalBgRectPos = { x: bgRect.x(), y: bgRect.y(), width: bgRect.width(), height: bgRect.height() };
        originalStroke = bgRect.stroke();
        originalStrokeWidth = bgRect.strokeWidth();
        originalStrokeEnabled = bgRect.strokeEnabled();

        bgRect.x(0);
        bgRect.y(0);
        bgRect.width(stateCanvasSize.width);
        bgRect.height(stateCanvasSize.height);
        bgRect.strokeEnabled(false);
      }

      const bgImage = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
      const originalBgImageAttrs = bgImage ? { ...bgImage.getAttrs() } : undefined;
      if (bgImage) {
        const image = bgImage.image() as HTMLImageElement | undefined;
        const transformed = getTransformedBackgroundGeometry(
          { width: image?.naturalWidth || image?.width || 0, height: image?.naturalHeight || image?.height || 0 },
          sideData.background.backgroundTransform,
        );
        // Saved transforms use natural-image pixels. Layer positioning above
        // handles the print crop or the full-canvas preview independently.
        const geometry = transformed ?? { x: 0, y: 0, width: stateCanvasSize.width, height: stateCanvasSize.height };
        bgImage.position(geometry);
        bgImage.size(geometry);
        if (transformed) bgImage.crop({ x: 0, y: 0, width: 0, height: 0 });
      }

      // Keep the saved preview faithful to the canvas artwork, without editor
      // guides, grid lines, selection controls, or image-frame controls.
      const backgroundDecorationStates = bgLayer.getChildren().map((node) => ({ node, visible: node.visible() }));
      backgroundDecorationStates.forEach(({ node }) => {
        if (node !== bgRect && node !== bgImage) node.visible(false);
      });
      const replaceControlStates = stage.find('.image-replace-control').map((node) => ({ node, visible: node.visible() }));
      replaceControlStates.forEach(({ node }) => node.visible(false));

      try {
        stage.batchDraw();
        await new Promise((resolve) => setTimeout(resolve, 50));

        await prepareStageText(stage);
        return stage.toDataURL({
          pixelRatio: stage.width() > 1000 ? 1 : 1.5,
          mimeType: 'image/jpeg',
          quality: 0.8,
          x: 0,
          y: 0,
          width: stateCanvasSize.width,
          height: stateCanvasSize.height,
        });
      } finally {
        backgroundDecorationStates.forEach(({ node, visible }) => node.visible(visible));
        replaceControlStates.forEach(({ node, visible }) => node.visible(visible));

        // Restore grid lines
        gridLineStates.forEach(({ line, visible }) => {
          line.visible(visible);
        });

        // Restore bgRect
        if (bgRect && originalBgRectPos) {
          bgRect.x(originalBgRectPos.x);
          bgRect.y(originalBgRectPos.y);
          bgRect.width(originalBgRectPos.width);
          bgRect.height(originalBgRectPos.height);
          bgRect.stroke(originalStroke);
          bgRect.strokeWidth(originalStrokeWidth);
          bgRect.strokeEnabled(originalStrokeEnabled);
        }

        // Restore attributes introduced during export too, including an absent crop.
        if (bgImage && originalBgImageAttrs) {
          for (const key of Object.keys(bgImage.getAttrs())) {
            if (!(key in originalBgImageAttrs)) bgImage.setAttr(key, undefined);
          }
          bgImage.setAttrs(originalBgImageAttrs);
        }
      }
    };

    try {
      images.front = await captureSide('front');
      if (get().sidedness === 'DOUBLE') {
        images.back = await captureSide('back');
      }

      // Restore stage and layers
      stage.width(oldWidth);
      stage.height(oldHeight);

      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });

      transformerLayer?.visible(oldTransformerLayerVisible);
      switchSide(originalSide);

      stage.batchDraw();
      get().setExportLoading(false);

      return images;
    } catch (error) {
      // Emergency Restore
      stage.width(oldWidth);
      stage.height(oldHeight);
      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });
      transformerLayer?.visible(oldTransformerLayerVisible);
      switchSide(originalSide);
      get().setExportLoading(false);
      throw error;
    } finally {
      editorOnlyStates.forEach(({ node, visible }) => node.visible(visible));
      stage.batchDraw();
    }
  },

  exportToPDF: async (stageRef: React.RefObject<Konva.Stage | null>) => {
    // The legacy argument stays for callers; printing never reads or mutates the stage.
    void stageRef;
    try {
      get().setExportLoading(true);
      const state = get();
      const result = await buildPrintPdf({
        frontData: state.frontData,
        backData: state.backData,
        sideFrames: state.sideFrames,
        sidedness: state.sidedness,
      });
      for (const warning of result.warnings) toast.warning(warning, { duration: 12_000 });
      downloadPrintPdf(result.blob);
      get().setExportLoading(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : '인쇄 PDF를 생성하지 못했습니다.');
      get().setExportLoading(false);
      throw error;
    }
  },
  // Actions - Load
  resetEditor: () => {
    set({
      activeSide: 'front',
      frontData: { objects: [], background: createDefaultBackground() },
      backData: { objects: [], background: createDefaultBackground() },
      ...createFreeEditFrame(),
      fitZoom: DEFAULT_ZOOM,
      sideFrames: { front: createFreeEditFrame(), back: createFreeEditFrame() },
      sidedness: 'DOUBLE',
      thumbnails: { front: null, back: null },
      isExportLoading: false,
      isDirty: false,
      inspectorPreview: null,
      selectedId: null,
      backgroundSelected: false,
      trimSelected: false,
      zoom: DEFAULT_ZOOM,
      pan: { x: 0, y: 0 },
      past: [],
      future: [],
    });
  },
  updateFreeEditFrame: (widthMm, heightMm, safeMarginMm, syncDimensions = true) => {
    if (![widthMm, heightMm, safeMarginMm].every(Number.isFinite)) return;
    if (widthMm < 1 || heightMm < 1 || widthMm > 1000 || heightMm > 1000) return;
    const safeMargin = Math.max(0, Math.min(safeMarginMm, Math.min(widthMm, heightMm) / 2));
    set((state) => {
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];
      const frame = state.sideFrames[state.activeSide];
      // One pixels/mm value links physical inputs and the drawn trim in both directions.
      const oldUnit = frame.templateFrameConfig?.pageUnit === 'px' ? 25.4 / 96 : 1;
      const oldWidthMm = (frame.templateFrameConfig?.pageWidth ?? widthMm) * oldUnit;
      const oldHeightMm = (frame.templateFrameConfig?.pageHeight ?? heightMm) * oldUnit;
      const pixelsPerMm = frame.contentSize.width / oldWidthMm;
      const dimensionsChanged = widthMm !== oldWidthMm || heightMm !== oldHeightMm;
      const contentSize =
        dimensionsChanged || syncDimensions
          ? { width: widthMm * pixelsPerMm, height: heightMm * pixelsPerMm }
          : frame.contentSize;
      const nextFrame: SideFrameState = {
        ...frame,
        contentSize,
        canvasSize: {
          width: Math.max(frame.canvasSize.width, frame.contentOffset.x + contentSize.width),
          height: Math.max(frame.canvasSize.height, frame.contentOffset.y + contentSize.height),
        },
        templateFrameConfig: {
          ...frame.templateFrameConfig,
          pageWidth: widthMm,
          pageHeight: heightMm,
          pageUnit: 'mm',
          safeMargin,
          cutWidth: contentSize.width,
          cutHeight: contentSize.height,
          cutOffsetX: frame.contentOffset.x,
          cutOffsetY: frame.contentOffset.y,
        },
        contentSafeMargin: (safeMargin / heightMm) * contentSize.height,
      };
      if (
        hasPhysicalPrintAspect(frame) &&
        frame.templateFrameConfig?.pageWidth === widthMm &&
        frame.templateFrameConfig?.pageHeight === heightMm &&
        frame.templateFrameConfig?.pageUnit === 'mm' &&
        frame.contentSafeMargin === nextFrame.contentSafeMargin
      )
        return state;
      return {
        ...nextFrame,
        [sideKey]: {
          ...currentData,
          background: {
            ...currentData.background,
            previewSize: currentData.background.previewSize ?? frame.canvasSize,
          },
        },
        sideFrames: { ...state.sideFrames, [state.activeSide]: nextFrame },
        past: [
          ...state.past,
          { objects: currentData.objects, background: currentData.background, frame, side: state.activeSide },
        ].slice(-MAX_HISTORY_SIZE),
        future: [],
        inspectorPreview: null,
        isDirty: true,
      };
    });
  },
  loadDesign: (data) => {
    set((state) => {
      const fallbackFrame: SideFrameState = {
        canvasSize: data.canvasSize || state.canvasSize,
        contentSize: data.contentSize || data.canvasSize || state.canvasSize,
        contentOffset: data.contentOffset || { x: 0, y: 0 },
        templateFrameConfig: data.templateFrameConfig ?? null,
        contentSafeMargin: data.contentSafeMargin ?? SAFE_MARGIN_PX,
      };
      const originalFrames = data.sideFrames || { front: fallbackFrame, back: fallbackFrame };
      const sideFrames = {
        front: normalizePhysicalPrintFrame(originalFrames.front),
        back: normalizePhysicalPrintFrame(originalFrames.back),
      };
      return {
        frontData: {
          ...data.frontData,
          background: {
            ...data.frontData.background,
            previewSize: data.frontData.background.previewSize ?? originalFrames.front.canvasSize,
          },
          objects: data.frontData.objects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        },
        backData: {
          ...data.backData,
          background: {
            ...data.backData.background,
            previewSize: data.backData.background.previewSize ?? originalFrames.back.canvasSize,
          },
          objects: data.backData.objects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        },
        canvasSize: sideFrames.front.canvasSize,
        contentSize: sideFrames.front.contentSize,
        contentOffset: sideFrames.front.contentOffset,
        templateFrameConfig: sideFrames.front.templateFrameConfig,
        contentSafeMargin: sideFrames.front.contentSafeMargin,
        sideFrames,
        past: [],
        future: [],
        selectedId: null,
        inspectorPreview: null,
        isDirty: false,
        backgroundSelected: false,
        trimSelected: false,
        activeSide: 'front',
        sidedness: data.sidedness || state.sidedness,
      };
    });
  },
  updateFields: (values) => {
    set((state) => {
      const updateSideData = (data: CardSideData) => ({
        ...data,
        objects:
          data?.objects?.map((obj) => {
            if (obj.type === ObjectType.TEXT && obj.field && values[obj.field] !== undefined) {
              return { ...obj, content: String(values[obj.field]) };
            }
            if (obj.type === ObjectType.IMAGE && obj.field && values[obj.field] !== undefined) {
              return { ...obj, src: transformToUrl(values[obj.field] as File | string) };
            }
            return obj;
          }) ?? [],
      });

      return {
        frontData: updateSideData(state.frontData),
        backData: updateSideData(state.backData),
        isDirty: true,
      };
    });
  },
  setTemplate: (template: Template) => {
    const { layout_config } = template;
    if (!layout_config) return;

    const finite = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

    const layers = layout_config.layers || [];
    const getTemplateSide = (side?: string): CardSide => (String(side || 'front').toLowerCase() === 'back' ? 'back' : 'front');
    const guides = layout_config.guides;
    const hasSideGuides = Boolean(guides && ('front' in guides || 'back' in guides));
    // Modern templates persist each side independently. Only the legacy flat
    // guide contract is shared between front and back.
    const frontGuides = guides?.front || guides;
    const backGuides = hasSideGuides ? guides?.back : guides;
    const pageToPixel = (value: number) => (layout_config.page.unit === 'mm' ? (value * 96) / 25.4 : value);
    const frontPageSize = {
      width: frontGuides?.cut_width ?? layout_config.page.width,
      height: frontGuides?.cut_height ?? layout_config.page.height,
    };
    const backPageSize = {
      width: backGuides?.cut_width ?? layout_config.page.width,
      height: backGuides?.cut_height ?? layout_config.page.height,
    };
    const frontPagePixelSize = { width: pageToPixel(frontPageSize.width), height: pageToPixel(frontPageSize.height) };
    const configuredCutSize = {
      width: finite(frontGuides?.cut_frame_width, frontPagePixelSize.width),
      height: finite(frontGuides?.cut_frame_height, frontPagePixelSize.height),
    };
    const fontRenderScale =
      frontPagePixelSize.width > 0 && frontPagePixelSize.height > 0
        ? Math.max(
            0.1,
            Math.min(configuredCutSize.width / frontPagePixelSize.width, configuredCutSize.height / frontPagePixelSize.height),
          )
        : 1;

    const mapLayerToObject = (layer: Layer, sideFontRenderScale = fontRenderScale): CanvasObject | undefined => {
      if (!layer.position || !layer.size) return undefined;

      const layerWidth = Math.max(1, finite(layer.size.width, 1));
      const layerHeight = Math.max(1, finite(layer.size.height, 1));
      const opacity = clamp(finite(layer.style?.opacity, 1), 0, 1);

      const baseProps = {
        id: layer.id || generateId(),
        position: { x: finite(layer.position.x, 0), y: finite(layer.position.y, 0) },
        size: { width: layerWidth, height: layerHeight },
        rotation: finite(layer.rotation, 0),
        opacity,
        locked: layer.locked ?? false,
        visible: layer.visible ?? true,
        field: layer.field_key,
        label: layer.label,
        defaultValue: layer.default_value,
      };

      if (layer.type === 'text') {
        return {
          ...baseProps,
          type: ObjectType.TEXT,
          content: layer.default_value || layer.field_key || 'Text',
          fontFamily: layer.style?.font_family || 'Inter',
          fontSize: finite(layer.style?.font_size, 18) * (96 / 72) * sideFontRenderScale,
          fontRenderScale: sideFontRenderScale,
          fontWeight:
            layer.style?.font_weight === 'bold'
              ? '700'
              : layer.style?.font_weight === 'medium'
                ? '500'
                : layer.style?.font_weight === 'regular'
                  ? '400'
                  : layer.style?.font_weight || '400',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: layer.style?.color || '#000000',
          align: layer.style?.align || 'left',
          lineHeight: layer.style?.line_height || 1,
          letterSpacing: layer.style?.letter_spacing || 0,
          stroke: layer.style?.stroke_color || '#111827',
          strokeWidth: finite(layer.style?.stroke_width, 0),
          shadowColor: layer.style?.shadow_color || '#000000',
          shadowBlur: finite(layer.style?.shadow_blur, 0),
          shadowOffsetX: finite(layer.style?.shadow_offset_x, 0),
          shadowOffsetY: finite(layer.style?.shadow_offset_y, 0),
          shadowOpacity: clamp(finite(layer.style?.shadow_opacity, 0), 0, 1),
        } as TextObject;
      }

      if (layer.type === 'image') {
        return {
          ...baseProps,
          type: ObjectType.IMAGE,
          interactive: layer.field_key === 'image_frame',
          src: typeof layer.image_url === 'string' ? resolveCanvasAssetUrl(layer.image_url) : '',
          maskShape: layer.mask_shape || (layer.field_key === 'image_frame' ? 'circle' : 'none'),
          maskImageUrl: typeof layer.mask_image_url === 'string' ? resolveCanvasAssetUrl(layer.mask_image_url) : undefined,
          originalWidth: 0,
          originalHeight: 0,
          cropX: 0,
          cropY: 0,
          cropWidth: 0,
          cropHeight: 0,
        } as ImageObject;
      }

      if (layer.type === 'shape') {
        const shapeType = layer.shape_type === 'ellipse' ? 'circle' : layer.shape_type || 'rectangle';

        return {
          ...baseProps,
          type: ObjectType.SHAPE,
          shapeType,
          fill: layer.style?.color || '#111827',
          stroke: layer.style?.stroke_color || '#111827',
          strokeWidth: finite(layer.style?.stroke_width, 0),
          polygonSides: Math.max(3, Math.min(12, finite(layer.polygon_sides, 5))),
          fillImageUrl:
            typeof layer.style?.fill_image_url === 'string' ? resolveCanvasAssetUrl(layer.style.fill_image_url) : undefined,
        } as ShapeObject;
      }

      return undefined;
    };

    const processObjects = (side: CardSide) => {
      const sideGuides = side === 'front' ? frontGuides : backGuides;
      const sidePageSize = side === 'front' ? frontPageSize : backPageSize;
      const sidePagePixelSize = { width: pageToPixel(sidePageSize.width), height: pageToPixel(sidePageSize.height) };
      const sideFontRenderScale =
        sidePagePixelSize.width > 0 && sidePagePixelSize.height > 0
          ? Math.max(
              0.1,
              Math.min(
                finite(sideGuides?.cut_frame_width, sidePagePixelSize.width) / sidePagePixelSize.width,
                finite(sideGuides?.cut_frame_height, sidePagePixelSize.height) / sidePagePixelSize.height,
              ),
            )
          : 1;
      const configuredCutX = sideGuides?.cut_offset_x ?? undefined;
      const configuredCutY = sideGuides?.cut_offset_y ?? undefined;
      const objects = layers
        .filter((l: Layer) => getTemplateSide(l.side) === side)
        .map((l: Layer) => mapLayerToObject(l, sideFontRenderScale))
        .filter((obj): obj is CanvasObject => obj !== undefined);

      return objects.map((obj, i) => ({
        ...obj,
        position:
          sideGuides?.layer_coordinate_space === 'background'
            ? { x: obj.position.x - (configuredCutX ?? 0), y: obj.position.y - (configuredCutY ?? 0) }
            : obj.position,
        zIndex: i,
      }));
    };

    const frontObjects = processObjects('front');
    const backObjects = processObjects('back');
    const resolvedFrontBackground =
      layout_config.background?.front_image_url || template.background?.image_url || template.background?.image_path || undefined;
    const resolvedBackBackground = layout_config.background?.back_image_url || undefined;
    const hasBackTemplateData = Boolean(
      resolvedBackBackground || template.back_preview_url || layers.some((layer) => getTemplateSide(layer.side) === 'back'),
    );
    const isDoubleSidedTemplate = String(layout_config.side || '').toLowerCase() === 'double' || hasBackTemplateData;

    const getBackgroundConfig = (bgSrc?: string, sideGuides?: typeof frontGuides): BackgroundObject => {
      const bg: BackgroundObject = {
        id: generateId(),
        type: ObjectType.BACKGROUND,
        backgroundColor: '#FFFFFF',
        backgroundImage: resolveCanvasAssetUrl(bgSrc),
        backgroundSize: 'fill',
        backgroundTransform: normalizeBackgroundTransform(sideGuides?.background_transform),
      };

      return bg;
    };

    const currentState = get();
    const canReuseBackgroundSize =
      currentState.frontData.background.backgroundImage === resolveCanvasAssetUrl(resolvedFrontBackground);
    const createSideFrame = (sideGuides: typeof frontGuides, initialBackgroundSize: Size): SideFrameState => {
      const cutSize = {
        width: Math.min(Math.max(1, finite(sideGuides?.cut_frame_width, CARD_SIZE_PX.width)), initialBackgroundSize.width),
        height: Math.min(Math.max(1, finite(sideGuides?.cut_frame_height, CARD_SIZE_PX.height)), initialBackgroundSize.height),
      };
      const contentOffset = {
        x: clamp(
          finite(sideGuides?.cut_offset_x, (initialBackgroundSize.width - cutSize.width) / 2),
          0,
          initialBackgroundSize.width - cutSize.width,
        ),
        y: clamp(
          finite(sideGuides?.cut_offset_y, (initialBackgroundSize.height - cutSize.height) / 2),
          0,
          initialBackgroundSize.height - cutSize.height,
        ),
      };
      const templateFrameConfig: TemplateFrameConfig = {
        cutOffsetX: sideGuides?.cut_offset_x ?? undefined,
        cutOffsetY: sideGuides?.cut_offset_y ?? undefined,
        cutWidth: sideGuides?.cut_frame_width ?? undefined,
        cutHeight: sideGuides?.cut_frame_height ?? undefined,
        pageWidth: sideGuides?.cut_width ?? layout_config.page.width,
        pageHeight: sideGuides?.cut_height ?? layout_config.page.height,
        pageUnit: layout_config.page.unit,
        safeMargin: sideGuides?.safe_margin,
      };
      return {
        canvasSize: initialBackgroundSize,
        contentSize: cutSize,
        contentOffset: {
          x: Math.max(0, templateFrameConfig.cutOffsetX ?? contentOffset.x),
          y: Math.max(0, templateFrameConfig.cutOffsetY ?? contentOffset.y),
        },
        templateFrameConfig,
        contentSafeMargin:
          sideGuides?.safe_margin !== undefined && templateFrameConfig.pageHeight
            ? Math.max(0, (sideGuides.safe_margin / templateFrameConfig.pageHeight) * cutSize.height)
            : 0,
      };
    };
    const frontInitialSize = canReuseBackgroundSize
      ? currentState.canvasSize
      : {
          width: Math.max(1, finite(frontGuides?.cut_frame_width, CARD_SIZE_PX.width)),
          height: Math.max(1, finite(frontGuides?.cut_frame_height, CARD_SIZE_PX.height)),
        };
    const backInitialSize = {
      width: Math.max(1, finite(backGuides?.cut_frame_width, CARD_SIZE_PX.width)),
      height: Math.max(1, finite(backGuides?.cut_frame_height, CARD_SIZE_PX.height)),
    };
    // Convert template fonts using the original saved frame before normalizing
    // geometry. Pixel objects must not be resized by legacy metadata correction.
    const frontFrame = normalizePhysicalPrintFrame(createSideFrame(frontGuides, frontInitialSize));
    const backFrame = normalizePhysicalPrintFrame(createSideFrame(backGuides, backInitialSize));

    set({
      frontData: {
        objects: frontObjects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        background: getBackgroundConfig(resolvedFrontBackground, frontGuides),
      },
      backData: {
        objects: backObjects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        background: getBackgroundConfig(resolvedBackBackground, backGuides),
      },
      canvasSize: frontFrame.canvasSize,
      contentSize: frontFrame.contentSize,
      contentOffset: frontFrame.contentOffset,
      templateFrameConfig: frontFrame.templateFrameConfig,
      contentSafeMargin: frontFrame.contentSafeMargin,
      sideFrames: { front: frontFrame, back: backFrame },
      sidedness: isDoubleSidedTemplate ? 'DOUBLE' : 'SINGLE',
      past: [],
      future: [],
      selectedId: null,
      inspectorPreview: null,
      thumbnails: { front: null, back: null },
      backgroundSelected: false,
      trimSelected: false,
      isDirty: true,
      activeSide: 'front',
    });
  },
}));
