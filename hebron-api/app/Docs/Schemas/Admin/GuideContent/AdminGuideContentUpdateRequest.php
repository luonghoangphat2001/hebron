<?php

namespace App\Docs\Schemas\Admin\GuideContent;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminGuideContentUpdateRequest',
    properties: [
        new OA\Property(property: 'title', type: 'string', example: 'Updated Service Guide'),
        new OA\Property(property: 'content', type: 'string', example: '<p>Updated guide content HTML</p>'),
        new OA\Property(property: 'type', type: 'string', enum: ['guide', 'notice'], example: 'notice'),
        new OA\Property(property: 'attachments', type: 'array', items: new OA\Items(type: 'string'), description: 'Array of file keys from FileAttachment schema'),
        new OA\Property(property: 'is_active', type: 'boolean', example: false),
        new OA\Property(property: 'exposure_target', type: 'string', enum: ['all', 'individual'], example: 'individual'),
        new OA\Property(property: 'exposure_start_date', type: 'string', format: 'date-time', nullable: true, example: '2024-01-15T00:00:00.000000Z'),
        new OA\Property(property: 'exposure_end_date', type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59.000000Z'),
    ]
)]
class AdminGuideContentUpdateRequest {}
