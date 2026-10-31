import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import AdministratorPage from '@/pages/administrator/AdministratorPage';
import BannerPage from '@/pages/banner/BannerPage';
import CtaPage from '@/pages/cta/CtaPage';
import CanvasEditorPage from '@/pages/canvas-editor/CanvasEditorPage';
import CategoryPage from '@/pages/category/CategoryPage';
import OperationsDashboardPage from '@/pages/dashboard/OperationsDashboardPage';
import StatisticsPage from '@/pages/dashboard/StatisticsPage';
import ShipmentPage from '@/pages/delivery/ShipmentPage';
import CraftsmanshipPage from '@/pages/craftsmanship/CraftsmanshipPage';
import ExampleSentenceSamplePage from '@/pages/example-sentence-sample/ExampleSentenceSamplePage';
import FAQPage from '@/pages/faq/FAQPage';
import GuidePage from '@/pages/guide/GuidePage';
import InquiryDetailPage from '@/pages/inquiry/InquiryDetailPage';
import InquiryPage from '@/pages/inquiry/InquiryPage';
import LoginPage from '@/pages/login/LoginPage';
import MemberDetailPage from '@/pages/member/MemberDetailPage';
import MemberPage from '@/pages/member/MemberPage';
import MediaPage from '@/pages/media/MediaPage';
import MesMonitoringPage from '@/pages/mes/MesMonitoringPage';
import NoticePage from '@/pages/notice/NoticePage';
import OrderDetailPage from '@/pages/order/OrderDetailPage';
import OrderPage from '@/pages/order/OrderPage';
import PaymentHistoryPage from '@/pages/payment/PaymentHistoryPage';
import SettlementReportPage from '@/pages/payment/SettlementReportPage';
import PermissionPage from '@/pages/permission/PermissionPage';
import PopupPage from '@/pages/popup/PopupPage';
import OptionGroupDetailPage from '@/pages/product/options/OptionGroupDetailPage';
import OptionPage from '@/pages/product/options/OptionPage';
import { ProductCreatePage, ProductDetailPage, ProductEditPage } from '@/pages/product/management/ProductEditorPage';
import ProductPage from '@/pages/product/management/ProductPage';
import BackgroundListPage from '@/pages/product/backgrounds/BackgroundListPage';
import CalligraphyListPage from '@/pages/product/calligraphies/CalligraphyListPage';
import TemplateListPage from '@/pages/product/templates/TemplateListPage';
import { TemplateCreatePage, TemplateDetailPage, TemplateEditPage } from '@/pages/product/templates/TemplateEditorPage';
import ShoppingSettingPage from '@/pages/shopping-setting/ShoppingSettingPage';
import ConnectionLogPage from '@/pages/system/ConnectionLogPage';
import BankAccountSettingsPage from '@/pages/system/BankAccountSettingsPage';
import EmailSettingsPage from '@/pages/system/EmailSettingsPage';
import OperationLogPage from '@/pages/system/OperationLogPage';
import UploadedImagePage from '@/pages/uploaded-image/UploadedImagePage';
import MallContentPage from '@/pages/homepage-management/MallContentPage';
import BrandContentPage from '@/pages/homepage-management/BrandContentPage';
import VendorContentPage from '@/pages/homepage-management/VendorContentPage';
import PortfolioPage from '@/pages/portfolio/PortfolioPage';
import { DEFAULT_ROUTE, MY_ROUTE } from '@/utils/constants/route.constant';
import { isAuthenticated } from '@/utils/helper/local-storagte.helper';
import { createBrowserRouter, redirect } from 'react-router-dom';

const router = createBrowserRouter([
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: MainLayout,
        loader: (routes) => {
          if (new URL(routes.request.url).pathname === '/') return redirect(DEFAULT_ROUTE);
          return null;
        },
        children: [
          {
            path: MY_ROUTE.DASHBOARD.INDEX,
            Component: OperationsDashboardPage,
          },
          {
            path: MY_ROUTE.DASHBOARD.STATISTICS,
            Component: StatisticsPage,
          },
          {
            path: MY_ROUTE.ADMINISTRATOR,
            Component: AdministratorPage,
          },
          {
            path: MY_ROUTE.MEMBER.LIST,
            Component: MemberPage,
          },
          {
            path: MY_ROUTE.MEMBER.DETAIL(':id'),
            Component: MemberDetailPage,
          },
          {
            path: MY_ROUTE.CATEGORY.INDEX,
            Component: CategoryPage,
          },
          {
            path: MY_ROUTE.CATEGORY.DETAIL(':id'),
            Component: CategoryPage,
          },
          {
            path: MY_ROUTE.PRODUCT.LIST,
            Component: ProductPage,
          },
          {
            path: MY_ROUTE.PRODUCT.CREATE,
            Component: ProductCreatePage,
          },
          {
            path: MY_ROUTE.PRODUCT.EDIT(':id'),
            Component: ProductEditPage,
          },
          {
            path: MY_ROUTE.PRODUCT.DETAIL(':id'),
            Component: ProductDetailPage,
          },
          {
            path: MY_ROUTE.PRODUCT.TEMPLATE_LIST,
            Component: TemplateListPage,
          },
          {
            path: MY_ROUTE.PRODUCT.BACKGROUND_LIST,
            Component: BackgroundListPage,
          },
          {
            path: MY_ROUTE.PRODUCT.CALLIGRAPHY_LIST,
            Component: CalligraphyListPage,
          },
          {
            path: MY_ROUTE.PRODUCT.TEMPLATE_CREATE,
            Component: TemplateCreatePage,
          },
          {
            path: MY_ROUTE.PRODUCT.TEMPLATE_DETAIL(':templateId'),
            Component: TemplateDetailPage,
          },
          {
            path: MY_ROUTE.PRODUCT.TEMPLATE_EDIT(':templateId'),
            Component: TemplateEditPage,
          },
          {
            path: MY_ROUTE.PRODUCT.OPTION_LIST,
            Component: OptionPage,
          },
          {
            path: MY_ROUTE.PRODUCT.OPTION_DETAIL(':id'),
            Component: OptionGroupDetailPage,
          },
          {
            path: MY_ROUTE.PRODUCT.SHOPPING_SETTING,
            Component: ShoppingSettingPage,
          },

          // Payment Management
          {
            path: MY_ROUTE.PAYMENT.LIST,
            Component: PaymentHistoryPage,
          },
          {
            path: MY_ROUTE.PAYMENT.SETTLEMENT,
            Component: SettlementReportPage,
          },

          // Delivery Management
          {
            path: MY_ROUTE.DELIVERY.SHIPPING,
            Component: ShipmentPage,
          },

          //Content Management
          {
            path: MY_ROUTE.CONTENT.BANNER,
            Component: BannerPage,
          },
          {
            path: MY_ROUTE.CONTENT.POPUP,
            Component: PopupPage,
          },
          {
            path: MY_ROUTE.CONTENT.NOTICE,
            Component: NoticePage,
          },
          {
            path: MY_ROUTE.CONTENT.GUIDE,
            Component: GuidePage,
          },
          {
            path: MY_ROUTE.CONTENT.UPLOADED_IMAGE,
            Component: UploadedImagePage,
          },
          {
            path: MY_ROUTE.CONTENT.FAQ,
            Component: FAQPage,
          },
          {
            path: MY_ROUTE.PORTFOLIO,
            Component: PortfolioPage,
          },
          {
            path: MY_ROUTE.CONTENT.CTA,
            Component: CtaPage,
          },
          {
            path: MY_ROUTE.CONTENT.CRAFTSMANSHIP,
            Component: CraftsmanshipPage,
          },
          {
            path: MY_ROUTE.CONTENT.MEDIA,
            Component: MediaPage,
          },
          {
            path: MY_ROUTE.CONTENT.SAMPLE,
            Component: ExampleSentenceSamplePage,
          },
          {
            path: MY_ROUTE.INQUIRY.LIST,
            Component: InquiryPage,
          },
          {
            path: MY_ROUTE.INQUIRY.DETAIL(':id'),
            Component: InquiryDetailPage,
          },

          // Order Management
          {
            path: MY_ROUTE.ORDER.LIST,
            Component: OrderPage,
          },
          {
            path: MY_ROUTE.ORDER.DETAIL(':id'),
            Component: OrderDetailPage,
          },

          {
            path: MY_ROUTE.PERMISSION,
            Component: PermissionPage,
          },

          // System Management
          {
            path: MY_ROUTE.SYSTEM.CONNECTION_LOG,
            Component: ConnectionLogPage,
          },
          {
            path: MY_ROUTE.SYSTEM.OPERATION_LOG,
            Component: OperationLogPage,
          },
          {
            path: MY_ROUTE.SYSTEM.EMAIL_SETTINGS,
            Component: EmailSettingsPage,
          },
          {
            path: MY_ROUTE.SYSTEM.BANK_ACCOUNT_SETTINGS,
            Component: BankAccountSettingsPage,
          },

          // MES Monitoring
          {
            path: MY_ROUTE.MES_MONITORING,
            Component: MesMonitoringPage,
          },

          // Home Page Management
          {
            path: MY_ROUTE.HOME_PAGE_MANAGEMENT.MALL,
            Component: MallContentPage,
          },
          {
            path: MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND,
            Component: BrandContentPage,
          },
          {
            path: `${MY_ROUTE.HOME_PAGE_MANAGEMENT.BRAND}/:pageType`,
            Component: BrandContentPage,
          },
          {
            path: MY_ROUTE.HOME_PAGE_MANAGEMENT.VENDOR,
            Component: VendorContentPage,
          },
        ],
      },
      {
        path: '/editor',
        Component: CanvasEditorPage,
      },
    ],
  },
  {
    path: MY_ROUTE.LOGIN,
    Component: LoginPage,
    loader: () => {
      const isAuthen = isAuthenticated();
      if (isAuthen) {
        return redirect(MY_ROUTE.DASHBOARD.INDEX);
      }
      return null;
    },
  },
]);

export default router;
