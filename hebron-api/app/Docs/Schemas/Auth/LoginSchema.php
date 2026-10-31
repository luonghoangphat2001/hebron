<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'LoginSchema',
    required: ['login', 'password'],
    properties: [
        new OA\Property(property: 'login', type: 'string', example: 'user@example.com', description: 'Email or username'),
        new OA\Property(property: 'password', type: 'string', example: 'password123'),
    ]
)]
class LoginSchema {}
