import { useCanvasFonts } from '@/hooks/useCanvasFonts';
import { useSnapshot } from '@/hooks/useSnapshot';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { DEFAULT_GRID_SIZE, SAFE_MARGIN_PX } from '@/utils/constants/canvas-editor.constant';
import { applySnap, findSnapLines, snapToGrid } from '@/utils/helper/canvas.helper';
import { ObjectType, type CanvasObject, type CardSide } from '@/utils/types/canvas.types';
import Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Text as KonvaText, Layer, Line, Rect, Stage, Transformer } from 'react-konva';

const useLoadedImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => setImage(img);
    img.src = src;

    return () => {
      img.onload = null;
    };
  }, [src]);

  return image;
};

interface CanvasProps {
  width: number;
  height: number;
  onStageReady?: (stage: Konva.Stage) => void;
}

const Canvas = ({ width, height, onStageReady }: CanvasProps) => {
  const {
    activeSide,
    frontData,
    backData,
    updateThumbnail,
    selectedId,
    zoom,
    pan,
    gridEnabled,
    rulersEnabled,
    snapToGrid: snapToGridEnabled,
    snapToObjects,
    selectObject,
    updateObject,
    deleteObject,
    duplicateObject,
    undo,
    redo,
    setPan,
    setZoom,
    canvasSize,
  } = useWebEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  useCanvasFonts(stageRef, JSON.stringify([frontData.objects, backData?.objects]));
  const frontLayerRef = useRef<Konva.Layer>(null);
  const backLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const versionRef = useRef({ front: 0, back: 0 });
  const snapshotCacheRef = useRef<{ front?: string; back?: string }>({});
  const contentChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [snapLines, setSnapLines] = useState<{ vertical: number[]; horizontal: number[] }>({
    vertical: [],
    horizontal: [],
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Get data for both sides
  const frontObjects = frontData.objects;
  const frontBackground = frontData.background;
  const backObjects = backData?.objects;
  const backBackground = backData?.background;

  // Current side data for convenience
  const currentObjects = activeSide === 'front' ? frontObjects : backObjects;
  const currentBackground = activeSide === 'front' ? frontBackground : backBackground;

  const scale = zoom;
  const scaledCardWidth = canvasSize.width * scale;
  const scaledCardHeight = canvasSize.height * scale;
  const offsetX = (width - scaledCardWidth) / 2 + pan.x;
  const offsetY = (height - scaledCardHeight) / 2 + pan.y - 60;

  // Use refs for bounds to avoid recreating callback
  const boundsRef = useRef({ x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight });

  // Update bounds ref in effect
  useEffect(() => {
    boundsRef.current = { x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight };
  }, [offsetX, offsetY, scaledCardWidth, scaledCardHeight]);

  const getCardBounds = useCallback(() => boundsRef.current, []);

  const handleSnapshotGenerated = useCallback(
    (side: CardSide, dataURL: string, version?: number) => {
      if (version !== undefined && version !== versionRef.current[side]) {
        // Stale snapshot - drop it
        return;
      }

      // Cache snapshot
      snapshotCacheRef.current[side] = dataURL;

      // Always update thumbnail - cache handles stale updates
      updateThumbnail(side, dataURL);

      // Mark sync as complete
    },
    [updateThumbnail],
  );

  // Snapshot system - imperative, event-driven
  const { requestSnapshot: originalRequestSnapshot } = useSnapshot(stageRef, transformerRef, {
    onSnapshotGenerated: handleSnapshotGenerated,
    debounceMs: 0,
    getCardBounds,
  });

  // Wrap requestSnapshot to add version tracking
  const requestSnapshot = useCallback(
    (side: CardSide) => {
      // Increment version for this side
      const version = ++versionRef.current[side];

      // Pass version through config
      originalRequestSnapshot(side, { version });
    },
    [originalRequestSnapshot],
  );

  // Keep requestSnapshot ref stable for useEffect
  const requestSnapshotRef = useRef(requestSnapshot);

  useEffect(() => {
    requestSnapshotRef.current = requestSnapshot;
  }, [requestSnapshot]);

  // Handle object drag
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    // Apply grid snapping
    if (snapToGridEnabled) {
      newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
      newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
    }

    // Apply object snapping
    if (snapToObjects) {
      const otherObjects = currentObjects.filter((o) => o.id !== obj.id).map((o) => ({ position: o.position, size: o.size }));

      const lines = findSnapLines({ x: newX, y: newY }, obj.size, otherObjects);

      setSnapLines(lines);

      const snapped = applySnap({ x: newX, y: newY }, lines);
      newX = snapped.x;
      newY = snapped.y;
    }

    node.position({ x: newX, y: newY });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    updateObject(obj.id, {
      position: { x: node.x(), y: node.y() },
    });
    setSnapLines({ vertical: [], horizontal: [] });

    // Request snapshot after drag (debounced)
    requestSnapshot(activeSide);
  };

  // Handle transform
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, obj: CanvasObject) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);

    updateObject(obj.id, {
      position: { x: node.x(), y: node.y() },
      size: {
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      },
      rotation: node.rotation(),
    });

    // Request snapshot after transform (debounced)
    requestSnapshot(activeSide);
  };

  // Keep panRef in sync with pan state
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Generate snapshot when background or objects change
  useEffect(() => {
    // Clear existing timer
    if (contentChangeTimerRef.current) {
      clearTimeout(contentChangeTimerRef.current);
    }

    // Debounced snapshot request when content changes
    const timer = setTimeout(() => {
      requestSnapshotRef.current(activeSide);
      contentChangeTimerRef.current = null;
    }, 300);

    contentChangeTimerRef.current = timer;

    return () => {
      if (contentChangeTimerRef.current) {
        clearTimeout(contentChangeTimerRef.current);
        contentChangeTimerRef.current = null;
      }
    };
  }, [currentBackground.backgroundColor, currentBackground.backgroundImage, currentObjects.length, activeSide]);

  // Generate snapshot for new side after layout is committed
  useEffect(() => {
    // Apply cached snapshot if available (instant preview)
    const cached = snapshotCacheRef.current[activeSide];
    if (cached) {
      updateThumbnail(activeSide, cached);
    }

    // Generate fresh snapshot for new side after visibility toggle
    requestSnapshotRef.current(activeSide);
  }, [activeSide, updateThumbnail]);

  // Attach transformer to selected object
  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const activeLayer = activeSide === 'front' ? frontLayerRef.current : backLayerRef.current;

    if (!activeLayer) return;

    if (selectedId) {
      const node = activeLayer.findOne(`#${selectedId}`);
      if (node) {
        transformer.nodes([node]);
      }
    } else {
      transformer.nodes([]);
    }

    activeLayer.batchDraw();
  }, [selectedId, activeSide, frontObjects, backObjects]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enable pan mode with Space key
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'grab';
        }
        e.preventDefault();
        return;
      }

      // Delete
      if (e.key === 'Delete' && selectedId) {
        deleteObject(selectedId);
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        undo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Redo
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        redo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Duplicate
      if (e.ctrlKey && e.key === 'd' && selectedId) {
        duplicateObject(selectedId);
        e.preventDefault();
      }

      // Deselect
      if (e.key === 'Escape') {
        selectObject(null);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Disable pan mode when Space key is released
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, deleteObject, undo, redo, duplicateObject, selectObject, isSpacePressed, activeSide]);

  useEffect(() => {
    const container = stageRef?.current?.container();
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;

      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Calculate mouse position relative to stage
      const mousePointTo = {
        x: (pointer.x - offsetX) / oldScale,
        y: (pointer.y - offsetY) / oldScale,
      };

      // Zoom factor
      const scaleBy = 1.05;
      const direction = e.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      // Clamp zoom
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      // Calculate new pan to keep mouse position fixed
      const newPan = {
        x: pointer.x - mousePointTo.x * clampedScale - (width - canvasSize.width * clampedScale) / 2,
        y: pointer.y - mousePointTo.y * clampedScale - (height - canvasSize.height * clampedScale) / 2,
      };

      setZoom(clampedScale);
      setPan(newPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, pan, offsetX, offsetY, width, height, setZoom, setPan, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const panState = {
      isPanning: false,
      startPan: { x: 0, y: 0 },
      startPointer: { x: 0, y: 0 },
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Space + Left click OR Middle mouse button
      if ((e.evt.button === 0 && isSpacePressed) || e.evt.button === 1) {
        panState.isPanning = true;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          panState.startPointer = { x: pointer.x, y: pointer.y };
          panState.startPan = { ...panRef.current };
        }
        stage.container().style.cursor = 'grabbing';
        e.evt.preventDefault();
      }
    };

    const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!panState.isPanning) return;

      const pointer = stage.getPointerPosition();
      if (pointer) {
        const dx = pointer.x - panState.startPointer.x;
        const dy = pointer.y - panState.startPointer.y;

        const newPan = {
          x: panState.startPan.x + dx,
          y: panState.startPan.y + dy,
        };

        // Cancel any pending animation frame
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame for smooth updates
        rafRef.current = requestAnimationFrame(() => {
          setPan(newPan);
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (panState.isPanning) {
        panState.isPanning = false;
        stage.container().style.cursor = isSpacePressed ? 'grab' : 'default';
      }
    };

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);
    stage.on('mouseleave', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
      stage.off('mouseleave', handleMouseUp);

      // Clean up any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [setPan, isSpacePressed]);

  return (
    <div className='relative h-full w-full overflow-hidden bg-gray-100'>
      <Stage
        ref={(node) => {
          // Only update if stage instance changed
          if (stageRef.current !== node) {
            stageRef.current = node;
            if (node && onStageReady) {
              onStageReady(node);
            }
          }
        }}
        width={width}
        height={height}
        onMouseDown={(e) => {
          // Deselect when clicking on empty space
          if (e.target === e.target.getStage()) {
            selectObject(null);
          }
        }}>
        <Layer>
          {/* Canvas background (white card) */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={scaledCardWidth}
            height={scaledCardHeight}
            fill={currentBackground.backgroundColor}
            shadowColor='black'
          />

          {/* Background Image */}
          {currentBackground.backgroundImage && (
            <CanvasBackgroundImage
              src={currentBackground.backgroundImage}
              x={offsetX}
              y={offsetY}
              width={scaledCardWidth}
              height={scaledCardHeight}
              backgroundSize={currentBackground.backgroundSize || 'cover'}
            />
          )}
          {rulersEnabled && (
            <Rect
              x={offsetX + SAFE_MARGIN_PX * scale}
              y={offsetY + SAFE_MARGIN_PX * scale}
              width={scaledCardWidth - SAFE_MARGIN_PX * 2 * scale}
              height={scaledCardHeight - SAFE_MARGIN_PX * 2 * scale}
              listening={false}
            />
          )}
          {/* Grid */}
          {gridEnabled && (
            <>
              {Array.from({ length: Math.ceil(canvasSize.width / DEFAULT_GRID_SIZE) }).map((_, i) => {
                const x = i * DEFAULT_GRID_SIZE * scale;
                return (
                  <Line
                    key={`grid-v-${i}`}
                    points={[offsetX + x, offsetY, offsetX + x, offsetY + scaledCardHeight]}
                    stroke='#e0e0e0'
                    strokeWidth={0.5}
                    listening={false}
                  />
                );
              })}
              {Array.from({ length: Math.ceil(canvasSize.height / DEFAULT_GRID_SIZE) }).map((_, i) => {
                const y = i * DEFAULT_GRID_SIZE * scale;
                return (
                  <Line
                    key={`grid-h-${i}`}
                    points={[offsetX, offsetY + y, offsetX + scaledCardWidth, offsetY + y]}
                    stroke='#e0e0e0'
                    strokeWidth={0.5}
                    listening={false}
                  />
                );
              })}
            </>
          )}
        </Layer>

        {/* Front Objects Layer */}
        <Layer
          ref={frontLayerRef}
          x={offsetX}
          y={offsetY}
          scaleX={scale}
          scaleY={scale}
          visible={activeSide === 'front'}
          listening={activeSide === 'front'}>
          {renderObjects(frontObjects)}
        </Layer>
        {/* Back Objects Layer */}
        <Layer
          ref={backLayerRef}
          x={offsetX}
          y={offsetY}
          scaleX={scale}
          scaleY={scale}
          visible={activeSide === 'back'}
          listening={activeSide === 'back'}>
          {renderObjects(backObjects)}
        </Layer>

        {/* Snap lines and Transformer on top */}
        <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {/* Snap lines */}
          {snapLines.vertical.map((x, i) => (
            <Line
              key={`snap-v-${i}`}
              points={[x, 0, x, canvasSize.height]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}
          {snapLines.horizontal.map((y, i) => (
            <Line
              key={`snap-h-${i}`}
              points={[0, y, canvasSize.width, y]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}

          {/* Transformer */}
          {selectedId && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
    </div>
  );

  function renderObjects(objects: CanvasObject[]) {
    return objects
      ?.filter((obj) => obj.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((obj) => {
        if (obj.type === ObjectType.TEXT) {
          return (
            <KonvaText
              key={obj.id}
              name='editor-text'
              id={obj.id}
              x={obj.position.x}
              y={obj.position.y}
              text={obj.content}
              fontSize={obj.fontSize}
              fontFamily={obj.fontFamily}
              fontStyle={`${obj.fontStyle} ${obj.fontWeight}`}
              textDecoration={obj.textDecoration}
              fill={obj.color}
              align={obj.align}
              width={obj.size.width}
              height={obj.size.height}
              lineHeight={obj.lineHeight}
              letterSpacing={obj.letterSpacing}
              rotation={obj.rotation}
              opacity={obj.opacity}
              draggable={!obj.locked}
              onClick={() => selectObject(obj.id)}
              onTap={() => selectObject(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformEnd={(e) => handleTransformEnd(e, obj)}
            />
          );
        }

        if (obj.type === ObjectType.IMAGE) {
          return (
            <CanvasImage
              key={obj.id}
              obj={obj}
              onSelect={() => selectObject(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformEnd={(e) => handleTransformEnd(e, obj)}
            />
          );
        }

        // if (obj.type === ObjectType.SHAPE) {
        //   const shapeProps = {
        //     key: obj.id,
        //     id: obj.id,
        //     x: obj.position.x,
        //     y: obj.position.y,
        //     fill: obj.fill,
        //     stroke: obj.stroke,
        //     strokeWidth: obj.strokeWidth,
        //     rotation: obj.rotation,
        //     opacity: obj.opacity,
        //     draggable: !obj.locked,
        //     onClick: () => selectObject(obj.id),
        //     onTap: () => selectObject(obj.id),
        //     onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(e, obj),
        //     onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, obj),
        //     onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, obj),
        //   };

        //   if (obj.shapeType === 'rectangle') {
        //     return <Rect {...shapeProps} width={obj.size.width} height={obj.size.height} cornerRadius={obj.cornerRadius || 0} />;
        //   }

        //   if (obj.shapeType === 'circle') {
        //     return <Circle {...shapeProps} radius={Math.min(obj.size.width, obj.size.height) / 2} />;
        //   }

        //   if (obj.shapeType === 'line') {
        //     return <Line {...shapeProps} points={[0, 0, obj.size.width, 0]} />;
        //   }
        // }

        return null;
      });
  }
};

export default Canvas;

// Image component with loading
function CanvasImage({
  obj,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  obj: CanvasObject & { type: ObjectType.IMAGE };
  onSelect: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}) {
  const image = useLoadedImage(obj.src);

  if (!image || obj.type !== ObjectType.IMAGE) return null;

  return (
    <KonvaImage
      id={obj.id}
      x={obj.position.x}
      y={obj.position.y}
      width={obj.size.width}
      height={obj.size.height}
      image={image}
      crop={{
        x: obj.cropX,
        y: obj.cropY,
        width: obj.cropWidth,
        height: obj.cropHeight,
      }}
      rotation={obj.rotation}
      opacity={obj.opacity}
      draggable={!obj.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
}

// Background Image component to handle sizing ('cover' vs 'contain')
function CanvasBackgroundImage({
  src,
  x,
  y,
  width,
  height,
  backgroundSize = 'cover',
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundSize?: 'cover' | 'contain' | 'fill';
}) {
  const image = useLoadedImage(src);

  if (!image) return null;

  // Calculate rendering size and position
  let renderWidth = width;
  let renderHeight = height;
  let renderX = x;
  let renderY = y;
  let crop: { x: number; y: number; width: number; height: number } | undefined;

  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;

  if (backgroundSize === 'cover') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      const scaledWidth = image.height * canvasRatio;
      crop = {
        x: (image.width - scaledWidth) / 2,
        y: 0,
        width: scaledWidth,
        height: image.height,
      };
    } else {
      // Image is taller than canvas ratio
      const scaledHeight = image.width / canvasRatio;
      crop = {
        x: 0,
        y: (image.height - scaledHeight) / 2,
        width: image.width,
        height: scaledHeight,
      };
    }
  } else if (backgroundSize === 'contain') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      renderHeight = width / imageRatio;
      renderY = y + (height - renderHeight) / 2;
    } else {
      // Image is taller than canvas ratio
      renderWidth = height * imageRatio;
      renderX = x + (width - renderWidth) / 2;
    }
  }

  return (
    <KonvaImage
      id='canvas-background-image'
      x={renderX}
      y={renderY}
      width={renderWidth}
      height={renderHeight}
      image={image}
      crop={crop}
      listening={false}
    />
  );
}
