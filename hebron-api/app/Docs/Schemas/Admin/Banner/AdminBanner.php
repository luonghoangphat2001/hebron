<?php

namespace App\Docs\Schemas\Admin\Banner;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminBanner',
    description: 'Admin view of a banner in Banner Management (배너 관리 - Banner List)',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: '메인 배너 1'),
        new OA\Property(property: 'image_path', type: 'string', description: 'Banner image path (배너 이미지 경로)', example: '/storage/banners/banner1.jpg'),
        new OA\Property(property: 'image_path_mobile', type: 'string', nullable: true, description: 'Mobile banner image path (모바일 배너 이미지 경로)', example: '/storage/banners/banner1-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, description: 'Link URL (링크 URL)', example: 'https://example.com'),
        new OA\Property(property: 'exposure_location', type: 'string', description: 'Exposure location (노출 위치)', example: 'main'),
        new OA\Property(
            property: 'exposure_target',
            description: 'Exposure target (노출 대상). String "all" or array of customer IDs. - Use "all" or [] or null for all customers. - Use [1, 2, 3] for specific customers. Values = customers.id from GET /api/admin/customers.',
            oneOf: [
                new OA\Schema(type: 'string', example: 'all'),
                new OA\Schema(type: 'array', items: new OA\Items(type: 'integer'), example: [1, 2, 3]),
            ]
        ),
        new OA\Property(
            property: 'status',
            type: 'object',
            properties: [
                new OA\Property(property: 'value', type: 'string', enum: ['exposed', 'non-exposed'], example: 'exposed'),
                new OA\Property(property: 'label', type: 'string', example: 'Exposed'),
            ]
        ),
        new OA\Property(property: 'sort_order', type: 'integer', description: 'Sort order for display (정렬 순서)', example: 1),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true, example: '2025-01-01 00:00:00'),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true, example: '2025-12-31 23:59:59'),
        new OA\Property(
            property: 'registrant',
            type: 'object',
            nullable: true,
            description: 'User who created this banner (등록자)',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'username', type: 'string', example: 'admin'),
                new OA\Property(property: 'name', type: 'string', example: 'Admin User'),
            ]
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000000Z'),
    ]
)]
class AdminBanner {}
