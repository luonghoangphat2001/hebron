import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { ProductDesignContentCreateREQ, ProductDesignContentUpdateREQ } from '@/data/products/products.request';
import type { ProductDesignContent } from '@/data/products/products.response';
import type { DesignContentFormValues } from '@/schemas/design-content/design-content.schema';
import { DATE_FORMAT_DASH, DATE_FORMAT_DOT } from '@/utils/constants/date.constant';
import type { SearchParams } from '@/utils/enums/common.enum';
import { ProductSearchParams } from '@/utils/enums/product.enum';
import type { AttachmentFormValue } from '@/utils/helper/file.helper';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const getSelectedCategoryIds = (searchParams: URLSearchParams) =>
  [
    ...new Set(
      searchParams
        .getAll(ProductSearchParams.CATEGORY_IDS)
        .flatMap((ids) => ids.split(','))
        .map(Number),
    ),
  ].filter((categoryId) => Number.isInteger(categoryId) && categoryId > 0);

export const getSearchPrice = (searchParams: URLSearchParams, key: ProductSearchParams) => {
  const value = searchParams.get(key);
  const price = value === null || value.trim() === '' ? Number.NaN : Number(value);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
};

export const getPriceFromInput = (value: string) => {
  const price = value.trim() === '' ? Number.NaN : Number(value);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
};

export const getSearchPositiveInteger = (searchParams: URLSearchParams, key: SearchParams) => {
  const value = Number(searchParams.get(key));

  return Number.isInteger(value) && value > 0 ? value : undefined;
};

export const mapDesignContentFormToCreateREQ = (
  values: DesignContentFormValues,
  attachments: FileAttachmentREQ[],
): ProductDesignContentCreateREQ => ({
  title: values.title,
  recipient_name: values.recipientName,
  event_date: dayjs(values.date, DATE_FORMAT_DOT, true).format(DATE_FORMAT_DASH),
  main_text: values.message,
  sender_name: values.sender,
  attachment_file_urls: attachments,
});

export const mapDesignContentFormToUpdateREQ = (
  id: number,
  values: DesignContentFormValues,
  attachments: FileAttachmentREQ[],
): ProductDesignContentUpdateREQ => ({
  id,
  ...mapDesignContentFormToCreateREQ(values, attachments),
});

export const mapProductDesignContentToFormValues = (designContent: ProductDesignContent): DesignContentFormValues => {
  const eventDate = dayjs(designContent.event_date, [DATE_FORMAT_DASH, DATE_FORMAT_DOT], true);
  const file: AttachmentFormValue[] = designContent.attachment_file_urls.map((attachment, index) => ({
    localId: `remote-${index}-${attachment.file_path}`,
    ...attachment,
  }));

  return {
    title: designContent.title,
    recipientName: designContent.recipient_name,
    date: eventDate.isValid() ? eventDate.format(DATE_FORMAT_DOT) : designContent.event_date,
    message: designContent.main_text,
    sender: designContent.sender_name,
    file,
  };
};

export const getDesignContentIdFromSearchParams = (searchParams: URLSearchParams) => {
  const id = Number(searchParams.get('designContentId'));

  return Number.isInteger(id) && id > 0 ? id : undefined;
};
