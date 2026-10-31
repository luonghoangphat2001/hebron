<?php

namespace App\Docs\Schemas\Admin\Banner;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminBannerUpdateRequest',
    properties: [
        new OA\Property(property: 'name', type: 'string', example: '업데이트된 메인 배너'),
        new OA\Property(property: 'image_path', type: 'string', example: 'banners/updated-banner.jpg'),
        new OA\Property(property: 'image_path_mobile', type: 'string', nullable: true, example: 'banners/updated-banner-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, example: 'https://updated.example.com'),
        new OA\Property(property: 'exposure_location', type: 'string', example: 'main'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 2),
        new OA\Property(property: 'is_active', type: 'boolean', example: false),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'erp_option_group_id', type: 'integer', nullable: true, example: 54321),
    ]
)]
class AdminBannerUpdateRequest {}
