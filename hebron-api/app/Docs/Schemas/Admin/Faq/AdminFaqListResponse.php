<?php

namespace App\Docs\Schemas\Admin\Faq;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFaqListResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string'),
        new OA\Property(property: 'data', type: 'array',
            items: new OA\Items(
                ref: '#/components/schemas/AdminFaqResource'
            )
        ),
        new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse')
    ]
)]
class AdminFaqListResponse {}
