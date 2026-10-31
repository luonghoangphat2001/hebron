import type { ComponentType, SVGProps } from 'react';

import type { FileType } from '@/utils/enums/file.enum';

export type ImageAlignment = 'left' | 'center' | 'right';

export type AppRichTextEditorProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  isInvalid?: boolean;
  minHeight?: number;
  maxLength?: number;
  imageUploadMode?: 'url' | 'immediate';
  imageFileType?: FileType;
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadingChange?: (isUploading: boolean) => void;
  className?: string;
};

export type EditorButtonProps = {
  label: string;
  disabledLabel?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
};

export type LinkDialogProps = {
  defaultUrl: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
};

export type TextColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
};

export type ToolbarState = {
  canUndo: boolean;
  canRedo: boolean;
  isParagraph: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isCode: boolean;
  textColor: string;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isCodeBlock: boolean;
  isAlignLeft: boolean;
  isAlignCenter: boolean;
  isAlignRight: boolean;
  isAlignJustify: boolean;
  isImage: boolean;
  isImageAlignLeft: boolean;
  isImageAlignCenter: boolean;
  isImageAlignRight: boolean;
  isLink: boolean;
  isTable: boolean;
  characterCount: number;
  wordCount: number;
};
