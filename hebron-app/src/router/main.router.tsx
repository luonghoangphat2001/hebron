import AuthRoute from '@/layouts/AuthRoute';
import MainLayout from '@/layouts/ecommerce/MainLayout';
import MyPageLayout from '@/layouts/MyPageLayout';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import CartPage from '@/pages/ecommerce/cart/CartPage';
import CheckoutFailPage from '@/pages/ecommerce/checkout/CheckoutFailPage';
import CheckoutPage from '@/pages/ecommerce/checkout/CheckoutPage';
import CheckoutResultPage from '@/pages/ecommerce/checkout/CheckoutResultPage';
import CheckoutSuccessPage from '@/pages/ecommerce/checkout/CheckoutSuccessPage';
import ConfirmDesignPage from '@/pages/ecommerce/confirm-design/ConfirmDesignPage';
import ExampleSampleDetailPage from '@/pages/ecommerce/example-samples/ExampleSampleDetailPage';
import ExampleSamplesPage from '@/pages/ecommerce/example-samples/ExampleSamplesPage';
import HomePage from '@/pages/ecommerce/home/HomePage';
import PrivacyPolicyPage from '@/pages/ecommerce/legal/PrivacyPolicyPage';
import TermsPage from '@/pages/ecommerce/legal/TermsPage';
import LoginPage from '@/pages/ecommerce/login/LoginPage';
import MyPageFAQ from '@/pages/ecommerce/my-page/faq/MyPageFAQ';
import MyPageHome from '@/pages/ecommerce/my-page/home/MyPageHome';
import MyPageInfo from '@/pages/ecommerce/my-page/info/MyPageInfo';
import MyPageNotice from '@/pages/ecommerce/my-page/notice/MyPageNotice';
import MyPageNoticeDetail from '@/pages/ecommerce/my-page/notice/MyPageNoticeDetail';
import MyPageOrderDetail from '@/pages/ecommerce/my-page/orders/MyPageOrderDetail';
import MyPageOrders from '@/pages/ecommerce/my-page/orders/MyPageOrders';
import MyPageQuote from '@/pages/ecommerce/my-page/quote/MyPageQuote';
import MyPageQuoteForm from '@/pages/ecommerce/my-page/quote/MyPageQuoteForm';
import MyPageReworkRequest from '@/pages/ecommerce/my-page/rework-request/MyPageReworkRequest';
import MyPageReworkRequestForm from '@/pages/ecommerce/my-page/rework-request/MyPageReworkRequestForm';
import MyPageAddresses from '@/pages/ecommerce/my-page/shipping-address/MyPageAddresses';
import MyPageAddressForm from '@/pages/ecommerce/my-page/shipping-address/MyPageAddressForm';
import MyPageShippingInquiry from '@/pages/ecommerce/my-page/shipping-inquiry/MyPageShippingInquiry';
import MyPageShippingInquiryForm from '@/pages/ecommerce/my-page/shipping-inquiry/MyPageShippingInquiryForm';
import OrderInquiryPage from '@/pages/ecommerce/order-inquiry/OrderInquiryPage';
import ProductDetailPage from '@/pages/ecommerce/product/ProductDetailPage';
import ProductPage from '@/pages/ecommerce/product/ProductPage';
import RegisterPage from '@/pages/ecommerce/register/RegisterPage';
import SearchPage from '@/pages/ecommerce/search/SearchPage';
import SocialCallbackPage from '@/pages/ecommerce/social-callback/SocialCallbackPage';
import { MY_ROUTE, ROUTE_NAME } from '@/utils/constants/route.constant';
import type { RouteObject } from 'react-router-dom';

export const mainRouters: RouteObject = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    {
      path: MY_ROUTE.SEARCH,
      element: <SearchPage />,
    },
    {
      path: MY_ROUTE.PRODUCT_LIST,
      element: <ProductPage />,
    },
    {
      path: MY_ROUTE.PRODUCT_LIST_BY_CATEGORY,
      element: <ProductPage />,
    },
    {
      path: MY_ROUTE.PRODUCT_DETAIL,
      element: <ProductDetailPage />,
    },
    {
      path: MY_ROUTE.CART,
      element: <CartPage />,
    },
    {
      path: MY_ROUTE.CHECKOUT,
      element: <CheckoutPage />,
    },
    {
      path: MY_ROUTE.CHECKOUT_SUCCESS,
      element: <CheckoutSuccessPage />,
    },
    {
      path: MY_ROUTE.CHECKOUT_FAIL,
      element: <CheckoutFailPage />,
    },
    {
      path: MY_ROUTE.CHECKOUT_RESULT,
      element: <CheckoutResultPage />,
    },
    {
      path: MY_ROUTE.ORDER_INQUIRY,
      element: <OrderInquiryPage />,
    },
    {
      path: MY_ROUTE.EXAMPLE_SAMPLES,
      element: <ExampleSamplesPage />,
    },
    {
      path: MY_ROUTE.EXAMPLE_SAMPLE_DETAIL,
      element: <ExampleSampleDetailPage />,
    },
    {
      path: MY_ROUTE.TERMS,
      element: <TermsPage />,
    },
    {
      path: MY_ROUTE.PRIVACY_POLICY,
      element: <PrivacyPolicyPage />,
    },
    {
      path: MY_ROUTE.CONFIRM_DESIGN,
      element: <ConfirmDesignPage />,
    },
    /**
     * auth
     */
    {
      element: <AuthRoute />,
      children: [
        {
          path: MY_ROUTE.LOGIN,
          element: <LoginPage />,
        },
        {
          path: MY_ROUTE.REGISTER,
          element: <RegisterPage />,
        },
        {
          path: MY_ROUTE.SOCIAL_CALLBACK,
          element: <SocialCallbackPage />,
        },
      ],
    },

    /**
     * protected
     */
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: ROUTE_NAME.MY_PAGE,
          element: <MyPageLayout />,
          children: [
            {
              index: true,
              element: <MyPageHome />,
            },
            {
              path: MY_ROUTE.MY_PAGE.ORDERS,
              element: <MyPageOrders />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.ORDERS}/${MY_ROUTE.MY_PAGE.ORDER_DETAIL}`,
              element: <MyPageOrderDetail />,
            },
            {
              path: MY_ROUTE.MY_PAGE.INFO,
              element: <MyPageInfo />,
            },
            {
              path: MY_ROUTE.MY_PAGE.ADDRESSES,
              element: <MyPageAddresses />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.ADDRESSES}/${MY_ROUTE.MY_PAGE.ADDRESS_CREATE}`,
              element: <MyPageAddressForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.ADDRESSES}/${MY_ROUTE.MY_PAGE.ADDRESS_EDIT}`,
              element: <MyPageAddressForm />,
            },
            {
              path: MY_ROUTE.MY_PAGE.FAQ,
              element: <MyPageFAQ />,
            },
            {
              path: MY_ROUTE.MY_PAGE.NOTICE,
              element: <MyPageNotice />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.NOTICE}/${MY_ROUTE.MY_PAGE.NOTICE_DETAIL}`,
              element: <MyPageNoticeDetail />,
            },
            {
              path: MY_ROUTE.MY_PAGE.QUOTE,
              element: <MyPageQuote />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.QUOTE}/${MY_ROUTE.MY_PAGE.QUOTE_CREATE}`,
              element: <MyPageQuoteForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.QUOTE}/${MY_ROUTE.MY_PAGE.QUOTE_EDIT}`,
              element: <MyPageQuoteForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.QUOTE}/${MY_ROUTE.MY_PAGE.QUOTE_DETAIL}`,
              element: <MyPageQuoteForm />,
            },
            {
              path: MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY,
              element: <MyPageShippingInquiry />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY_CREATE}`,
              element: <MyPageShippingInquiryForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY_EDIT}`,
              element: <MyPageShippingInquiryForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY}/${MY_ROUTE.MY_PAGE.SHIPPING_INQUIRY_DETAIL}`,
              element: <MyPageShippingInquiryForm />,
            },
            {
              path: MY_ROUTE.MY_PAGE.REWORK_REQUEST,
              element: <MyPageReworkRequest />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST_CREATE}`,
              element: <MyPageReworkRequestForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST_EDIT}`,
              element: <MyPageReworkRequestForm />,
            },
            {
              path: `${MY_ROUTE.MY_PAGE.REWORK_REQUEST}/${MY_ROUTE.MY_PAGE.REWORK_REQUEST_DETAIL}`,
              element: <MyPageReworkRequestForm />,
            },
          ],
        },
      ],
    },
  ],
};
