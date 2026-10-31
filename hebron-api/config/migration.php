<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cafe24 (Hebron21) Connection
    |--------------------------------------------------------------------------
    */
    'cafe24' => [
        'base_url' => env('HEBRON21_BASE_URL', 'https://hebron21.cafe24api.com/api/v2'),
        'token' => env('HEBRON21_TOKEN'),
        'client_id' => env('HEBRON21_CLIENT_ID'),
        'client_secret' => env('HEBRON21_CLIENT_SECRET'),
        'mall_id' => env('HEBRON21_MALL_ID', 'hebron21'),
        'oauth_token_url' => env('HEBRON21_OAUTH_TOKEN_URL', 'https://hebron21.cafe24api.com/api/v2/oauth/token'),
        'oauth_auth_url' => env('HEBRON21_OAUTH_AUTH_URL', 'https://hebron21.cafe24.com/api/v2/oauth/authorize'),
        'scopes' => env('HEBRON21_OAUTH_SCOPES', 'mall.read_product mall.read_design mall.read_community'),
        'timeout' => env('HEBRON21_TIMEOUT', 30),
        'retry_times' => env('HEBRON21_RETRY_TIMES', 3),
        'retry_sleep_ms' => env('HEBRON21_RETRY_SLEEP_MS', 500),
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        'products' => [
            'limit' => env('MIGRATION_PRODUCTS_LIMIT', 100),
            'max_offset' => env('MIGRATION_PRODUCTS_MAX_OFFSET', 100000),
        ],

        'categories' => [
            'limit' => env('MIGRATION_CATEGORIES_LIMIT', 50),
            'max_offset' => env('MIGRATION_CATEGORIES_MAX_OFFSET', 5000),
        ],

        'inquiries' => [
            'limit' => env('MIGRATION_INQUIRIES_LIMIT', 50),
            'max_offset' => env('MIGRATION_INQUIRIES_MAX_OFFSET', 10000),
            'admin_member' => env('MIGRATION_INQUIRIES_ADMIN_MEMER', 'hebron21'),
            'board_no' => env('MIGRATION_INQUIRIES_BOARD_NO', 9),
        ],

        'faqs' => [
            'limit' => env('MIGRATION_FAQS_LIMIT', 50),
            'max_offset' => env('MIGRATION_FAQS_MAX_OFFSET', 10000),
            'board_no' => env('MIGRATION_FAQS_BOARD_NO', 3),
        ],

        'notices' => [
            'limit' => env('MIGRATION_NOTICES_LIMIT', 50),
            'max_offset' => env('MIGRATION_NOTICES_MAX_OFFSET', 10000),
            'board_no' => env('MIGRATION_NOTICES_BOARD_NO', 1),
        ],

        'portfolios' => [
            'limit' => env('MIGRATION_PORTFOLIOS_LIMIT', 100),
            'max_offset' => env('MIGRATION_PORTFOLIOS_MAX_OFFSET', 8000),
            'board_no' => env('MIGRATION_PORTFOLIOS_BOARD_NO', 8),
        ],

        'example_sentence_samples' => [
            'limit' => env('MIGRATION_EXAMPLE_SENTENCE_SAMPLES_LIMIT', 100),
            'max_offset' => env('MIGRATION_EXAMPLE_SENTENCE_SAMPLES_MAX_OFFSET', 8000),
            'board_no' => env('MIGRATION_EXAMPLE_SENTENCE_SAMPLES_BOARD_NO', 7),
        ],

        'media' => [
            'limit' => env('MIGRATION_MEDIA_LIMIT', 100),
            'max_offset' => env('MIGRATION_MEDIA_MAX_OFFSET', 8000),
            'board_no' => env('MIGRATION_MEDIA_BOARD_NO', 2),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Category migration
    |--------------------------------------------------------------------------
    */
    'categories' => [
        'fetch_translations' => env('MIGRATION_CATEGORIES_FETCH_TRANSLATIONS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('MIGRATION_QUEUE_CONNECTION', null),
        'name' => env('MIGRATION_QUEUE_NAME', 'migrations'),
        'tries' => env('MIGRATION_QUEUE_TRIES', 3),
        'timeout' => env('MIGRATION_QUEUE_TIMEOUT', 120),
        'backoff' => env('MIGRATION_QUEUE_BACKOFF', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Image handling
    |--------------------------------------------------------------------------
    */
    'images' => [
        'enabled' => env('MIGRATION_IMPORT_IMAGES', true),
        'directory' => env('MIGRATION_IMAGES_DIRECTORY', 'products/legacy'),
        'download_timeout' => env('MIGRATION_IMAGES_TIMEOUT', 30),
        'legacy_prefix' => env('MIGRATION_LEGACY_PREFIX', 'https://ecimg.cafe24img.com/pg1598b18874164044/hebron21/web'),
        'public_prefix' => env(
            'APP_URL',
            'http://localhost:8000'
        ) . '/storage/web',
    ],

    /*
    |--------------------------------------------------------------------------
    | Behaviour flags
    |--------------------------------------------------------------------------
    */
    'options' => [
        'import' => env('MIGRATION_IMPORT_OPTIONS', true),
        'import_specifications' => env('MIGRATION_IMPORT_SPECS', true),
    ],

    'dry_run' => env('MIGRATION_DRY_RUN', false),

    'stop_on_error' => env('MIGRATION_STOP_ON_ERROR', false),
];
