<?php

return [
    'queue' => env('EXPORT_QUEUE_NAME', 'export'),
    'tries' => (int) env('EXPORT_JOB_TRIES', 1),
    'timeout' => (int) env('EXPORT_JOB_TIMEOUT', 900),
    'stuck_after_minutes' => (int) env('EXPORT_STUCK_AFTER_MINUTES', 30),
    'max_per_page' => (int) env('ORDER_HISTORY_MAX_PER_PAGE', 100),
    'mypage_order_history' => [
        'path' => 'exports/mypage-order-history',
        'filename_prefix' => 'order-history',
        'random_suffix_length' => 8,
    ],
];
