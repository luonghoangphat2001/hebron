import type { ProductSpecification } from '@/data/products/products.response';
import type { SideFrameState, TemplateFrameConfig } from '@/stores/useWebEditorStore';
import type { CardSide, CardSideData } from '@/utils/types/canvas.types';

export const DEFAULT_CART_CONTENT = {
  title: '감 사 패',
  recipientName: '홍길동 상무님께',
  message: '귀하께서는 회사 발전을 위하여 헌신과 노력을 아끼지 않으시고...',
  date: '2026년 5월 26일',
  sender: '감사패드림 임직원 일동',
} as const;

export type GuestCartItem = {
  id: string;
  designId?: string;
  designContentId?: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImage?: string;
  sku?: string;
  price?: number;
  quantity: number;
  previewFront: string;
  previewBack?: string;
  design?: {
    frontData: CardSideData;
    backData: CardSideData;
    canvasSize: { width: number; height: number };
    contentSize?: { width: number; height: number };
    contentOffset?: { x: number; y: number };
    templateFrameConfig?: TemplateFrameConfig | null;
    contentSafeMargin?: number;
    sideFrames?: Record<CardSide, SideFrameState>;
    sidedness: 'SINGLE' | 'DOUBLE';
    /** New previews contain the entire template canvas, rather than only the cut area. */
    previewMode?: 'content_crop' | 'full_canvas';
  };
  createdAt: string;
  content?: {
    title: string;
    recipientName: string;
    message: string;
    date: string;
    sender: string;
  };
  selectedOptions?: Array<{
    groupId: number;
    groupName: string;
    optionId: number;
    optionName: string;
    additionalPrice: number;
  }>;
  specification?: ProductSpecification;
};

export type ProductDesignState = NonNullable<GuestCartItem['design']>;

export type ProductDesign = {
  id: string;
  designRevision?: string;
  productId: number;
  productSlug: string;
  state: ProductDesignState;
  previewFront: string;
  previewBack?: string;
  createdAt: string;
  updatedAt: string;
};

export const createCartPreview = (source: string, maxSize = 1000): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Cannot create cart preview'));
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => reject(new Error('Cannot load design preview'));
    image.src = source;
  });
