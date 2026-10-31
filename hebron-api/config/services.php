<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID'),
        'auth_token' => env('TWILIO_AUTH_TOKEN'),
        'from_number' => env('TWILIO_FROM_NUMBER'),
    ],

    'kakao' => [
        'client_id' => env('KAKAO_CLIENT_ID'),
        'client_secret' => env('KAKAO_CLIENT_SECRET'),
        'redirect' => env('KAKAO_REDIRECT_URI'),
        'rest_api_key' => env('KAKAO_REST_API_KEY'),
    ],

    'naver' => [
        'client_id' => env('NAVER_CLIENT_ID'),
        'client_secret' => env('NAVER_CLIENT_SECRET'),
        'redirect' => env('NAVER_REDIRECT_URI'),
    ],

    'mes' => [
        'base_url' => env('MES_BASE_URL', 'http://test-hebron.happyai.co.kr'),
        'timeout' => env('MES_TIMEOUT', 30),
        'sid' => env('MES_SID', 'withaward'),
        'stock_sync_enabled' => filter_var(env('MES_STOCK_SYNC_ENABLED', true), FILTER_VALIDATE_BOOLEAN),
    ],

    'toss' => [
        'client_key' => env('TOSS_CLIENT_KEY'),
        'secret_key' => env('TOSS_SECRET_KEY'),
        'base_url' => env('TOSS_BASE_URL', 'https://api.tosspayments.com'),
        'timeout' => (int) env('TOSS_TIMEOUT', 30),
    ],

    'aligo' => [
        'api_key' => env('ALIGO_API_KEY'),
        'user_id' => env('ALIGO_USER_ID'),
        'sender_number' => env('ALIGO_SENDER_NUMBER'),
        'sms_enabled' => env('ALIGO_SMS_ENABLED', false),
        'test_mode' => env('ALIGO_TEST_MODE', false),
        'base_url' => env('ALIGO_BASE_URL', 'https://kakaoapi.aligo.in'),
        'sender_key' => env('ALIGO_SENDER_KEY'),
        'inquiry_reply_guest_template' => env('ALIGO_INQUIRY_REPLY_GUEST_TEMPLATE'),
        'inquiry_reply_member_template' => env('ALIGO_INQUIRY_REPLY_MEMBER_TEMPLATE'),
        'inquiry_shop_names' => [
            'BRAND_SITE' => env('ALIGO_BRAND_SHOP_NAME', env('APP_NAME', 'Hebron')),
            'PLAIN_SITE' => env('ALIGO_PLAIN_SHOP_NAME', env('APP_NAME', 'Hebron')),
            'SHOPPING_MALL' => env('ALIGO_SHOPPING_MALL_NAME', env('APP_NAME', 'Hebron')),
            'default' => env('APP_NAME', 'Hebron'),
        ],
    ],

    'sweettracker' => [
        'info_base_url' => env('SWEETTRACKER_INFO_BASE_URL', 'https://info.sweettracker.co.kr'),
        // SweetTracker documents {host}; production host is supplied per contract.
        'trace_base_url' => env('SWEETTRACKER_TRACE_BASE_URL'),
        'api_key' => env('SWEETTRACKER_API_KEY'),
        'tier' => env('SWEETTRACKER_TIER'),
        'key' => env('SWEETTRACKER_KEY'),
        'webhook_secret' => env('SWEETTRACKER_WEBHOOK_SECRET', ''),
        'timeout' => (int) env('SWEETTRACKER_TIMEOUT', 15),
        'company_list_path' => env('SWEETTRACKER_COMPANY_LIST_PATH', '/api/v1/companylist'),
        'tracking_info_path' => env('SWEETTRACKER_TRACKING_INFO_PATH', '/api/v1/trackingInfo'),
        'poll_interval_minutes' => max(1, min(59, (int) env('SWEETTRACKER_POLL_INTERVAL_MINUTES', 30))),
        'register_path' => env('SWEETTRACKER_REGISTER_PATH', '/add_invoice'),
        'webhook_path' => env('SWEETTRACKER_WEBHOOK_PATH', '/api/webhooks/sweettracker/tracking'),
    ],

    'cache' => [
        'admin_page_ttl' => env('ADMIN_PAGE_CACHE_TTL', 3600),
        'page_ttl' => env('PAGE_CACHE_TTL', 3600),
        'category_ttl' => env('CATEGORY_CACHE_TTL', 7200),
        'banner_ttl' => env('BANNER_CACHE_TTL', 3600),
        'faq_ttl' => env('FAQ_CACHE_TTL', 3600),
        'notice_ttl' => env('NOTICE_CACHE_TTL', 3600),
        'shopping_setting_ttl' => env('SHOPPING_SETTING_CACHE_TTL', 86400),
    ],
];
