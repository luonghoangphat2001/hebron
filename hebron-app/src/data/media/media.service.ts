import type { BrandMediaListItemView } from '@/data/pages/pages.mapper';
import type { MediaCategoryItemRESP, MediaItemRESP } from './media.response';

export type MediaCategoryOption = {
  id: number;
  value: string;
  label: string;
  count?: number;
};

export const mapMediaItem = (item: MediaItemRESP): BrandMediaListItemView => ({
  id: String(item.id),
  date: '',
  link: item.link_url || '',
  image: item.image_url || item.url || '',
  media: item.category?.name || '',
  title: item.title || '',
  categoryId: item.category_id,
});

export const normalizeMediaItem = mapMediaItem;

export const normalizeMediaList = (items?: MediaItemRESP[] | null): BrandMediaListItemView[] => (items ?? []).map(mapMediaItem);

export const normalizeMediaCategoryOptions = (categories: MediaCategoryItemRESP[]): MediaCategoryOption[] =>
  categories
    .filter((cat) => cat.is_active !== false)
    .map((cat) => ({
      id: cat.id,
      value: String(cat.id),
      label: cat.name,
      count: cat.total_post,
    }));

export const filterMediaItems = (items: BrandMediaListItemView[], keyword: string): BrandMediaListItemView[] => {
  const query = keyword.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => item.title.toLowerCase().includes(query) || item.media.toLowerCase().includes(query));
};

export type MediaDetailView = BrandMediaListItemView & {
  categoryName?: string;
  publishedAt?: string;
  content: string;
};

export const mapMediaToDetailView = (item: MediaItemRESP): MediaDetailView => ({
  ...mapMediaItem(item),
  categoryName: item.category?.name,
  publishedAt: item.created_at,
  content: item.description || '',
});
