<?php

namespace App\Docs\Schemas\Admin\GuideContent;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminGuideContentListResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'guide_contents', type: 'array',
                items: new OA\Items(
                    ref: '#/components/schemas/AdminGuideContentResource'
                )
            ),
            new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse')
        ])
    ]
)]
class AdminGuideContentListResponse {}
