import { resolveTextFont } from '@/utils/helper/editor-fonts';
import { prepareStageText } from '@/utils/helper/canvas-text-renderer';
import {
  CARD_SIZE_MM,
  CARD_SIZE_PX,
  DEFAULT_IMAGE_OBJECT,
  DEFAULT_SHAPE_OBJECT,
  DEFAULT_TEXT_OBJECT,
  DEFAULT_ZOOM,
  MAX_HISTORY_SIZE,
} from '@/utils/constants/canvas-editor.constant';
import { exportCanvasToPDF, generateId, transformToUrl } from '@/utils/helper/canvas.helper';
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
  type SnapshotThumbnails,
  type TextObject,
} from '@/utils/types/canvas.types';
import type { Layer, Template } from '@/utils/types/design.response';
import Konva from 'konva';
import { create } from 'zustand';

interface HistoryEntry {
  objects: CanvasObject[];
  background: BackgroundObject;
}

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
  sidedness: 'SINGLE' | 'DOUBLE';

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
  addText: (position?: Position) => string;
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

  // Actions - History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Actions - View
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  resetView: () => void;

  // Actions - Settings
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;

  // Actions - Export Loading
  setExportLoading: (loading: boolean) => void;

  // Actions - Load
  loadDesign: (data: {
    frontData: CardSideData;
    backData: CardSideData;
    canvasSize?: { width: number; height: number };
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
  backgroundSize: 'cover',
  backgroundImage: 'https://tara-api.axndx.org/storage/templates/previews/EB4x2YiC3toryrARtjJzITAZZ4sS4kZK5Z7fxeLt.jpg',
});

const getNextZIndex = (objects: CanvasObject[]): number => {
  if (objects.length === 0) return 0;
  return Math.max(...objects.map((obj) => obj.zIndex)) + 1;
};

export const useWebEditorStore = create<WebEditorState>((set, get) => ({
  // EDITOR DATA - Initial state
  activeSide: 'front',
  frontData: {
    objects: [
      {
        id: 'b8b31e4d-c576-47a5-b6c5-4576cf311b61',
        position: {
          x: 26,
          y: 36,
        },
        size: {
          width: 150,
          height: 24,
        },
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        field: 'name',
        label: '이름',
        defaultValue: '이름이름',
        type: ObjectType.TEXT,
        content: '이름이름',
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: '600',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
        align: 'center',
        lineHeight: 1,
        letterSpacing: 1.3,
        zIndex: 0,
      },
      {
        id: '32de169e-bab9-41b4-a58e-bf3193850732',
        position: {
          x: 59,
          y: 76,
        },
        size: {
          width: 150,
          height: 24,
        },
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        field: 'phone',
        label: '전화번호',
        defaultValue: '전화번호전화번호',
        type: ObjectType.TEXT,
        content: '전화번호전화번호',
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
        align: 'left',
        lineHeight: 1,
        letterSpacing: 0,
        zIndex: 1,
      },
      {
        id: '77d6ad2f-ed8c-47e1-85b3-c6040f505ec5',
        position: {
          x: 56,
          y: 235,
        },
        size: {
          width: 100,
          height: 100,
        },
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        field: 'logo',
        label: '회사명',
        type: ObjectType.IMAGE,
        src: 'https://tara-api.axndx.org/storage/templates/previews/PIWOhtxxqVfsDiDmGB3X6h7ps2hXXzPxKP59fERB.jpg',
        originalWidth: 100,
        originalHeight: 100,
        cropX: 0,
        cropY: 0,
        cropWidth: 100,
        cropHeight: 100,
        zIndex: 2,
      },
    ],
    background: createDefaultBackground(),
  },
  backData: {
    objects: [],
    background: createDefaultBackground(),
  },

  canvasSize: CARD_SIZE_PX,
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

  // View state
  selectedId: null,
  zoom: DEFAULT_ZOOM,
  pan: { x: 0, y: 0 },
  gridEnabled: false,
  rulersEnabled: true,
  snapToGrid: false,
  snapToObjects: true,
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
    set({ activeSide: side, selectedId: null });
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
      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

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

      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

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
      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          ...currentData,
          objects: currentData.objects.filter((obj) => obj.id !== id),
        },
        selectedId: state.selectedId === id ? null : state.selectedId,
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
      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

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

      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

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
  addText: (position) => {
    const state = get();
    const pos = position || {
      x: state.canvasSize.width / 2 - 50,
      y: state.canvasSize.height / 2 - 10,
    };

    const textObject: Omit<TextObject, 'id' | 'zIndex'> = {
      type: ObjectType.TEXT,
      ...DEFAULT_TEXT_OBJECT,
      position: pos,
      size: { width: 100, height: 20 },
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
      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

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
    set({ selectedId: id });
  },

  // History
  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];

      return {
        [sideKey]: {
          objects: previous.objects,
          background: previous.background,
        },
        past: newPast,
        future: [{ objects: currentData.objects, background: currentData.background }, ...state.future].slice(
          0,
          MAX_HISTORY_SIZE,
        ),
        selectedId: null,
        isDirty: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;

      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const sideKey = state.activeSide === 'front' ? 'frontData' : 'backData';
      const currentData = state[sideKey];

      return {
        [sideKey]: {
          objects: next.objects,
          background: next.background,
        },
        past: [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE),
        future: newFuture,
        selectedId: null,
        isDirty: true,
      };
    });
  },

  clearHistory: () => {
    set({ past: [], future: [] });
  },

  // View
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(5, zoom)) });
  },

  setPan: (pan) => {
    set({ pan });
  },

  resetView: () => {
    set({ zoom: DEFAULT_ZOOM, pan: { x: 0, y: 0 } });
  },

  // Settings
  toggleGrid: () => {
    set((state) => ({ gridEnabled: !state.gridEnabled }));
  },

  toggleRulers: () => {
    set((state) => ({ rulersEnabled: !state.rulersEnabled }));
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },

  toggleSnapToObjects: () => {
    set((state) => ({ snapToObjects: !state.snapToObjects }));
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
      const past = [...state.past, { objects: currentData.objects, background: currentData.background }].slice(-MAX_HISTORY_SIZE);

      return {
        [sideKey]: {
          objects: [],
          background: createDefaultBackground(),
        },
        selectedId: null,
        past,
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

    const { activeSide, switchSide, canvasSize: stateCanvasSize } = get();
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

    const captureSide = async (side: CardSide) => {
      switchSide(side);

      // Wait for React to switch side and background components to update/load
      await new Promise((resolve) => setTimeout(resolve, 150));

      stage.width(stateCanvasSize.width);
      stage.height(stateCanvasSize.height);

      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
        layer.scaleX(1);
        layer.scaleY(1);
      });

      // Hide grid lines during export
      const gridLines = (bgLayer.find('Line') || []) as unknown as Konva.Line[];
      const gridLineStates = gridLines.map((line) => ({
        line,
        visible: line.visible(),
      }));
      gridLines.forEach((line) => line.visible(false));

      // Handle background rect - ensure it fits and has export border
      const bgRect = bgLayer.findOne('Rect') as Konva.Rect | undefined;
      let originalStroke, originalStrokeWidth, originalBgRectPos;
      if (bgRect) {
        originalBgRectPos = { x: bgRect.x(), y: bgRect.y(), width: bgRect.width(), height: bgRect.height() };
        originalStroke = bgRect.stroke();
        originalStrokeWidth = bgRect.strokeWidth();

        bgRect.x(0);
        bgRect.y(0);
        bgRect.width(stateCanvasSize.width);
        bgRect.height(stateCanvasSize.height);
        bgRect.stroke('#D1D5DB');
        bgRect.strokeWidth(1);
      }

      // Handle background image - ensure it fits the export dimensions (x=0, y=0)
      const bgImage = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
      let originalBgImagePos;
      if (bgImage) {
        originalBgImagePos = { x: bgImage.x(), y: bgImage.y(), width: bgImage.width(), height: bgImage.height() };
        bgImage.x(0);
        bgImage.y(0);
        bgImage.width(stateCanvasSize.width);
        bgImage.height(stateCanvasSize.height);
      }

      stage.batchDraw();
      await new Promise((resolve) => setTimeout(resolve, 50));

      await prepareStageText(stage);
      const dataURL = stage.toDataURL({
        pixelRatio: 3,
        mimeType: 'image/png',
        x: 0,
        y: 0,
        width: stateCanvasSize.width,
        height: stateCanvasSize.height,
      });

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
      }

      // Restore bgImage
      if (bgImage && originalBgImagePos) {
        bgImage.x(originalBgImagePos.x);
        bgImage.y(originalBgImagePos.y);
        bgImage.width(originalBgImagePos.width);
        bgImage.height(originalBgImagePos.height);
      }

      return dataURL;
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
    }
  },

  exportPreviewImages: async (stageRef: React.RefObject<Konva.Stage | null>) => {
    const stage = stageRef.current;
    if (!stage) throw new Error('Stage not found');

    const { activeSide, switchSide, canvasSize: stateCanvasSize } = get();
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

    const captureSide = async (side: CardSide) => {
      switchSide(side);

      await new Promise((resolve) => setTimeout(resolve, 150));

      stage.width(stateCanvasSize.width);
      stage.height(stateCanvasSize.height);

      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
        layer.scaleX(1);
        layer.scaleY(1);
      });

      // Hide grid lines during export
      const gridLines = (bgLayer.find('Line') || []) as unknown as Konva.Line[];
      const gridLineStates = gridLines.map((line) => ({
        line,
        visible: line.visible(),
      }));
      gridLines.forEach((line) => line.visible(false));

      // Handle background rect - ensure it fits and has export border
      const bgRect = bgLayer.findOne('Rect') as Konva.Rect | undefined;
      let originalStroke, originalStrokeWidth, originalBgRectPos;
      if (bgRect) {
        originalBgRectPos = { x: bgRect.x(), y: bgRect.y(), width: bgRect.width(), height: bgRect.height() };
        originalStroke = bgRect.stroke();
        originalStrokeWidth = bgRect.strokeWidth();

        bgRect.x(0);
        bgRect.y(0);
        bgRect.width(stateCanvasSize.width);
        bgRect.height(stateCanvasSize.height);
        bgRect.stroke('#D1D5DB');
        bgRect.strokeWidth(1);
      }

      // Handle background image - ensure it fits the export dimensions (x=0, y=0)
      const bgImage = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
      let originalBgImagePos;
      if (bgImage) {
        originalBgImagePos = { x: bgImage.x(), y: bgImage.y(), width: bgImage.width(), height: bgImage.height() };
        bgImage.x(0);
        bgImage.y(0);
        bgImage.width(stateCanvasSize.width);
        bgImage.height(stateCanvasSize.height);
      }

      stage.batchDraw();
      await new Promise((resolve) => setTimeout(resolve, 50));

      await prepareStageText(stage);
      const dataURL = stage.toDataURL({
        pixelRatio: stage.width() > 1000 ? 1 : 1.5,
        mimeType: 'image/jpeg',
        quality: 0.8,
        x: 0,
        y: 0,
        width: stateCanvasSize.width,
        height: stateCanvasSize.height,
      });

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
      }

      // Restore bgImage
      if (bgImage && originalBgImagePos) {
        bgImage.x(originalBgImagePos.x);
        bgImage.y(originalBgImagePos.y);
        bgImage.width(originalBgImagePos.width);
        bgImage.height(originalBgImagePos.height);
      }

      return dataURL;
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
    }
  },

  exportToPDF: async (stageRef: React.RefObject<Konva.Stage | null>) => {
    try {
      get().setExportLoading(true);
      const images = await get().exportImages(stageRef);

      const pdfCardWidth = CARD_SIZE_MM.width;
      const pdfCardHeight = CARD_SIZE_MM.height;

      await exportCanvasToPDF({
        frontImage: images.front,
        backImage: images.back,
        cardWidth: pdfCardWidth,
        cardHeight: pdfCardHeight,
        fileName: 'business-card.pdf',
      });
      get().setExportLoading(false);
    } catch (error) {
      console.error('Export failed:', error);
      get().setExportLoading(false);
      throw error;
    }
  },
  // Actions - Load
  loadDesign: (data) => {
    set((state) => ({
      frontData: {
        ...data.frontData,
        objects: data.frontData.objects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
      },
      backData: {
        ...data.backData,
        objects: data.backData.objects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
      },
      canvasSize: data.canvasSize || state.canvasSize,
      past: [],
      future: [],
      selectedId: null,
      isDirty: false,
      activeSide: 'front',
      sidedness: data.sidedness || state.sidedness,
    }));
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

    const layers = layout_config.layers || [];

    const mapLayerToObject = (layer: Layer): CanvasObject | undefined => {
      const baseProps = {
        id: layer.id || generateId(),
        position: layer.position,
        size: layer.size,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        field: layer.field_key,
        label: layer.label,
        defaultValue: layer.default_value,
      };

      if (layer.type === 'text') {
        return {
          ...baseProps,
          type: ObjectType.TEXT,
          content: layer.default_value || layer.label || '',
          fontFamily: layer.style?.font_family || 'Inter',
          fontSize: layer.style?.font_size || 12,
          fontWeight: layer.style?.font_weight || 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: layer.style?.color || '#000000',
          align: layer.style?.align || 'left',
          lineHeight: layer.style?.line_height || 1,
          letterSpacing: layer.style?.letter_spacing || 0,
        } as TextObject;
      }

      if (layer.type === 'image') {
        return {
          ...baseProps,
          type: ObjectType.IMAGE,
          src: layer.image_url ?? `https://dummyimage.com/${layer.size.width}x${layer.size.height}/000/fff&text=${layer.label}`,
          originalWidth: layer.size.width,
          originalHeight: layer.size.height,
          cropX: 0,
          cropY: 0,
          cropWidth: layer.size.width,
          cropHeight: layer.size.height,
        } as ImageObject;
      }

      return undefined;
    };

    const processObjects = (side: CardSide) => {
      const objects = layers
        .filter((l: Layer) => l.side === side)
        .map((l: Layer) => mapLayerToObject(l))
        .filter((obj): obj is CanvasObject => obj !== undefined);

      return objects.map((obj, i) => ({ ...obj, zIndex: i }));
    };

    const frontObjects = processObjects('front');
    const backObjects = processObjects('back');

    const getBackgroundConfig = (bgSrc?: string): BackgroundObject => {
      const bg: BackgroundObject = {
        id: generateId(),
        type: ObjectType.BACKGROUND,
        backgroundColor: '#FFFFFF',
        backgroundImage: bgSrc,
        backgroundSize: 'cover',
      };

      return bg;
    };

    const newCanvasSize = {
      width: layout_config.page?.width || CARD_SIZE_PX.width,
      height: layout_config.page?.height || CARD_SIZE_PX.height,
    };

    set({
      frontData: {
        objects: frontObjects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        background: getBackgroundConfig(layout_config.background?.front_image_url),
      },
      backData: {
        objects: backObjects.map((object) => (object.type === ObjectType.TEXT ? resolveTextFont(object) : object)),
        background: getBackgroundConfig(layout_config.background?.back_image_url),
      },
      canvasSize: newCanvasSize,
      sidedness: (layout_config.page?.sidedness as 'SINGLE' | 'DOUBLE') || 'DOUBLE',
      past: [],
      future: [],
      selectedId: null,
      isDirty: false,
      activeSide: 'front',
    });
  },
}));
