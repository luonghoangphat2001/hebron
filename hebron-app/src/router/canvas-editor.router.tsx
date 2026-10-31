import { AuthProvider } from '@/contexts/AuthContext';
import CanvasEditorPage from '@/pages/ecommerce/canvas-editor/CanvasEditorPage';
import { ROUTE_NAME } from '@/utils/constants/route.constant';
import type { RouteObject } from 'react-router-dom';

export const canvasEditorRouter: RouteObject = {
  path: ROUTE_NAME.CANVAS_EDITOR,
  element: (
    <AuthProvider>
      <CanvasEditorPage />
    </AuthProvider>
  ),
};
