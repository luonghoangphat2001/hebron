<?php

namespace App\Docs\Schemas\Admin\Notice;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminNoticeResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Important Announcement'),
        new OA\Property(property: 'content', type: 'string', example: 'This is the content of the announcement.'),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'category_name', type: 'string', nullable: true, example: 'General'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'exposure_location', type: 'string', example: 'main'),
        new OA\Property(property: 'exposure_status', type: 'object', properties: [
            new OA\Property(property: 'value', type: 'string', example: 'exposed'),
            new OA\Property(property: 'label', type: 'string', example: 'Exposed')
        ]),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T00:00:00.000000Z'),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59.000000Z'),
        new OA\Property(property: 'author', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'username', type: 'string', example: 'admin'),
            new OA\Property(property: 'name', type: 'string', example: 'Admin User'),
            new OA\Property(property: 'email', type: 'string', example: 'admin@example.com')
        ]),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class AdminNoticeResource {}
