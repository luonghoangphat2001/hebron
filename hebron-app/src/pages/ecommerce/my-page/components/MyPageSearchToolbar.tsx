import { Button } from '@/components/ui/button';
import DebouncedSearchInput from '@/components/search/DebouncedSearchInput';
import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react';

type MyPageSearchToolbarProps = {
  defaultValue?: string;
  onDebouncedChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel: string;
  showExcelDownload?: boolean;
  excelDownloadLabel?: string;
  onExcelDownload?: () => void;
  isExcelDownloading?: boolean;
};

const MyPageSearchToolbar = ({
  defaultValue,
  onDebouncedChange,
  searchPlaceholder = '직접입력',
  searchAriaLabel,
  showExcelDownload = true,
  excelDownloadLabel = '엑셀 다운로드',
  onExcelDownload,
  isExcelDownloading = false,
}: MyPageSearchToolbarProps) => {
  return (
    <div className='flex items-center justify-between gap-2'>
      <DebouncedSearchInput
        defaultValue={defaultValue}
        onDebouncedChange={onDebouncedChange}
        placeholder={searchPlaceholder}
        aria-label={searchAriaLabel}
        className='flex-1 sm:max-w-sm'
      />
      {showExcelDownload && (
        <Button
          variant='outline'
          className='h-10 shrink-0 gap-2 whitespace-nowrap'
          onClick={onExcelDownload}
          loading={isExcelDownloading}
          disabled={!onExcelDownload || isExcelDownloading}>
          <MicrosoftExcelLogoIcon className='size-4 shrink-0 text-green-600' weight='duotone' />
          {excelDownloadLabel}
        </Button>
      )}
    </div>
  );
};

export default MyPageSearchToolbar;
