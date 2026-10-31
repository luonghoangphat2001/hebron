<?php

namespace App\Docs\Schemas\Admin\Notice;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminNoticeStoreRequest',
    required: ['title', 'content'],
    properties: [
        new OA\Property(property: 'title', type: 'string', example: 'Important Announcement'),
        new OA\Property(property: 'content', type: 'string', example: 'This is the content of the announcement.'),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'exposure_location', type: 'string', enum: ['main', 'login', 'all'], example: 'main'),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T00:00:00.000000Z'),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59.000000Z'),
    ]
)]
class AdminNoticeStoreRequest {}
