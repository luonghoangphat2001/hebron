<?php

namespace App\Docs\Schemas\Admin\Faq;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFaqResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'question', type: 'string', example: 'How do I reset my password?'),
        new OA\Property(property: 'answer', type: 'string', example: 'You can reset your password by following these steps: ...'),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'category_name', type: 'string', nullable: true, example: 'Login'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class AdminFaqResource {}
