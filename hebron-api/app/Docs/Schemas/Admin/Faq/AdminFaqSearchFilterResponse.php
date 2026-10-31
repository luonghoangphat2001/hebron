<?php

namespace App\Docs\Schemas\Admin\Faq;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFaqSearchFilterResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'categories', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'integer', example: 1),
                    new OA\Property(property: 'label', type: 'string', example: 'Login')
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
class AdminFaqSearchFilterResponse {}
