<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'RegisterSchema',
    required: ['name', 'username', 'email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'name', type: 'string', example: '홍길동'),
        new OA\Property(property: 'username', type: 'string', example: 'hong_gildong', description: 'Lowercase letters, numbers and underscores only'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'password123'),
        new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '010-1234-5678'),
    ]
)]
class RegisterSchema {}
