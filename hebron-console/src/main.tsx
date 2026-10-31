import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import App from './App.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { TooltipProvider } from './components/ui/tooltip.tsx';
import i18n from './i18n/index.ts';
import './index.css';
import ReactQueryProvider from './provider/ReactQueryProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <ReactQueryProvider>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <App />
        <Toaster position='top-right' richColors />
      </TooltipProvider>
    </I18nextProvider>
  </ReactQueryProvider>,
);
