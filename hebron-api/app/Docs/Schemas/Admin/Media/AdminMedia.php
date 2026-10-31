<?php

namespace App\Docs\Schemas\Admin\Media;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminMedia',
    description: 'Media item managed by the admin CMS',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'site_type', type: 'string', example: 'BRAND_SITE'),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 13),
        new OA\Property(property: 'category', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 13),
            new OA\Property(property: 'name', type: 'string', example: 'Press'),
            new OA\Property(property: 'slug', type: 'string', example: 'press'),
        ], type: 'object', nullable: true),
        new OA\Property(property: 'title', type: 'string', example: 'Brand film'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'url', type: 'string', nullable: true, format: 'uri', example: 'https://example.com/storage/media/company-introduction.jpg'),
        new OA\Property(property: 'image_url', type: 'string', nullable: true, format: 'uri', example: 'https://example.com/storage/media/company-introduction-thumb.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, format: 'uri'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ],
    type: 'object'
)]
class AdminMedia {}
