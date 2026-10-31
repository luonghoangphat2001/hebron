<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;


// MyPage Payments
#[OA\Post(
    path: '/api/admin/payments/bulk-approve',
    summary: 'Bulk approve payments (Admin)',
    security: [['sanctum' => []]],
    tags: ['Admin Payments'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully approved payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully approved 5 payments'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'approved_count', type: 'integer', example: 5),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 403, description: 'Forbidden (not admin)', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Post(
    path: '/api/admin/payments/bulk-reject',
    summary: 'Bulk reject payments (Admin)',
    security: [['sanctum' => []]],
    tags: ['Admin Payments'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully rejected payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully rejected 3 payments'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'rejected_count', type: 'integer', example: 3),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 403, description: 'Forbidden (not admin)', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
class AdminPaymentEndpoints {}
