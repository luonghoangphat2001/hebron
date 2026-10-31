import { resolveFontFamily, resolveFontWeight } from '@/utils/helper/editor-fonts';
import type {
  CanvasSide,
  Template,
  TemplateFormState,
  TemplateLayer,
  TemplateLayerType,
  TemplateShapeType,
  TemplateWrite,
} from '@/data/product-catalog/product-catalog.types';

export const DEFAULT_TEMPLATE_FORM: TemplateFormState = {
  name: '',
  type: 'no-fold',
  side: 'single',
  is_active: true,
  allow_text_edit: true,
  allow_image_replace: true,
  spot_color_enabled: true,
  page_width: 0,
  page_height: 0,
  page_unit: 'mm',
  safe_margin: 0,
  background_id: null,
  cut_offset_x: null,
  cut_offset_y: null,
  cut_frame_width: null,
  cut_frame_height: null,
  back_safe_margin: 0,
  back_page_width: 0,
  back_page_height: 0,
  back_cut_offset_x: null,
  back_cut_offset_y: null,
  back_cut_frame_width: null,
  back_cut_frame_height: null,
  background_front_transform: { x: 0, y: 0, scale: 1 },
  background_back_transform: { x: 0, y: 0, scale: 1 },
  background_front: '',
  background_back: '',
  layers: [],
};

const id = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createLayer = (
  type: TemplateLayerType,
  side: CanvasSide,
  shapeType: TemplateShapeType = 'rectangle',
  position = { x: 20, y: 20 },
): TemplateLayer => ({
  layer_id: id(),
  type,
  side,
  field_key: type === 'text' ? 'text' : type === 'image' ? 'image' : 'shape',
  default_value: '',
  image_url: '',
  mask_image_url: '',
  mask_shape: type === 'image' ? 'circle' : 'none',
  shape_type: shapeType,
  polygon_sides: 6,
  position_x: position.x,
  position_y: position.y,
  width: type === 'text' ? 160 : 120,
  height: type === 'text' ? 24 : type === 'image' ? 120 : shapeType === 'line' ? 1 : 80,
  rotation: 0,
  font_family: 'Arimo',
  font_size: 16,
  font_weight: '400',
  line_height: 1.2,
  color: type === 'shape' ? '#94a3b8' : type === 'text' ? '#111827' : '#000000',
  fill_image_url: '',
  align: 'left',
  stroke_color: '#111827',
  stroke_width: shapeType === 'line' ? 2 : 0,
  locked: false,
  visible: true,
  editable: true,
  replaceable: true,
  opacity: 1,
  shadow_color: '#000000',
  shadow_blur: 0,
  shadow_offset_x: 0,
  shadow_offset_y: 0,
  shadow_opacity: 0,
});

export const mmToPx = (mm: number, dpi: number) => (Number(mm) * Number(dpi || 96)) / 25.4;
export const pxToMm = (px: number, dpi: number) => (Number(px) * 25.4) / Number(dpi || 96);

const number = (value: unknown, fallback = 0) => {
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const optionalNumber = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const templateToForm = (template?: Template): TemplateFormState => {
  if (!template) return { ...DEFAULT_TEMPLATE_FORM, layers: [] };
  const layout = template.layout_config;
  const guides = record(layout?.guides);
  const frontGuides = Object.keys(record(guides.front)).length ? record(guides.front) : guides;
  const hasSideGuides = 'front' in guides || 'back' in guides;
  // Only legacy flat guides were shared. A missing modern Back is not a copy of Front.
  const backGuides = hasSideGuides ? record(guides.back) : guides;
  const background = record(layout?.background);
  const safetyLine = record(template.safety_line);
  // Layer coordinates are canonicalized relative to the cutline. Convert the
  // short-lived background-coordinate payloads so they remain visually stable.
  const layers = (layout?.layers || []).map<TemplateLayer>((layer) => {
    const side = layer.side === 'back' ? 'back' : 'front';
    const sideGuides = side === 'back' ? backGuides : frontGuides;
    const usesBackgroundCoordinates = (sideGuides.layer_coordinate_space ?? guides.layer_coordinate_space) === 'background';
    const backgroundToCutlineX = usesBackgroundCoordinates ? number(sideGuides.cut_offset_x) : 0;
    const backgroundToCutlineY = usesBackgroundCoordinates ? number(sideGuides.cut_offset_y) : 0;
    return {
      layer_id: layer.id,
      type: layer.type,
      side,
      field_key: layer.field_key || '',
      default_value: layer.default_value || '',
      image_url: layer.image_url || '',
      mask_image_url: layer.mask_image_url || '',
      mask_shape:
        layer.type === 'image' && layer.field_key !== 'image_frame'
          ? 'none'
          : layer.mask_shape || (layer.type === 'image' ? 'circle' : 'none'),
      shape_type: layer.shape_type || 'rectangle',
      polygon_sides: number(layer.polygon_sides, 6),
      position_x: number(layer.position?.x) - backgroundToCutlineX,
      position_y: number(layer.position?.y) - backgroundToCutlineY,
      width: number(layer.size?.width, 1),
      height: number(layer.size?.height, 1),
      rotation: number(layer.rotation),
      font_family: resolveFontFamily(layer.style?.font_family),
      font_size: number(layer.style?.font_size, 16),
      font_weight: String(resolveFontWeight(layer.style?.font_family || 'Arimo', layer.style?.font_weight || '400')),
      line_height: number(layer.style?.line_height, 1.2),
      color: layer.style?.color || '#111827',
      fill_image_url: layer.style?.fill_image_url || '',
      align: layer.style?.align || 'left',
      stroke_color: layer.style?.stroke_color || '#111827',
      stroke_width: number(layer.style?.stroke_width),
      locked: layer.locked ?? false,
      visible: layer.visible ?? true,
      editable: layer.editable ?? true,
      replaceable: layer.replaceable ?? true,
      opacity: number(layer.style?.opacity, 1),
      shadow_color: layer.style?.shadow_color || '#000000',
      shadow_blur: number(layer.style?.shadow_blur),
      shadow_offset_x: number(layer.style?.shadow_offset_x),
      shadow_offset_y: number(layer.style?.shadow_offset_y),
      shadow_opacity: number(layer.style?.shadow_opacity),
    };
  });

  return {
    name: template.name || '',
    type: template.type || 'no-fold',
    side: template.side || layout?.side || 'single',
    is_active: template.is_active ?? false,
    allow_text_edit: template.editor_permission?.allow_text_edit ?? true,
    allow_image_replace: template.editor_permission?.allow_image_replace ?? true,
    spot_color_enabled: template.spot_color?.enabled ?? true,
    page_width: number(frontGuides.cut_width, number(layout?.page?.width, 0)),
    page_height: number(frontGuides.cut_height, number(layout?.page?.height, 0)),
    page_unit: 'mm',
    safe_margin: number(frontGuides.safe_margin ?? frontGuides.safety_margin ?? safetyLine.safe_margin ?? safetyLine.margin, 0),
    background_id: template.background_id ?? template.background?.id ?? null,
    background_front_transform: {
      x: number(record(frontGuides.background_transform).x),
      y: number(record(frontGuides.background_transform).y),
      scale: Math.max(0.01, number(record(frontGuides.background_transform).scale, 1)),
    },
    background_back_transform: {
      x: number(record(backGuides.background_transform).x),
      y: number(record(backGuides.background_transform).y),
      scale: Math.max(0.01, number(record(backGuides.background_transform).scale, 1)),
    },
    cut_offset_x: optionalNumber(frontGuides.cut_offset_x),
    cut_offset_y: optionalNumber(frontGuides.cut_offset_y),
    cut_frame_width: optionalNumber(frontGuides.cut_frame_width),
    cut_frame_height: optionalNumber(frontGuides.cut_frame_height),
    back_safe_margin: number(backGuides.safe_margin ?? backGuides.safety_margin, 0),
    back_page_width: number(backGuides.cut_width, hasSideGuides ? 0 : number(layout?.page?.width)),
    back_page_height: number(backGuides.cut_height, hasSideGuides ? 0 : number(layout?.page?.height)),
    back_cut_offset_x: optionalNumber(backGuides.cut_offset_x),
    back_cut_offset_y: optionalNumber(backGuides.cut_offset_y),
    back_cut_frame_width: optionalNumber(backGuides.cut_frame_width),
    back_cut_frame_height: optionalNumber(backGuides.cut_frame_height),
    background_front: String(
      background.front_image_url || template.background?.image_url || template.background?.image_path || '',
    ),
    background_back: String(background.back_image_url || ''),
    layers,
  };
};

export const getInvalidTemplateCutSide = (form: TemplateFormState): CanvasSide | undefined => {
  const valid = (width: number, height: number) => Number.isFinite(width) && width >= 1 && Number.isFinite(height) && height >= 1;
  if (!valid(form.page_width, form.page_height)) return 'front';
  if (form.side === 'double' && !valid(form.back_page_width, form.back_page_height)) return 'back';
  return undefined;
};

export const templateToPayload = (form: TemplateFormState, existing?: Template): TemplateWrite => {
  const layers = form.layers.filter((layer) => layer.visible && (form.side === 'double' || layer.side === 'front'));

  return {
    name: form.name.trim(),
    product_id: existing?.product_id ?? null,
    background_id: form.background_id,
    type: form.type,
    specifications: existing?.specifications || {},
    font_set: existing?.font_set || {},
    color_set: existing?.color_set || {},
    spot_color: { ...(existing?.spot_color || {}), enabled: form.spot_color_enabled },
    layout_config: {
      version: 1,
      side: form.side,
      page: { width: form.page_width, height: form.page_height, unit: 'mm' },
      background: {
        front_image_url: form.background_front || '',
        back_image_url: form.side === 'double' ? form.background_back || null : null,
      },
      guides: {
        cut_offset_unit: 'px',
        layer_coordinate_space: 'cutline',
        unit: 'mm',
        front: {
          background_transform: form.background_front_transform,
          cut_width: form.page_width,
          cut_height: form.page_height,
          safe_margin: form.safe_margin,
          cut_offset_x: form.cut_offset_x,
          cut_offset_y: form.cut_offset_y,
          cut_frame_width: form.cut_frame_width,
          cut_frame_height: form.cut_frame_height,
          cut_offset_unit: 'px',
          layer_coordinate_space: 'cutline',
          unit: 'mm',
        },
        ...(form.side === 'double'
          ? {
              back: {
                background_transform: form.background_back_transform,
                cut_width: form.back_page_width,
                cut_height: form.back_page_height,
                safe_margin: form.back_safe_margin,
                cut_offset_x: form.back_cut_offset_x,
                cut_offset_y: form.back_cut_offset_y,
                cut_frame_width: form.back_cut_frame_width,
                cut_frame_height: form.back_cut_frame_height,
                cut_offset_unit: 'px',
                layer_coordinate_space: 'cutline',
                unit: 'mm',
              },
            }
          : {}),
      },
      layers: layers.map((layer) => ({
        id: layer.layer_id,
        type: layer.type,
        side: form.side === 'single' ? 'front' : layer.side,
        field_key: layer.field_key,
        default_value: layer.default_value,
        image_url: layer.image_url,
        mask_image_url: layer.mask_image_url,
        mask_shape: layer.type === 'image' && layer.field_key !== 'image_frame' ? 'none' : layer.mask_shape,
        shape_type: layer.shape_type,
        polygon_sides: layer.polygon_sides,
        locked: layer.locked,
        visible: layer.visible,
        editable: layer.editable,
        replaceable: layer.replaceable,
        position: { x: layer.position_x, y: layer.position_y },
        size: { width: layer.width, height: layer.height },
        rotation: layer.rotation,
        style: {
          font_family: resolveFontFamily(layer.font_family),
          font_size: layer.font_size,
          font_weight: String(resolveFontWeight(layer.font_family, layer.font_weight)),
          line_height: layer.line_height,
          color: layer.color,
          fill_image_url: layer.fill_image_url,
          align: layer.align,
          stroke_color: layer.stroke_color,
          stroke_width: layer.stroke_width,
          opacity: layer.opacity,
          shadow_color: layer.type === 'text' ? layer.shadow_color : '#000000',
          shadow_blur: layer.type === 'text' ? layer.shadow_blur : 0,
          shadow_offset_x: layer.type === 'text' ? layer.shadow_offset_x : 0,
          shadow_offset_y: layer.type === 'text' ? layer.shadow_offset_y : 0,
          shadow_opacity: layer.type === 'text' ? layer.shadow_opacity : 0,
        },
      })),
    },
    editor_permission: {
      allow_text_edit: form.allow_text_edit,
      allow_image_replace: form.allow_image_replace,
    },
    preview_images: existing?.preview_images || [],
    is_active: form.is_active,
  };
};
