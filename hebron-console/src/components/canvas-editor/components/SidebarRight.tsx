import { EDITOR_FONT_FAMILIES, fontWeights, resolveFontFamily, resolveFontWeight } from '@/utils/helper/editor-fonts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { ObjectType, type ImageObject, type ShapeObject, type TextObject } from '@/utils/types/canvas.types';

export default function SidebarRight() {
  const { getSelectedObject, updateText, updateImage, updateShape } = useWebEditorStore();

  const selectedObject = getSelectedObject();

  if (!selectedObject) {
    return (
      <div className='flex h-full w-80 flex-shrink-0 flex-col border-l border-gray-200 bg-white'>
        <div className='flex h-full items-center justify-center px-4 text-center text-sm text-gray-500'>Select Object</div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-80 flex-shrink-0 flex-col border-l border-gray-200 bg-white'>
      <div className='flex-shrink-0 border-b border-gray-200 p-4'>
        <h3 className='font-semibold text-gray-900 capitalize'>{selectedObject.type} Properties</h3>
      </div>

      <div className='min-h-0 flex-1 space-y-6 overflow-y-auto p-4'>
        {/* Text Properties */}
        {selectedObject.type === ObjectType.TEXT && (
          <TextProperties object={selectedObject as TextObject} updateText={updateText} />
        )}

        {/* Image Properties */}
        {selectedObject.type === ObjectType.IMAGE && (
          <ImageProperties object={selectedObject as ImageObject} updateImage={updateImage} />
        )}

        {/* Shape Properties */}
        {selectedObject.type === ObjectType.SHAPE && (
          <ShapeProperties object={selectedObject as ShapeObject} updateShape={updateShape} />
        )}

        {/* Common Properties */}
        <CommonProperties
          object={selectedObject}
          onUpdate={(updates) => {
            if (selectedObject.type === ObjectType.TEXT) {
              updateText(selectedObject.id, updates as Partial<TextObject>);
            } else if (selectedObject.type === ObjectType.IMAGE) {
              updateImage(selectedObject.id, updates as Partial<ImageObject>);
            } else if (selectedObject.type === ObjectType.SHAPE) {
              updateShape(selectedObject.id, updates as Partial<ShapeObject>);
            }
          }}
          onDelete={() => {
            useWebEditorStore.getState().deleteObject(selectedObject.id);
          }}
        />
      </div>
    </div>
  );
}

// Text Properties Component
function TextProperties({
  object,
  updateText,
}: {
  object: TextObject;
  updateText: (id: string, updates: Partial<TextObject>) => void;
}) {
  return (
    <>
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Content'}</label>
        <textarea
          value={object.content}
          onChange={(e) => {
            updateText(object.id, { content: e.target.value });
          }}
          rows={3}
        />
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Font Family'}</label>
        <Select
          value={resolveFontFamily(object.fontFamily)}
          onValueChange={(fontFamily) => updateText(object.id, { fontFamily })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITOR_FONT_FAMILIES.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Font Size'}</label>
          <Select value={object.fontSize.toString()} />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Font weight'}</label>
          <Select
            value={String(resolveFontWeight(object.fontFamily, object.fontWeight))}
            onValueChange={(fontWeight) => updateText(object.id, { fontWeight: fontWeight as TextObject['fontWeight'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontWeights(object.fontFamily).map((weight) => (
                <SelectItem key={weight} value={String(weight)}>
                  {weight}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* <ColorPicker value={object.color} onChange={(color) => updateText(object.id, { color })} /> */}

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Alignment'}</label>
        {/* <Radio
          value={object.align}
          onChange={(value) => updateText(object.id, { align: value as TextObject['align'] })}
          options={[
            { value: 'left', label: tBusinessCardEditor('left') },
            { value: 'center', label: tBusinessCardEditor('center') },
            { value: 'right', label: tBusinessCardEditor('right') },
          ]}
        /> */}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Line Height'}</label>
          <Input
            type='number'
            value={object.lineHeight.toString()}
            onChange={(e) => updateText(object.id, { lineHeight: Number(e.target.value) })}
            step={0.1}
            min={0.5}
            max={3}
            size={40}
          />
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Spacing'}</label>
          <Input
            type='number'
            value={object.letterSpacing.toString()}
            onChange={(e) => updateText(object.id, { letterSpacing: Number(e.target.value) })}
            step={0.5}
            min={-10}
            max={20}
            size={40}
          />
        </div>
      </div>
    </>
  );
}

// Image Properties Component
function ImageProperties({
  object,
  updateImage,
}: {
  object: ImageObject;
  updateImage: (id: string, updates: Partial<ImageObject>) => void;
}) {
  return (
    <>
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Opacity'}</label>
        <div className='flex items-center gap-2'>
          <input
            type='range'
            value={object.opacity * 100}
            onChange={(e) => updateImage(object.id, { opacity: Number(e.target.value) / 100 })}
            min={0}
            max={100}
            className='flex-1'
          />
          <span className='w-12 text-right text-sm text-gray-600'>{Math.round(object.opacity * 100)}%</span>
        </div>
      </div>

      {object.filters && (
        <>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'Brightness'}</label>
            <div className='flex items-center gap-2'>
              <input
                type='range'
                value={object.filters.brightness}
                onChange={(e) =>
                  updateImage(object.id, {
                    filters: { ...object.filters!, brightness: Number(e.target.value) },
                  })
                }
                min={-100}
                max={100}
                className='flex-1'
              />
              <span className='w-12 text-right text-sm text-gray-600'>{object.filters.brightness}</span>
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'Contrast'}</label>
            <div className='flex items-center gap-2'>
              <input
                type='range'
                value={object.filters.contrast}
                onChange={(e) =>
                  updateImage(object.id, {
                    filters: { ...object.filters!, contrast: Number(e.target.value) },
                  })
                }
                min={-100}
                max={100}
                className='flex-1'
              />
              <span className='w-12 text-right text-sm text-gray-600'>{object.filters.contrast}</span>
            </div>
          </div>
        </>
      )}

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Original Size'}</label>
        <p className='text-sm text-gray-600'>
          {object.originalWidth} × {object.originalHeight} px
        </p>
      </div>
    </>
  );
}

// Shape Properties Component
function ShapeProperties({
  object,
  updateShape,
}: {
  object: ShapeObject;
  updateShape: (id: string, updates: Partial<ShapeObject>) => void;
}) {
  return (
    <>
      {/* <ColorPicker value={object.fill} onChange={(color) => updateShape(object.id, { fill: color })} />

      <ColorPicker value={object.stroke} onChange={(color) => updateShape(object.id, { stroke: color })} /> */}

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>{'Stroke Width'}</label>
        <Input
          type='number'
          value={object.strokeWidth.toString()}
          onChange={(e) => updateShape(object.id, { strokeWidth: Number(e.target.value) })}
          min={0}
          max={50}
          size={40}
        />
      </div>

      {object.shapeType === 'rectangle' && (
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Corner Radius'}</label>
          <Input
            type='number'
            value={(object.cornerRadius || 0).toString()}
            onChange={(e) => updateShape(object.id, { cornerRadius: Number(e.target.value) })}
            min={0}
            max={100}
            size={40}
          />
        </div>
      )}
    </>
  );
}

// Common Properties Component
function CommonProperties({
  object,
  onUpdate,
  onDelete,
}: {
  object: TextObject | ImageObject | ShapeObject;
  onUpdate: (updates: Partial<TextObject | ImageObject | ShapeObject>) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className='border-t border-gray-200 pt-6'>
        <h4 className='mb-4 text-sm font-semibold text-gray-900'>{'Transform'}</h4>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'X-position'}</label>
            <Input
              type='number'
              value={Math.round(object.position.x).toString()}
              onChange={(e) =>
                onUpdate({
                  position: { ...object.position, x: Number(e.target.value) },
                })
              }
              size={40}
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'y-position'}</label>
            <Input
              type='number'
              value={Math.round(object.position.y).toString()}
              onChange={(e) =>
                onUpdate({
                  position: { ...object.position, y: Number(e.target.value) },
                })
              }
              size={40}
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'Width'}</label>
            <Input
              type='number'
              value={Math.round(object.size.width).toString()}
              onChange={(e) =>
                onUpdate({
                  size: { ...object.size, width: Number(e.target.value) },
                })
              }
              min={1}
              size={40}
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>{'Height'}</label>
            <Input
              type='number'
              value={Math.round(object.size.height).toString()}
              onChange={(e) =>
                onUpdate({
                  size: { ...object.size, height: Number(e.target.value) },
                })
              }
              min={1}
              size={40}
            />
          </div>
        </div>

        <div className='mt-4'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Rotation'}</label>
          <div className='flex items-center gap-2'>
            <input
              type='range'
              value={object.rotation}
              onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
              min={0}
              max={360}
              className='flex-1'
            />
            <span className='w-12 text-right text-sm text-gray-600'>{Math.round(object.rotation)}°</span>
          </div>
        </div>

        <div className='mt-4'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>{'Opacity'}</label>
          <div className='flex items-center gap-2'>
            <input
              type='range'
              value={object.opacity * 100}
              onChange={(e) => onUpdate({ opacity: Number(e.target.value) / 100 })}
              min={0}
              max={100}
              className='flex-1'
            />
            <span className='w-12 text-right text-sm text-gray-600'>{Math.round(object.opacity * 100)}%</span>
          </div>
        </div>
      </div>

      <div className='border-t border-gray-200 pt-6'>
        <h4 className='mb-4 text-sm font-semibold text-gray-900'>{'Layer'}</h4>

        <div className='grid grid-cols-2 gap-2'>
          <button
            onClick={() => useWebEditorStore.getState().reorderObject(object.id, 'top')}
            className='min-h-10 cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50'>
            {'Bring to Front'}
          </button>
          <button
            onClick={() => useWebEditorStore.getState().reorderObject(object.id, 'bottom')}
            className='min-h-10 cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50'>
            {'Send to back'}
          </button>
          <button
            onClick={() => useWebEditorStore.getState().reorderObject(object.id, 'up')}
            className='min-h-10 cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50'>
            {'Bring Forward'}
          </button>
          <button
            onClick={() => useWebEditorStore.getState().reorderObject(object.id, 'down')}
            className='min-h-10 cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50'>
            {'Send Backward'}
          </button>
        </div>

        <div className='mt-4 space-y-2'>
          <button
            onClick={() => useWebEditorStore.getState().duplicateObject(object.id)}
            className='w-full cursor-pointer rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50'>
            {'Duplicate'}
          </button>
          <button
            onClick={onDelete}
            className='w-full cursor-pointer rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600'>
            {'Delete'}
          </button>
        </div>
      </div>
    </>
  );
}
