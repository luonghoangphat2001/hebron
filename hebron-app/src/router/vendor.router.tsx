import VendorLayout from '@/layouts/vendor/VendorLayout';
import VendorProductPage from '@/pages/vendor/product/VendorProductPage';
import VendorProductDetailPage from '@/pages/vendor/product/VendorProductDetailPage';
import VendorSearchPage from '@/pages/vendor/search/VendorSearchPage';
import HomePage from '@/pages/vendor/home/HomePage';
import ProductInquiryPage from '@/pages/vendor/product-inquiry/ProductInquiryPage';
import { VENDOR_ROUTE } from '@/utils/constants/route.constant';
import type { RouteObject } from 'react-router-dom';

export const vendorRouters: RouteObject = {
  path: '/',
  element: <VendorLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: VENDOR_ROUTE.SEARCH,
      element: <VendorSearchPage />,
    },
    {
      path: VENDOR_ROUTE.CATEGORY_PRODUCTS,
      element: <VendorProductPage />,
    },
    {
      path: VENDOR_ROUTE.PRODUCT_DETAIL,
      element: <VendorProductDetailPage />,
    },
    {
      path: VENDOR_ROUTE.PRODUCT_INQUIRY,
      element: <ProductInquiryPage />,
    },
  ],
};
