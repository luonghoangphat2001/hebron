<?php

namespace App\Docs\Schemas\Admin\File;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFileSearchFilterResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'types', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'banners'),
                    new OA\Property(property: 'label', type: 'string', example: 'Banners')
                ]
            )),
            new OA\Property(property: 'statuses', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'boolean', example: true),
                    new OA\Property(property: 'label', type: 'string', example: 'Active')
                ]
            ))
        ], type: 'object')
    ]
)]
class AdminFileSearchFilterResponse {}
