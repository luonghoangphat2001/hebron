import type { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  SeparatorHorizontal,
  Strikethrough,
  Table2,
  TableCellsSplit,
  Trash2,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { appToast } from '@/components/toast/AppToast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { uploadFileAPI } from '@/data/file/file.api';
import { cn } from '@/lib/utils';

import { LinkDialog } from './components/LinkDialog';
import { EditorButton, TextColorPicker, ToolbarDivider } from './components/ToolbarControls';
import { EMPTY_TOOLBAR_STATE, IMAGE_RESIZE_CONFIG, TEXT_COLOR_DEBOUNCE_MS } from './constants';
import { RichTextImage } from './rich-text-image.extension';
import type { AppRichTextEditorProps, ImageAlignment } from './types';
import { resolveImageUrlFromPrompt } from './utils';

export function AppRichTextEditor({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  readOnly = false,
  isInvalid = false,
  minHeight = 240,
  maxLength,
  imageUploadMode = 'url',
  imageFileType,
  onImageUpload,
  onImageUploadingChange,
  className,
}: AppRichTextEditorProps) {
  const { t: tCommon } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textColorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const isEditable = !disabled && !readOnly;
  const shouldUploadImageImmediately = imageUploadMode === 'immediate' && Boolean(imageFileType);
  const resolvedPlaceholder = placeholder ?? tCommon('editor.placeholder');

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          autolink: true,
          linkOnPaste: true,
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        },
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      RichTextImage.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'app-rich-text-editor__image',
        },
        resize: IMAGE_RESIZE_CONFIG,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'app-rich-text-editor__table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    [maxLength, resolvedPlaceholder],
  );

  const editor = useEditor({
    extensions,
    content: value ?? defaultValue ?? '',
    editable: isEditable,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: currentEditor }) => {
      queueMicrotask(() => onValueChange?.(currentEditor.getHTML()));
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return EMPTY_TOOLBAR_STATE;
      }

      return {
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
        isParagraph: currentEditor.isActive('paragraph'),
        isHeading1: currentEditor.isActive('heading', { level: 1 }),
        isHeading2: currentEditor.isActive('heading', { level: 2 }),
        isHeading3: currentEditor.isActive('heading', { level: 3 }),
        isBold: currentEditor.isActive('bold'),
        isItalic: currentEditor.isActive('italic'),
        isUnderline: currentEditor.isActive('underline'),
        isStrike: currentEditor.isActive('strike'),
        isCode: currentEditor.isActive('code'),
        textColor: (currentEditor.getAttributes('textStyle').color as string | undefined) ?? '',
        isBulletList: currentEditor.isActive('bulletList'),
        isOrderedList: currentEditor.isActive('orderedList'),
        isBlockquote: currentEditor.isActive('blockquote'),
        isCodeBlock: currentEditor.isActive('codeBlock'),
        isAlignLeft: currentEditor.isActive({ textAlign: 'left' }),
        isAlignCenter: currentEditor.isActive({ textAlign: 'center' }),
        isAlignRight: currentEditor.isActive({ textAlign: 'right' }),
        isAlignJustify: currentEditor.isActive({ textAlign: 'justify' }),
        isImage: currentEditor.isActive('image'),
        isImageAlignLeft: currentEditor.getAttributes('image').dataAlign === 'left',
        isImageAlignCenter: currentEditor.getAttributes('image').dataAlign === 'center',
        isImageAlignRight: currentEditor.getAttributes('image').dataAlign === 'right',
        isLink: currentEditor.isActive('link'),
        isTable: currentEditor.isActive('table'),
        characterCount: currentEditor.storage.characterCount.characters(),
        wordCount: currentEditor.storage.characterCount.words(),
      };
    },
  });

  useEffect(() => {
    // Changing interaction state must not publish Tiptap-normalized HTML as a user edit.
    editor?.setEditable(isEditable, false);
  }, [editor, isEditable]);

  useEffect(() => {
    onImageUploadingChange?.(isUploadingImage);
  }, [isUploadingImage, onImageUploadingChange]);

  useEffect(() => {
    if (!editor || value === undefined || value === editor.getHTML()) {
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const runCommand = useCallback(
    (command: (editor: Editor) => boolean) => {
      if (!editor || !isEditable) {
        return;
      }

      command(editor);
    },
    [editor, isEditable],
  );

  const handleSetLink = useCallback(() => {
    if (!editor || !isEditable) {
      return;
    }

    setLinkDraft((editor.getAttributes('link').href as string | undefined) ?? '');
    setIsLinkDialogOpen(true);
  }, [editor, isEditable]);

  const handleSubmitLink = useCallback(
    (url: string) => {
      setIsLinkDialogOpen(false);

      if (!editor || !isEditable) {
        return;
      }

      const trimmed = url.trim();

      if (!trimmed) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    },
    [editor, isEditable],
  );

  const insertImage = useCallback(
    (src: string) => {
      if (!editor || !isEditable || !src) {
        return;
      }

      editor.chain().focus().setImage({ src }).run();
    },
    [editor, isEditable],
  );

  const handleImageAction = useCallback(() => {
    if (!editor || !isEditable) {
      return;
    }

    if (onImageUpload || shouldUploadImageImmediately) {
      fileInputRef.current?.click();
      return;
    }

    const currentUrl = editor.getAttributes('image').src as string | undefined;
    const url = resolveImageUrlFromPrompt(tCommon('editor.prompt_image_url'), currentUrl ?? '');

    if (url) {
      insertImage(url);
    }
  }, [editor, insertImage, isEditable, onImageUpload, shouldUploadImageImmediately, tCommon]);

  const handleImageFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file || !isEditable) {
        return;
      }

      try {
        setIsUploadingImage(true);
        const uploadedUrl = onImageUpload
          ? await onImageUpload(file)
          : shouldUploadImageImmediately && imageFileType
            ? (await uploadFileAPI(file, imageFileType)).data.file.url
            : '';

        if (!uploadedUrl) {
          return;
        }

        insertImage(uploadedUrl);
      } catch (error) {
        console.error('Rich text image upload failed:', error);
        appToast.error(tCommon('editor.fail_upload_image'));
      } finally {
        setIsUploadingImage(false);
      }
    },
    [imageFileType, insertImage, isEditable, onImageUpload, shouldUploadImageImmediately, tCommon],
  );

  const setImageAlignment = useCallback(
    (alignment: ImageAlignment) => {
      if (!editor || !isEditable || !editor.isActive('image')) {
        return;
      }

      editor.chain().focus().updateAttributes('image', { dataAlign: alignment }).run();
    },
    [editor, isEditable],
  );

  // The native color input fires onChange continuously while dragging — debounce so
  // each drag lands as one editor transaction (and one undo step) instead of dozens.
  const setTextColor = useCallback(
    (color: string) => {
      if (textColorTimeoutRef.current) {
        clearTimeout(textColorTimeoutRef.current);
      }

      textColorTimeoutRef.current = setTimeout(() => {
        if (!editor || !isEditable || !color) {
          return;
        }

        editor.chain().focus().setColor(color).run();
      }, TEXT_COLOR_DEBOUNCE_MS);
    },
    [editor, isEditable],
  );

  useEffect(
    () => () => {
      if (textColorTimeoutRef.current) {
        clearTimeout(textColorTimeoutRef.current);
      }
    },
    [],
  );

  const currentToolbarState = toolbarState ?? EMPTY_TOOLBAR_STATE;
  const toolbarDisabled = !editor || !isEditable;
  const characterLimitExceeded = Boolean(maxLength && currentToolbarState.characterCount > maxLength);

  return (
    <div
      className={cn(
        'border-input bg-background overflow-hidden rounded-lg border transition-colors',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3',
        disabled && 'bg-input/50 cursor-not-allowed opacity-50',
        readOnly && !disabled && 'bg-muted/40 border-border/80',
        (isInvalid || characterLimitExceeded) &&
          'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        className,
      )}
      data-invalid={isInvalid || characterLimitExceeded ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-readonly={readOnly ? 'true' : undefined}>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleImageFileChange}
        disabled={toolbarDisabled}
      />

      <TooltipProvider>
        <div className='bg-muted/20 flex flex-wrap items-center gap-1 border-b p-2'>
          <EditorButton
            label={tCommon('editor.undo')}
            disabledLabel={tCommon('editor.tip_nothing_to_undo')}
            icon={Undo2}
            disabled={toolbarDisabled || !currentToolbarState.canUndo}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().undo().run())}
          />
          <EditorButton
            label={tCommon('editor.redo')}
            disabledLabel={tCommon('editor.tip_nothing_to_redo')}
            icon={Redo2}
            disabled={toolbarDisabled || !currentToolbarState.canRedo}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().redo().run())}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.paragraph')}
            icon={Pilcrow}
            active={currentToolbarState.isParagraph}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setParagraph().run())}
          />
          <EditorButton
            label={tCommon('editor.heading_1')}
            icon={Heading1}
            active={currentToolbarState.isHeading1}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 1 }).run())}
          />
          <EditorButton
            label={tCommon('editor.heading_2')}
            icon={Heading2}
            active={currentToolbarState.isHeading2}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 2 }).run())}
          />
          <EditorButton
            label={tCommon('editor.heading_3')}
            icon={Heading3}
            active={currentToolbarState.isHeading3}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 3 }).run())}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.bold')}
            icon={Bold}
            active={currentToolbarState.isBold}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBold().run())}
          />
          <EditorButton
            label={tCommon('editor.italic')}
            icon={Italic}
            active={currentToolbarState.isItalic}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleItalic().run())}
          />
          <EditorButton
            label={tCommon('editor.underline')}
            icon={Underline}
            active={currentToolbarState.isUnderline}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleUnderline().run())}
          />
          <EditorButton
            label={tCommon('editor.strike')}
            icon={Strikethrough}
            active={currentToolbarState.isStrike}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleStrike().run())}
          />
          <EditorButton
            label={tCommon('editor.inline_code')}
            icon={Code}
            active={currentToolbarState.isCode}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleCode().run())}
          />
          <TextColorPicker value={currentToolbarState.textColor} onChange={setTextColor} disabled={toolbarDisabled} />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.bullet_list')}
            icon={List}
            active={currentToolbarState.isBulletList}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBulletList().run())}
          />
          <EditorButton
            label={tCommon('editor.ordered_list')}
            icon={ListOrdered}
            active={currentToolbarState.isOrderedList}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleOrderedList().run())}
          />
          <EditorButton
            label={tCommon('editor.blockquote')}
            icon={Quote}
            active={currentToolbarState.isBlockquote}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleBlockquote().run())}
          />
          <EditorButton
            label={tCommon('editor.code_block')}
            icon={Rows3}
            active={currentToolbarState.isCodeBlock}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().toggleCodeBlock().run())}
          />
          <EditorButton
            label={tCommon('editor.horizontal_rule')}
            icon={SeparatorHorizontal}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setHorizontalRule().run())}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.align_left')}
            icon={AlignLeft}
            active={currentToolbarState.isAlignLeft}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setTextAlign('left').run())}
          />
          <EditorButton
            label={tCommon('editor.align_center')}
            icon={AlignCenter}
            active={currentToolbarState.isAlignCenter}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setTextAlign('center').run())}
          />
          <EditorButton
            label={tCommon('editor.align_right')}
            icon={AlignRight}
            active={currentToolbarState.isAlignRight}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setTextAlign('right').run())}
          />
          <EditorButton
            label={tCommon('editor.align_justify')}
            icon={AlignJustify}
            active={currentToolbarState.isAlignJustify}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().setTextAlign('justify').run())}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.set_link')}
            icon={LinkIcon}
            active={currentToolbarState.isLink}
            disabled={toolbarDisabled}
            onClick={handleSetLink}
          />
          <EditorButton
            label={tCommon('editor.remove_link')}
            disabledLabel={tCommon('editor.tip_select_link_to_remove')}
            icon={Unlink}
            disabled={toolbarDisabled || !currentToolbarState.isLink}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().unsetLink().run())}
          />
          <EditorButton
            label={tCommon(onImageUpload || shouldUploadImageImmediately ? 'editor.upload_image' : 'editor.insert_image_url')}
            icon={ImageIcon}
            disabled={toolbarDisabled || isUploadingImage}
            onClick={handleImageAction}
          />
          <EditorButton
            label={tCommon('editor.align_image_left')}
            disabledLabel={tCommon('editor.tip_select_image_to_align')}
            icon={AlignLeft}
            active={currentToolbarState.isImageAlignLeft}
            disabled={toolbarDisabled || !currentToolbarState.isImage}
            onClick={() => setImageAlignment('left')}
          />
          <EditorButton
            label={tCommon('editor.align_image_center')}
            disabledLabel={tCommon('editor.tip_select_image_to_align')}
            icon={AlignCenter}
            active={currentToolbarState.isImageAlignCenter}
            disabled={toolbarDisabled || !currentToolbarState.isImage}
            onClick={() => setImageAlignment('center')}
          />
          <EditorButton
            label={tCommon('editor.align_image_right')}
            disabledLabel={tCommon('editor.tip_select_image_to_align')}
            icon={AlignRight}
            active={currentToolbarState.isImageAlignRight}
            disabled={toolbarDisabled || !currentToolbarState.isImage}
            onClick={() => setImageAlignment('right')}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.insert_table')}
            icon={Table2}
            disabled={toolbarDisabled}
            onClick={() =>
              runCommand((currentEditor) =>
                currentEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
              )
            }
          />
          <EditorButton
            label={tCommon('editor.add_row_after')}
            disabledLabel={tCommon('editor.tip_select_table_to_edit')}
            icon={Rows3}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().addRowAfter().run())}
          />
          <EditorButton
            label={tCommon('editor.add_column_after')}
            disabledLabel={tCommon('editor.tip_select_table_to_edit')}
            icon={TableCellsSplit}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().addColumnAfter().run())}
          />
          <EditorButton
            label={tCommon('editor.delete_table')}
            disabledLabel={tCommon('editor.tip_select_table_to_edit')}
            icon={Trash2}
            disabled={toolbarDisabled || !currentToolbarState.isTable}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().deleteTable().run())}
          />

          <ToolbarDivider />

          <EditorButton
            label={tCommon('editor.clear_formatting')}
            icon={RemoveFormatting}
            disabled={toolbarDisabled}
            onClick={() => runCommand((currentEditor) => currentEditor.chain().focus().unsetAllMarks().clearNodes().run())}
          />
        </div>
      </TooltipProvider>

      <EditorContent
        editor={editor}
        className='app-rich-text-editor__content resize-y overflow-y-auto'
        style={{
          minHeight,
        }}
      />

      {maxLength ? (
        <div
          className={cn(
            'text-muted-foreground flex items-center justify-end gap-2 border-t px-3 py-2 text-xs',
            characterLimitExceeded && 'text-destructive',
          )}>
          <span>{tCommon('editor.character_count', { current: currentToolbarState.characterCount, max: maxLength })}</span>
          <span aria-hidden='true'>·</span>
          <span>{tCommon('editor.word_count', { words: currentToolbarState.wordCount })}</span>
        </div>
      ) : null}

      {isLinkDialogOpen && <LinkDialog defaultUrl={linkDraft} onOpenChange={setIsLinkDialogOpen} onSubmit={handleSubmitLink} />}
    </div>
  );
}
