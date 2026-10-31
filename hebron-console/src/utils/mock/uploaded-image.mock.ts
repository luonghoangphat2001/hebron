import { ImageCategory } from '../enums/content.enum';

export type UploadedImageRESP = {
  id: number;
  thumbnail_url: string;
  name: string;
  category: ImageCategory;
  type: string;
  upload_date: string;
};

export const UPLOADED_IMAGE_MOCK: UploadedImageRESP[] = [
  {
    id: 1,
    thumbnail_url: 'https://placehold.co/80x80/4f86f7/white?text=IMG',
    name: 'summer-sale-banner-pc.jpg',
    category: ImageCategory.BANNER,
    type: 'image/jpeg',
    upload_date: '2026-06-09',
  },
  {
    id: 2,
    thumbnail_url: 'https://placehold.co/80x80/f7a44f/white?text=IMG',
    name: 'hero-section-background.png',
    category: ImageCategory.BRAND,
    type: 'image/png',
    upload_date: '2026-06-09',
  },
  {
    id: 3,
    thumbnail_url: 'https://placehold.co/80x80/4ff7a4/white?text=IMG',
    name: 'product-thumbnail-sneakers-01.webp',
    category: ImageCategory.PRODUCT,
    type: 'image/webp',
    upload_date: '2026-06-08',
  },
  {
    id: 4,
    thumbnail_url: 'https://placehold.co/80x80/f74f4f/white?text=IMG',
    name: 'product-detail-watch-main.jpg',
    category: ImageCategory.PRODUCT,
    type: 'image/jpeg',
    upload_date: '2026-06-08',
  },
  {
    id: 5,
    thumbnail_url: 'https://placehold.co/80x80/a44ff7/white?text=IMG',
    name: 'brand-logo-dark-bg.png',
    category: ImageCategory.BRAND,
    type: 'image/png',
    upload_date: '2026-06-07',
  },
  {
    id: 6,
    thumbnail_url: 'https://placehold.co/80x80/4ff7f7/white?text=IMG',
    name: 'mobile-popup-welcome.jpg',
    category: ImageCategory.BANNER,
    type: 'image/jpeg',
    upload_date: '2026-06-06',
  },
  {
    id: 7,
    thumbnail_url: 'https://placehold.co/80x80/f7f74f/white?text=IMG',
    name: 'category-icon-electronics.svg',
    category: ImageCategory.ETC,
    type: 'image/svg+xml',
    upload_date: '2026-06-05',
  },
];
