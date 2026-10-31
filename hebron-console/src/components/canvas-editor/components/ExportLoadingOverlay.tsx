import { Spinner } from '@/components/ui/spinner';
import { useWebEditorStore } from '@/stores/useWebEditorStore';

export default function ExportLoadingOverlay() {
  const { isExportLoading } = useWebEditorStore();

  if (!isExportLoading) return null;

  return (
    <div className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-3xl'>
      <Spinner color='#1599a6' />
    </div>
  );
}
