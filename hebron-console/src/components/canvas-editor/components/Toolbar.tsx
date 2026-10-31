import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useWebEditorStore } from '@/stores/useWebEditorStore';
import { MAX_ZOOM, ZOOM_LEVELS } from '@/utils/constants/canvas-editor.constant';
import { Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react';

export default function Toolbar() {
  const { past, future, zoom, undo, redo, setZoom, clearCanvas } = useWebEditorStore();

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    const nextIndex = Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1);
    setZoom(ZOOM_LEVELS[nextIndex]);
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    const prevIndex = Math.max(currentIndex - 1, 0);
    setZoom(ZOOM_LEVELS[prevIndex]);
  };

  const handleOnchangeZoom = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');

    if (cleaned === '') return;

    const percent = Number(cleaned);

    let nextZoom = percent / 100;

    // max 500%
    if (nextZoom > MAX_ZOOM) {
      nextZoom = MAX_ZOOM;
    }

    setZoom(nextZoom);
  };

  console.log('zoom', zoom);

  return (
    <section className='z-10 flex items-center gap-4 border-t border-gray-300 bg-white px-3 py-2 md:absolute md:top-12 md:right-10 md:rounded-xl md:border'>
      <section className='flex w-full items-center gap-4'>
        <article className='flex gap-2'>
          <button
            className={cn('p-2', canUndo ? 'cursor-pointer' : 'cursor-not-allowed')}
            onClick={undo}
            disabled={!canUndo}
            title='Undo (Ctrl+Z)'>
            {canUndo ? <Undo2 className='title-24' /> : <Redo2 className='title-24 scale-x-[-1] transform' />}
          </button>
          <button onClick={redo} className={cn('p-2', canRedo ? 'cursor-pointer' : 'cursor-not-allowed')} title='Redo (Ctrl+Y)'>
            {canRedo ? <Undo2 className='title-24 scale-x-[-1] transform' /> : <Redo2 className='title-24' />}
          </button>
        </article>

        <p className='caption-12 text-gray-300'>|</p>

        <button className='cursor-pointer p-2' onClick={clearCanvas} disabled={!canRedo} title='Clear'>
          <RotateCcw className='title-24' />
        </button>
      </section>

      <p className='caption-12 w-full text-center text-gray-300'>|</p>

      <section className='flex items-center gap-4'>
        <button onClick={handleZoomOut} title='Zoom In' className='cursor-pointer'>
          <Minus className='title-24' />
        </button>

        <Input
          // hasDeleteButton={false}
          // digitsOnly
          value={String(Math.round(zoom * 100))}
          onChange={(e) => handleOnchangeZoom(e.target.value)}
          // rootClassName='w-16 h-9'
          // suffix={<p className='caption-12 text-text-subtle'>%</p>}
          // inputContainerClassName='p-2'
        />

        <button onClick={handleZoomIn} title='Zoom In' className='cursor-pointer'>
          <Plus className='title-24' />
        </button>
      </section>
    </section>
  );
}
