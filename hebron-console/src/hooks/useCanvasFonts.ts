import { useEffect, type RefObject } from 'react';
import type Konva from 'konva';
import { prepareStageText } from '@/utils/helper/canvas-text-renderer';
import { toast } from 'sonner';

/** Read committed node props after every render, including frame/font render scale changes. */
export const useCanvasFonts = (stageRef: RefObject<Konva.Stage | null>, fontKey: string) => {
  void fontKey;
  useEffect(() => {
    let cancelled = false;
    void prepareStageText(stageRef.current).catch((error) => {
      if (!cancelled) toast.error(error instanceof Error ? error.message : '글꼴을 불러오지 못했습니다.');
    });
    return () => {
      cancelled = true;
    };
  });
};
