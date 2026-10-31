import type Konva from 'konva';
import { layoutEditorText } from './editor-text-layout';
import { resolveFontFamily, resolveFontWeight } from './editor-fonts';

const pending = new WeakMap<Konva.Text, { key: string; promise: Promise<void> }>();
/** Install the same outline renderer used by PDF. Hit areas remain ordinary text boxes. */
export function prepareCanvasText(node: Konva.Text) {
  const attrs = node.getAttrs();
  const key = JSON.stringify(attrs, (key, value) => (typeof value === 'function' || key === 'sceneFunc' ? undefined : value));
  const cached = pending.get(node);
  if (cached?.key === key) return cached.promise;
  const fontFamily = resolveFontFamily(node.fontFamily());
  const style = node.fontStyle();
  const weight = resolveFontWeight(fontFamily, style.match(/\d{3}/)?.[0] || (style.includes('bold') ? '700' : '400'));
  const input = {
    content: node.text(),
    fontFamily,
    fontWeight: String(weight),
    fontStyle: style.includes('italic') ? 'italic' : 'normal',
    fontSize: node.fontSize(),
    size: { width: node.width() },
    lineHeight: node.lineHeight(),
    letterSpacing: node.letterSpacing(),
    align: node.align(),
    textDecoration: node.textDecoration() || 'none',
  };
  // Never show a transient system-font rendering while local glyphs are loading.
  node.sceneFunc(() => {});
  const promise = layoutEditorText(input).then((layout) => {
    if (pending.get(node)?.promise !== promise) return;
    const path = new Path2D(layout.paths.join(''));
    node.height(layout.height);
    node.sceneFunc((context) => {
      const canvas = context._context;
      canvas.save();
      canvas.fillStyle = String(node.fill() || '#000000');
      canvas.strokeStyle = String(node.stroke() || '#000000');
      canvas.lineWidth = node.strokeWidth();
      if (node.shadowEnabled() && node.shadowOpacity() > 0) {
        canvas.shadowColor = node.getShadowRGBA();
        canvas.shadowBlur = node.shadowBlur();
        canvas.shadowOffsetX = node.shadowOffsetX();
        canvas.shadowOffsetY = node.shadowOffsetY();
      }
      canvas.fill(path);
      if (node.stroke() && node.strokeWidth()) canvas.stroke(path);
      canvas.strokeStyle = String(node.fill() || '#000000');
      canvas.lineWidth = node.fontSize() / 15;
      for (const decoration of layout.decorations) {
        canvas.beginPath();
        canvas.moveTo(decoration.x, decoration.y);
        canvas.lineTo(decoration.x + decoration.width, decoration.y);
        canvas.stroke();
      }
      canvas.restore();
    });
    node
      .getStage()
      ?.find<Konva.Transformer>('Transformer')
      .forEach((transformer) => transformer.forceUpdate());
    node.getLayer()?.batchDraw();
  });
  pending.set(node, { key, promise });
  void promise.catch(() => {
    if (pending.get(node)?.promise === promise) pending.delete(node);
  });
  return promise;
}
export async function prepareStageText(stage: Konva.Stage | null) {
  if (!stage) return;
  await Promise.all(stage.find<Konva.Text>('.editor-text').map(prepareCanvasText));
  stage.draw();
}
