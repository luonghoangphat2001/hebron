<?php

namespace App\Docs\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserResource',
    title: 'User',
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid', example: '01960000-0000-0000-0000-000000000000'),
        new OA\Property(property: 'name', type: 'string', example: '홍길동'),
        new OA\Property(property: 'username', type: 'string', example: 'hong_gildong'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '010-1234-5678'),
        new OA\Property(property: 'role', type: 'string', enum: ['customer', 'admin'], example: 'customer'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2026-03-31T00:00:00.000000Z'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', example: '2026-03-31T00:00:00.000000Z'),
    ]
)]
class UserSchema {}
