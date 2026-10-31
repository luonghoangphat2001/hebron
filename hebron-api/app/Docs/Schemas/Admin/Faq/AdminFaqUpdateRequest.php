<?php

namespace App\Docs\Schemas\Admin\Faq;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFaqUpdateRequest',
    properties: [
        new OA\Property(property: 'question', type: 'string', example: 'How do I reset my password? (Updated)'),
        new OA\Property(property: 'answer', type: 'string', example: 'You can reset your password by following these updated steps: ...'),
        new OA\Property(property: 'category', type: 'string', example: 'order'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 2),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ]
)]
class AdminFaqUpdateRequest {}
