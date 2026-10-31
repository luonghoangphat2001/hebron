<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'VerifyVerificationCodeSchema',
    required: ['phone', 'code'],
    properties: [
        new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
        new OA\Property(property: 'code', type: 'string', example: '123456'),
    ]
)]
class VerifyVerificationCodeSchema {}
