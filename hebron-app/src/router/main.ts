import { createBrowserRouter } from 'react-router-dom';
import { canvasEditorRouter } from './canvas-editor.router';
import { mainRouters } from './main.router';

export default createBrowserRouter([canvasEditorRouter, mainRouters]);
