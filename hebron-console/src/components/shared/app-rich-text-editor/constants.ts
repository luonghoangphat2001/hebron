import type { ToolbarState } from './types';

export const DEFAULT_TEXT_COLOR = '#000000';

export const TEXT_COLOR_DEBOUNCE_MS = 200;

export const IMAGE_RESIZE_CONFIG = {
  enabled: true,
  minWidth: 120,
  minHeight: 80,
  alwaysPreserveAspectRatio: true,
} as const;

export const EMPTY_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isParagraph: false,
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isCode: false,
  textColor: '',
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCodeBlock: false,
  isAlignLeft: false,
  isAlignCenter: false,
  isAlignRight: false,
  isAlignJustify: false,
  isImage: false,
  isImageAlignLeft: false,
  isImageAlignCenter: false,
  isImageAlignRight: false,
  isLink: false,
  isTable: false,
  characterCount: 0,
  wordCount: 0,
};
