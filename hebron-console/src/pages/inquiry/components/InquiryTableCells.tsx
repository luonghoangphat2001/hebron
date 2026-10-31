import { Badge } from '@/components/ui/badge';
import type { InquiryAssignedUserRESP } from '@/data/inquiry/inquiry.response';
import { cn } from '@/lib/utils';
import { INQUIRY_STATUS_BADGE, INQUIRY_TYPE_BADGE } from '@/utils/constants/inquiry.constant';
import type { InquiryStatus, InquiryType } from '@/utils/enums/inquiry.enum';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type InquiryTypeCellProps = {
  type?: InquiryType | null;
  className?: string;
};

export const InquiryTypeCell = React.memo(({ type, className }: InquiryTypeCellProps) => {
  const { t: tEnum } = useTranslation('enum');
  if (!type) return <span className='text-muted-foreground block text-center'>-</span>;
  return <Badge className={cn(INQUIRY_TYPE_BADGE[type], className)}>{tEnum(`inquiry.${type}`)}</Badge>;
});

InquiryTypeCell.displayName = 'InquiryTypeCell';

export type InquiryStatusCellProps = {
  status?: InquiryStatus | null;
  className?: string;
};

export const InquiryStatusCell = React.memo(({ status, className }: InquiryStatusCellProps) => {
  const { t: tEnum } = useTranslation('enum');
  if (!status) return <span className='text-muted-foreground block text-center'>-</span>;
  return <Badge className={cn(INQUIRY_STATUS_BADGE[status], className)}>{tEnum(`inquiry.${status}`)}</Badge>;
});

InquiryStatusCell.displayName = 'InquiryStatusCell';

export type InquiryPersonInChargeCellProps = {
  assignedTo?: InquiryAssignedUserRESP | string | null;
  className?: string;
};

export const InquiryPersonInChargeCell = React.memo(({ assignedTo, className }: InquiryPersonInChargeCellProps) => {
  const name =
    typeof assignedTo === 'object' && assignedTo !== null
      ? assignedTo.name || (assignedTo as any).email || '-'
      : assignedTo || '-';

  return <span className={cn('block text-center text-sm text-gray-700', className)}>{name}</span>;
});

InquiryPersonInChargeCell.displayName = 'InquiryPersonInChargeCell';
