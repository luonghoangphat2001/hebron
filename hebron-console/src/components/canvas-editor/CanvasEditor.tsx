import { useWebEditorStore } from '@/stores/useWebEditorStore';
import type { CardSideData } from '@/utils/types/canvas.types';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import Canvas from './components/Canvas';
import ExportLoadingOverlay from './components/ExportLoadingOverlay';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import Toolbar from './components/Toolbar';
import { mockDataEditor } from './mock';

const CanvasEditor = () => {
  // Store active canvas stage ref (whichever is visible)
  const activeStageRef = useRef<Konva.Stage | null>(null);
  const desktopCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [desktopCanvasSize, setDesktopCanvasSize] = useState({ width: 0, height: 0 });
  const { loadDesign } = useWebEditorStore();

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (desktopCanvasContainerRef.current) {
        setDesktopCanvasSize({
          width: desktopCanvasContainerRef.current.clientWidth,
          height: desktopCanvasContainerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  //load init canvas layer
  useEffect(() => {
    loadDesign({
      frontData: mockDataEditor().frontData as CardSideData,
      backData: mockDataEditor().backData as CardSideData,
    });
  }, [loadDesign]);

  return (
    <>
      <div className='flex h-screen flex-col bg-gray-50'>
        <div className='flex flex-1 flex-row'>
          <SidebarLeft />
          <div ref={desktopCanvasContainerRef} className='relative flex-1'>
            <Toolbar />
            {desktopCanvasSize.width > 0 && desktopCanvasSize.height > 0 && (
              <Canvas
                width={desktopCanvasSize.width}
                height={desktopCanvasSize.height}
                onStageReady={(stage) => {
                  activeStageRef.current = stage;
                }}
              />
            )}
          </div>
          <SidebarRight />
        </div>
      </div>
      <ExportLoadingOverlay />
    </>
  );
};

export default CanvasEditor;
