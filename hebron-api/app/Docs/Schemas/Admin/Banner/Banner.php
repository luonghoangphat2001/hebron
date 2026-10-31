<?php

namespace App\Docs\Schemas\Admin\Banner;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Banner',
    description: 'Public banner for app (홈/로그인 배너)',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: '홈 메인 배너'),
        new OA\Property(property: 'image_path', type: 'string', description: 'Desktop banner image path (배너 이미지 경로)', example: 'banners/banner1.jpg'),
        new OA\Property(property: 'image_url', type: 'string', description: 'Desktop banner full URL (배너 이미지 전체 경로)', example: 'https://cdn.example.com/storage/banners/banner1.jpg'),
        new OA\Property(property: 'image_path_mobile', type: 'string', nullable: true, description: 'Mobile banner image path (모바일 배너 이미지 경로)', example: 'banners/banner1-mobile.jpg'),
        new OA\Property(property: 'image_url_mobile', type: 'string', nullable: true, description: 'Mobile banner full URL (모바일 배너 이미지 전체 경로)', example: 'https://cdn.example.com/storage/banners/banner1-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, description: 'Link URL (링크 URL)', example: 'https://example.com'),
        new OA\Property(property: 'exposure_location', type: 'string', description: 'Exposure location (노출 위치)', example: 'main'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'erp_option_group_id', type: 'integer', nullable: true, description: 'ERP Option Group ID', example: 12345),
    ]
)]
class Banner {}
