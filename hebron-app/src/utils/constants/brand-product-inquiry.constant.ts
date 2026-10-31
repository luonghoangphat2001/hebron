import { Trophy1, Trophy2, Trophy3 } from '@/assets/images';
import type { BrandProductionInquiryCreateREQ } from '@/data/brand-production-inquiry/brand-production-inquiry.request';
import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { BrandProductInquiryFormValues } from '@/schemas/brand-product-inquiry/brand-product-inquiry-form.schema';
import { ATTACHMENT_ACCEPT_LABEL, ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_SIZE_MB } from '@/utils/constants/attachment.constant';
import { DATE_FORMAT_DASH, DATE_FORMAT_DOT } from '@/utils/constants/date.constant';
import { SiteType } from '@/utils/enums/common.enum';
import { BudgetType, QuantityType } from '@/utils/enums/inquiry.enum';
import { ProductType } from '@/utils/enums/product.enum';
import type { BrandProductInquiryImageUploadView, BrandProductInquiryStepView } from '@/utils/types/brand-product-inquiry.type';
import type { Icon } from '@phosphor-icons/react';
import { CheckCircleIcon, MagicWandIcon, PencilSimpleLineIcon, PenNibIcon, RulerIcon, TruckIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const BRAND_PRODUCT_INQUIRY_PAGE_LABELS = {
  heroTitle: '제작 문의',
  processTitle: '맞춤 제작 프로세스',
  processSubtitle: '기획부터 출고까지, 헤브론의 검증된 프로세스로 완성합니다.',
  formSectionTitle: '문의 폼',
  submit: '문의하기',
  submitting: '전송 중...',
  submitSuccess: '문의가 정상적으로 접수되었습니다.',
  submitFailed: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.',
} as const;

export const BRAND_PRODUCT_INQUIRY_STEP_ICONS: Record<string, Icon> = {
  inquiry: PencilSimpleLineIcon,
  design: MagicWandIcon,
  proposal: PenNibIcon,
  approval: CheckCircleIcon,
  production: RulerIcon,
  delivery: TruckIcon,
};

export const getBrandProductInquiryStepIcon = (key: string): Icon =>
  BRAND_PRODUCT_INQUIRY_STEP_ICONS[key] ?? PencilSimpleLineIcon;

export const BRAND_PRODUCT_INQUIRY_PROCESS_STEPS: BrandProductInquiryStepView[] = [
  { key: 'inquiry', title: '주문접수', description: '제품 레퍼런스, 컨셉, 예산 등 요구사항을 접수합니다.' },
  { key: 'design', title: '디자인 작업', description: '브랜드 아이덴티티에 맞춘 시안을 제작합니다.' },
  { key: 'proposal', title: '샘플 제작', description: '실물 샘플 또는 3D 목업으로 형태를 확인합니다.' },
  { key: 'approval', title: '제작 진행', description: '확정된 시안을 바탕으로 본 제작을 진행합니다.' },
  { key: 'production', title: '품질 검수', description: '각인, 도금, 마감 품질을 최종 점검합니다.' },
  { key: 'delivery', title: '출고/배송', description: '안전 포장 후 출고하며 배송 정보를 안내드립니다.' },
];

export const BRAND_PRODUCT_INQUIRY_FORM_LABELS = {
  inquiryType: '문의 유형',
  inquiryTypePlaceholder: '트로피 / 상패 / 메달·뱃지 / 현판·명패 / 기타',
  companyName: '회사명',
  companyNamePlaceholder: '회사명 또는 단체명',
  managerName: '담당자명',
  managerNamePlaceholder: '담당자명',
  contact: '연락처',
  contactPlaceholder: '010-0000-0000',
  email: '이메일',
  emailPlaceholder: 'abc@naver.com',
  estimatedQuantity: '예상 수량',
  desiredDeliveryDate: '희망 납기일',
  desiredDeliveryDatePlaceholder: '날짜 선택',
  budgetRange: '예산 범위',
  content: '문의 내용',
  contentPlaceholder: '문의 내용을 입력해주세요',
  attachments: '참고 파일 첨부',
} as const;

export const BRAND_PRODUCT_INQUIRY_DEFAULT_TYPE = ProductType.TROPHIES;

export const BRAND_PRODUCT_INQUIRY_TYPE_IMAGES: Record<ProductType, string> = {
  [ProductType.TROPHIES]: Trophy1,
  [ProductType.PLAQUES]: Trophy2,
  [ProductType.MEDALS_BADGES]: Trophy3,
  [ProductType.SIGNBOARDS_NAMEPLATES]: Trophy2,
  [ProductType.OTHERS]: Trophy3,
};

export const getBrandProductInquiryImage = (productType?: string) =>
  BRAND_PRODUCT_INQUIRY_TYPE_IMAGES[productType as ProductType] ?? Trophy1;

export const BRAND_PRODUCT_INQUIRY_QUANTITY_OPTIONS = [
  { label: '1~10개', value: QuantityType.ONE_TO_TEN },
  { label: '10~50개', value: QuantityType.TEN_TO_FIFTY },
  { label: '50~100개', value: QuantityType.FIFTY_TO_ONE_HUNDRED },
  { label: '100개 이상', value: QuantityType.ONE_HUNDRED_PLUS },
  { label: '미정', value: QuantityType.UNDETERMINED },
];

export const BRAND_PRODUCT_INQUIRY_BUDGET_OPTIONS = [
  { label: '~50만원', value: BudgetType.UP_TO_FIVE_HUNDRED },
  { label: '50~100만원', value: BudgetType.FIVE_HUNDRED_TO_ONE_MILLION },
  { label: '100~300만원', value: BudgetType.ONE_MILLION_TO_THREE_MILLION },
  { label: '300만원 이상', value: BudgetType.THREE_MILLION_PLUS },
  { label: '추후 협의', value: BudgetType.TO_BE_DISCUSSED },
];

export const getBrandProductInquiryUploadProps = (upload?: BrandProductInquiryImageUploadView) => ({
  label: upload?.label || BRAND_PRODUCT_INQUIRY_FORM_LABELS.attachments,
  acceptLabel: upload?.accept.length ? `${upload.accept.join(', ')} (최대 ${upload.maxSizeMb}MB)` : ATTACHMENT_ACCEPT_LABEL,
  maxSize: (upload?.maxSizeMb ?? ATTACHMENT_MAX_SIZE_MB) * 1024 * 1024,
});

export const BRAND_PRODUCT_INQUIRY_FORM_LIMITS = {
  contentMaxLength: 500,
  attachmentMaxFiles: ATTACHMENT_MAX_FILES,
} as const;

export const BRAND_PRODUCT_INQUIRY_FORM_DEFAULT_VALUES: BrandProductInquiryFormValues = {
  inquiryType: BRAND_PRODUCT_INQUIRY_DEFAULT_TYPE,
  companyName: '',
  managerName: '',
  contact: '',
  email: '',
  estimatedQuantity: QuantityType.ONE_TO_TEN,
  desiredDeliveryDate: '',
  budgetRange: BudgetType.UP_TO_FIVE_HUNDRED,
  content: '',
  attachments: [],
};

export const mapBrandProductInquiryFormToCreateREQ = (
  values: BrandProductInquiryFormValues,
  attachments: FileAttachmentREQ[],
  productId?: number | null,
): BrandProductionInquiryCreateREQ => ({
  product_type: values.inquiryType,
  site_type: SiteType.BRAND_SITE,
  company_name: values.companyName,
  manager_name: values.managerName,
  phone: values.contact,
  email: values.email,
  quantity_type: values.estimatedQuantity,
  budget_type: values.budgetRange,
  message: values.content,
  ...(values.desiredDeliveryDate
    ? { deadline: dayjs(values.desiredDeliveryDate, DATE_FORMAT_DOT).format(DATE_FORMAT_DASH) }
    : {}),
  product_id: productId ?? null,
  attachments,
});

export type ProductInquiryCardData = {
  title?: string;
  sku?: string;
  image?: string;
  options?: { label: string; value: string }[];
};
