import { EDITOR_FONT_FAMILIES } from '../helper/editor-fonts';
import { EditorTabType } from '@/utils/types/canvas.types';
import { Image, PictureInPicture, Text } from 'lucide-react';

export const optionsTabContent = [
  {
    label: EditorTabType.IMAGE,
    icon: PictureInPicture,
  },
  {
    label: EditorTabType.TEXT,
    icon: Text,
  },
  {
    label: EditorTabType.BACKGROUND,
    icon: Image,
  },
];

export const CARD_SIZE_MM = {
  width: 140,
  height: 95,
} as const;

export const DEFAULT_DPI = 200;

export const EXPORT_DPI = 300;

// Convert mm to pixels at 300 DPI
export const CARD_SIZE_PX = {
  width: 480,
  height: 275,
} as const;

// Safe margin (3mm from edge) - typical print bleed area
export const SAFE_MARGIN_MM = 3;
export const SAFE_MARGIN_PX = Math.round((SAFE_MARGIN_MM / 25.4) * DEFAULT_DPI); // ~35px

// Grid settings
export const DEFAULT_GRID_SIZE = 10; // pixels
export const SNAP_THRESHOLD = 8; // pixels

// Zoom levels
export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5] as const;
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const CANVAS_VIEW_OFFSET = { x: -28, y: -123 } as const;
export const FIT_SCREEN_PADDING = { horizontal: 96, vertical: 160 } as const;

// Default object properties
export const DEFAULT_TEXT_OBJECT = {
  content: 'Text',
  fontFamily: 'Arimo',
  fontSize: 16,
  fontWeight: '400' as const,
  fontStyle: 'normal' as const,
  textDecoration: 'none' as const,
  color: '#000000',
  align: 'left' as const,
  lineHeight: 1.2,
  letterSpacing: 0,
  fontRenderScale: 1,
  stroke: '#111827',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowOpacity: 0,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
};

export const DEFAULT_IMAGE_OBJECT = {
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  cropX: 0,
  cropY: 0,
};

export const DEFAULT_SHAPE_OBJECT = {
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 2,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
};

export const FONT_FAMILIES = EDITOR_FONT_FAMILIES;

// Font sizes
export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72] as const;

// Font weights
export const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' },
] as const;

// Color presets
export const COLOR_PRESETS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#800000',
  '#808000',
  '#008080',
  '#000080',
  '#FFC0CB',
  '#A52A2A',
  '#D2691E',
  '#FF7F50',
  '#6495ED',
  '#DC143C',
  '#00CED1',
  '#9400D3',
  '#FF1493',
  '#FFD700',
  '#ADFF2F',
  '#FF69B4',
  '#CD5C5C',
  '#4B0082',
  '#F0E68C',
] as const;

// Text templates
export const TEXT_TEMPLATES = [
  { id: '1', label: 'name', fontSize: 24, fontWeight: '700', content: 'John Doe' },
  { id: '2', label: 'title', fontSize: 14, fontWeight: '400', content: 'Senior Developer' },
  { id: '3', label: 'company', fontSize: 16, fontWeight: '600', content: 'Company Name' },
  { id: '4', label: 'email', fontSize: 12, fontWeight: '400', content: 'email@example.com' },
  { id: '5', label: 'phone', fontSize: 12, fontWeight: '400', content: '+1 234 567 890' },
  { id: '6', label: 'address', fontSize: 10, fontWeight: '400', content: '123 Main St, City' },
] as const;

// History
export const MAX_HISTORY_SIZE = 50;

// Ruler

export const RULER_SIZE = 24; // Height/width of ruler in pixels
export const TICK_INTERVAL = 100; // Distance between tick marks
