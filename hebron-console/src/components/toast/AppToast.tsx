import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type ToastOptions = {
  description?: string;
};

const baseStyle = {
  className: 'flex items-center gap-2',
};

export const appToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      icon: <CheckCircle className='h-5 w-5 text-green-600' />,
      ...baseStyle,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      icon: <XCircle className='h-5 w-5 text-red-600' />,
      ...baseStyle,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      icon: <AlertTriangle className='h-5 w-5 text-yellow-600' />,
      ...baseStyle,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
      icon: <Info className='h-5 w-5 text-blue-600' />,
      ...baseStyle,
      ...options,
    }),
};
