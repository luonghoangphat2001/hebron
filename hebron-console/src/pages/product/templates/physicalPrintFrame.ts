import type { CanvasSide, TemplateFormState } from '@/data/product-catalog/product-catalog.types';

export const resizePrintFrame = (
  corner: string,
  x: number,
  y: number,
  start: { x: number; y: number; width: number; height: number; widthMm?: number },
) => {
  const left = corner.includes('left');
  const top = corner.includes('top');
  const anchorX = left ? start.x + start.width : start.x;
  const anchorY = top ? start.y + start.height : start.y;
  const minimum = start.widthMm ? start.width / start.widthMm : 12;
  let width = left ? Math.min(Math.max(minimum, anchorX - x), anchorX) : Math.max(minimum, x - anchorX);
  let height = top ? Math.min(Math.max(minimum, anchorY - y), anchorY) : Math.max(minimum, y - anchorY);
  // Freeze the physical scale at drag start, then snap geometry as well as
  // dimensions. Recomputing this scale from each rounded move causes drift.
  if (start.widthMm && start.widthMm > 0) {
    const pixelsPerMm = start.width / start.widthMm;
    const maxWidthMm = left ? Math.max(1, Math.floor(anchorX / pixelsPerMm + 1e-10)) : Infinity;
    const maxHeightMm = top ? Math.max(1, Math.floor(anchorY / pixelsPerMm + 1e-10)) : Infinity;
    width = Math.min(maxWidthMm, Math.max(1, Math.round(width / pixelsPerMm))) * pixelsPerMm;
    height = Math.min(maxHeightMm, Math.max(1, Math.round(height / pixelsPerMm))) * pixelsPerMm;
  }
  return { x: left ? anchorX - width : anchorX, y: top ? anchorY - height : anchorY, width, height };
};

// A single width-derived pixel scale keeps form values and frame geometry in
// sync, including the first explicit edit of an older mismatched frame.
export const updatePrintDimensions = (width: number, widthMm: number, nextWidthMm: number, nextHeightMm: number) => ({
  width: (nextWidthMm * width) / widthMm,
  height: (nextHeightMm * width) / widthMm,
});

export const printDimensionsFromFrame = (width: number, height: number, oldWidth: number, oldWidthMm: number) => {
  const pixelsPerMm = oldWidth / oldWidthMm;
  return { widthMm: Math.max(1, Math.round(width / pixelsPerMm)), heightMm: Math.max(1, Math.round(height / pixelsPerMm)) };
};

// Hydrate older stored frames into the authoritative physical dimensions. This
// only changes editor state; persistence still requires the normal Save action.
export const normalizeTemplatePhysicalFrames = (form: TemplateFormState): TemplateFormState => {
  let normalized = form;
  for (const side of ['front', 'back'] as CanvasSide[]) {
    const back = side === 'back';
    const width = back ? form.back_cut_frame_width : form.cut_frame_width;
    const height = back ? form.back_cut_frame_height : form.cut_frame_height;
    const widthMm = back ? form.back_page_width : form.page_width;
    const heightMm = back ? form.back_page_height : form.page_height;
    if (![width, height, widthMm, heightMm].every((value) => value != null && Number.isFinite(value) && value > 0)) continue;
    const frameWidth = width!;
    const frameHeight = height!;
    const nextHeight = (frameWidth / widthMm) * heightMm;
    if (Math.abs(frameHeight - nextHeight) < 1e-8) continue;
    const pixelsPerPointScale = 25.4 / 96;
    const oldFontScale = Math.max(0.1, Math.min(frameWidth / widthMm, frameHeight / heightMm) * pixelsPerPointScale);
    const newFontScale = Math.max(0.1, (frameWidth / widthMm) * pixelsPerPointScale);
    normalized = {
      ...normalized,
      ...(back ? { back_cut_frame_height: nextHeight } : { cut_frame_height: nextHeight }),
      // Existing artwork stays in cut-local pixels; compensate only the stored
      // point-size representation so text keeps the same rendered glyph size.
      layers: normalized.layers.map((layer) =>
        layer.side === side && layer.type === 'text'
          ? { ...layer, font_size: (layer.font_size * oldFontScale) / newFontScale }
          : layer,
      ),
    };
  }
  return normalized;
};
