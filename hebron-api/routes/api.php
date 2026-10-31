<?php

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Enums\SiteType;
use App\Http\Controllers\Api\AddressBookController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\AdminAboutCtaController;
use App\Http\Controllers\Api\Admin\AdminAccessLogController;
use App\Http\Controllers\Api\Admin\AdminBackgroundController;
use App\Http\Controllers\Api\Admin\AdminBankAccountController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminBarcodeController;
use App\Http\Controllers\Api\Admin\AdminBoardNoticeConfigController;
use App\Http\Controllers\Api\Admin\AdminCalligraphyController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminCraftsmanshipValueController;
use App\Http\Controllers\Api\Admin\AdminCustomerStatisticsController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminEmailSettingController;
use App\Http\Controllers\Api\Admin\AdminEmailIntegrationLogController;
use App\Http\Controllers\Api\Admin\AdminExampleSentenceSampleController;
use App\Http\Controllers\Api\Admin\AdminFaqController;
use App\Http\Controllers\Api\Admin\AdminFileController;
use App\Http\Controllers\Api\Admin\AdminGuideContentController;
use App\Http\Controllers\Api\Admin\AdminInquiryController;
use App\Http\Controllers\Api\Admin\AdminInquiryStatisticsController;
use App\Http\Controllers\Api\Admin\AdminMediaController;
use App\Http\Controllers\Api\Admin\AdminMemberController;
use App\Http\Controllers\Api\Admin\AdminMemberStatisticsController;
use App\Http\Controllers\Api\Admin\AdminMesIntegrationLogController;
use App\Http\Controllers\Api\Admin\AdminNoticeController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminOrderDesignController;
use App\Http\Controllers\Api\Admin\AdminOrderDesignRevisionController;
use App\Http\Controllers\Api\Admin\AdminPageController;
use App\Http\Controllers\Api\Admin\AdminPageSectionController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminPermissionController;
use App\Http\Controllers\Api\Admin\AdminPopupController;
use App\Http\Controllers\Api\Admin\AdminPortfolioController;
use App\Http\Controllers\Api\Admin\AdminPostCategoryController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminProductOptionController;
use App\Http\Controllers\Api\Admin\AdminProductOptionGroupController;
use App\Http\Controllers\Api\Admin\AdminProductStatisticsController;
use App\Http\Controllers\Api\Admin\AdminSettlementReportController;
use App\Http\Controllers\Api\Admin\AdminShipmentController;
use App\Http\Controllers\Api\Admin\AdminShoppingSettingController;
use App\Http\Controllers\Api\Admin\AdminTaskLogController;
use App\Http\Controllers\Api\Admin\AdminTemplateController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminUserPermissionController;
use App\Http\Controllers\Api\Admin\AdminWorkInstructionController;
use App\Http\Controllers\Api\Admin\ExportHistoryController;
use App\Http\Controllers\Api\Admin\MePermissionController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BoardNoticeConfigController;
use App\Http\Controllers\Api\CalligraphyController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactUsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DesignController;
use App\Http\Controllers\Api\ExampleSentenceSampleController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\FilterMetadataController;
use App\Http\Controllers\Api\GuideContentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MesWebhookController;
use App\Http\Controllers\Api\MyAccountController;
use App\Http\Controllers\Api\MyPage\CartController as MyPageCartController;
use App\Http\Controllers\Api\MyPage\DepositStatusController as MyPageDepositStatusController;
use App\Http\Controllers\Api\MyPage\FaqController as MyPageFaqController;
use App\Http\Controllers\Api\MyPage\InquiryController as MyPageInquiryController;
use App\Http\Controllers\Api\MyPage\NoticeController as MyPageNoticeController;
use App\Http\Controllers\Api\MyPage\NotificationController as MyPageNotificationController;
use App\Http\Controllers\Api\MyPage\OrderHistoryController as MyPageOrderHistoryController;
use App\Http\Controllers\Api\MyPage\PaymentController as MyPagePaymentController;
use App\Http\Controllers\Api\MyPage\RecentlyViewedController as MyPageRecentlyViewedController;
use App\Http\Controllers\Api\MyPage\ReviewController as MyPageReviewController;
use App\Http\Controllers\Api\MyPage\ShippingAddressController as MyPageShippingAddressController;
use App\Http\Controllers\Api\MyPage\TransactionHistoryController as MyPageTransactionHistoryController;
use App\Http\Controllers\Api\MyPageController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDesignContentController;
use App\Http\Controllers\Api\OrderDesignRevisionController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ProductConfiguratorController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductionInquiryController;
use App\Http\Controllers\Api\SearchSuggestionController;
use App\Http\Controllers\Api\ShoppingSettingController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TemplateAssetController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\WithdrawalController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/template-assets/{path}', [TemplateAssetController::class, 'show'])->where('path', '.*');

// Health check
Route::get('/health', [HealthController::class, 'index']);

// Public order inquiry (order number + contact mobile phone; no login required)
Route::prefix('inquiry')->group(function () {
    Route::get('/order-detail', [InquiryController::class, 'show']);
});

// Public page delivery. Page content, including its active sections, is resolved by slug.
Route::get('/pages/{slug}', [PageController::class, 'show'])->middleware('cache.response:3600,pages');

// Public Media routes (미디어 목록 및 카테고리별 미디어)
Route::prefix('media')->middleware('cache.response:3600,media')->group(function () {
    Route::get('/', [MediaController::class, 'index']);
    Route::get('/category', [MediaController::class, 'categories']);
    Route::get('/category/{id}', [MediaController::class, 'categoryDetail'])->whereNumber('id');
    Route::get('/{id}', [MediaController::class, 'show'])->whereNumber('id');
});

// Public calligraphy catalog for user sites.
Route::get('/calligraphies', [CalligraphyController::class, 'index']);

// Brand APIs
Route::prefix('brand')->group(function () {
    Route::get('/faqs', [FaqController::class, 'index'])->middleware('optional.auth');
    Route::get('/pages/{slug}', [PageController::class, 'showBrand'])->middleware('cache.response:3600,pages');
    // Brand media is always scoped to BRAND_SITE.
    Route::get('/media', [MediaController::class, 'brandIndex'])->middleware('cache.response:3600,media');
    Route::get('/portfolios', [PortfolioController::class, 'index']);
    Route::get('/portfolios/{id}', [PortfolioController::class, 'show'])->whereNumber('id');
    Route::post('/production-inquiry', [ProductionInquiryController::class, 'storeProduction'])->middleware('optional.auth');
    Route::post('/contact-us', [ContactUsController::class, 'store'])->middleware('optional.auth');
    Route::get('/products', [ProductController::class, 'brandIndex'])->middleware('cache.response:1800,products');
});

// Vendor APIs
Route::prefix('vendor')->group(function () {
    Route::get('/pages/{slug}', [PageController::class, 'showVendor'])->middleware('cache.response:3600,pages');
    Route::get('/products', [ProductController::class, 'index'])->middleware('cache.response:1800,products');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->middleware('cache.response:1800,products');
});

// Banner routes (배너 - Public for app)
Route::prefix('banners')->middleware('cache.response:3600,banners')->group(function () {
    // Homepage banners
    Route::get('/homepage', [BannerController::class, 'homepage']);

    // Login modal banners
    Route::get('/login', [BannerController::class, 'login']);
});

// Filter Metadata routes (필터 메타데이터)
Route::get('/filter-metadata', [FilterMetadataController::class, 'index']);

// Search Suggestions routes (검색 제안)
Route::get('/search-suggestions', [SearchSuggestionController::class, 'index']);

// Board Notice Config routes (게시판 공지 설정)
Route::prefix('board-notice-configs')->group(function () {
    Route::get('/{boardType}', [BoardNoticeConfigController::class, 'show']);
});

// Notice routes (공지사항)
Route::prefix('notices')->middleware('cache.response:3600,notices')->group(function () {
    // 공지사항 목록 (Public - Active notices only)
    Route::get('/', [NoticeController::class, 'index']);
    Route::get('/category', [NoticeController::class, 'categories']);
    Route::get('/category/{id}', [NoticeController::class, 'categoryDetail'])->whereNumber('id');

    // 공지사항 상세 (Public)
    Route::get('/{id}', [NoticeController::class, 'show'])->whereNumber('id');
});

// FAQ routes (자주 묻는 질문)
Route::prefix('faqs')->middleware('cache.response:3600,faqs')->group(function () {
    // FAQ 목록 (Public - Active FAQs only)
    Route::get('/', [FaqController::class, 'index'])->middleware('optional.auth');
    Route::get('/category', [FaqController::class, 'categories']);
    Route::get('/category/{id}', [FaqController::class, 'categoryDetail'])->whereNumber('id');

    // FAQ 카테고리별 집계 (Public - tab badges)
    Route::get('/category-counts', [FaqController::class, 'categoryCounts'])->middleware('optional.auth');

    // FAQ 상세 (Public)
    Route::get('/{id}', [FaqController::class, 'show'])->middleware('optional.auth');

    // FAQ 조회수 증가 (Public)
    Route::post('/{id}/view', [FaqController::class, 'recordView']);
});

// Portfolio routes (Public)
Route::prefix('portfolios')->group(function () {
    Route::get('/', [PortfolioController::class, 'index']);
    Route::get('/category', [PortfolioController::class, 'categories']);
    Route::get('/category/{id}', [PortfolioController::class, 'categoryDetail'])->whereNumber('id');
    Route::get('/{id}', [PortfolioController::class, 'show'])->whereNumber('id');
});

Route::prefix('example-sentence-samples')->group(function () {
    Route::get('/', [ExampleSentenceSampleController::class, 'index']);
    Route::get('/category', [ExampleSentenceSampleController::class, 'categories']);
    Route::get('/category/{id}', [ExampleSentenceSampleController::class, 'categoryDetail'])->whereNumber('id');
    Route::get('/{id}', [ExampleSentenceSampleController::class, 'show'])->whereNumber('id');
});

// Guide Content routes (안내 관리)
Route::prefix('guide-contents')->group(function () {
    // 안내 목록 (Public - Active guides only)
    Route::get('/', [GuideContentController::class, 'index']);

    // 안내 상세 (Public)
    Route::get('/{id}', [GuideContentController::class, 'show']);
});

// Shopping Settings routes (쇼핑 설정)
Route::prefix('shopping-settings')->middleware('cache.response:86400,shopping_settings')->group(function () {
    // 쇼핑 설정 목록 (Public)
    Route::get('/', [ShoppingSettingController::class, 'index']);

    // 쇼핑 설정 상세 (Public)
    Route::get('/{id}', [ShoppingSettingController::class, 'show']);
});

// Public template routes
Route::prefix('templates')->group(function () {
    Route::get('/', [TemplateController::class, 'index']);
    Route::get('/{id}', [TemplateController::class, 'show'])->whereNumber('id');
});

// Public product and category routes
Route::prefix('products')->middleware(['optional.auth', 'cache.response:1800,products'])->group(function () {
    // 제품 목록 (Product List)
    Route::get('/', [ProductController::class, 'index']);

    // 인기 상품 (Popular Products)
    Route::get('/popular', [ProductController::class, 'popular']);

    // 제품 검색 (Product Search)
    Route::get('/search', [ProductController::class, 'search']);

    // 템플릿 목록 (Product Templates) - for user web (Simple Text / Web Editor)
    Route::get('/{slug}/templates', [TemplateController::class, 'byProduct']);

    // 리뷰 목록 (Product Reviews)
    Route::get('/{slug}/reviews', [ProductController::class, 'reviews']);

    // 제품 사양서 PDF 다운로드 (Public Product Specification PDF)
    Route::get('/{slug}/download-pdf', [ProductController::class, 'downloadPdf']);

    // 제품 상세 (Product Detail)
    Route::get('/{slug}', [ProductController::class, 'show']);

    // Product Configurator Quote
    Route::post('/{id}/quote', [ProductConfiguratorController::class, 'quote'])->where('id', '[0-9]+');
});

Route::prefix('categories')->middleware(['optional.auth', 'cache.response:7200,categories'])->group(function () {
    // 카테고리 목록 (Category List)
    Route::get('/', [CategoryController::class, 'index']);

    // 카테고리 상세 (Category Detail)
    Route::get('/{slug}', [CategoryController::class, 'show']);

    // 카테고리별 제품 (Products by Category)
    Route::get('/{slug}/products', [CategoryController::class, 'products']);

    // 하위 카테고리 (Children Categories)
    Route::get('/{slug}/children', [CategoryController::class, 'children']);
});

// Public authentication routes
Route::prefix('auth')->group(function () {
    // 회원가입 (Register)
    Route::post('/register', [AuthController::class, 'register']);

    // 로그인 (Login)
    Route::post('/login', [AuthController::class, 'login']);

    // 토큰 갱신 (Refresh Token)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // 인증번호 전송 (Send Verification Code)
    Route::post('/send-verification-code', [AuthController::class, 'sendVerificationCode']);

    // 인증번호 확인 (Verify Verification Code)
    Route::post('/verify-verification-code', [AuthController::class, 'verifyVerificationCode']);

    // 아이디 찾기 (Find Username/ID)
    Route::post('/find-username', [AuthController::class, 'findUsername']);

    // 비밀번호 찾기 (Forgot Password - Send reset link)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    // 비밀번호 재설정 (Reset Password)
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // 인증번호로 비밀번호 재설정 (Reset Password with verification code)
    Route::post('/reset-password/with-code', [AuthController::class, 'resetPasswordWithCode']);

    // SNS 소셜 로그인 (Social Login - Kakao, Naver)
    Route::get('/social/{provider}/redirect-url', [SocialAuthController::class, 'redirectUrl']);
    Route::post('/social/{provider}/callback', [SocialAuthController::class, 'callback']);
    // For testing only — provider redirects directly to BE
    Route::get('/social/{provider}/callback-direct', [SocialAuthController::class, 'callbackDirect']);
});

// Guest checkout is supported. When a valid bearer token is supplied, the
// order is still associated with the authenticated user.
Route::middleware(['optional.auth', 'guest.commerce'])->group(function () {
    Route::prefix('designs')->group(function () {
        Route::post('/', [DesignController::class, 'store']);
        Route::get('/{id}', [DesignController::class, 'show']);
        Route::put('/{id}', [DesignController::class, 'update']);
        Route::delete('/{id}', [DesignController::class, 'destroy']);
        Route::get('/{id}/export-pdf', [DesignController::class, 'exportPdf']);
        Route::post('/{id}/print-pdf', [DesignController::class, 'uploadPrintPdf']);
    });

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::get('/orders/design-revisions/{slug}', [OrderDesignRevisionController::class, 'get']);
    Route::post('/orders/design-revisions/{slug}/action', [OrderDesignRevisionController::class, 'action']);

    Route::prefix('mypage/cart')->group(function () {
        Route::get('/', [MyPageCartController::class, 'index']);
        Route::post('/', [MyPageCartController::class, 'store']);
        Route::post('/selection-summary', [MyPageCartController::class, 'selectionSummary']);
        Route::delete('/batch', [MyPageCartController::class, 'batchDestroy']);
        Route::put('/{itemId}', [MyPageCartController::class, 'update']);
        Route::delete('/{itemId}', [MyPageCartController::class, 'destroy']);
        Route::post('/{itemId}/extend-storage', [MyPageCartController::class, 'extendStorage']);
        Route::post('/checkout', [MyPageCartController::class, 'checkout']);
        Route::post('/checkout/quote', [MyPageCartController::class, 'checkoutQuote']);
    });

    Route::prefix('payments')->group(function () {
        Route::post('/', [PaymentController::class, 'initiate']);
        Route::post('/toss/confirm', [PaymentController::class, 'confirmToss']);
        Route::post('/{transactionId}/verify', [PaymentController::class, 'verify']);
        Route::get('/{transactionId}', [PaymentController::class, 'show']);
        Route::post('/{transactionId}/cancel', [PaymentController::class, 'cancel']);
        Route::post('/{transactionId}/refund', [PaymentController::class, 'refund']);
    });
});

Route::get('/payment-methods', [PaymentController::class, 'methods']);
Route::get('/bank-account', [BankAccountController::class, 'show']);

// Payment webhook (결제 웹훅 - no auth required, called by payment gateway)
Route::prefix('payments/webhook')->controller(PaymentController::class)->group(function () {
    Route::post('/', 'webhook');
    Route::post('/deposit-callback', 'depositCallback');
});

// MES Webhook (no auth required)
Route::prefix('mes')->group(function () {
    Route::post('/stock', [MesWebhookController::class, 'updateStock']);
    Route::post('/status', [MesWebhookController::class, 'updateStatus']);
    Route::post('/sync-stock', [MesWebhookController::class, 'syncStock']);
    Route::post('/commit-stock', [MesWebhookController::class, 'syncStock']);
});

// AI generation is available to guest users.
Route::post('/ai/generate', [AiController::class, 'generate']);

// File uploads are available to guests. Authenticated requests still retain
// the uploader through the optional Sanctum authentication middleware.
Route::post('/files', [FileController::class, 'upload'])->middleware('optional.auth');

// Order design contents are available to the current commerce identity only.
Route::middleware(['optional.auth', 'guest.commerce'])->prefix('order-design-contents')->group(function () {
    Route::get('/', [OrderDesignContentController::class, 'index']);
    Route::get('/{id}', [OrderDesignContentController::class, 'show']);
    Route::post('/', [OrderDesignContentController::class, 'store']);
    Route::put('/{id}', [OrderDesignContentController::class, 'update']);
    Route::delete('/{id}', [OrderDesignContentController::class, 'destroy']);
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum', 'user.active'])->group(function () {

    // 로그아웃 (Logout)
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // 현재 사용자 정보 (Get current user)
    Route::get('/auth/me', [AuthController::class, 'me']);

    // 비밀번호 변경 (Change Password)
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // 핸드폰 번호 변경 - 인증번호 전송 (Send Verification Code for Change Phone)
    Route::post('/auth/change-phone/send-code', [AuthController::class, 'sendChangePhoneVerificationCode']);

    // 핸드폰 번호 변경 (Change Phone)
    Route::put('/auth/change-phone', [AuthController::class, 'changePhone']);

    // Legacy route for backward compatibility
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard routes (대시보드)
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

    // MyPage routes (마이페이지)
    Route::prefix('mypage')->group(function () {
        // 대시보드 (Dashboard)
        Route::get('/dashboard', [MyPageController::class, 'dashboard'])->middleware('cache.response:300,mypage_{user}');

        // 프로필 조회 (Get Profile)
        Route::get('/profile', [MyPageController::class, 'show'])->middleware('cache.response:300,mypage_{user}');

        // 프로필 수정 (Update Profile)
        Route::put('/profile', [MyPageController::class, 'update']);

        // 비밀번호 변경 (Change Password)
        Route::put('/profile/password', [MyPageController::class, 'updatePassword']);

        // 사업자등록증 업로드 (Upload Business Registration File)
        Route::post('/profile/business-registration-file', [MyPageController::class, 'uploadBusinessRegistrationFile']);

        // FAQ (자주 묻는 질문)
        Route::get('/faqs/category-counts', [MyPageFaqController::class, 'categoryCounts'])->middleware('cache.response:3600,faqs');
        Route::get('/faqs', [MyPageFaqController::class, 'index'])->middleware('cache.response:3600,faqs');
        Route::get('/faqs/{id}', [MyPageFaqController::class, 'show'])->middleware('cache.response:3600,faqs');

        // Notice (공지사항)
        Route::get('/notices', [MyPageNoticeController::class, 'index'])->middleware('cache.response:3600,notices');
        Route::get('/notices/{id}', [MyPageNoticeController::class, 'show'])->middleware('cache.response:3600,notices');

        // Notifications (실시간 알림함)
        Route::get('/notifications', [MyPageNotificationController::class, 'index']);
        Route::patch('/notifications/read-all', [MyPageNotificationController::class, 'markAllAsRead']);
        Route::patch('/notifications/{notificationId}/read', [MyPageNotificationController::class, 'markAsRead']);

        // 1:1 Inquiry (1:1 문의)
        Route::get('/inquiries', [MyPageInquiryController::class, 'index']);
        Route::get('/inquiries/{id}', [MyPageInquiryController::class, 'show']);
        Route::post('/inquiries', [MyPageInquiryController::class, 'store']);
        Route::patch('/inquiries/{id}', [MyPageInquiryController::class, 'update']);
        Route::delete('/inquiries/{id}', [MyPageInquiryController::class, 'destroy']);
        Route::post('/inquiries/{id}/comments', [MyPageInquiryController::class, 'addComment']);

        // Shipping Addresses (배송지 관리)
        Route::get('/shipping-addresses', [MyPageShippingAddressController::class, 'index'])->middleware('cache.response:300,mypage_{user}');
        Route::get('/shipping-addresses/{id}', [MyPageShippingAddressController::class, 'show'])->middleware('cache.response:300,mypage_{user}');
        Route::post('/shipping-addresses', [MyPageShippingAddressController::class, 'store']);
        Route::put('/shipping-addresses/{id}', [MyPageShippingAddressController::class, 'update']);
        Route::delete('/shipping-addresses', [MyPageShippingAddressController::class, 'destroy']);
        Route::post('/shipping-addresses/{id}/set-default', [MyPageShippingAddressController::class, 'setDefault']);

        // Recently Viewed Products (최근 본 상품)
        Route::get('/recently-viewed', [MyPageRecentlyViewedController::class, 'index']);
        Route::post('/recently-viewed/{productId}', [MyPageRecentlyViewedController::class, 'track']);
        Route::delete('/recently-viewed/{productId}', [MyPageRecentlyViewedController::class, 'destroy']);
        Route::delete('/recently-viewed', [MyPageRecentlyViewedController::class, 'clearAll']);

        // Reviews/Ratings (리뷰/별점)
        Route::get('/reviews', [MyPageReviewController::class, 'index']);
        Route::post('/reviews', [MyPageReviewController::class, 'store']);
        Route::get('/reviews/unreviewed', [MyPageReviewController::class, 'unreviewedOrderItems']);
        Route::put('/reviews/{reviewId}', [MyPageReviewController::class, 'update']);
        Route::delete('/reviews/{reviewId}', [MyPageReviewController::class, 'destroy']);

        // Payment history
        Route::get('/payments', [MyPagePaymentController::class, 'index']);
        Route::get('/payments/pending', [MyPagePaymentController::class, 'pending']);
        Route::get('/payments/completed', [MyPagePaymentController::class, 'completed']);
        Route::get('/payments/failed', [MyPagePaymentController::class, 'failed']);
        Route::get('/payments/{transactionId}', [MyPagePaymentController::class, 'show']);
        Route::post('/payments/bulk-approve', [MyPagePaymentController::class, 'bulkApprove']);
        Route::post('/payments/bulk-reject', [MyPagePaymentController::class, 'bulkReject']);
    });

    // 주문배송조회 (Order & Delivery Tracking)
    Route::prefix('mypage-order-delivery-tracking')->group(function () {
        Route::get('/histories', [MyPageOrderHistoryController::class, 'index']);
        Route::post('/histories/export-excel', [MyPageOrderHistoryController::class, 'exportExcel']);
        Route::get('/histories/export-excel/{history}/check-progress-status', [MyPageOrderHistoryController::class, 'checkExportProgress'])->where('history', '[0-9]+');
        Route::get('/histories/{orderNumber}/shipping-addresses', [MyPageOrderHistoryController::class, 'shippingAddressPicker']);
        Route::get('/histories/{orderNumber}/shipping-address-changes', [MyPageOrderHistoryController::class, 'shippingAddressChangeHistory']);
        Route::post('/histories/{orderNumber}/proof/revision-request', [MyPageOrderHistoryController::class, 'requestProofRevision']);
        Route::post('/histories/{orderNumber}/proof/resubmit-file', [MyPageOrderHistoryController::class, 'resubmitProofFile']);
        Route::post('/histories/{orderNumber}/proof/confirm', [MyPageOrderHistoryController::class, 'confirmProof']);
        Route::get('/histories/{orderNumber}/quotation/pdf', [MyPageOrderHistoryController::class, 'downloadQuotationPdf']);
        Route::put('/histories/{orderNumber}/shipping-address', [MyPageOrderHistoryController::class, 'updateShippingAddress']);
        Route::get('/histories/{orderNumber}/transaction-statement/pdf', [MyPageOrderHistoryController::class, 'downloadTransactionStatementPdf']);
        Route::get('/histories/{orderNumber}', [MyPageOrderHistoryController::class, 'show']);
    });

    // Create Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/{orderNumber}/reorder', [OrderController::class, 'reorder']);
        Route::put('/{orderNumber}/shipping-info', [OrderController::class, 'updateShippingInfo']);
        Route::post('/{orderNumber}/attach-designs', [OrderController::class, 'attachDesigns']);
    });

    // Address Book routes (배송지 관리)
    Route::prefix('address-books')->group(function () {
        // 배송지 목록 (Address Book List)
        Route::get('/', [AddressBookController::class, 'index']);

        // 배송지 등록 (Create Address Book)
        Route::post('/', [AddressBookController::class, 'store']);

        // 배송지 일괄 삭제 (Batch Delete Address Books)
        Route::delete('/batch', [AddressBookController::class, 'batchDestroy']);

        // 배송지 상세 (Get Address Book Detail)
        Route::get('/{id}', [AddressBookController::class, 'show']);

        // 배송지 수정 (Update Address Book)
        Route::put('/{id}', [AddressBookController::class, 'update']);

        // 배송지 삭제 (Delete Address Book)
        Route::delete('/{id}', [AddressBookController::class, 'destroy']);

        // 기본 배송지 설정 (Set Default Address)
        Route::post('/{id}/set-default', [AddressBookController::class, 'setDefault']);
    });

    // Deposit Status routes (입금현황)
    Route::get('mypage/deposit-status', [MyPageDepositStatusController::class, 'index']);

    // Transaction History routes (거래내역조회)
    Route::get('mypage/transaction-history', [MyPageTransactionHistoryController::class, 'index']);

    // Withdrawal routes (회원탈퇴)
    Route::prefix('mypage/withdrawal')->group(function () {
        Route::get('/check', [WithdrawalController::class, 'check']);
        Route::post('/', [WithdrawalController::class, 'withdraw']);
    });

    // My Account routes (전용계좌 / 환불계좌 관리)
    Route::prefix('mypage/account')->group(function () {
        // 계좌 조회 (Get Account Info)
        Route::get('/', [MyAccountController::class, 'show']);

        // 전용계좌 은행 변경 (Change Bank)
        Route::post('/bank', [MyAccountController::class, 'updateBank']);
        Route::put('/bank', [MyAccountController::class, 'updateBank']);

        // 환불내역 조회 (Get Refund Histories)
        Route::get('/histories', [MyAccountController::class, 'histories']);

        // 전용계좌 발급확인서 (Certificate)
        Route::get('/certificate', [MyAccountController::class, 'certificate']);
    });

    // Notice Admin routes (공지사항 관리 - Admin only)
    Route::prefix('notices')->group(function () {
        // 공지사항 목록 (Admin - All notices including inactive)
        Route::get('/admin/list', [NoticeController::class, 'adminIndex']);

        // 공지사항 생성 (Create Notice)
        Route::post('/', [NoticeController::class, 'store']);

        // 공지사항 수정 (Update Notice)
        Route::put('/{id}', [NoticeController::class, 'update']);

        // 공지사항 삭제 (Delete Notice)
        Route::delete('/{id}', [NoticeController::class, 'destroy']);
    });

    // FAQ Admin routes (FAQ 관리 - Admin only)
    Route::prefix('faqs')->group(function () {
        // FAQ 목록 (Admin - All FAQs including inactive)
        Route::get('/admin/list', [FaqController::class, 'adminIndex']);

        // FAQ 생성 (Create FAQ)
        Route::post('/', [FaqController::class, 'store']);

        // FAQ 수정 (Update FAQ)
        Route::put('/{id}', [FaqController::class, 'update']);

        // FAQ 삭제 (Delete FAQ)
        Route::delete('/{id}', [FaqController::class, 'destroy']);
    });

    // Portfolio Admin routes (Admin only)
    Route::prefix('portfolios')->group(function () {
        Route::get('/admin/list', [AdminPortfolioController::class, 'index']);
    });

    // Admin routes (관리자 전용)
    Route::prefix('admin')->middleware(['user.admin'])->group(function () {

        Route::prefix('bank-account')->group(function () {
            Route::get('/', [AdminBankAccountController::class, 'show']);
            Route::put('/', [AdminBankAccountController::class, 'update']);
        });

        Route::get('/me/permissions', [MePermissionController::class, 'index']);

        // Address routes Kakao Map(주소)
        Route::get('/addresses/geocode', [AddressController::class, 'geocode']);

        Route::prefix('about-ctas')->group(function () {
            Route::get('/{siteType}', [AdminAboutCtaController::class, 'show'])
                ->whereIn('siteType', SiteType::values());
            Route::put('/{siteType}', [AdminAboutCtaController::class, 'update'])
                ->whereIn('siteType', SiteType::values());
        });

        Route::prefix('pages')->group(function () {
            Route::get('/', [AdminPageController::class, 'index']);
            Route::put('/{siteType}/{pageType}/sections/{sectionType}', [AdminPageSectionController::class, 'update'])
                ->whereIn('siteType', SiteType::values())
                ->whereIn('pageType', PageType::values())
                // Data-backed sections are resolved by their own management
                // APIs and are not editable through this endpoint.
                ->whereIn('sectionType', SectionType::valuesForManualUpdate());
        });

        Route::prefix('craftsmanship-values')->group(function () {
            Route::get('/', [AdminCraftsmanshipValueController::class, 'index']);
            Route::post('/', [AdminCraftsmanshipValueController::class, 'store']);
            Route::get('/{id}', [AdminCraftsmanshipValueController::class, 'show'])->whereNumber('id');
            Route::put('/{id}', [AdminCraftsmanshipValueController::class, 'update'])->whereNumber('id');
            Route::patch('/{id}', [AdminCraftsmanshipValueController::class, 'update'])->whereNumber('id');
            Route::delete('/{id}', [AdminCraftsmanshipValueController::class, 'destroy'])->whereNumber('id');
        });

        Route::prefix('dashboard')->group(function () {
            Route::get('/overview/operation', [AdminDashboardController::class, 'operational']);
            Route::get('/statics/members-static', [AdminMemberStatisticsController::class, 'index']);
            Route::get('/statics/order-static', [AdminDashboardController::class, 'orderStatic']);
            Route::get('/statics/products-static', [AdminProductStatisticsController::class, 'index']);
            Route::get('/statics/payment-static', [AdminPaymentController::class, 'statistics']);
            Route::get('/statics/inquiry-static', [AdminInquiryStatisticsController::class, 'index']);
            Route::get('/statics/customer-static', [AdminCustomerStatisticsController::class, 'index']);
        });

        Route::resource('/export-history', ExportHistoryController::class)->only('show');

        // Order Management (주문관리)
        Route::prefix('orders')->group(function () {
            // 주문 목록 (Order List)
            Route::get('/', [AdminOrderController::class, 'index']);

            // Create internal order (내부 주문 생성)
            Route::post('/internal', [AdminOrderController::class, 'storeInternal']);

            // 주문 상세 (Order Detail)
            Route::get('/{orderNumber}', [AdminOrderController::class, 'show']);

            // Draft/design file management
            Route::get('/{orderNumber}/design-files', [AdminOrderDesignController::class, 'show']);
            Route::post('/{orderNumber}/design-files/upload', [AdminOrderDesignController::class, 'uploadRevisedFile']);
            Route::get('/{orderNumber}/design-files/rejection-reason', [AdminOrderDesignController::class, 'getRejectionReason']);

            Route::get('/{orderNumber}/design-revisions', [AdminOrderDesignRevisionController::class, 'index']);
            Route::post('/{orderNumber}/design-revisions', [AdminOrderDesignRevisionController::class, 'store']);

            // Order design as PDF (front + back) – for order list button: view design
            Route::get('/{orderNumber}/design-pdf', [AdminOrderController::class, 'designPdf']);
            Route::get('/{orderNumber}/print-pdf', [AdminOrderController::class, 'printPdf']);
            Route::get('/{orderNumber}/items/{orderItemId}/print-pdf', [AdminOrderController::class, 'printItemPdf'])
                ->whereNumber('orderItemId')->name('admin.orders.items.print-pdf');

            // Order status update. FE use PUT .../status with body {"status": "confirmed"}
            Route::put('/{orderNumber}/status', [AdminOrderController::class, 'updateStatus']);

            // Bulk status change
            Route::put('/bulk-status-change', [AdminOrderController::class, 'bulkChangeStatus']);

            // Basic information (기본정보)
            Route::put('/{orderNumber}/basic-information', [AdminOrderController::class, 'updateBasicInformation']);

            // Modification logs (수정 이력)
            Route::get('/{orderNumber}/modification-logs', [AdminOrderController::class, 'modificationLogs']);

            // Status history (상태 이력)
            Route::get('/{orderNumber}/status-history', [AdminOrderController::class, 'statusHistory']);

            // Export to Excel
            Route::post('/export-excel', [AdminOrderController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminOrderController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminOrderController::class, 'download'])->where('history', '[0-9]+');
        });

        // Shipment Management (출고 관리) - 8.1
        Route::prefix('shipments')->group(function () {
            Route::get('/search-filters', [AdminShipmentController::class, 'searchFilters']);
            Route::get('/carriers', [AdminShipmentController::class, 'carriers']);
            Route::get('/{invoiceNumber}/tracking/events', [AdminShipmentController::class, 'trackingEvents']);
            Route::get('/invoice/{invoiceNumber}', [AdminShipmentController::class, 'showByInvoiceNumber']);
            Route::put('/{orderNumber}', [AdminOrderController::class, 'updateWaybill']);
            Route::get('/', [AdminShipmentController::class, 'index']);
            Route::post('/export-excel', [AdminShipmentController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminShipmentController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminShipmentController::class, 'download'])->where('history', '[0-9]+');
        });

        /*
         * Delivery Tracking is temporarily disabled.
         * Shipment is now the single source of truth for delivery data.
         * Keep the controller/service for legacy rollback until migration cleanup.
         */

        // Administrator Management
        Route::prefix('user')->group(function () {
            // 검색 필터 옵션 (Search Filter Options)
            Route::get('/search-filters', [AdminUserController::class, 'searchFilters']);

            // 사용자 목록 (User List)
            Route::get('/', [AdminUserController::class, 'index']);

            // 사용자 생성 (Create User)
            Route::post('/', [AdminUserController::class, 'store']);

            // 사용자 상세 (User Detail)
            Route::get('/{id}', [AdminUserController::class, 'show'])->where('id', '[0-9]+');

            // 사용자 수정 (Update User)
            Route::patch('/{id}', [AdminUserController::class, 'update'])->where('id', '[0-9]+');

            // 사용자 삭제 (Delete User)
            Route::delete('/{id}', [AdminUserController::class, 'destroy'])->where('id', '[0-9]+');

            // 비밀번호 변경 (Change Password)
            Route::put('/{id}/password', [AdminUserController::class, 'changePassword'])->where('id', '[0-9]+');
        });

        // Member Management (회원 관리), User Management
        Route::prefix('members')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminMemberController::class, 'searchFilters']);

            // Member List (회원 목록)
            Route::get('/', [AdminMemberController::class, 'index']);

            // Member Detail (회원 상세)
            Route::get('/{id}', [AdminMemberController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            // Member Registration (회원 등록)
            Route::post('/', [AdminMemberController::class, 'store']);

            // Member Update
            Route::put('/{id}', [AdminMemberController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            // Permission Information (권한 정보)
            Route::get('/{id}/permissions', [AdminMemberController::class, 'getPermissions'])->where('id', '[0-9]+|[\w-]+');
            Route::put('/{id}/permissions', [AdminMemberController::class, 'updatePermissions'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/change-password', [AdminMemberController::class, 'changePassword'])->where('id', '[0-9]+|[\w-]+');

            // Activity Log (활동 이력)
            Route::get('/{id}/activity-logs', [AdminMemberController::class, 'activityLogs'])->where('id', '[0-9]+|[\w-]+');

            // Export to Excel
            Route::post('/export-excel', [AdminMemberController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminMemberController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminMemberController::class, 'download'])->where('history', '[0-9]+');
        });

        // Member Statistics (회원 통계)
        Route::prefix('member-statistics')->group(function () {
            // New Members (신규 회원)
            Route::get('/new-members', [AdminMemberStatisticsController::class, 'newMembers']);

            // Withdrawn Members (탈퇴 회원)
            Route::get('/withdrawn-members', [AdminMemberStatisticsController::class, 'withdrawnMembers']);

            // Active Members (활성 회원)
            Route::get('/active-members', [AdminMemberStatisticsController::class, 'activeMembers']);

            // Members by Level (회원 등급별)
            Route::get('/members-by-level', [AdminMemberStatisticsController::class, 'membersByLevel']);

            // Members by Path (회원 경로별)
            Route::get('/members-by-path', [AdminMemberStatisticsController::class, 'membersByPath']);

            // Export to Excel
            Route::get('/export', [AdminMemberStatisticsController::class, 'export']);
        });

        // Product Management (제품관리)
        Route::prefix('products')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminProductController::class, 'searchFilters']);

            // 제품 목록 (Product List) - 템플릿, 맞춤제품, 홍보물, 파일주문
            Route::get('/', [AdminProductController::class, 'index']);

            // 제품 생성 (Create Product)
            Route::post('/', [AdminProductController::class, 'store']);

            // Export to Excel
            Route::post('/export-excel', [AdminProductController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminProductController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminProductController::class, 'download'])->where('history', '[0-9]+');

            // 제품 일괄 수정 (Bulk Update Products) - category_ids, selling_price, stock_quantity, sort_order
            Route::patch('/bulk', [AdminProductController::class, 'bulkUpdate']);

            // MES Stock Synchronization (MES 재고 동기화)
            Route::post('/sync-stock', [AdminProductController::class, 'syncStock']);
            Route::post('/sync-mes-stock', [AdminProductController::class, 'syncStock']);
            Route::post('/commit-stock', [AdminProductController::class, 'syncStock']);
            Route::post('/{id}/sync-stock', [AdminProductController::class, 'syncProductStock'])->where('id', '[0-9]+|[\w-]+');

            // 제품 수정 (Update Product)
            Route::put('/{id}', [AdminProductController::class, 'update'])->where('id', '[0-9]+|[\w-]+');
            Route::patch('/{id}', [AdminProductController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            // 제품 일괄 삭제 (Bulk Delete Products)
            // Must be declared before /{id}, otherwise "bulk" is treated as a product slug.
            Route::delete('/bulk', [AdminProductController::class, 'bulkDelete']);

            // 제품 삭제 (Delete Product)
            Route::delete('/{id}', [AdminProductController::class, 'destroy'])->where('id', '[0-9]+|[\w-]+');

            // 제품 상태 변경 (Toggle Product Status)
            Route::patch('/{id}/toggle-status', [AdminProductController::class, 'toggleStatus'])->where('id', '[0-9]+|[\w-]+');

            // 제품 복사 미리보기 / 복사 (Copy Preview / Copy)
            Route::get('/{id}/copy-preview', [AdminProductController::class, 'copyPreview'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/copy', [AdminProductController::class, 'copy'])->where('id', '[0-9]+|[\w-]+');

            // 제품 상세 (Product Detail)
            Route::get('/{id}', [AdminProductController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            // // 제품 이미지 업로드 (Upload Product Images)
            Route::post('/upload-images', [AdminProductController::class, 'uploadImages']);

            // 제품 일괄 작업 (Bulk Operations)
            Route::patch('/bulk/status', [AdminProductController::class, 'bulkUpdateStatus']);

            // MES Inventory Settings
            Route::patch('/{id}/mes-settings', [AdminProductController::class, 'updateMesSettings'])->where('id', '[0-9]+|[\w-]+');

            Route::patch('/{id}/position', [AdminProductController::class, 'moveToPosition'])->where('id', '[0-9]+|[\w-]+');
        });

        // Product Statistics (제품 통계)
        Route::prefix('stastics/products-static')->group(function () {
            // Get sales volume by product
            Route::get('/sales-volume', [AdminProductStatisticsController::class, 'salesVolume']);

            // Get top N sales products
            Route::get('/top-n-sales', [AdminProductStatisticsController::class, 'topNSales']);

            // Get promoted products CTR
            Route::get('/promoted-products-ctr', [AdminProductStatisticsController::class, 'promotedProductsCTR']);

            // Get statistics by product status
            Route::get('/statistics-by-status', [AdminProductStatisticsController::class, 'statisticsByStatus']);
        });

        // Background Management
        Route::prefix('backgrounds')->group(function () {
            Route::get('/', [AdminBackgroundController::class, 'index']);
            Route::post('/', [AdminBackgroundController::class, 'store']);
            Route::delete('/bulk', [AdminBackgroundController::class, 'bulkDelete']);
            Route::get('/{id}', [AdminBackgroundController::class, 'show'])->whereNumber('id');
            Route::put('/{id}', [AdminBackgroundController::class, 'update'])->whereNumber('id');
            Route::patch('/{id}', [AdminBackgroundController::class, 'update'])->whereNumber('id');
            Route::delete('/{id}', [AdminBackgroundController::class, 'destroy'])->whereNumber('id');
        });

        // Calligraphy Management
        Route::prefix('calligraphies')->group(function () {
            Route::get('/', [AdminCalligraphyController::class, 'index']);
            Route::post('/', [AdminCalligraphyController::class, 'store']);
            Route::patch('/bulk', [AdminCalligraphyController::class, 'bulkUpdate']);
            Route::delete('/bulk', [AdminCalligraphyController::class, 'bulkDelete']);
            Route::get('/{id}', [AdminCalligraphyController::class, 'show'])->whereNumber('id');
            Route::put('/{id}', [AdminCalligraphyController::class, 'update'])->whereNumber('id');
            Route::patch('/{id}', [AdminCalligraphyController::class, 'update'])->whereNumber('id');
            Route::delete('/{id}', [AdminCalligraphyController::class, 'destroy'])->whereNumber('id');
        });

        // Template Management (템플릿 관리)
        Route::prefix('templates')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminTemplateController::class, 'searchFilters']);

            // Upload template source file or editor asset. Returns file_path for template create/update.
            Route::post('/upload-file', [AdminTemplateController::class, 'uploadFile']);
            // Preview images upload (max 2 images). Returns paths for preview_images field.
            Route::post('/preview-images', [AdminTemplateController::class, 'uploadPreviewImages']);

            // 템플릿 목록 (Template List)
            Route::get('/', [AdminTemplateController::class, 'index']);

            // 템플릿 생성 (Create Template)
            Route::post('/', [AdminTemplateController::class, 'store']);

            // Export to Excel
            Route::post('/export-excel', [AdminTemplateController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminTemplateController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminTemplateController::class, 'download'])->where('history', '[0-9]+');

            // 템플릿 일괄 수정 / 삭제 (Bulk Actions)
            Route::patch('/bulk', [AdminTemplateController::class, 'bulkUpdate']);
            Route::delete('/bulk', [AdminTemplateController::class, 'bulkDelete']);

            // 템플릿 미리보기 이미지 저장 (stable overwrite by side)
            Route::post('/{id}/preview', [AdminTemplateController::class, 'upsertPreview'])->where('id', '[0-9]+');

            // 템플릿 수정 (Update Template)
            Route::put('/{id}', [AdminTemplateController::class, 'update'])->where('id', '[0-9]+');
            Route::patch('/{id}', [AdminTemplateController::class, 'update'])->where('id', '[0-9]+');

            // 템플릿 삭제 (Delete Template)
            Route::delete('/{id}', [AdminTemplateController::class, 'destroy'])->where('id', '[0-9]+');

            // 템플릿 복사 미리보기 / 복사 (Copy Preview / Copy)
            Route::get('/{id}/copy-preview', [AdminTemplateController::class, 'copyPreview'])->where('id', '[0-9]+');
            Route::post('/{id}/copy', [AdminTemplateController::class, 'copy'])->where('id', '[0-9]+');

            // 템플릿 상세 (Template Detail)
            Route::get('/{id}', [AdminTemplateController::class, 'show'])->where('id', '[0-9]+');
        });

        // Management Payments
        Route::prefix('payments')->group(function () {
            Route::get('/', [AdminPaymentController::class, 'index']);
            Route::get('/statistics', [AdminPaymentController::class, 'statistics']);
            Route::post('/export-excel', [AdminPaymentController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminPaymentController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminPaymentController::class, 'download'])->where('history', '[0-9]+');
            Route::get('/{transactionId}', [AdminPaymentController::class, 'show']);
            Route::put('/{transactionId}/status', [AdminPaymentController::class, 'updateStatus']);
            Route::get('/{transactionId}/receipt', [AdminPaymentController::class, 'printReceipt']);
            Route::post('/{transactionId}/refund', [AdminPaymentController::class, 'refund']);
        });

        // Settlement Report Management
        Route::prefix('settlement-report')->group(function () {
            Route::get('/', [AdminSettlementReportController::class, 'index']);
            Route::post('/export-excel', [AdminSettlementReportController::class, 'exportExcel']);
            Route::get('/export-excel/{history}/check-progress-status', [AdminSettlementReportController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('/export-excel/{history}/download', [AdminSettlementReportController::class, 'download'])->where('history', '[0-9]+');
        });

        // Administrator Permission Management (관리자 권한 관리 - Super Admin)
        Route::prefix('permissions')->group(function () {
            Route::get('/search-filters', [AdminPermissionController::class, 'searchFilters']);
            Route::get('/', [AdminPermissionController::class, 'index']);
            Route::post('/', [AdminPermissionController::class, 'store']);
            Route::get('/{id}/menu-structure', [AdminPermissionController::class, 'menuStructure'])->where('id', '[0-9]+');
            Route::put('/{id}/settings', [AdminPermissionController::class, 'updateSettings'])->where('id', '[0-9]+');
            Route::get('/{id}', [AdminPermissionController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPermissionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPermissionController::class, 'destroy'])->where('id', '[0-9]+');
            Route::post('/{id}/copy', [AdminPermissionController::class, 'copy'])->where('id', '[0-9]+');
            Route::post('/export-excel', [AdminPermissionController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminPermissionController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminPermissionController::class, 'download'])->where('history', '[0-9]+');
        });

        // Category Management (카테고리 관리 - Super Admin)
        Route::prefix('categories')->group(function () {
            Route::get('/search-filters', [AdminCategoryController::class, 'searchFilters']);
            Route::post('/upload-exposure-image', [AdminCategoryController::class, 'uploadExposureImage']);
            Route::get('/', [AdminCategoryController::class, 'index']);
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::put('/sort-order', [AdminCategoryController::class, 'updateSortOrder']);
            Route::patch('/{id}/position', [AdminCategoryController::class, 'moveToPosition'])->where('id', '[0-9]+');
            Route::get('/{id}/products', [AdminCategoryController::class, 'getCategoryProducts'])->where('id', '[0-9]+');
            Route::patch('/{categoryId}/products/{productId}/position', [AdminCategoryController::class, 'updateCategoryProductPosition'])
                ->where(['categoryId' => '[0-9]+', 'productId' => '[0-9]+']);
            Route::post('/export-excel', [AdminCategoryController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminCategoryController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminCategoryController::class, 'download'])->where('history', '[0-9]+');
            Route::get('/{id}', [AdminCategoryController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminCategoryController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminCategoryController::class, 'destroy'])->where('id', '[0-9]+');
            Route::put('/{id}/exposure', [AdminCategoryController::class, 'updateExposure'])->where('id', '[0-9]+');
        });

        // Product Option Group Management (제품 옵션 그룹 관리 - Super Admin)
        Route::prefix('product-option-groups')->group(function () {
            Route::get('/', [AdminProductOptionGroupController::class, 'index']);
            Route::post('/', [AdminProductOptionGroupController::class, 'store']);
            Route::get('/{id}', [AdminProductOptionGroupController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminProductOptionGroupController::class, 'update'])->where('id', '[0-9]+');
            Route::post('/{id}/assign-products', [AdminProductOptionGroupController::class, 'assignProducts'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminProductOptionGroupController::class, 'destroy'])->where('id', '[0-9]+');
            Route::post('/export-excel', [AdminProductOptionGroupController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminProductOptionGroupController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminProductOptionGroupController::class, 'download'])->where('history', '[0-9]+');
        });

        // Product Option Management (제품 옵션 관리 - Super Admin)
        Route::prefix('product-options')->group(function () {
            Route::get('/', [AdminProductOptionController::class, 'index']);
            Route::post('/', [AdminProductOptionController::class, 'store']);
            Route::get('/{id}', [AdminProductOptionController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminProductOptionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminProductOptionController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // User Permission Management (사용자 권한 관리 - Super Admin)
        Route::prefix('user-permissions')->group(function () {
            Route::get('/', [AdminUserPermissionController::class, 'index']);
            Route::get('/{id}', [AdminUserPermissionController::class, 'show'])->where('id', '[0-9]+');
            Route::post('/', [AdminUserPermissionController::class, 'store']);
            Route::put('/{id}', [AdminUserPermissionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminUserPermissionController::class, 'destroy'])->where('id', '[0-9]+');
            Route::post('/export-excel', [AdminUserPermissionController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminUserPermissionController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminUserPermissionController::class, 'download'])->where('history', '[0-9]+');
        });

        // Notice Management (공지사항 관리 - Super Admin)
        Route::prefix('notices')->group(function () {
            Route::get('/search-filters', [AdminNoticeController::class, 'searchFilters']);
            Route::post('/upload-attachment', [AdminNoticeController::class, 'uploadAttachment']);
            Route::get('/', [AdminNoticeController::class, 'index']);
            Route::post('/', [AdminNoticeController::class, 'store']);
            Route::get('/{id}', [AdminNoticeController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminNoticeController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminNoticeController::class, 'destroy'])->where('id', '[0-9]+');
        });

        Route::prefix('{page}/category')
            ->where(['page' => 'notices|faqs|portfolios|media|example-sentence-samples'])
            ->group(function () {
                Route::get('/', [AdminPostCategoryController::class, 'index']);
                Route::post('/', [AdminPostCategoryController::class, 'store']);
                Route::get('/{id}', [AdminPostCategoryController::class, 'show'])->whereNumber('id');
                Route::put('/{id}', [AdminPostCategoryController::class, 'update'])->whereNumber('id');
                Route::delete('/{id}', [AdminPostCategoryController::class, 'destroy'])->whereNumber('id');
            });

        // Board Notice Config Management (게시판 공지 설정 관리)
        Route::prefix('board-notice-configs')->group(function () {
            Route::get('/', [AdminBoardNoticeConfigController::class, 'index']);
            Route::put('/{boardType}', [AdminBoardNoticeConfigController::class, 'update']);
        });

        // File Management (파일 관리 - Super Admin)
        Route::prefix('files')->group(function () {
            Route::get('/search-filters', [AdminFileController::class, 'searchFilters']);
            Route::get('/', [AdminFileController::class, 'index']);
            Route::post('/', [AdminFileController::class, 'upload']);
            Route::get('/{id}', [AdminFileController::class, 'show'])->where('id', '[0-9]+');
        });

        // Guide Content Management (안내 관리 - Super Admin)
        Route::prefix('guide-contents')->group(function () {
            Route::get('/search-filters', [AdminGuideContentController::class, 'searchFilters']);
            Route::post('/upload-attachment', [AdminGuideContentController::class, 'uploadAttachment']);
            Route::get('/', [AdminGuideContentController::class, 'index']);
            Route::post('/', [AdminGuideContentController::class, 'store']);
            Route::get('/{id}', [AdminGuideContentController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminGuideContentController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminGuideContentController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Shopping Settings Management (쇼핑 설정 관리 - Super Admin)
        Route::prefix('shopping-settings')->group(function () {
            Route::get('/', [AdminShoppingSettingController::class, 'index']);
            Route::get('/{id}', [AdminShoppingSettingController::class, 'show'])->where('id', '[0-9]+');
            Route::post('/', [AdminShoppingSettingController::class, 'store']);
            Route::put('/{id}', [AdminShoppingSettingController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminShoppingSettingController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Email Settings Management (이메일 설정 관리 - Super Admin)
        Route::prefix('email-settings')->group(function () {
            Route::get('/', [AdminEmailSettingController::class, 'show']);
            Route::put('/', [AdminEmailSettingController::class, 'update']);
            Route::post('/test', [AdminEmailSettingController::class, 'sendTestEmail']);
        });

        Route::prefix('email-integration-logs')->group(function () {
            Route::get('/', [AdminEmailIntegrationLogController::class, 'index']);
            Route::get('/{id}', [AdminEmailIntegrationLogController::class, 'show'])->where('id', '[0-9]+');
        });

        // Banner Management (배너 관리 - Super Admin)
        Route::prefix('banners')->group(function () {
            Route::get('/search-filters', [AdminBannerController::class, 'searchFilters']);
            Route::post('/upload-image', [AdminBannerController::class, 'uploadImage']);
            Route::get('/', [AdminBannerController::class, 'index']);
            Route::post('/', [AdminBannerController::class, 'store']);
            Route::get('/{id}', [AdminBannerController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminBannerController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminBannerController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Media Management (미디어 관리 - Super Admin)
        Route::prefix('media')->group(function () {
            Route::get('/', [AdminMediaController::class, 'index']);
            Route::post('/', [AdminMediaController::class, 'store']);
            Route::get('/{id}', [AdminMediaController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminMediaController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminMediaController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Pop-up Management (팝업 관리 - Super Admin)
        Route::prefix('popups')->group(function () {
            Route::get('/search-filters', [AdminPopupController::class, 'searchFilters']);
            Route::post('/upload-image', [AdminPopupController::class, 'uploadImage']);
            Route::get('/', [AdminPopupController::class, 'index']);
            Route::post('/', [AdminPopupController::class, 'store']);
            Route::get('/{id}', [AdminPopupController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPopupController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPopupController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // FAQ Management (FAQ 관리 - Super Admin)
        Route::prefix('faq')->group(function () {
            Route::get('/search-filters', [AdminFaqController::class, 'searchFilters']);
            Route::get('/', [AdminFaqController::class, 'index']);
            Route::post('/', [AdminFaqController::class, 'store']);
            Route::get('/{id}', [AdminFaqController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminFaqController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminFaqController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Portfolio Management (Super Admin)
        Route::prefix('portfolios')->group(function () {
            Route::get('/', [AdminPortfolioController::class, 'index']);
            Route::post('/', [AdminPortfolioController::class, 'store']);
            Route::get('/{id}', [AdminPortfolioController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPortfolioController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPortfolioController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Example Sentence Sample Management (Super Admin)
        Route::prefix('example-sentence-samples')->group(function () {
            Route::get('/', [AdminExampleSentenceSampleController::class, 'index']);
            Route::post('/', [AdminExampleSentenceSampleController::class, 'store']);
            Route::get('/{id}', [AdminExampleSentenceSampleController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminExampleSentenceSampleController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminExampleSentenceSampleController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Access Log Management (접속 로그 관리 - Super Admin)
        Route::prefix('access-logs')->group(function () {
            Route::get('/search-filters', [AdminAccessLogController::class, 'searchFilters']);
            Route::get('/', [AdminAccessLogController::class, 'index']);
        });

        // Task Log Management (작업 로그 관리 - Super Admin)
        Route::prefix('task-logs')->group(function () {
            Route::get('/search-filters', [AdminTaskLogController::class, 'searchFilters']);
            Route::get('/', [AdminTaskLogController::class, 'index']);
            Route::post('/export-excel', [AdminTaskLogController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminTaskLogController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminTaskLogController::class, 'download'])->where('history', '[0-9]+');
        });

        // MES Integration Log Management (MES 연동 로그 관리 - Super Admin)
        Route::prefix('mes-integration-logs')->group(function () {
            Route::get('/dashboard', [AdminMesIntegrationLogController::class, 'dashboard']);
            Route::get('/', [AdminMesIntegrationLogController::class, 'index']);
            Route::get('/{id}', [AdminMesIntegrationLogController::class, 'show'])->where('id', '[0-9]+');
        });

        // Administrator Inquiry Management (관리자 1:1 문의 관리 - Admin only)
        Route::prefix('inquiries')->group(function () {
            // Filter metadata
            Route::get('/search-filters', [AdminInquiryController::class, 'filters']);

            // Upload attachment for inquiry reply
            Route::post('/upload-attachment', [AdminInquiryController::class, 'uploadAttachment']);

            // Inquiry List (1:1 문의 목록)
            Route::get('/', [AdminInquiryController::class, 'index']);

            // Export Excel (must be before /{id})
            Route::post('/export-excel', [AdminInquiryController::class, 'exportExcel']);
            Route::get('/export-excel/{history}/check-progress-status', [AdminInquiryController::class, 'checkExportProgress'])->where('history', '[0-9]+');
            Route::get('/export-excel/{history}/download', [AdminInquiryController::class, 'downloadExport'])->where('history', '[0-9]+');

            // Inquiry Detail (1:1 문의 상세)
            Route::get('/{id}', [AdminInquiryController::class, 'show'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminInquiryController::class, 'destroy'])->where('id', '[0-9]+');

            // Related inquiries, timeline, replies, audit logs, internal memo
            Route::get('/{id}/related', [AdminInquiryController::class, 'related'])->where('id', '[0-9]+');
            Route::get('/{id}/timeline', [AdminInquiryController::class, 'timeline'])->where('id', '[0-9]+');
            Route::get('/{id}/replies', [AdminInquiryController::class, 'replies'])->where('id', '[0-9]+');
            Route::post('/{id}/replies', [AdminInquiryController::class, 'storeReply'])->where('id', '[0-9]+');
            Route::put('/{id}/replies/{reply}', [AdminInquiryController::class, 'updateReply'])->where(['id' => '[0-9]+', 'reply' => '[0-9]+']);
            Route::delete('/{id}/replies/{reply}', [AdminInquiryController::class, 'deleteReply'])->where(['id' => '[0-9]+', 'reply' => '[0-9]+']);
            Route::get('/{id}/audit-logs', [AdminInquiryController::class, 'auditLogs'])->where('id', '[0-9]+');
            Route::get('/{id}/memo', [AdminInquiryController::class, 'memo'])->where('id', '[0-9]+');
            Route::post('/{id}/memo', [AdminInquiryController::class, 'storeMemo'])->where('id', '[0-9]+');

            // Answer / reply to inquiry (register, edit, delete)
            Route::get('/{id}/answer', [AdminInquiryController::class, 'getAnswer'])->where('id', '[0-9]+');
            Route::post('/{id}/answer', [AdminInquiryController::class, 'answer'])->where('id', '[0-9]+');
            Route::put('/{id}/answer', [AdminInquiryController::class, 'updateAnswer'])->where('id', '[0-9]+');
            Route::delete('/{id}/answer', [AdminInquiryController::class, 'deleteAnswer'])->where('id', '[0-9]+');

            // Status update
            Route::post('/{id}/status', [AdminInquiryController::class, 'updateStatus'])->where('id', '[0-9]+');

            // Assign manager
            Route::post('/{id}/assign', [AdminInquiryController::class, 'assign'])->where('id', '[0-9]+');
        });

        // Work Instructions (작업지시서)
        Route::prefix('work-instructions')->group(function () {
            Route::get('/{orderId}/print', [AdminWorkInstructionController::class, 'print'])->where('orderId', '[0-9]+');
            Route::post('/batch-print', [AdminWorkInstructionController::class, 'batchPrint']);
        });

        // Barcode Scanner (바코드 스캐너 - 주문 상태 자동 변경)
        Route::prefix('barcode')->group(function () {
            Route::post('/scan', [AdminBarcodeController::class, 'scan']);
        });
    });
});
