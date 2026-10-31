<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;
use App\Http\Resources\UserResource;

#[OA\Schema(
    schema: 'TokenResponseSchema',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'token', type: 'string', example: '1|abc123...'),
            new OA\Property(property: 'user', ref: '#/components/schemas/UserResource'),
            new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
            new OA\Property(property: 'refresh_token', type: 'string', example: 'def456...'),
            new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
            new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
            new OA\Property(property: 'refresh_expires_in', type: 'integer', example: 2592000),
        ], type: 'object'),
    ]
)]
class TokenResponseSchema {}
