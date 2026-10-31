<?php

namespace App\Docs\Schemas\Auth;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'SendVerificationCodeSchema',
    required: ['phone'],
    properties: [
        new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
    ]
)]
class SendVerificationCodeSchema {}
