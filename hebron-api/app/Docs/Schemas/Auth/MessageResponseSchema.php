<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'MessageResponseSchema',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'message', type: 'string', example: 'Logged out successfully'),
        ], type: 'object'),
    ]
)]
class MessageResponseSchema {}
