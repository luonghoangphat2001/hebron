<?php

namespace App\Docs\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'FaqResource',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'question', type: 'string', example: 'How do I reset my password?'),
        new OA\Property(property: 'answer', type: 'string', example: 'You can reset your password by following these steps: ...'),
        new OA\Property(property: 'category_id', type: 'integer', example: 1),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class FaqResource {}
