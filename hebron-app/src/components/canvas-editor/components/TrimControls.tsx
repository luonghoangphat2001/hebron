import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { resizeTrimFromCorner } from '@/utils/helper/trim-frame.helper';
import type Konva from 'konva';
import { useRef } from 'react';
import { Group, Layer, Rect } from 'react-konva';
import { useShallow } from 'zustand/react/shallow';

type Frame = { x: number; y: number; width: number; height: number };

/** Editor-only edge hit areas and corner handles linked to physical print measurements. */
export default function TrimControls({ x, y, scale }: { x: number; y: number; scale: number }) {
  const { contentOffset, contentSize, canvasSize, trimSelected, selectTrim, updateTrimFrame, rulersEnabled } = useWebEditorStore(
    useShallow((state) => ({
      contentOffset: state.contentOffset,
      contentSize: state.contentSize,
      canvasSize: state.canvasSize,
      trimSelected: state.trimSelected,
      selectTrim: state.selectTrim,
      updateTrimFrame: state.updateTrimFrame,
      rulersEnabled: state.rulersEnabled,
    })),
  );
  const session = useRef<{ frame: Frame; recorded: boolean } | null>(null);
  const frame = { ...contentOffset, ...contentSize };
  const hitSize = 18 / scale;
  const handleSize = 6 / scale;
  const begin = () => {
    selectTrim();
    session.current = { frame, recorded: false };
  };
  const update = (next: Frame) => {
    const before = useWebEditorStore.getState().contentOffset;
    const beforeSize = useWebEditorStore.getState().contentSize;
    updateTrimFrame(next, !session.current?.recorded);
    if (
      session.current &&
      (before !== useWebEditorStore.getState().contentOffset || beforeSize !== useWebEditorStore.getState().contentSize)
    ) {
      session.current.recorded = true;
    }
  };
  const resize = (corner: string, event: Konva.KonvaEventObject<DragEvent>) => {
    const start = session.current?.frame ?? frame;
    const pointer = event.target.getStage()?.getPointerPosition();
    const layer = event.target.getLayer();
    if (!pointer || !layer) return;
    const localPointer = layer.getAbsoluteTransform().copy().invert().point(pointer);
    update(resizeTrimFromCorner(start, corner, localPointer, canvasSize));
    const resolved = useWebEditorStore.getState();
    event.target.position({
      x: resolved.contentOffset.x + (corner.includes('right') ? resolved.contentSize.width : 0) - handleSize / 2,
      y: resolved.contentOffset.y + (corner.includes('bottom') ? resolved.contentSize.height : 0) - handleSize / 2,
    });
  };

  if (!rulersEnabled) return null;
  return (
    <Layer name='editor-only' x={x} y={y} scaleX={scale} scaleY={scale}>
      <Group
        x={frame.x}
        y={frame.y}
        draggable
        onMouseDown={selectTrim}
        onTap={selectTrim}
        onDragStart={begin}
        onDragMove={(event) => {
          const start = session.current?.frame ?? frame;
          update({ ...start, x: event.target.x(), y: event.target.y() });
          event.target.position(useWebEditorStore.getState().contentOffset);
        }}
        onDragEnd={() => {
          session.current = null;
        }}
        onMouseEnter={(event) => {
          event.target.getStage()!.container().style.cursor = 'move';
        }}
        onMouseLeave={(event) => {
          event.target.getStage()!.container().style.cursor = '';
        }}>
        <Rect x={0} y={-hitSize / 2} width={frame.width} height={hitSize} fill='rgba(239,68,68,0.01)' />
        <Rect x={0} y={frame.height - hitSize / 2} width={frame.width} height={hitSize} fill='rgba(239,68,68,0.01)' />
        <Rect x={-hitSize / 2} y={0} width={hitSize} height={frame.height} fill='rgba(239,68,68,0.01)' />
        <Rect x={frame.width - hitSize / 2} y={0} width={hitSize} height={frame.height} fill='rgba(239,68,68,0.01)' />
      </Group>
      {trimSelected &&
        (['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => (
          <Rect
            key={corner}
            x={frame.x + (corner.includes('right') ? frame.width : 0) - handleSize / 2}
            y={frame.y + (corner.includes('bottom') ? frame.height : 0) - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill='#ffffff'
            stroke='#ef4444'
            strokeWidth={1.5 / scale}
            draggable
            onMouseDown={(event) => {
              event.cancelBubble = true;
              selectTrim();
            }}
            onDragStart={begin}
            // The ref is read only when Konva dispatches this event, never during rendering.

            onDragMove={(event) => resize(corner, event)}
            onDragEnd={(event) => {
              resize(corner, event);
              session.current = null;
            }}
            onMouseEnter={(event) => {
              event.target.getStage()!.container().style.cursor =
                corner === 'top-left' || corner === 'bottom-right' ? 'nwse-resize' : 'nesw-resize';
            }}
            onMouseLeave={(event) => {
              event.target.getStage()!.container().style.cursor = '';
            }}
          />
        ))}
    </Layer>
  );
}
