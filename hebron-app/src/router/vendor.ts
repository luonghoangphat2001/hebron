import { createBrowserRouter } from 'react-router-dom';
import { canvasEditorRouter } from './canvas-editor.router';
import { vendorRouters } from './vendor.router';

export default createBrowserRouter([canvasEditorRouter, vendorRouters]);
