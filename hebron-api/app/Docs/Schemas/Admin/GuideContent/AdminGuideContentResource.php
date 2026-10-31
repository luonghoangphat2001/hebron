<?php

namespace App\Docs\Schemas\Admin\GuideContent;

use OpenApi\Attributes as OA;
use App\Docs\Schemas\FileAttachment;

#[OA\Schema(
    schema: 'AdminGuideContentResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Service Guide'),
        new OA\Property(property: 'content', type: 'string', example: '<p>Guide content HTML</p>'),
        new OA\Property(property: 'type', type: 'string', example: 'guide'),
        new OA\Property(property: 'attachments', type: 'array', items: new OA\Items(ref: '#/components/schemas/FileAttachment')),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'exposure_status', type: 'object', properties: [
            new OA\Property(property: 'value', type: 'string', example: 'exposed'),
            new OA\Property(property: 'label', type: 'string', example: 'Exposed')
        ]),
        new OA\Property(property: 'exposure_target', type: 'string', example: 'all'),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T00:00:00.000000Z'),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59.000000Z'),
        new OA\Property(property: 'author', type: 'object', properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'username', type: 'string', example: 'admin'),
            new OA\Property(property: 'name', type: 'string', example: 'Admin User'),
        ]),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class AdminGuideContentResource {}
