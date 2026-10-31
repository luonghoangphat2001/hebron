<?php

namespace App\Docs\Schemas\Admin\GuideContent;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminGuideContentSearchFilterResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'types', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'guide'),
                    new OA\Property(property: 'label', type: 'string', example: 'Guide')
                ]
            )),
            new OA\Property(property: 'exposure_statuses', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'string', example: 'exposed'),
                    new OA\Property(property: 'label', type: 'string', example: 'Exposed')
                ]
            )),
            new OA\Property(property: 'active_options', type: 'array', items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'value', type: 'boolean', example: true),
                    new OA\Property(property: 'label', type: 'string', example: 'Active')
                ]
            ))
        ], type: 'object')
    ]
)]
class AdminGuideContentSearchFilterResponse {}
