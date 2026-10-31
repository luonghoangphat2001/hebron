<?php

namespace App\Docs\Schemas\Admin\File;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFileSearchFilterRequest',
    properties: [
        new OA\Property(property: 'types', type: 'array', items: new OA\Items(type: 'string'), example: ['banners', 'guides']),
        new OA\Property(property: 'statuses', type: 'array', items: new OA\Items(
            type: 'object',
            properties: [
                new OA\Property(property: 'value', type: 'string', example: 'active'),
                new OA\Property(property: 'label', type: 'string', example: 'Active')
            ]
        ))
    ]
)]
class AdminFileSearchFilterRequest {}
