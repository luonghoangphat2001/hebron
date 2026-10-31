import { OptionGroupDisplayType } from '@/utils/enums/option-group.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useOptionGroupDisplayTypeOptions = () => {
  const { t } = useTranslation('option');

  return useMemo(
    () =>
      Object.values(OptionGroupDisplayType).map((value) => ({
        value,
        label: t(`group.modal.display_type_${value}`),
      })),
    [t],
  );
};
