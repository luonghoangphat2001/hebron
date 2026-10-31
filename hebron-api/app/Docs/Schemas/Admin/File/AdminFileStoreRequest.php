<?php

namespace App\Docs\Schemas\Admin\File;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFileStoreRequest',
    required: ['file'],
    properties: [
        new OA\Property(property: 'file', type: 'string', format: 'binary'),
        new OA\Property(property: 'type', type: 'string', example: 'banners'),
        new OA\Property(property: 'association_id', type: 'integer', nullable: true, example: 1),
    ]
)]
class AdminFileStoreRequest {}
