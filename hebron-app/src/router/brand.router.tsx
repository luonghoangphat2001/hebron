import BrandLayout from '@/layouts/brand/BrandLayout';
import BrandPage from '@/pages/brand/brand-page/BrandPage';
import ContactPage from '@/pages/brand/contact/ContactPage';
import BrandFAQPage from '@/pages/brand/faq/BrandFAQPage';
import HomePage from '@/pages/brand/home/HomePage';
import MediaDetailPage from '@/pages/brand/media/MediaDetailPage';
import MediaPage from '@/pages/brand/media/MediaPage';
import PortfolioDetailPage from '@/pages/brand/portfolio/PortfolioDetailPage';
import PortfolioPage from '@/pages/brand/portfolio/PortfolioPage';
import ProcessPage from '@/pages/brand/process/ProcessPage';
import ProductInquiryPage from '@/pages/brand/product-inquiry/ProductInquiryPage';
import BrandProductDetailPage from '@/pages/brand/products/BrandProductDetailPage';
import BrandProductsPage from '@/pages/brand/products/BrandProductsPage';
import { BRAND_ROUTE } from '@/utils/constants/route.constant';
import type { RouteObject } from 'react-router-dom';

export const brandRouters: RouteObject = {
  path: '/',
  element: <BrandLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: BRAND_ROUTE.BRAND_PAGE,
      element: <BrandPage />,
    },
    {
      path: BRAND_ROUTE.PRODUCTS,
      element: <BrandProductsPage />,
    },
    {
      path: BRAND_ROUTE.PRODUCTS_DETAIL,
      element: <BrandProductDetailPage />,
    },
    {
      path: BRAND_ROUTE.PROCESS,
      element: <ProcessPage />,
    },
    {
      path: BRAND_ROUTE.PORTFOLIO_DETAIL,
      element: <PortfolioDetailPage />,
    },
    {
      path: BRAND_ROUTE.PORTFOLIO,
      element: <PortfolioPage />,
    },
    {
      path: BRAND_ROUTE.MEDIA_DETAIL,
      element: <MediaDetailPage />,
    },
    {
      path: BRAND_ROUTE.MEDIA,
      element: <MediaPage />,
    },
    {
      path: BRAND_ROUTE.FAQ,
      element: <BrandFAQPage />,
    },
    {
      path: BRAND_ROUTE.CONTACT,
      element: <ContactPage />,
    },
    {
      path: BRAND_ROUTE.PRODUCT_INQUIRY,
      element: <ProductInquiryPage />,
    },
  ],
};
