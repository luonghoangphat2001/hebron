<?php

namespace App\Docs\Schemas\Admin\Banner;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminBannerStoreRequest',
    required: ['name', 'exposure_location'],
    properties: [
        new OA\Property(property: 'name', type: 'string', example: '홈 메인 배너'),
        new OA\Property(property: 'image_path', type: 'string', example: 'banners/banner1.jpg'),
        new OA\Property(property: 'image_path_mobile', type: 'string', nullable: true, example: 'banners/banner1-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, example: 'https://example.com'),
        new OA\Property(property: 'exposure_location', type: 'string', example: 'main'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'erp_option_group_id', type: 'integer', nullable: true, example: 12345),
    ]
)]
class AdminBannerStoreRequest {}
