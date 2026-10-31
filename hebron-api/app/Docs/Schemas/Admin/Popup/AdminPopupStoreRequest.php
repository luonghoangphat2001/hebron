<?php

namespace App\Docs\Schemas\Admin\Popup;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminPopupStoreRequest',
    required: [
        'name',
        'exposure_location',
        'image'
    ],
    properties: [
        new OA\Property(property: 'name', type: 'string', example: 'Special Offer Banner'),
        new OA\Property(property: 'description', type: 'string', nullable: true, example: 'Limited time offer for new customers'),
        new OA\Property(property: 'image', type: 'string', example: '/popups/special-offer.jpg'),
        new OA\Property(property: 'image_mobile', type: 'string', nullable: true, example: '/popups/special-offer-mobile.jpg'),
        new OA\Property(property: 'link_url', type: 'string', nullable: true, example: 'https://example.com/offer'),
        new OA\Property(property: 'exposure_location', type: 'string', enum: ['main', 'login', 'all'], example: 'main'),
        new OA\Property(property: 'display_type', type: 'string', enum: ['modal', 'banner'], example: 'modal'),
        new OA\Property(property: 'display_duration', type: 'integer', nullable: true, example: 7, description: 'Number of days the popup should be displayed'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ]
)]
class AdminPopupStoreRequest {}
