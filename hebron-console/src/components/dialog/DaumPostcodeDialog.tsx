import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React from 'react';
import type { Address } from 'react-daum-postcode';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useTranslation } from 'react-i18next';

export type SelectedPostcodeAddress = {
  fullAddress: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  raw: Address;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAddress: (addressData: SelectedPostcodeAddress) => void;
};

export const DaumPostcodeDialog: React.FC<Props> = ({ open, onOpenChange, onSelectAddress }) => {
  const { t: tCommon } = useTranslation('common');

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    onSelectAddress({
      fullAddress,
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
      zonecode: data.zonecode,
      raw: data,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-hidden p-0 sm:max-w-lg'>
        <DialogHeader className='border-b p-4 pb-3'>
          <DialogTitle className='text-sm font-bold'>
            {tCommon('address.search_title', '주소 검색 (우편번호 / Daum Postcode)')}
          </DialogTitle>
          <DialogDescription className='text-xs'>
            {tCommon('address.search_desc', '검색할 도로명 또는 지번 주소를 선택해 주세요.')}
          </DialogDescription>
        </DialogHeader>
        <div className='p-2'>
          <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '460px', width: '100%' }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DaumPostcodeDialog;
