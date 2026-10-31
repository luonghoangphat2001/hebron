<?php

namespace App\Docs\Schemas\Admin\Popup;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminPopupResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Special Offer Banner'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Limited time offer for new customers'),
        new OA\Property(property: 'image_url', type: 'string', example: 'https://cdn.example.com/popups/special-offer.jpg'),
        new OA\Property(property: 'image_url_mobile', type: 'string', nullable: true, example: 'https://cdn.example.com/popups/special-offer-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, example: 'https://example.com/offer'),
        new OA\Property(property: 'exposure_location', type: 'string', enum: ['main', 'login', 'all'], example: 'main'),
        new OA\Property(property: 'display_type', type: 'string', enum: ['modal', 'banner'], example: 'modal'),
        new OA\Property(property: 'display_duration', type: 'integer', nullable: true, example: 7),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class AdminPopupResource {}
