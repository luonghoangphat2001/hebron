import { AlignCenter, AlignLeft, AlignRight, Bold, ChevronDown, Italic, Palette, Redo2, Underline, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorButton, ToolbarDivider } from '@/components/shared/app-rich-text-editor/components/ToolbarControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadFileAPI } from '@/data/file/file.api';
import { FileType } from '@/utils/enums/file.enum';
import { editableLeaves, hasEverawardWrapper, makePreview, parseDescription, syncLeaf } from './everaward-dom';
import type { PreviewModel } from './everaward-dom';
import './everaward-storefront.css';
import './everaward-editor.css';

export interface EverawardDescriptionEditorProps {
  value: string;
  onValueChange: (html: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  onImageUploadingChange?: (uploading: boolean) => void;
  onValidationChange?: (error: string | null) => void;
  onFlushReady?: (flush: () => string | null) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function EverawardDescriptionEditor({
  value,
  onValueChange,
  readOnly = false,
  disabled = false,
  onImageUploadingChange,
  onValidationChange,
  onFlushReady,
  onImageUpload,
}: EverawardDescriptionEditorProps) {
  const { t } = useTranslation('product');
  const [tab, setTab] = useState<'visual' | 'html'>('visual');
  const [revision, setRevision] = useState(0);
  const [source, setSource] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const container = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const raw = useRef(value);
  const canonical = useRef<HTMLElement | null>(null);
  const model = useRef<PreviewModel | null>(null);
  const active = useRef<HTMLElement | null>(null);
  const selectedRange = useRef<Range | null>(null);
  const selectedImage = useRef<HTMLImageElement | null>(null);
  const composing = useRef(false);
  const mounted = useRef(false);
  const history = useRef({ values: [value], index: 0 });
  const locked = readOnly || disabled || uploading;
  const wrapperError = t('everaward.wrapperRequired', { defaultValue: 'The HTML must contain a .view_design_wrap element.' });

  function validate(html = raw.current) {
    const error = hasEverawardWrapper(html) ? null : wrapperError;
    setInvalid(!!error);
    onValidationChange?.(error);
    return error;
  }

  function publish(html: string, record = true) {
    if (html === raw.current) return;
    raw.current = html;
    if (record) {
      const state = history.current;
      state.values = state.values.slice(0, state.index + 1);
      state.values.push(html);
      state.index++;
    }
    setHistoryState({ canUndo: history.current.index > 0, canRedo: history.current.index < history.current.values.length - 1 });
    onValueChange(html);
    validate(html);
  }

  function commitLeaf(element = active.current, force = false) {
    if (!element || !model.current || !canonical.current || (composing.current && !force)) return;
    const before = canonical.current.innerHTML;
    syncLeaf(element, model.current);
    if (canonical.current.innerHTML !== before) publish(canonical.current.innerHTML);
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    const element = active.current;
    if (element?.contains(range.startContainer) && element.contains(range.endContainer))
      selectedRange.current = range.cloneRange();
    else selectedRange.current = null;
  }

  function restoreSelection() {
    const range = selectedRange.current;
    const element = active.current;
    if (
      !range ||
      !element ||
      !container.current?.contains(element) ||
      !element.contains(range.startContainer) ||
      !element.contains(range.endContainer)
    )
      return null;
    element.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return range;
  }

  function insertText(text: string) {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !active.current) return;
    const range = selection.getRangeAt(0);
    if (!active.current.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const fragment = document.createDocumentFragment();
    text.split('\n').forEach((line, index) => {
      if (index) fragment.append(document.createElement('br'));
      if (line) fragment.append(document.createTextNode(line));
    });
    if (!fragment.lastChild) fragment.append(document.createTextNode(''));
    const last = fragment.lastChild!;
    range.insertNode(fragment);
    range.setStartAfter(last);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    rememberSelection();
    commitLeaf();
  }

  function format(tag: 'b' | 'i' | 'u' | 'span', property?: 'color' | 'fontSize', value?: string) {
    if (locked || composing.current) return;
    const range = restoreSelection();
    if (!range || range.collapsed) return;
    const wrapper = document.createElement(tag);
    if (property && value) wrapper.style[property] = value;
    wrapper.append(range.extractContents());
    range.insertNode(wrapper);
    range.selectNodeContents(wrapper);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    selectedRange.current = range.cloneRange();
    commitLeaf();
  }

  function align(alignment: 'left' | 'center' | 'right') {
    if (locked || !active.current || !model.current) return;
    const original = model.current.originals.get(active.current) as HTMLElement | undefined;
    if (!original || !canonical.current) return;
    original.style.textAlign = alignment;
    active.current.style.textAlign = alignment;
    publish(canonical.current.innerHTML);
    restoreSelection();
  }

  function undo(redo = false) {
    if (locked || composing.current) return;
    const state = history.current;
    const index = state.index + (redo ? 1 : -1);
    if (index < 0 || index >= state.values.length) return;
    state.index = index;
    publish(state.values[index], false);
    setSource(state.values[index]);
    setRevision((current) => current + 1);
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      model.current = null;
      canonical.current = null;
    };
  }, []);

  useEffect(() => {
    if (value !== raw.current) {
      raw.current = value;
      history.current = { values: [value], index: 0 };
      setHistoryState({ canUndo: false, canRedo: false });
      setSource(value);
      const error = hasEverawardWrapper(value) ? null : wrapperError;
      setInvalid(!!error);
      onValidationChange?.(error);
      setRevision((current) => current + 1);
    }
  }, [value, onValidationChange, wrapperError]);

  useEffect(() => {
    validate();
    onFlushReady?.(() => {
      if (tab === 'visual') commitLeaf(active.current, true);
      return validate();
    });
    // Re-register the synchronous flush with the latest callbacks and translation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFlushReady, onValidationChange, wrapperError, tab]);

  useEffect(() => {
    if (tab !== 'visual' || !container.current) return;
    const tree = parseDescription(raw.current);
    canonical.current = tree;
    const next = makePreview(tree);
    model.current = next;
    active.current = null;
    selectedRange.current = null;
    const leaves = editableLeaves(next.preview);
    leaves.forEach((element) => {
      element.contentEditable = locked ? 'false' : 'true';
      if (!locked) {
        element.dataset.everawardEditable = 'true';
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'textbox');
        element.setAttribute('aria-multiline', 'true');
        element.addEventListener('focus', () => {
          active.current = element;
        });
        element.addEventListener('input', () => commitLeaf(element));
        element.addEventListener('compositionstart', () => {
          composing.current = true;
        });
        element.addEventListener('compositionend', () => {
          composing.current = false;
          commitLeaf(element);
        });
        element.addEventListener('beforeinput', (event) => {
          if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') {
            event.preventDefault();
            insertText('\n');
          }
        });
        element.addEventListener('paste', (event) => {
          event.preventDefault();
          insertText(event.clipboardData?.getData('text/plain') ?? '');
        });
        element.addEventListener('drop', (event) => event.preventDefault());
        element.addEventListener('keyup', rememberSelection);
        element.addEventListener('mouseup', rememberSelection);
      }
    });
    next.preview.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      image.draggable = false;
      if (!locked) {
        image.dataset.everawardImage = 'true';
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', t('everaward.replaceImage', { defaultValue: 'Replace image' }));
        const choose = () => {
          selectedImage.current = image;
          fileInput.current?.click();
        };
        image.addEventListener('click', choose);
        image.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            choose();
          }
        });
      }
    });
    container.current.replaceChildren(...next.preview.childNodes);
    // The imperative editable tree must stay mounted while typing or composing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, revision, readOnly, disabled]);

  useEffect(() => {
    if (container.current) container.current.inert = uploading;
  }, [uploading, tab]);

  async function replaceImage(file: File) {
    const image = selectedImage.current;
    const currentModel = model.current;
    const tree = canonical.current;
    const original = image && currentModel?.originals.get(image);
    if (locked || !image || !(original instanceof HTMLImageElement) || !tree || !file.type.startsWith('image/')) return;
    setUploading(true);
    onImageUploadingChange?.(true);
    setUploadError(false);
    try {
      const url = onImageUpload ? await onImageUpload(file) : (await uploadFileAPI(file, FileType.PRODUCT_IMAGES)).data.file.url;
      // Source edits and external resets invalidate the image identity.
      if (canonical.current === tree && model.current === currentModel) {
        original.setAttribute('src', url);
        image.setAttribute('src', url);
        publish(tree.innerHTML);
      }
    } catch {
      if (mounted.current && model.current === currentModel) setUploadError(true);
    } finally {
      if (mounted.current) {
        setUploading(false);
        onImageUploadingChange?.(false);
        requestAnimationFrame(restoreSelection);
      }
    }
  }

  return (
    <div
      className='everaward-editor'
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !composing.current) {
          event.preventDefault();
          undo(event.shiftKey);
        }
      }}>
      <div className='everaward-editor-controls'>
        <div
          className='everaward-editor-tabs'
          role='tablist'
          aria-label={t('everaward.mode', { defaultValue: 'Description editing mode' })}>
          <button
            type='button'
            role='tab'
            aria-selected={tab === 'visual'}
            onClick={() => {
              setTab('visual');
              setRevision((current) => current + 1);
            }}>
            {t('everaward.visual', { defaultValue: 'Visual' })}
          </button>
          <button
            type='button'
            role='tab'
            aria-selected={tab === 'html'}
            onClick={() => {
              commitLeaf();
              setSource(raw.current);
              setTab('html');
            }}>
            {t('everaward.html', { defaultValue: 'HTML (advanced)' })}
          </button>
        </div>
        {tab === 'visual' && !readOnly && (
          <TooltipProvider>
            <div
              className='everaward-editor-toolbar'
              role='toolbar'
              aria-label={t('everaward.format', { defaultValue: 'Text formatting' })}
              onMouseDown={(event) => {
                if ((event.target as HTMLElement).closest('button')) event.preventDefault();
              }}>
              <EditorButton
                label={t('everaward.undo', { defaultValue: 'Undo' })}
                icon={Undo2}
                disabled={locked || !historyState.canUndo}
                onClick={() => undo()}
              />
              <EditorButton
                label={t('everaward.redo', { defaultValue: 'Redo' })}
                icon={Redo2}
                disabled={locked || !historyState.canRedo}
                onClick={() => undo(true)}
              />
              <ToolbarDivider />
              {(
                [
                  ['b', Bold, 'Bold'],
                  ['i', Italic, 'Italic'],
                  ['u', Underline, 'Underline'],
                ] as const
              ).map(([tag, icon, label]) => (
                <EditorButton
                  key={tag}
                  label={t(`everaward.${tag}`, { defaultValue: label })}
                  icon={icon}
                  disabled={locked}
                  onClick={() => format(tag)}
                />
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className='everaward-editor-color' data-disabled={locked || undefined} onMouseDown={rememberSelection}>
                    <Palette className='size-4' />
                    <input
                      type='color'
                      disabled={locked}
                      aria-label={t('everaward.color', { defaultValue: 'Text color' })}
                      onInput={(event) => format('span', 'color', event.currentTarget.value)}
                    />
                  </label>
                </TooltipTrigger>
                <TooltipContent>{t('everaward.color', { defaultValue: 'Text color' })}</TooltipContent>
              </Tooltip>
              <div className='everaward-editor-font-size'>
                <select
                  disabled={locked}
                  aria-label={t('everaward.fontSize', { defaultValue: 'Font size' })}
                  defaultValue=''
                  onMouseDown={rememberSelection}
                  onChange={(event) => format('span', 'fontSize', `${event.target.value}px`)}>
                  <option value='' disabled>
                    {t('everaward.fontSize', { defaultValue: 'Font size' })}
                  </option>
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 45, 48, 60].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
                <ChevronDown className='size-3.5' aria-hidden='true' />
              </div>
              <ToolbarDivider />
              {(
                [
                  ['left', AlignLeft],
                  ['center', AlignCenter],
                  ['right', AlignRight],
                ] as const
              ).map(([direction, icon]) => (
                <EditorButton
                  key={direction}
                  label={t(`everaward.${direction}`, { defaultValue: direction })}
                  icon={icon}
                  disabled={locked}
                  onClick={() => align(direction)}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
      {tab === 'visual' ? (
        <div className='everaward-preview' ref={container} />
      ) : (
        <textarea
          className='everaward-editor-source'
          aria-label={t('everaward.html', { defaultValue: 'HTML (advanced)' })}
          value={source}
          readOnly={readOnly}
          disabled={disabled || uploading}
          spellCheck={false}
          onChange={(event) => {
            const html = event.target.value;
            setSource(html);
            publish(html);
          }}
        />
      )}
      <input
        ref={fileInput}
        type='file'
        accept='image/*'
        hidden
        disabled={locked}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void replaceImage(file);
        }}
      />
      {uploading && <p role='status'>{t('everaward.uploading', { defaultValue: 'Uploading image…' })}</p>}
      {uploadError && (
        <p role='alert'>{t('everaward.uploadFailed', { defaultValue: 'Image upload failed. Please try again.' })}</p>
      )}
      {invalid && <p role='alert'>{wrapperError}</p>}
    </div>
  );
}
