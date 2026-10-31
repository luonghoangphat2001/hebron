<?php

namespace App\Docs\Schemas\Admin\Media;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminMediaUpdateRequest',
    properties: [
        new OA\Property(property: 'site_type', type: 'string', example: 'BRAND_SITE'),
        new OA\Property(property: 'category_id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Updated brand film'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'file_path', type: 'string', nullable: true, example: 'media/updated-company-introduction.jpg'),
        new OA\Property(property: 'thumbnail_path', type: 'string', nullable: true, example: 'media/updated-company-introduction-thumb.jpg'),
        new OA\Property(property: 'url', type: 'string', nullable: true, format: 'uri'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, format: 'uri'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ],
    type: 'object'
)]
class AdminMediaUpdateRequest {}
