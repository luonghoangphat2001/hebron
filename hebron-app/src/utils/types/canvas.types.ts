export enum ObjectType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  BACKGROUND = 'background',
}

export type ShapeType =
  | 'rectangle'
  | 'roundedRectangle'
  | 'circle'
  | 'doubleRectangle'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'line';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseCanvasObject {
  id: string;
  type: ObjectType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  field?: string;
  label?: string;
  defaultValue?: string;
}

export interface TextObject extends BaseCanvasObject {
  type: ObjectType.TEXT;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  fontRenderScale?: number;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export interface ImageObject extends BaseCanvasObject {
  type: ObjectType.IMAGE;
  interactive?: boolean;
  src: string; // base64 or URL
  maskShape?: 'none' | 'circle' | 'rectangle' | 'custom';
  maskImageUrl?: string;
  originalWidth: number;
  originalHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  filters?: {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    blur: number; // 0 to 20
  };
}

export interface ShapeObject extends BaseCanvasObject {
  type: ObjectType.SHAPE;
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number; // for rectangle
  polygonSides?: number;
  fillImageUrl?: string;
}

export interface BackgroundTransform {
  /** Translation from the template art origin in natural image pixels. */
  x: number;
  y: number;
  scale: number;
}

export interface BackgroundObject {
  id: string;
  type: ObjectType.BACKGROUND;
  backgroundColor: string;
  backgroundImage?: string; // base64 or URL
  backgroundSize: 'cover' | 'contain' | 'fill';
  /** Original mockup bounds stay fixed when the print surface expands. */
  previewSize?: Size;
  backgroundTransform?: BackgroundTransform;
  /** User replacement images must not redefine the physical frame. */
  preserveFrameOnImageLoad?: boolean;
}

export type CanvasObject = TextObject | ImageObject | ShapeObject;

export interface CanvasState {
  objects: CanvasObject[];
  background: BackgroundObject;
  selectedId: string | null;
  zoom: number;
  pan: Position;
  gridEnabled: boolean;
  rulersEnabled: boolean;
  snapToGrid: boolean;
  snapToCenter: boolean;
  snapToEdges: boolean;
  snapToObjects: boolean;
  snapToSafeArea: boolean;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface CanvasSettings {
  width: number; // in pixels
  height: number; // in pixels
  dpi: number;
  unit: 'mm' | 'px';
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  gridSize: number; // in pixels
  safeMargin: number; // in pixels
}

// Snapshot types - UI artifacts only, not part of editor history

export interface CardSideData {
  objects: CanvasObject[];
  background: BackgroundObject;
}

export interface SnapshotConfig {
  pixelRatio?: number;
  quality?: number;
  format?: 'image/png' | 'image/jpeg';
  version?: number; // For version tracking to prevent stale snapshots
}

export interface SnapshotThumbnails {
  front: string | null; // Base64 image
  back: string | null; // Base64 image
}

export type CardSide = 'front' | 'back';

export interface ExportCanvasToPDFOptions {
  frontImage: string; // base64 dataURL
  backImage: string; // base64 dataURL
  cardWidth: number; // in mm
  cardHeight: number; // in mm
  fileName?: string;
}

export enum EditorTabType {
  IMAGE = 'image',
  TEXT = 'text',
  BACKGROUND = 'background',
  TEMPLATE = 'template',
}
