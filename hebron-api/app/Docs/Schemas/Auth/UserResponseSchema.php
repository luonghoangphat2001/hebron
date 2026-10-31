<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserResponseSchema',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: '홍길동'),
        new OA\Property(property: 'username', type: 'string', example: 'hong_gildong'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '010-1234-5678'),
        new OA\Property(property: 'mobile', type: 'string', nullable: true, example: '010-1234-5678'),
        new OA\Property(property: 'status', type: 'object', properties: [
            new OA\Property(property: 'value', type: 'string', example: 'active'),
            new OA\Property(property: 'label', type: 'string', example: 'Active'),
        ]),
        new OA\Property(property: 'authority', type: 'object', properties: [
            new OA\Property(property: 'value', type: 'string', example: 'user'),
            new OA\Property(property: 'label', type: 'string', example: 'User'),
        ]),
        new OA\Property(property: 'member_type', type: 'string', enum: ['individual', 'business'], example: 'individual'),
        new OA\Property(property: 'profile_image_url', type: 'string', nullable: true, example: 'https://cdn.example.com/storage/avatars/user1.jpg'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000000Z'),
    ]
)]
class UserResponseSchema {}
