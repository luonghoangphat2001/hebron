import { normalizeTemplatePhysicalFrames, printDimensionsFromFrame, updatePrintDimensions } from './physicalPrintFrame';
import {
  EDITOR_FONT_FAMILIES as FONT_FAMILIES,
  fontPreviewStack,
  fontWeights,
  resolveFontFamily,
  resolveFontWeight,
} from '@/utils/helper/editor-fonts';
import Can from '@/components/Can';
import PageTitle from '@/components/PageTitle';
import AppDialog from '@/components/dialog/AppDialog';
import AppSelect from '@/components/select/AppSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useBackgroundCreateMutation, useBackgroundsQuery } from '@/data/background/background.query';
import type { Background } from '@/data/background/background.types';
import { useCalligraphiesQuery } from '@/data/calligraphy/calligraphy.query';
import { CALLIGRAPHY_TYPES, type CalligraphyType } from '@/data/calligraphy/calligraphy.types';
import { uploadFileAPI } from '@/data/file/file.api';
import useDebounce from '@/hooks/useDebounce';
import type {
  CanvasSide,
  Template,
  TemplateFormState,
  TemplateLayer,
  TemplateShapeType,
  TemplateWrite,
} from '@/data/product-catalog/product-catalog.types';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import { FileType } from '@/utils/enums/file.enum';
import { getErrorMessage } from '@/utils/helper/noti-error.helper';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Circle,
  Copy,
  Eye,
  EyeOff,
  Hexagon,
  Image as ImageIcon,
  Lock,
  Minus,
  Pencil,
  Redo2,
  Save,
  Square,
  Triangle,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  TemplateCanvas,
  type TemplateCanvasHandle,
  type TemplateCanvasViewState,
  type TemplateSnapSettings,
} from './TemplateCanvas';
import { FieldLabel, FormSection } from './TemplateUi';
import { templateAssetUrl as toStorageUrl } from './templateAssetUrl';
import { createLayer, getInvalidTemplateCutSide, mmToPx, templateToForm, templateToPayload } from './templateMapper';
import { getTemplateErrorMessage } from './templateUtils';

type Props = {
  title: string;
  existing?: Template;
  pending: boolean;
  readOnly?: boolean;
  onSave: (payload: TemplateWrite, previewFiles: { front: File; back?: File }) => Promise<void> | void;
};

type History = { form: TemplateFormState };

const TEMPLATE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml';
const TEMPLATE_IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const TEMPLATE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const readImageSize = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image dimensions.'));
    };
    image.src = objectUrl;
  });
const FOLD_LINES = { 'no-fold': 0, '2-fold': 1, '3-fold': 2, '4-fold': 3 } as const;
const SHAPES: Array<{ value: TemplateShapeType; icon: typeof Square }> = [
  { value: 'rectangle', icon: Square },
  { value: 'roundedRectangle', icon: Square },
  { value: 'doubleRectangle', icon: Square },
  { value: 'ellipse', icon: Circle },
  { value: 'line', icon: Minus },
  { value: 'triangle', icon: Triangle },
  { value: 'star', icon: Hexagon },
  { value: 'polygon', icon: Hexagon },
];

type UploadedTemplateAsset = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
};

const DEFAULT_VIEW_STATE: TemplateCanvasViewState = { zoom: 1, pan: { x: 0, y: 0 } };
const DEFAULT_SNAP_SETTINGS: TemplateSnapSettings = {
  grid: false,
  center: true,
  edges: true,
  objects: true,
  safeArea: true,
};

const upload = async (file: File, type: FileType) => {
  const response = (await uploadFileAPI(file, type)) as any;
  const uploaded = response?.data?.file ?? response?.file ?? response?.data ?? response;
  const path = uploaded?.url || uploaded?.path;
  if (!path) throw new Error();
  return String(path);
};

const isValidTemplateImage = (file: File, t: ReturnType<typeof useTranslation<'template'>>['t']) => {
  if (file.size > TEMPLATE_IMAGE_MAX_SIZE) {
    toast.error(t('product.message.file_too_large', { name: file.name }));
    return false;
  }

  if (!TEMPLATE_IMAGE_TYPES.has(file.type)) {
    toast.error(t('product.message.unsupported_image', { name: file.name }));
    return false;
  }

  return true;
};

const isEditableTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return !!element?.closest('input,textarea,select,[contenteditable="true"]');
};

const roundedNumber = (value: number, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round(Number(value || 0) * factor) / factor;
};

const roundedValue = (value: number, precision = 1) => String(roundedNumber(value, precision));

export default function TemplateEditor({ title, existing, pending, onSave, readOnly }: Props) {
  const { t } = useTranslation('template');
  const { t: tProduct } = useTranslation('product');
  const [form, setForm] = useState<TemplateFormState>(() => normalizeTemplatePhysicalFrames(templateToForm(existing)));
  const [activeSide, setActiveSide] = useState<CanvasSide>('front');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cutLineSelected, setCutLineSelected] = useState(false);
  const [drawingShape, setDrawingShape] = useState<TemplateShapeType | null>(null);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const backgroundUploadLock = useRef(false);
  const backgroundInput = useRef<HTMLInputElement>(null);
  const createBackground = useBackgroundCreateMutation();
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [calligraphyPickerOpen, setCalligraphyPickerOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedTemplateAsset[]>([]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapSettings, setSnapSettings] = useState<TemplateSnapSettings>(DEFAULT_SNAP_SETTINGS);
  const [viewBySide, setViewBySide] = useState<Record<CanvasSide, TemplateCanvasViewState>>({
    front: DEFAULT_VIEW_STATE,
    back: DEFAULT_VIEW_STATE,
  });
  const [calligraphyType, setCalligraphyType] = useState<CalligraphyType>('calligraphy');
  const [calligraphySearchInput, setCalligraphySearchInput] = useState('');
  const [calligraphySearch, setCalligraphySearch] = useState('');
  const [guideInputs, setGuideInputs] = useState({
    page_width: form.page_width ? String(form.page_width) : '',
    page_height: form.page_height ? String(form.page_height) : '',
    safe_margin: form.safe_margin ? String(form.safe_margin) : '',
  });
  const [uploading, setUploading] = useState(false);
  const [past, setPast] = useState<History[]>([]);
  const [future, setFuture] = useState<History[]>([]);
  const formInteractionStart = useRef<TemplateFormState | undefined>(undefined);
  const clipboard = useRef<TemplateLayer | undefined>(undefined);
  const assetInput = useRef<HTMLInputElement>(null);
  const maskInput = useRef<HTMLInputElement>(null);
  const multipleAssetInput = useRef<HTMLInputElement>(null);
  const frontCanvasRef = useRef<TemplateCanvasHandle>(null);
  const backCanvasRef = useRef<TemplateCanvasHandle>(null);
  const canvasRef = activeSide === 'front' ? frontCanvasRef : backCanvasRef;
  const backgroundsQuery = useBackgroundsQuery({
    page: 1,
    per_page: 100,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  useDebounce(calligraphySearchInput, setCalligraphySearch);
  const calligraphiesQuery = useCalligraphiesQuery({
    type: calligraphyType,
    search: calligraphySearch || undefined,
    page: 1,
    per_page: 100,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const commit = useCallback((recipe: (current: TemplateFormState) => TemplateFormState) => {
    setForm((current) => {
      const next = recipe(current);
      setPast((history) => [...history, { form: deepCopy(current) }].slice(-50));
      setFuture([]);
      return next;
    });
  }, []);

  const beginFormInteraction = useCallback(() => {
    formInteractionStart.current ??= deepCopy(form);
  }, [form]);

  const endFormInteraction = useCallback(() => {
    const previous = formInteractionStart.current;
    if (!previous) return;
    setPast((history) => [...history, { form: previous }].slice(-50));
    setFuture([]);
    formInteractionStart.current = undefined;
  }, []);

  const updateForm = <K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K], history = false) => {
    if (history) commit((current) => ({ ...current, [key]: value }));
    else setForm((current) => ({ ...current, [key]: value }));
  };

  const applyGuideNumber = (key: 'page_width' | 'page_height' | 'safe_margin', value: number) => {
    setForm((current) => {
      const back = activeSide === 'back';
      const formKey = back ? (`back_${key}` as 'back_page_width' | 'back_page_height' | 'back_safe_margin') : key;
      const width = back ? current.back_cut_frame_width : current.cut_frame_width;
      const height = back ? current.back_cut_frame_height : current.cut_frame_height;
      const widthMm = back ? current.back_page_width : current.page_width;
      const heightMm = back ? current.back_page_height : current.page_height;
      const next = { ...current, [formKey]: value };
      // Physical parameters resize the frame at its existing uniform pixel scale.
      if (key !== 'safe_margin' && width && height) {
        const nextWidthMm = key === 'page_width' ? value : widthMm;
        const nextHeightMm = key === 'page_height' ? value : heightMm;
        if (!(nextWidthMm > 0 && nextHeightMm > 0)) return next;
        const frame = updatePrintDimensions(width, widthMm > 0 ? widthMm : nextWidthMm, nextWidthMm, nextHeightMm);
        if (back) Object.assign(next, { back_cut_frame_width: frame.width, back_cut_frame_height: frame.height });
        else Object.assign(next, { cut_frame_width: frame.width, cut_frame_height: frame.height });
        const oldScale =
          widthMm > 0 && heightMm > 0 ? Math.max(0.1, Math.min(width / mmToPx(widthMm, 96), height / mmToPx(heightMm, 96))) : 1;
        const newScale = Math.max(0.1, Math.min(frame.width / mmToPx(nextWidthMm, 96), frame.height / mmToPx(nextHeightMm, 96)));
        next.layers = current.layers.map((layer) =>
          layer.side === activeSide && layer.type === 'text'
            ? { ...layer, font_size: (layer.font_size * oldScale) / newScale }
            : layer,
        );
      }
      return next;
    });
  };

  const updateGuideNumber = (key: 'page_width' | 'page_height' | 'safe_margin', value: string, min: number, max?: number) => {
    setGuideInputs((current) => ({ ...current, [key]: value }));
    if (!value.trim()) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(Math.max(min, parsed), max ?? parsed);
    applyGuideNumber(key, next);
  };

  const commitGuideNumber = (key: 'page_width' | 'page_height' | 'safe_margin', min: number, max?: number) => {
    const parsed = Number(guideInputs[key]);
    const fallback = Number(
      activeSide === 'back'
        ? key === 'safe_margin'
          ? form.back_safe_margin
          : key === 'page_width'
            ? form.back_page_width
            : form.back_page_height
        : form[key],
    );
    const value = Number.isFinite(parsed) ? parsed : fallback;
    const committed = key === 'safe_margin' ? value : Math.round(value);
    const next = Math.min(Math.max(min, committed), max ?? committed);
    applyGuideNumber(key, next);
    setGuideInputs((current) => ({ ...current, [key]: String(next) }));
  };

  const updateLayer = useCallback(
    (layerId: string, patch: Partial<TemplateLayer>, history = false) => {
      const update = (current: TemplateFormState) => ({
        ...current,
        layers: current.layers.map((layer) => (layer.layer_id === layerId ? { ...layer, ...patch } : layer)),
      });
      if (history) commit(update);
      else setForm(update);
    },
    [commit],
  );

  const updateLayers = useCallback(
    (patches: Array<{ id: string; patch: Partial<TemplateLayer> }>) => {
      if (!patches.length) return;
      const patchMap = new Map(patches.map(({ id, patch }) => [id, patch]));
      commit((current) => ({
        ...current,
        layers: current.layers.map((layer) => {
          const patch = patchMap.get(layer.layer_id);
          return patch ? { ...layer, ...patch } : layer;
        }),
      }));
    },
    [commit],
  );

  const addLayer = (type: TemplateLayer['type'], shapeType?: TemplateShapeType) => {
    const layer = createLayer(type, activeSide, shapeType);
    if (type === 'image') layer.mask_shape = 'none';
    const contentSize = canvasRef.current?.contentSize() || { width: canvasWidth, height: canvasHeight };
    const hasCutLine = contentSize.width > 0 && contentSize.height > 0;
    if (hasCutLine) {
      if (type === 'image') {
        const imageSize = Math.max(80, roundedNumber(Math.min(contentSize.width, contentSize.height) * 0.3));
        layer.width = imageSize;
        layer.height = imageSize;
        layer.position_x = roundedNumber((contentSize.width - imageSize) / 2);
        layer.position_y = roundedNumber((contentSize.height - imageSize) / 2);
      } else {
        const widthRatio = type === 'text' ? 0.45 : 0.3;
        const heightRatio = type === 'text' ? 0.12 : shapeType === 'line' ? 0 : 0.3;
        layer.width = Math.max(type === 'text' ? 160 : 80, roundedNumber(contentSize.width * widthRatio));
        layer.height =
          shapeType === 'line' ? 1 : Math.max(type === 'text' ? 48 : 80, roundedNumber(contentSize.height * heightRatio));
        layer.position_x = roundedNumber((contentSize.width - layer.width) / 2);
        layer.position_y = roundedNumber((contentSize.height - layer.height) / 2);
        if (type === 'text') layer.font_size = 16;
      }
    }
    if (type === 'text') layer.default_value = t('template.editor.default_text');
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedIds([layer.layer_id]);
    setDrawingShape(null);
  };

  const addImageLayer = (url: string, naturalWidth: number, naturalHeight: number) => {
    const layer = createLayer('image', activeSide);
    const contentSize = canvasRef.current?.contentSize() || { width: canvasWidth, height: canvasHeight };
    const aspectRatio = naturalWidth / Math.max(naturalHeight, 1);
    const maxWidth = Math.max(40, contentSize.width * 0.4);
    const maxHeight = Math.max(40, contentSize.height * 0.4);
    let width = maxWidth;
    let height = width / Math.max(aspectRatio, 0.01);
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    Object.assign(layer, {
      image_url: url,
      mask_shape: 'none',
      width: roundedNumber(width),
      height: roundedNumber(height),
      position_x: roundedNumber((contentSize.width - width) / 2),
      position_y: roundedNumber((contentSize.height - height) / 2),
    });
    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
    setSelectedIds([layer.layer_id]);
    setDrawingShape(null);
  };

  const uploadMultipleAssets = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const validFiles = files.filter((file) => isValidTemplateImage(file, t));
    if (!validFiles.length) return;

    setUploading(true);
    try {
      const results = await Promise.all(
        validFiles.map(async (file) => {
          const [size, url] = await Promise.all([readImageSize(file), upload(file, FileType.TEMPLATES)]);
          return { id: crypto.randomUUID(), name: file.name, url, width: size.width, height: size.height };
        }),
      );
      setUploadedAssets((current) => [...current, ...results]);
      toast.success(t('template.message.asset_uploaded'));
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.asset_upload_failed')));
    } finally {
      setUploading(false);
    }
  };

  const addCalligraphy = (url: string) => {
    const resolvedUrl = toStorageUrl(url);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      addImageLayer(url, image.naturalWidth, image.naturalHeight);
      setCalligraphyPickerOpen(false);
    };
    image.onerror = () => toast.error(t('template.message.asset_upload_failed'));
    image.src = resolvedUrl;
  };

  const deleteSelected = useCallback(() => {
    const deletable = new Set(
      form.layers.filter((layer) => selectedIds.includes(layer.layer_id) && !layer.locked).map((layer) => layer.layer_id),
    );
    if (!deletable.size) return;
    commit((current) => ({ ...current, layers: current.layers.filter((layer) => !deletable.has(layer.layer_id)) }));
    setSelectedIds([]);
  }, [commit, form.layers, selectedIds]);

  const duplicateSelected = useCallback(() => {
    const originals = form.layers.filter((layer) => selectedIds.includes(layer.layer_id));
    if (!originals.length) return;
    const copies = originals.map((layer) => ({
      ...deepCopy(layer),
      layer_id: crypto.randomUUID(),
      position_x: layer.position_x + 10,
      position_y: layer.position_y + 10,
      side: activeSide,
      locked: false,
    }));
    commit((current) => ({ ...current, layers: [...current.layers, ...copies] }));
    setSelectedIds(copies.map((layer) => layer.layer_id));
  }, [activeSide, commit, form.layers, selectedIds]);

  const reorderSelectedLayer = useCallback(
    (action: 'forward' | 'front' | 'backward' | 'back') => {
      if (selectedIds.length !== 1) return;
      const selectedId = selectedIds[0];
      const currentSideLayers = form.layers.filter((layer) => layer.side === activeSide);
      const selectedIndex = currentSideLayers.findIndex((layer) => layer.layer_id === selectedId);
      const movingUp = action === 'forward' || action === 'front';
      if (selectedIndex < 0 || (movingUp && selectedIndex === currentSideLayers.length - 1) || (!movingUp && selectedIndex === 0))
        return;

      commit((current) => {
        const sideIndexes = current.layers.reduce<number[]>((indexes, layer, index) => {
          if (layer.side === activeSide) indexes.push(index);
          return indexes;
        }, []);
        const sideLayers = sideIndexes.map((index) => current.layers[index]);
        const currentIndex = sideLayers.findIndex((layer) => layer.layer_id === selectedId);
        if (currentIndex < 0) return current;

        const targetIndex =
          action === 'front'
            ? sideLayers.length - 1
            : action === 'back'
              ? 0
              : action === 'forward'
                ? Math.min(sideLayers.length - 1, currentIndex + 1)
                : Math.max(0, currentIndex - 1);
        if (targetIndex === currentIndex) return current;

        const reordered = [...sideLayers];
        const [selected] = reordered.splice(currentIndex, 1);
        reordered.splice(targetIndex, 0, selected);
        const layers = [...current.layers];
        sideIndexes.forEach((globalIndex, index) => {
          layers[globalIndex] = reordered[index];
        });

        return { ...current, layers };
      });
    },
    [activeSide, commit, form.layers, selectedIds],
  );

  const paste = useCallback(
    (position?: { x: number; y: number }) => {
      if (!clipboard.current) return;
      const source = clipboard.current;
      const next = {
        ...deepCopy(source),
        layer_id: crypto.randomUUID(),
        side: activeSide,
        locked: false,
        position_x: position ? position.x - source.width / 2 : source.position_x + 10,
        position_y: position ? position.y - source.height / 2 : source.position_y + 10,
      };
      commit((current) => ({ ...current, layers: [...current.layers, next] }));
      setSelectedIds([next.layer_id]);
    },
    [activeSide, commit],
  );

  const undo = useCallback(() => {
    setPast((history) => {
      const previous = history.at(-1);
      if (!previous) return history;
      setFuture((items) => [{ form: deepCopy(form) }, ...items]);
      setForm(previous.form);
      setSelectedIds([]);
      return history.slice(0, -1);
    });
  }, [form]);

  const redo = useCallback(() => {
    setFuture((history) => {
      const next = history[0];
      if (!next) return history;
      setPast((items) => [...items, { form: deepCopy(form) }]);
      setForm(next.form);
      setSelectedIds([]);
      return history.slice(1);
    });
  }, [form]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (readOnly || isEditableTarget(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length) {
        event.preventDefault();
        deleteSelected();
      }
      if (modifier && event.key.toLowerCase() === 'c' && selectedIds.length === 1) {
        const selected = form.layers.find((layer) => layer.layer_id === selectedIds[0]);
        if (selected) clipboard.current = deepCopy(selected);
      }
      if (modifier && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        paste();
      }
      if (modifier && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
      }
      if (modifier && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (modifier && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
      if (event.key === 'Escape') setDrawingShape(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, duplicateSelected, form.layers, paste, readOnly, redo, selectedIds, undo]);

  const dpi = 96;
  const frontPageWidth = Number(form.page_width);
  const frontPageHeight = Number(form.page_height);
  const backPageWidth = Number(form.back_page_width);
  const backPageHeight = Number(form.back_page_height);
  const pageWidth = activeSide === 'front' ? frontPageWidth : backPageWidth;
  const pageHeight = activeSide === 'front' ? frontPageHeight : backPageHeight;
  const frontCanvasWidth = frontPageWidth > 0 ? mmToPx(frontPageWidth, dpi) : 0;
  const frontCanvasHeight = frontPageHeight > 0 ? mmToPx(frontPageHeight, dpi) : 0;
  const backCanvasWidth = backPageWidth > 0 ? mmToPx(backPageWidth, dpi) : 0;
  const backCanvasHeight = backPageHeight > 0 ? mmToPx(backPageHeight, dpi) : 0;
  const canvasWidth = activeSide === 'front' ? frontCanvasWidth : backCanvasWidth;
  const canvasHeight = activeSide === 'front' ? frontCanvasHeight : backCanvasHeight;
  const activeBackgroundValue = activeSide === 'front' ? form.background_front : form.background_back;
  const activeBackgroundUrl = toStorageUrl(activeBackgroundValue);
  const bleed = 0;
  const maxSafeMargin = Math.max(0, Math.min(pageWidth, pageHeight) / 2);
  const frontSafeMargin = Math.min(Math.max(0, Number(form.safe_margin) || 0), maxSafeMargin);
  const backSafeMargin = Math.min(Math.max(0, Number(form.back_safe_margin) || 0), maxSafeMargin);
  const safeMargin = activeSide === 'front' ? frontSafeMargin : backSafeMargin;
  const activeCutOffset =
    activeSide === 'front'
      ? { x: form.cut_offset_x, y: form.cut_offset_y }
      : { x: form.back_cut_offset_x, y: form.back_cut_offset_y };
  const activeCutFrameSize =
    activeSide === 'front'
      ? { width: form.cut_frame_width, height: form.cut_frame_height }
      : { width: form.back_cut_frame_width, height: form.back_cut_frame_height };
  const sideLayers = form.layers.filter((layer) => layer.side === activeSide);
  const selectedLayer = selectedIds.length === 1 ? form.layers.find((layer) => layer.layer_id === selectedIds[0]) : undefined;
  const isBusy = pending || uploading || backgroundUploading;

  const selectBackground = (background: Background) => {
    commit((current) => ({
      ...current,
      ...(activeSide === 'front' ? { background_id: background.id } : {}),
      [activeSide === 'front' ? 'background_front' : 'background_back']: background.image_url || background.image_path,
      [activeSide === 'front' ? 'background_front_transform' : 'background_back_transform']: { x: 0, y: 0, scale: 1 },
      ...(activeSide === 'front'
        ? { cut_offset_x: null, cut_offset_y: null, cut_frame_width: null, cut_frame_height: null }
        : {
            back_cut_offset_x: null,
            back_cut_offset_y: null,
            back_cut_frame_width: null,
            back_cut_frame_height: null,
          }),
    }));
    setBackgroundPickerOpen(false);
  };

  const uploadBackground = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || readOnly || backgroundUploadLock.current) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(tProduct('background.message.invalid_type'));
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error(tProduct('background.message.too_large'));
      return;
    }

    backgroundUploadLock.current = true;
    setBackgroundUploading(true);
    try {
      const response = await uploadFileAPI(file, FileType.BACKGROUNDS);
      const uploaded = response.data?.file;
      if (!uploaded?.path) throw new Error(tProduct('background.message.upload_failed'));
      const background = await createBackground.mutateAsync({ image_path: uploaded.path });
      if (!(background.id > 0) || !(background.image_url || background.image_path)) {
        throw new Error(tProduct('background.message.upload_failed'));
      }
      selectBackground(background);
      toast.success(tProduct('background.message.created'));
    } catch (error) {
      toast.error(getErrorMessage(error, tProduct('background.message.upload_failed')));
    } finally {
      backgroundUploadLock.current = false;
      setBackgroundUploading(false);
    }
  };

  const uploadAsset = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedLayer) return;
    if (!isValidTemplateImage(file, t)) return;

    setUploading(true);
    try {
      const naturalSize =
        selectedLayer.type === 'image' && selectedLayer.field_key !== 'image_frame' ? await readImageSize(file) : undefined;
      const url = await upload(file, FileType.TEMPLATES);
      if (selectedLayer.type === 'shape') {
        updateLayer(selectedLayer.layer_id, { fill_image_url: url }, true);
      } else if (naturalSize) {
        const nextHeight = selectedLayer.width * (naturalSize.height / Math.max(naturalSize.width, 1));
        updateLayer(
          selectedLayer.layer_id,
          {
            image_url: url,
            height: roundedNumber(nextHeight),
            position_y: roundedNumber(selectedLayer.position_y + (selectedLayer.height - nextHeight) / 2),
          },
          true,
        );
      } else {
        updateLayer(selectedLayer.layer_id, { image_url: url }, true);
      }
      toast.success(t('template.message.asset_uploaded'));
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.asset_upload_failed')));
    } finally {
      setUploading(false);
    }
  };

  const uploadMaskAsset = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedLayer) return;
    if (!isValidTemplateImage(file, t)) return;

    setUploading(true);
    try {
      const url = await upload(file, FileType.TEMPLATES);
      updateLayer(selectedLayer.layer_id, { mask_image_url: url, mask_shape: 'custom' }, true);
      toast.success(t('template.message.asset_uploaded'));
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.asset_upload_failed')));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error(t('validation.name_required'));
    const invalidSide = getInvalidTemplateCutSide(form);
    if (invalidSide) {
      setActiveSide(invalidSide);
      setSelectedIds([]);
      setCutLineSelected(true);
      setGuideInputs({
        page_width: String(invalidSide === 'front' ? form.page_width : form.back_page_width),
        page_height: String(invalidSide === 'front' ? form.page_height : form.back_page_height),
        safe_margin: String(invalidSide === 'front' ? form.safe_margin : form.back_safe_margin),
      });
      return toast.error(t('validation.cut_dimensions', { side: t(`common.side.${invalidSide}`) }));
    }
    const payload = templateToPayload(
      {
        ...form,
        side: form.side,
        page_width: frontPageWidth,
        page_height: frontPageHeight,
        back_page_width: backPageWidth,
        back_page_height: backPageHeight,
        safe_margin: frontSafeMargin,
        back_safe_margin: backSafeMargin,
      },
      existing,
    );
    setUploading(true);
    try {
      const frontPreview = await frontCanvasRef.current?.toPreviewFile('preview-front.png');
      if (!frontPreview) throw new Error('Template canvas is not ready.');
      const backPreview = form.side === 'double' ? await backCanvasRef.current?.toPreviewFile('preview-back.png') : undefined;
      if (form.side === 'double' && !backPreview) throw new Error('Back template canvas is not ready.');
      await onSave(payload, { front: frontPreview, back: backPreview });
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, t('template.message.update_failed')));
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className='space-y-5'>
      <PageTitle
        title={title}
        returnLink={MY_ROUTE.PRODUCT.TEMPLATE_LIST}
        extra={
          readOnly ? (
            existing && (
              <Can action='edit'>
                <Button asChild variant='outline'>
                  <Link to={MY_ROUTE.PRODUCT.TEMPLATE_EDIT(existing.id)}>
                    <Pencil /> {t('common.action.edit')}
                  </Link>
                </Button>
              </Can>
            )
          ) : (
            <div className='flex gap-2'>
              {existing && (
                <Button asChild variant='outline'>
                  <Link to={MY_ROUTE.PRODUCT.TEMPLATE_DETAIL(existing.id)}>
                    <Eye /> {t('common.action.view')}
                  </Link>
                </Button>
              )}
              <Can action={existing ? 'edit' : 'register'}>
                <Button loading={isBusy} disabled={isBusy} onClick={save}>
                  <Save /> {t('template.action.save')}
                </Button>
              </Can>
            </div>
          )
        }
      />
      <fieldset disabled={readOnly} className='space-y-5'>
        <FormSection title={t('template.section.settings')}>
          <div className='grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]'>
            <div>
              <FieldLabel required>{t('common.field.name')}</FieldLabel>
              <Input value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
            </div>
            <div>
              <FieldLabel>{t('common.field.status')}</FieldLabel>
              <AppSelect
                value={form.is_active ? 'active' : 'inactive'}
                clearable={false}
                onChange={(value) => updateForm('is_active', value !== 'inactive', true)}
                options={[
                  { value: 'active', label: t('common.status.active') },
                  { value: 'inactive', label: t('common.status.inactive') },
                ]}
              />
            </div>
            <div>
              <FieldLabel>{t('template.field.sides')}</FieldLabel>
              <AppSelect
                value={form.side}
                clearable={false}
                onChange={(value) => {
                  const side = value === 'double' ? 'double' : 'single';
                  updateForm('side', side, true);
                  if (side === 'single') {
                    setActiveSide('front');
                    setGuideInputs({
                      page_width: String(form.page_width),
                      page_height: String(form.page_height),
                      safe_margin: String(form.safe_margin),
                    });
                  }
                  setSelectedIds([]);
                  setCutLineSelected(false);
                }}
                options={[
                  { value: 'single', label: t('template.side.single') },
                  { value: 'double', label: t('template.side.double') },
                ]}
              />
            </div>
          </div>
        </FormSection>

        <div className='grid items-start overflow-hidden rounded-lg border bg-white xl:grid-cols-[230px_minmax(0,1fr)_300px]'>
          <aside className='w-full border-r'>
            {form.side === 'double' ? (
              <div className='grid grid-cols-2 gap-2 border-b p-3'>
                {(['front', 'back'] as CanvasSide[]).map((side) => (
                  <Button
                    key={side}
                    type='button'
                    size='sm'
                    variant={activeSide === side ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveSide(side);
                      setGuideInputs((current) => ({
                        ...current,
                        page_width: String(side === 'front' ? form.page_width : form.back_page_width),
                        page_height: String(side === 'front' ? form.page_height : form.back_page_height),
                        safe_margin: String(side === 'front' ? form.safe_margin : form.back_safe_margin),
                      }));
                      setSelectedIds([]);
                      setCutLineSelected(false);
                      setDrawingShape(null);
                    }}>
                    {t(`common.side.${side}`)}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className='p-3'>
              <p className='mb-2 text-sm font-semibold'>{t('template.editor.add_layer')}</p>
              <div className='grid grid-cols-2 gap-2'>
                <Button variant='outline' size='sm' onClick={() => addLayer('text')}>
                  <Type /> {t('template.editor.text')}
                </Button>
                <Button variant='outline' size='sm' onClick={() => addLayer('image')}>
                  <ImageIcon /> {t('template.editor.image')}
                </Button>
                <Button variant='outline' size='sm' onClick={() => setAssetPickerOpen(true)}>
                  <Upload /> {t('template.editor.asset_library')}
                </Button>
                <Button variant='outline' size='sm' onClick={() => setCalligraphyPickerOpen(true)}>
                  <Type /> {t('template.editor.calligraphy')}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const layer = createLayer('image', activeSide);
                    const contentSize = canvasRef.current?.contentSize() || { width: canvasWidth, height: canvasHeight };
                    if (contentSize.width > 0 && contentSize.height > 0) {
                      const frameSize = Math.max(80, roundedNumber(Math.min(contentSize.width, contentSize.height) * 0.3));
                      layer.width = frameSize;
                      layer.height = frameSize;
                      layer.position_x = roundedNumber((contentSize.width - layer.width) / 2);
                      layer.position_y = roundedNumber((contentSize.height - layer.height) / 2);
                    }
                    layer.field_key = 'image_frame';
                    layer.mask_shape = 'circle';
                    commit((current) => ({ ...current, layers: [...current.layers, layer] }));
                    setSelectedIds([layer.layer_id]);
                    setDrawingShape(null);
                  }}>
                  <Circle /> {t('template.editor.image_frame')}
                </Button>
                {SHAPES.map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={drawingShape === value ? 'default' : 'outline'}
                    size='sm'
                    title={t('template.editor.draw_hint', { shape: t(`template.editor.${value}`) })}
                    onClick={() => setDrawingShape((current) => (current === value ? null : value))}>
                    <Icon /> {t(`template.editor.${value}`)}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className='flex items-center justify-between p-3'>
              <p className='text-sm font-semibold'>{t('template.editor.layers')}</p>
              <div className='flex'>
                <Button variant='ghost' size='icon-sm' disabled={!past.length} onClick={undo}>
                  <Undo2 />
                </Button>
                <Button variant='ghost' size='icon-sm' disabled={!future.length} onClick={redo}>
                  <Redo2 />
                </Button>
              </div>
            </div>
            <div className='flex items-center justify-center gap-1 border-t border-b px-2 py-1.5'>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={selectedIds.length !== 1}
                title={t('common.action.bring_to_front')}
                aria-label={t('common.action.bring_to_front')}
                onClick={() => reorderSelectedLayer('front')}>
                <ChevronsUp />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={selectedIds.length !== 1}
                title={t('common.action.move_forward')}
                aria-label={t('common.action.move_forward')}
                onClick={() => reorderSelectedLayer('forward')}>
                <ArrowUp />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={selectedIds.length !== 1}
                title={t('common.action.move_backward')}
                aria-label={t('common.action.move_backward')}
                onClick={() => reorderSelectedLayer('backward')}>
                <ArrowDown />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={selectedIds.length !== 1}
                title={t('common.action.send_to_back')}
                aria-label={t('common.action.send_to_back')}
                onClick={() => reorderSelectedLayer('back')}>
                <ChevronsDown />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={!selectedIds.length}
                title={t('common.action.copy')}
                aria-label={t('common.action.copy')}
                onClick={duplicateSelected}>
                <Copy />
              </Button>
              <Button
                variant='ghost'
                size='icon-sm'
                disabled={!selectedIds.length}
                title={t('common.action.delete')}
                aria-label={t('common.action.delete')}
                onClick={deleteSelected}>
                <Trash2 />
              </Button>
            </div>
            <div className='max-h-[520px] overflow-y-auto px-2 pb-3'>
              {[...sideLayers].reverse().map((layer) => (
                <div
                  key={layer.layer_id}
                  className={`mb-1 flex w-full items-center rounded-md text-sm ${
                    selectedIds.includes(layer.layer_id) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                  }`}>
                  <button
                    type='button'
                    className='flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left'
                    onClick={(event) =>
                      setSelectedIds((current) =>
                        event.shiftKey || event.metaKey || event.ctrlKey
                          ? current.includes(layer.layer_id)
                            ? current.filter((id) => id !== layer.layer_id)
                            : [...current, layer.layer_id]
                          : [layer.layer_id],
                      )
                    }>
                    {layer.type === 'text' ? <Type /> : layer.type === 'image' ? <ImageIcon /> : <Square />}
                    <span className={`min-w-0 flex-1 truncate ${layer.visible ? '' : 'text-slate-400'}`}>
                      {layer.type === 'text'
                        ? layer.default_value.trim() ||
                          (layer.field_key && layer.field_key !== layer.type ? layer.field_key : t('template.editor.text'))
                        : layer.field_key === 'image_frame'
                          ? t('template.editor.image_frame')
                          : layer.field_key && layer.field_key !== layer.type
                            ? layer.field_key
                            : t(`template.editor.${layer.type}`)}
                    </span>
                    {layer.locked ? <Lock className='size-3' /> : null}
                  </button>
                  <Switch
                    className='mr-2 shrink-0'
                    checked={layer.visible}
                    aria-label={t(layer.visible ? 'template.editor.hide_layer' : 'template.editor.show_layer')}
                    title={t(layer.visible ? 'template.editor.hide_layer' : 'template.editor.show_layer')}
                    onCheckedChange={(visible) => updateLayer(layer.layer_id, { visible }, true)}
                  />
                </div>
              ))}
            </div>
          </aside>

          <section className='flex w-full min-w-0 flex-col bg-slate-50'>
            <div className='h-[540px]'>
              <TemplateCanvas
                key={activeSide}
                ref={canvasRef}
                layers={sideLayers}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                bleed={bleed}
                cutOffset={activeCutOffset}
                cutFrameSize={activeCutFrameSize}
                pageWidthMm={pageWidth}
                pageHeightMm={pageHeight}
                safetyLabel={t('template.editor.safety_line')}
                foldLines={FOLD_LINES[form.type]}
                backgroundUrl={activeBackgroundUrl}
                backgroundTransform={activeSide === 'front' ? form.background_front_transform : form.background_back_transform}
                onBackgroundTransformChange={(transform) => {
                  commit((current) => ({
                    ...current,
                    [activeSide === 'front' ? 'background_front_transform' : 'background_back_transform']: transform,
                  }));
                }}
                safeMarginMm={safeMargin}
                selectedIds={selectedIds}
                interactive={!readOnly}
                drawingShape={drawingShape}
                gridEnabled={gridEnabled}
                onGridToggle={() => setGridEnabled((current) => !current)}
                snapSettings={snapSettings}
                viewState={viewBySide[activeSide]}
                onViewStateChange={(viewState) => setViewBySide((current) => ({ ...current, [activeSide]: viewState }))}
                onSelect={(id, additive) => {
                  setCutLineSelected(false);
                  if (!id) return setSelectedIds([]);
                  setSelectedIds((current) =>
                    additive ? (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]) : [id],
                  );
                }}
                onCutActiveChange={(active) => {
                  setCutLineSelected(active);
                  if (active) setSelectedIds([]);
                }}
                onMarqueeSelect={setSelectedIds}
                onPasteAt={paste}
                onChange={(id, patch) => updateLayer(id, patch, true)}
                onChanges={updateLayers}
                onCutInteractionStart={beginFormInteraction}
                onCutInteractionEnd={endFormInteraction}
                onCutOffsetChange={(offset) => {
                  setForm((current) => {
                    return {
                      ...current,
                      ...(activeSide === 'front'
                        ? { cut_offset_x: offset.x, cut_offset_y: offset.y }
                        : { back_cut_offset_x: offset.x, back_cut_offset_y: offset.y }),
                    };
                  });
                }}
                onCutResizeChange={(frame) => {
                  const oldWidth = activeCutFrameSize.width;
                  const oldHeight = activeCutFrameSize.height;
                  const dimensions =
                    oldWidth &&
                    oldHeight &&
                    (oldWidth !== frame.width || oldHeight !== frame.height) &&
                    pageWidth > 0 &&
                    pageHeight > 0
                      ? printDimensionsFromFrame(frame.width, frame.height, oldWidth, pageWidth)
                      : undefined;
                  if (dimensions)
                    setGuideInputs((current) => ({
                      ...current,
                      page_width: String(dimensions.widthMm),
                      page_height: String(dimensions.heightMm),
                    }));
                  setForm((current) => {
                    const oldWidth = activeSide === 'front' ? current.cut_frame_width : current.back_cut_frame_width;
                    const oldHeight = activeSide === 'front' ? current.cut_frame_height : current.back_cut_frame_height;
                    const widthMm = activeSide === 'front' ? current.page_width : current.back_page_width;
                    const heightMm = activeSide === 'front' ? current.page_height : current.back_page_height;
                    const dimensions =
                      oldWidth &&
                      oldHeight &&
                      (oldWidth !== frame.width || oldHeight !== frame.height) &&
                      widthMm > 0 &&
                      heightMm > 0
                        ? printDimensionsFromFrame(frame.width, frame.height, oldWidth, widthMm)
                        : undefined;
                    const oldScale =
                      oldWidth && oldHeight && widthMm > 0 && heightMm > 0
                        ? Math.max(0.1, Math.min(oldWidth / mmToPx(widthMm, 96), oldHeight / mmToPx(heightMm, 96)))
                        : 1;
                    const newScale = dimensions
                      ? Math.max(
                          0.1,
                          Math.min(frame.width / mmToPx(dimensions.widthMm, 96), frame.height / mmToPx(dimensions.heightMm, 96)),
                        )
                      : 1;
                    return {
                      ...current,
                      ...(activeSide === 'front'
                        ? {
                            cut_frame_width: frame.width,
                            cut_frame_height: frame.height,
                            cut_offset_x: frame.x,
                            cut_offset_y: frame.y,
                            ...(dimensions ? { page_width: dimensions.widthMm, page_height: dimensions.heightMm } : {}),
                          }
                        : {
                            back_cut_frame_width: frame.width,
                            back_cut_frame_height: frame.height,
                            back_cut_offset_x: frame.x,
                            back_cut_offset_y: frame.y,
                            ...(dimensions ? { back_page_width: dimensions.widthMm, back_page_height: dimensions.heightMm } : {}),
                          }),
                      layers: dimensions
                        ? current.layers.map((layer) =>
                            layer.side === activeSide && layer.type === 'text'
                              ? { ...layer, font_size: (layer.font_size * oldScale) / newScale }
                              : layer,
                          )
                        : current.layers,
                    };
                  });
                }}
                onDraw={(result) => {
                  const layer = createLayer('shape', activeSide, result.type, { x: result.x, y: result.y });
                  Object.assign(layer, {
                    width: result.width,
                    height: result.height,
                    rotation: result.rotation || 0,
                  });
                  commit((current) => ({ ...current, layers: [...current.layers, layer] }));
                  setSelectedIds([layer.layer_id]);
                  setDrawingShape(null);
                }}
              />
            </div>
            <div className='border-t bg-white px-3 py-2 text-xs text-slate-500'>
              {pageWidth > 0 && pageHeight > 0
                ? t('template.editor.trim_summary', { width: roundedValue(pageWidth), height: roundedValue(pageHeight) })
                : t('template.editor.no_cut_line')}
            </div>
          </section>

          <aside className='w-full border-l'>
            <div className='max-h-[680px] overflow-y-auto p-4'>
              {selectedLayer ? (
                <LayerProperties
                  layer={selectedLayer}
                  onChange={(patch, history = true) => updateLayer(selectedLayer.layer_id, patch, history)}
                  onUpload={() => assetInput.current?.click()}
                  onUploadMask={() => maskInput.current?.click()}
                />
              ) : (
                <div className='space-y-4'>
                  {cutLineSelected ? (
                    <>
                      <div>
                        <h3 className='font-semibold'>{t('template.editor.cut_line')}</h3>
                        <div className='mt-3 grid grid-cols-2 gap-3'>
                          <div>
                            <FieldLabel>{t('template.field.cut_width')}</FieldLabel>
                            <Input
                              type='number'
                              min={1}
                              step='1'
                              value={guideInputs.page_width}
                              onFocus={beginFormInteraction}
                              onChange={(event) => updateGuideNumber('page_width', event.target.value, 1)}
                              onBlur={() => {
                                commitGuideNumber('page_width', 1);
                                endFormInteraction();
                              }}
                            />
                          </div>
                          <div>
                            <FieldLabel>{t('template.field.cut_height')}</FieldLabel>
                            <Input
                              type='number'
                              min={1}
                              step='1'
                              value={guideInputs.page_height}
                              onFocus={beginFormInteraction}
                              onChange={(event) => updateGuideNumber('page_height', event.target.value, 1)}
                              onBlur={() => {
                                commitGuideNumber('page_height', 1);
                                endFormInteraction();
                              }}
                            />
                          </div>
                        </div>
                        <p className='mt-2 text-xs text-slate-500'>{t('template.editor.physical_dimensions_help')}</p>
                        <div className='mt-3'>
                          <FieldLabel>{t('template.field.safety_margin')}</FieldLabel>
                          <Input
                            type='number'
                            min={0}
                            max={maxSafeMargin}
                            step='0.1'
                            value={guideInputs.safe_margin}
                            onFocus={beginFormInteraction}
                            onChange={(event) => updateGuideNumber('safe_margin', event.target.value, 0, maxSafeMargin)}
                            onBlur={() => {
                              commitGuideNumber('safe_margin', 0, maxSafeMargin);
                              endFormInteraction();
                            }}
                          />
                        </div>
                      </div>
                      <Separator />
                    </>
                  ) : null}
                  <h3 className='font-semibold'>{t('template.editor.canvas')}</h3>
                  <div>
                    <FieldLabel>{t('template.editor.background')}</FieldLabel>
                    {activeBackgroundUrl ? (
                      <img src={activeBackgroundUrl} className='mb-2 h-28 w-full rounded border object-cover' alt='' />
                    ) : (
                      <div className='mb-2 flex h-28 items-center justify-center rounded border border-dashed text-sm text-slate-400'>
                        {t('template.editor.no_background')}
                      </div>
                    )}
                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm' onClick={() => setBackgroundPickerOpen(true)}>
                        <ImageIcon /> {t('template.editor.select_background')}
                      </Button>
                      {activeBackgroundUrl ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            commit((current) => ({
                              ...current,
                              ...(activeSide === 'front' ? { background_id: null } : {}),
                              [activeSide === 'front' ? 'background_front' : 'background_back']: '',
                              [activeSide === 'front' ? 'background_front_transform' : 'background_back_transform']: {
                                x: 0,
                                y: 0,
                                scale: 1,
                              },
                              ...(activeSide === 'front'
                                ? { cut_frame_width: null, cut_frame_height: null }
                                : { back_cut_frame_width: null, back_cut_frame_height: null }),
                            }));
                          }}>
                          {t('common.action.remove')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <Separator />
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold'>{t('template.editor.snap_settings')}</h4>
                    {(
                      [
                        ['grid', 'snap_grid'],
                        ['center', 'snap_center'],
                        ['edges', 'snap_edges'],
                        ['objects', 'snap_objects'],
                        ['safeArea', 'snap_safe_area'],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className='flex items-center justify-between gap-3 text-sm'>
                        <span>{t(`template.editor.${label}`)}</span>
                        <Switch
                          checked={snapSettings[key]}
                          onCheckedChange={(checked) => setSnapSettings((current) => ({ ...current, [key]: checked }))}
                        />
                      </label>
                    ))}
                  </div>
                  <Separator />
                  <dl className='grid grid-cols-2 gap-y-2 text-sm'>
                    <dt className='text-muted-foreground'>{t('template.editor.safe')}</dt>
                    <dd>{safeMargin}mm</dd>
                    <dt className='text-muted-foreground'>{t('template.editor.layers_count')}</dt>
                    <dd>{sideLayers.length}</dd>
                  </dl>
                </div>
              )}
            </div>
          </aside>
        </div>
      </fieldset>

      {form.side === 'double' ? (
        <div aria-hidden className='pointer-events-none fixed top-0 left-[-12000px] h-[540px] w-[1000px] overflow-hidden'>
          <TemplateCanvas
            key={activeSide === 'front' ? 'back-preview-canvas' : 'front-preview-canvas'}
            ref={activeSide === 'front' ? backCanvasRef : frontCanvasRef}
            layers={form.layers.filter((layer) => layer.side !== activeSide)}
            canvasWidth={activeSide === 'front' ? backCanvasWidth : frontCanvasWidth}
            canvasHeight={activeSide === 'front' ? backCanvasHeight : frontCanvasHeight}
            bleed={bleed}
            cutOffset={
              activeSide === 'front'
                ? { x: form.back_cut_offset_x, y: form.back_cut_offset_y }
                : { x: form.cut_offset_x, y: form.cut_offset_y }
            }
            cutFrameSize={
              activeSide === 'front'
                ? { width: form.back_cut_frame_width, height: form.back_cut_frame_height }
                : { width: form.cut_frame_width, height: form.cut_frame_height }
            }
            pageWidthMm={activeSide === 'front' ? backPageWidth : frontPageWidth}
            pageHeightMm={activeSide === 'front' ? backPageHeight : frontPageHeight}
            safetyLabel={t('template.editor.safety_line')}
            foldLines={FOLD_LINES[form.type]}
            backgroundUrl={toStorageUrl(activeSide === 'front' ? form.background_back : form.background_front)}
            backgroundTransform={activeSide === 'front' ? form.background_back_transform : form.background_front_transform}
            safeMarginMm={activeSide === 'front' ? backSafeMargin : frontSafeMargin}
            selectedIds={[]}
            interactive={false}
          />
        </div>
      ) : null}

      <AppDialog
        open={backgroundPickerOpen}
        onOpenChange={(open) => {
          if (!backgroundUploadLock.current) setBackgroundPickerOpen(open);
        }}
        loading={backgroundUploading}
        title={t('template.editor.select_background')}
        className='sm:max-w-4xl'>
        {!readOnly && (
          <div className='mb-4'>
            <Can action='register'>
              <Button
                type='button'
                variant='outline'
                loading={backgroundUploading}
                disabled={backgroundUploading}
                onClick={() => backgroundInput.current?.click()}>
                <Upload /> {tProduct('background.action.add')}
              </Button>
            </Can>
            <input
              ref={backgroundInput}
              hidden
              type='file'
              accept='image/jpeg,image/png,image/webp'
              disabled={backgroundUploading}
              onChange={uploadBackground}
            />
          </div>
        )}
        {backgroundsQuery.isLoading ? (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='aspect-[4/3] animate-pulse rounded-lg bg-slate-100' />
            ))}
          </div>
        ) : backgroundsQuery.isError ? (
          <p className='py-10 text-center text-sm text-red-600'>{t('template.message.background_load_failed')}</p>
        ) : backgroundsQuery.data?.items.length ? (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
            {backgroundsQuery.data.items.map((background) => (
              <button
                key={background.id}
                type='button'
                disabled={backgroundUploading}
                onClick={() => {
                  if (!backgroundUploadLock.current) selectBackground(background);
                }}
                className={`aspect-[4/3] overflow-hidden rounded-lg border-2 bg-slate-100 transition hover:border-indigo-300 ${
                  activeBackgroundValue === background.image_path || activeBackgroundValue === background.image_url
                    ? 'border-indigo-600 ring-2 ring-indigo-100'
                    : 'border-transparent'
                }`}>
                <img
                  crossOrigin='anonymous'
                  src={toStorageUrl(background.image_url || background.image_path)}
                  alt='Background'
                  className='h-full w-full object-contain'
                />
              </button>
            ))}
          </div>
        ) : (
          <p className='py-10 text-center text-sm text-slate-500'>{t('template.message.no_backgrounds')}</p>
        )}
      </AppDialog>
      <AppDialog
        open={assetPickerOpen}
        onOpenChange={setAssetPickerOpen}
        title={t('template.editor.asset_library')}
        className='sm:max-w-4xl'>
        <div className='space-y-4'>
          <Button variant='outline' loading={uploading} onClick={() => multipleAssetInput.current?.click()}>
            <Upload /> {t('template.editor.upload_images')}
          </Button>
          {uploadedAssets.length ? (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
              {uploadedAssets.map((asset) => (
                <div key={asset.id} className='group relative'>
                  <button
                    type='button'
                    className='aspect-square w-full overflow-hidden rounded-lg border bg-slate-100 p-2 hover:border-indigo-400'
                    onClick={() => {
                      addImageLayer(asset.url, asset.width, asset.height);
                      setAssetPickerOpen(false);
                    }}>
                    <img
                      crossOrigin='anonymous'
                      src={toStorageUrl(asset.url)}
                      alt={asset.name}
                      className='size-full object-contain'
                    />
                  </button>
                  <button
                    type='button'
                    className='absolute top-1 right-1 rounded-full bg-white p-1 text-red-600 shadow'
                    aria-label={t('common.action.delete')}
                    onClick={() => setUploadedAssets((current) => current.filter((item) => item.id !== asset.id))}>
                    <Trash2 className='size-3' />
                  </button>
                  <p className='mt-1 truncate text-xs text-slate-500'>{asset.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className='py-8 text-center text-sm text-slate-500'>{t('template.editor.no_uploaded_assets')}</p>
          )}
        </div>
      </AppDialog>
      <AppDialog
        open={calligraphyPickerOpen}
        onOpenChange={setCalligraphyPickerOpen}
        title={t('template.editor.calligraphy')}
        className='sm:max-w-4xl'>
        <div className='mb-4 grid gap-3 md:grid-cols-2'>
          <Input
            value={calligraphySearchInput}
            onChange={(event) => setCalligraphySearchInput(event.target.value)}
            placeholder={t('template.editor.search_calligraphy')}
          />
          <AppSelect
            value={calligraphyType}
            clearable={false}
            onChange={(value) => value && setCalligraphyType(value as CalligraphyType)}
            options={CALLIGRAPHY_TYPES.map((value) => ({
              value,
              label: t(`template.editor.calligraphy_type_${value}`),
            }))}
          />
        </div>
        {calligraphiesQuery.isLoading ? (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='aspect-square animate-pulse rounded-lg bg-slate-200' />
            ))}
          </div>
        ) : calligraphiesQuery.isError ? (
          <p className='py-10 text-center text-sm text-red-600'>{t('template.editor.calligraphy_load_failed')}</p>
        ) : calligraphiesQuery.data?.items.length ? (
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            {calligraphiesQuery.data.items.map((item) => (
              <button
                key={item.id}
                type='button'
                className='flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-300 p-3 hover:ring-2 hover:ring-indigo-400'
                title={item.text || item.type_label}
                onClick={() => addCalligraphy(item.image_url || item.image_path)}>
                <img
                  crossOrigin='anonymous'
                  src={toStorageUrl(item.image_url || item.image_path)}
                  alt={item.text || item.type_label}
                  className='size-full object-contain'
                />
              </button>
            ))}
          </div>
        ) : (
          <p className='py-10 text-center text-sm text-slate-500'>{t('template.editor.no_calligraphies')}</p>
        )}
      </AppDialog>
      <input ref={assetInput} hidden type='file' accept={TEMPLATE_IMAGE_ACCEPT} onChange={uploadAsset} />
      <input ref={maskInput} hidden type='file' accept={TEMPLATE_IMAGE_ACCEPT} onChange={uploadMaskAsset} />
      <input
        ref={multipleAssetInput}
        hidden
        multiple
        type='file'
        accept={TEMPLATE_IMAGE_ACCEPT}
        onChange={uploadMultipleAssets}
      />
    </main>
  );
}

function LayerProperties({
  layer,
  onChange,
  onUpload,
  onUploadMask,
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>, history?: boolean) => void;
  onUpload: () => void;
  onUploadMask: () => void;
}) {
  const { t } = useTranslation('template');
  const { t: tCommon } = useTranslation('common');
  const number = (key: keyof TemplateLayer) => (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ [key]: Number(event.target.value) } as Partial<TemplateLayer>);
  const supportsFillColor = layer.type === 'text' || (layer.type === 'shape' && layer.shape_type !== 'line');
  const supportsStroke = layer.type === 'text' || layer.type === 'shape';

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold capitalize'>
          {t('template.editor.layer_title', { type: t(`template.editor.${layer.type}`) })}
        </h3>
        <div className='flex'>
          <Button variant='ghost' size='icon-sm' onClick={() => onChange({ visible: !layer.visible }, true)}>
            {layer.visible ? <Eye /> : <EyeOff />}
          </Button>
          <Button variant='ghost' size='icon-sm' onClick={() => onChange({ locked: !layer.locked }, true)}>
            {layer.locked ? <Lock /> : <Unlock />}
          </Button>
        </div>
      </div>
      {layer.type === 'text' ? (
        <>
          <div>
            <FieldLabel>{t('template.editor.default_value')}</FieldLabel>
            <Textarea value={layer.default_value} onChange={(event) => onChange({ default_value: event.target.value })} />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <FieldLabel>{t('template.editor.font')}</FieldLabel>
              <Select
                value={resolveFontFamily(layer.font_family)}
                onValueChange={(value) =>
                  onChange({ font_family: value, font_weight: String(resolveFontWeight(value, layer.font_weight)) }, true)
                }>
                <SelectTrigger className='w-full' style={{ fontFamily: fontPreviewStack(layer.font_family) }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-72'>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: fontPreviewStack(font) }}>
                      <span className='truncate'>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>{t('template.editor.font_size')}</FieldLabel>
              <Input type='number' min={1} value={layer.font_size} onChange={number('font_size')} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <FieldLabel>{t('template.editor.weight')}</FieldLabel>
              <AppSelect
                value={String(resolveFontWeight(layer.font_family, layer.font_weight))}
                onChange={(value) => value && onChange({ font_weight: value }, true)}
                options={fontWeights(layer.font_family).map((weight) => ({ value: String(weight), label: String(weight) }))}
              />
            </div>
            <div>
              <FieldLabel>{t('template.editor.line_height')}</FieldLabel>
              <Input type='number' min={0} step='.1' value={layer.line_height} onChange={number('line_height')} />
            </div>
          </div>
          <div>
            <FieldLabel>{t('template.editor.alignment')}</FieldLabel>
            <div className='flex gap-1'>
              {(
                [
                  ['left', AlignLeft],
                  ['center', AlignCenter],
                  ['right', AlignRight],
                  ['justify', AlignJustify],
                ] as const
              ).map(([value, Icon]) => (
                <Button
                  key={String(value)}
                  variant={layer.align === value ? 'default' : 'outline'}
                  size='icon-sm'
                  aria-label={tCommon(`editor.align_${value}`)}
                  aria-pressed={layer.align === value}
                  onClick={() => onChange({ align: value as TemplateLayer['align'] }, true)}>
                  <Icon />
                </Button>
              ))}
            </div>
          </div>
        </>
      ) : null}
      {layer.type === 'image' || layer.type === 'shape' ? (
        <div>
          <FieldLabel>{layer.type === 'shape' ? t('template.editor.fill_image') : t('template.editor.image')}</FieldLabel>
          <div className='flex gap-2'>
            <Button variant='outline' className='flex-1' onClick={onUpload}>
              <Upload /> {t('template.editor.upload_image')}
            </Button>
            {layer.type === 'image' && layer.image_url ? (
              <Button variant='ghost' onClick={() => onChange({ image_url: '' }, true)}>
                {t('common.action.remove')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {layer.type === 'image' && layer.field_key === 'image_frame' ? (
        <>
          <div>
            <FieldLabel>{t('template.editor.mask_shape')}</FieldLabel>
            <AppSelect
              value={layer.mask_shape === 'none' ? 'circle' : layer.mask_shape}
              onChange={(value) => value && onChange({ mask_shape: value as TemplateLayer['mask_shape'] }, true)}
              options={[
                { value: 'circle', label: t('template.editor.mask_circle') },
                { value: 'rectangle', label: t('template.editor.mask_rectangle') },
                { value: 'custom', label: t('template.editor.mask_custom') },
              ]}
            />
          </div>
          {layer.mask_shape === 'custom' ? (
            <div>
              <FieldLabel>{t('template.editor.mask_image')}</FieldLabel>
              <Button variant='outline' className='w-full' onClick={onUploadMask}>
                <Upload /> {t('template.editor.upload_mask_image')}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
      {layer.type === 'shape' ? (
        <div>
          <FieldLabel>{t('template.editor.polygon_sides')}</FieldLabel>
          <Input
            type='number'
            min={3}
            max={12}
            disabled={layer.shape_type !== 'polygon'}
            value={layer.polygon_sides}
            onChange={number('polygon_sides')}
          />
        </div>
      ) : null}
      <Separator />
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <FieldLabel>X</FieldLabel>
          <Input type='number' step='.1' value={roundedValue(layer.position_x)} onChange={number('position_x')} />
        </div>
        <div>
          <FieldLabel>Y</FieldLabel>
          <Input type='number' step='.1' value={roundedValue(layer.position_y)} onChange={number('position_y')} />
        </div>
        <div>
          <FieldLabel>{t('template.editor.width')}</FieldLabel>
          <Input type='number' min={1} step='.1' value={roundedValue(layer.width)} onChange={number('width')} />
        </div>
        <div>
          <FieldLabel>{t('template.editor.height')}</FieldLabel>
          <Input
            type='number'
            min={1}
            step='.1'
            disabled={layer.type === 'text'}
            value={roundedValue(layer.height)}
            onChange={number('height')}
          />
        </div>
        <div>
          <FieldLabel>{t('template.editor.rotation')}</FieldLabel>
          <Input type='number' step='.1' value={roundedValue(layer.rotation)} onChange={number('rotation')} />
        </div>
        <div>
          <FieldLabel>{t('template.editor.opacity')}</FieldLabel>
          <Input type='number' min={0} max={1} step='.05' value={layer.opacity} onChange={number('opacity')} />
        </div>
      </div>
      {supportsFillColor || supportsStroke ? (
        <>
          <div className='grid grid-cols-2 gap-3'>
            {supportsFillColor ? (
              <div>
                <FieldLabel>{t('template.editor.color')}</FieldLabel>
                <Input
                  type='color'
                  className='cursor-pointer p-1'
                  value={layer.color}
                  onChange={(event) => onChange({ color: event.target.value }, true)}
                />
              </div>
            ) : null}
            {supportsStroke ? (
              <div>
                <FieldLabel>{t('template.editor.stroke')}</FieldLabel>
                <Input
                  type='color'
                  className='cursor-pointer p-1'
                  value={layer.stroke_color}
                  onChange={(event) =>
                    onChange(
                      {
                        stroke_color: event.target.value,
                        ...(layer.stroke_width <= 0 ? { stroke_width: layer.type === 'text' ? 1 : 2 } : {}),
                      },
                      true,
                    )
                  }
                />
              </div>
            ) : null}
          </div>
          {supportsStroke ? (
            <div>
              <FieldLabel>{t('template.editor.stroke_width')}</FieldLabel>
              <Input type='number' min={0} value={layer.stroke_width} onChange={number('stroke_width')} />
            </div>
          ) : null}
        </>
      ) : null}
      {layer.type === 'text' ? (
        <>
          <Separator />
          <p className='text-sm font-medium'>{t('template.editor.shadow')}</p>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <FieldLabel>{t('template.editor.blur')}</FieldLabel>
              <Input type='number' min={0} value={layer.shadow_blur} onChange={number('shadow_blur')} />
            </div>
            <div>
              <FieldLabel>{t('template.editor.opacity')}</FieldLabel>
              <Input type='number' min={0} max={1} step='.05' value={layer.shadow_opacity} onChange={number('shadow_opacity')} />
            </div>
            <div>
              <FieldLabel>{t('template.editor.offset_x')}</FieldLabel>
              <Input type='number' value={layer.shadow_offset_x} onChange={number('shadow_offset_x')} />
            </div>
            <div>
              <FieldLabel>{t('template.editor.offset_y')}</FieldLabel>
              <Input type='number' value={layer.shadow_offset_y} onChange={number('shadow_offset_y')} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
