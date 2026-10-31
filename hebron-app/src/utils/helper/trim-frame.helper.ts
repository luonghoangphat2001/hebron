export type TrimFrame = { x: number; y: number; width: number; height: number };

/** Resize against the fixed opposite corner, using the pointer rather than a snapped handle. */
export function resizeTrimFromCorner(
  start: TrimFrame,
  corner: string,
  pointer: { x: number; y: number },
  canvas: { width: number; height: number },
): TrimFrame {
  const left = corner.includes('left');
  const top = corner.includes('top');
  const anchorX = left ? start.x + start.width : start.x;
  const anchorY = top ? start.y + start.height : start.y;
  const requestedWidth = (left ? -1 : 1) * (pointer.x - anchorX);
  const requestedHeight = (top ? -1 : 1) * (pointer.y - anchorY);
  const maximumWidth = left ? anchorX : canvas.width - anchorX;
  const maximumHeight = top ? anchorY : canvas.height - anchorY;
  const width = Math.min(maximumWidth, Math.max(Math.min(12, maximumWidth), requestedWidth));
  const height = Math.min(maximumHeight, Math.max(Math.min(12, maximumHeight), requestedHeight));
  return { x: left ? anchorX - width : anchorX, y: top ? anchorY - height : anchorY, width, height };
}
