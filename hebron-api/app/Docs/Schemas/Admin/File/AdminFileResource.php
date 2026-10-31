<?php

namespace App\Docs\Schemas\Admin\File;

use OpenApi\Attributes as OA;
use App\Docs\Schemas\FileAttachment;

#[OA\Schema(
    schema: 'AdminFileResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'document.pdf'),
        new OA\Property(property: 'path', type: 'string', example: 'files/document.pdf'),
        new OA\Property(property: 'url', type: 'string', example: 'https://cdn.example.com/storage/files/document.pdf'),
        new OA\Property(property: 'type', type: 'string', example: 'guides'),
        new OA\Property(property: 'mime_type', type: 'string', nullable: true, example: 'application/pdf'),
        new OA\Property(property: 'size', type: 'integer', nullable: true, example: 1024567),
        new OA\Property(property: 'association', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'name', type: 'string', example: 'Service Guide'),
        ]),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class AdminFileResource {}
