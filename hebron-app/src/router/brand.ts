import { createBrowserRouter } from 'react-router-dom';
import { brandRouters } from './brand.router';
import { canvasEditorRouter } from './canvas-editor.router';

export default createBrowserRouter([canvasEditorRouter, brandRouters]);
