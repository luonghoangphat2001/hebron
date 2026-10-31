import { useWebEditorStore } from '@/stores/useWebEditorStore';
import type { BackgroundObject } from '@/utils/types/canvas.types';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import { getEditableBackgroundTransform } from '@/utils/helper/background-transform.helper';

/** The interaction proxy lives in the existing export-hidden transformer layer. */
export default function BackgroundControls({
  background,
  x,
  y,
  scale,
  panning = false,
}: {
  background: BackgroundObject;
  x: number;
  y: number;
  scale: number;
  panning?: boolean;
}) {
  const [image] = useImage(background.backgroundImage ?? '', 'anonymous');
  const nodeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const transient = useRef<{ node: Konva.Node; attrs: Record<string, unknown> } | null>(null);
  const state = useWebEditorStore.getState();
  const side = state.activeSide;
  const transform = image
    ? getEditableBackgroundTransform(
        { width: image.naturalWidth, height: image.naturalHeight },
        background.previewSize ?? state.canvasSize,
        background.backgroundSize,
        background.backgroundTransform,
      )
    : undefined;

  useEffect(() => {
    if (nodeRef.current) transformerRef.current?.nodes([nodeRef.current]);
    return () => {
      if (transient.current) transient.current.node.setAttrs(transient.current.attrs);
      transient.current = null;
    };
  }, [image]);

  if (!image || !transform) return null;
  const preview = () => {
    const node = nodeRef.current;
    const imageNode = node?.getStage()?.findOne('#canvas-background-image');
    if (!node || !imageNode) return;
    if (!transient.current)
      transient.current = {
        node: imageNode,
        attrs: {
          x: imageNode.x(),
          y: imageNode.y(),
          width: imageNode.width(),
          height: imageNode.height(),
          crop: imageNode.getAttr('crop'),
        },
      };
    imageNode.setAttrs({
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      crop: undefined,
    });
  };
  const commit = () => {
    const node = nodeRef.current;
    const current = useWebEditorStore.getState();
    if (!node || current.activeSide !== side || current.getCurrentBackground() !== background) return;
    const next = {
      x: (node.x() - x) / scale,
      y: (node.y() - y) / scale,
      scale: (node.width() * node.scaleX()) / scale / image.naturalWidth,
    };
    transient.current = null;
    node.scale({ x: 1, y: 1 });
    node.width(image.naturalWidth * next.scale * scale);
    node.height(image.naturalHeight * next.scale * scale);
    if (next.x !== transform.x || next.y !== transform.y || next.scale !== transform.scale)
      current.updateBackground({ backgroundTransform: next });
  };
  return (
    <>
      <Rect
        ref={nodeRef}
        name='background-interaction'
        x={x + transform.x * scale}
        y={y + transform.y * scale}
        width={image.naturalWidth * transform.scale * scale}
        height={image.naturalHeight * transform.scale * scale}
        fill='rgba(0,0,0,0)'
        stroke='#6366f1'
        strokeWidth={1}
        draggable={!panning}
        listening={!panning}
        onMouseDown={(event) => {
          event.cancelBubble = event.evt.button === 0;
        }}
        onTouchStart={(event) => {
          event.cancelBubble = true;
        }}
        onDragMove={preview}
        onDragEnd={commit}
        onTransform={preview}
        onTransformEnd={commit}
      />
      <Transformer
        ref={transformerRef}
        listening={!panning}
        rotateEnabled={false}
        flipEnabled={false}
        keepRatio
        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        anchorSize={9}
        borderStroke='#6366f1'
        boundBoxFunc={(oldBox, nextBox) =>
          nextBox.width < Math.max(5, image.naturalWidth * 0.01 * scale) ||
          nextBox.height < Math.max(5, image.naturalHeight * 0.01 * scale)
            ? oldBox
            : nextBox
        }
      />
    </>
  );
}
