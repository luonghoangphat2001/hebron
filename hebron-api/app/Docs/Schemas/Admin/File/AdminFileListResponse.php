<?php

namespace App\Docs\Schemas\Admin\File;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFileListResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string'),
        new OA\Property(property: 'data', type: 'object', properties: [
            new OA\Property(property: 'files', type: 'array',
                items: new OA\Items(
                    ref: '#/components/schemas/AdminFileResource'
                )
            ),
            new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse')
        ])
    ]
)]
class AdminFileListResponse {}
