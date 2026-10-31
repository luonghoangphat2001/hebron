import { Button } from '@/components/ui/button';
import { FilePdfIcon, FilesIcon, FloppyDiskIcon, MagicWandIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

type EditorHeaderProps = {
  canExportPdf: boolean;
  isExporting: boolean;
  isSaving: boolean;
  onSave: () => void;
  onExportPdf: () => void;
  onOpenAI: () => void;
  productName?: string;
};

const headerButtonClass =
  'h-10 rounded-full border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-none hover:bg-neutral-100';

const EditorHeader = ({ canExportPdf, isExporting, isSaving, onSave, onExportPdf, onOpenAI, productName }: EditorHeaderProps) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <header className='relative z-20 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 bg-white px-6'>
      <Button variant='outline' className={`${headerButtonClass} w-[72px] justify-self-start`} onClick={handleCancel}>
        취소
      </Button>

      <div className='flex items-center gap-1 justify-self-center text-neutral-950'>
        <FilesIcon className='size-5' weight='duotone' aria-hidden />
        <p className='text-md font-medium whitespace-pre'>{productName || '에디터'}</p>
      </div>

      <div className='flex items-center gap-4 justify-self-end'>
        <Button variant='outline' className={headerButtonClass} onClick={onOpenAI}>
          <MagicWandIcon className='size-4' weight='duotone' aria-hidden />
          AI 문구
        </Button>
        <Button variant='outline' className={headerButtonClass} loading={isSaving} onClick={onSave}>
          <FloppyDiskIcon className='size-4' aria-hidden />
          저장
        </Button>
        {canExportPdf && (
          <Button
            className='h-10 rounded-full bg-red-500 px-4 text-sm font-semibold text-white shadow-none hover:bg-red-600'
            loading={isExporting}
            onClick={onExportPdf}>
            <FilePdfIcon className='size-4' weight='fill' aria-hidden />
            PDF 추출
          </Button>
        )}
      </div>
    </header>
  );
};

export default EditorHeader;
