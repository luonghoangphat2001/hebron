import type { PortfolioItemRESP } from '@/data/portfolios/portfolios.response';
import { PORTFOLIO_CATEGORY, type PortfolioCategoryKey } from '@/data/portfolios/portfolios.response';
import dayjs from 'dayjs';

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioCategoryKey, string> = {
  [PORTFOLIO_CATEGORY.MAJOR_PROJECT]: '주요 프로젝트',
  [PORTFOLIO_CATEGORY.CORPORATE_PLAQUE]: '기업 상패',
  [PORTFOLIO_CATEGORY.TROPHY]: '트로피',
};

export const getPortfolioCategoryLabel = (category: string) =>
  PORTFOLIO_CATEGORY_LABELS[category as PortfolioCategoryKey] ?? category;

export type PortfolioCardView = {
  id: string;
  image: string;
  category: string;
  categoryKey: string;
  title: string;
  date: string;
  client: string;
};

export type PortfolioDetailView = PortfolioCardView & {
  publishedAt: string;
  content: string;
  gallery: string[];
  bodyImage: string;
};

export const mapPortfolioToCardView = (item: PortfolioItemRESP): PortfolioCardView => ({
  id: String(item.id),
  image: item.cover_image,
  category: getPortfolioCategoryLabel(item.category),
  categoryKey: item.category,
  title: item.title,
  date: dayjs(item.created_at).isValid() ? dayjs(item.created_at).format('YYYY-MM-DD') : String(item.year),
  client: item.client,
});

export const mapPortfolioToDetailView = (item: PortfolioItemRESP): PortfolioDetailView => {
  const card = mapPortfolioToCardView(item);

  return {
    ...card,
    publishedAt: item.created_at,
    content: item.description,
    gallery: item.gallery ?? [],
    bodyImage: item.gallery?.[0] ?? item.cover_image,
  };
};

export const getPortfolioNeighborsFromList = (items: PortfolioItemRESP[], id: string) => {
  const currentIndex = items.findIndex((item) => String(item.id) === id);
  if (currentIndex === -1) {
    return { prev: undefined, next: undefined };
  }

  const prev = currentIndex > 0 ? mapPortfolioToCardView(items[currentIndex - 1]) : undefined;
  const next = currentIndex < items.length - 1 ? mapPortfolioToCardView(items[currentIndex + 1]) : undefined;

  return { prev, next };
};
