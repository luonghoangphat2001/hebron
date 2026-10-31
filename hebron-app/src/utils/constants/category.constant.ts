export type HeaderCategoryChild = {
  id: string;
  name: string;
  href: string;
};

export type HeaderCategory = {
  id: string;
  name: string;
  href: string;
  children?: HeaderCategoryChild[];
};

export const HEADER_TOP_CATEGORY_NAMES = ['트로피', '상패', '현판/명패', '시계/문지', '포트폴리오'] as const;

export const HEADER_CATEGORY_QUICK_LINKS: HeaderCategory[] = [
  { id: 'special', name: '기획전', href: '#' },
  { id: 'all', name: '전체 보기', href: '#' },
];

const createSubcategories = (categoryId: string, categoryName: string, count = 3): HeaderCategoryChild[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${categoryId}-sub-${index + 1}`,
    name: `${categoryName} 하위${index + 1}`,
    href: '#',
  }));

export const HEADER_CATEGORY_TREE: HeaderCategory[] = [
  ...HEADER_CATEGORY_QUICK_LINKS,
  {
    id: 'trophy',
    name: '트로피',
    href: '/products/trophy',
    children: createSubcategories('trophy', '트로피'),
  },
  {
    id: 'plaque',
    name: '상패',
    href: '/products/plaque',
    children: createSubcategories('plaque', '상패', 4),
  },
  {
    id: 'nameplate',
    name: '현판/명패',
    href: '/products/nameplate',
    children: createSubcategories('nameplate', '현판/명패'),
  },
  {
    id: 'clock',
    name: '시계/문지',
    href: '/products/clock',
    children: createSubcategories('clock', '시계/문지', 2),
  },
  {
    id: 'portfolio',
    name: '포트폴리오',
    href: '/products/portfolio',
    children: createSubcategories('portfolio', '포트폴리오'),
  },
  {
    id: 'category-09',
    name: '카테고리_09',
    href: '#',
    children: createSubcategories('category-09', '카테09'),
  },
  {
    id: 'category-11',
    name: '카테고리_11',
    href: '#',
    children: createSubcategories('category-11', '카테11'),
  },
  {
    id: 'payment-test-12',
    name: '결제테스트_12',
    href: '#',
    children: createSubcategories('payment-test-12', '결제12'),
  },
  {
    id: 'payment-test-13',
    name: '결제테스트_13',
    href: '#',
    children: createSubcategories('payment-test-13', '결제13'),
  },
  {
    id: 'category-03',
    name: '카테고리_03',
    href: '#',
    children: createSubcategories('category-03', '카테03'),
  },
];

export const getHeaderTopCategories = () =>
  HEADER_CATEGORY_TREE.filter((category) =>
    HEADER_TOP_CATEGORY_NAMES.includes(category.name as (typeof HEADER_TOP_CATEGORY_NAMES)[number]),
  );

export const getDefaultMegaMenuCategoryId = () =>
  HEADER_CATEGORY_TREE.find((category) => category.children && category.children.length > 0)?.id ??
  HEADER_CATEGORY_TREE[0]?.id ??
  '';
