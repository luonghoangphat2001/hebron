<?php

namespace App\Docs\Schemas\Admin\Faq;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'AdminFaqStoreRequest',
    required: ['category', 'question', 'answer'],
    properties: [
        new OA\Property(property: 'question', type: 'string', example: 'How do I reset my password?'),
        new OA\Property(property: 'answer', type: 'string', example: 'You can reset your password by following these steps: ...'),
        new OA\Property(property: 'category', type: 'string', example: 'order'),
        new OA\Property(property: 'sort_order', type: 'integer', example: 1),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ]
)]
class AdminFaqStoreRequest {}
