<?php

namespace App\Docs\Schemas\Admin\Popup;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminPopupSearchFilterResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'exposure_locations', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'main'),
                    new OA\Property(property: 'label', type: 'string', example: 'Main Page')
                ]
            )),
            new OA\Property(property: 'display_types', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'modal'),
                    new OA\Property(property: 'label', type: 'string', example: 'Modal')
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
class AdminPopupSearchFilterResponse {}
