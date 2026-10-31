<?php

namespace App\Docs\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'ErrorResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: false),
        new OA\Property(property: 'message', type: 'string', example: 'An error occurred.'),
        new OA\Property(property: 'error', type: 'string', nullable: true, example: 'Specific error message'),
        new OA\Property(property: 'errors', type: 'object', nullable: true, description: 'Detailed validation errors'),
        new OA\Property(property: 'error_code', type: 'string', nullable: true, description: 'Custom error code', example: 'ERR001'),
    ]
)]
class ErrorResponse {}
