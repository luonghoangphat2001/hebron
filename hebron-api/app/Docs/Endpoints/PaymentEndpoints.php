<?php

namespace App\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/payments/pending',
    summary: 'Get pending payments for the current user',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved pending payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully retrieved pending payments'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'payments',
                                type: 'array',
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: 'transaction_id', type: 'string', example: 't_12345abcde'),
                                        new OA\Property(property: 'payment_method', type: 'string', example: 'card'),
                                        new OA\Property(property: 'status', type: 'string', example: 'pending'),
                                        new OA\Property(property: 'amount', type: 'integer', example: 25000),
                                        new OA\Property(property: 'currency', type: 'string', example: 'KRW'),
                                        new OA\Property(property: 'pg_name', type: 'string', nullable: true, example: 'TossPay'),
                                        new OA\Property(property: 'card_name', type: 'string', nullable: true, example: '국민카드'),
                                        new OA\Property(property: 'card_number', type: 'string', nullable: true, example: '1234-****-****-5678'),
                                        new OA\Property(property: 'paid_at', type: 'string', format: 'date-time', nullable: true),
                                        new OA\Property(property: 'failed_at', type: 'string', format: 'date-time', nullable: true),
                                    ]
                                )
                            ),
                            new OA\Property(property: 'total', type: 'integer', example: 10),
                            new OA\Property(property: 'per_page', type: 'integer', example: 15),
                            new OA\Property(property: 'current_page', type: 'integer', example: 1),
                            new OA\Property(property: 'last_page', type: 'integer', example: 1),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Get(
    path: '/api/payments/completed',
    summary: 'Get completed payments for the current user',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved completed payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully retrieved completed payments'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'payments',
                                type: 'array',
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: 'transaction_id', type: 'string', example: 't_12345abcde'),
                                        new OA\Property(property: 'payment_method', type: 'string', example: 'card'),
                                        new OA\Property(property: 'status', type: 'string', example: 'completed'),
                                        new OA\Property(property: 'amount', type: 'integer', example: 25000),
                                        new OA\Property(property: 'currency', type: 'string', example: 'KRW'),
                                    ]
                                )
                            ),
                            new OA\Property(property: 'total', type: 'integer', example: 10),
                            new OA\Property(property: 'per_page', type: 'integer', example: 15),
                            new OA\Property(property: 'current_page', type: 'integer', example: 1),
                            new OA\Property(property: 'last_page', type: 'integer', example: 1),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Get(
    path: '/api/payments/failed',
    summary: 'Get failed/cancelled payments for the current user',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved failed payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'payments',
                                type: 'array',
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: 'transaction_id', type: 'string', example: 't_12345abcde'),
                                        new OA\Property(property: 'payment_method', type: 'string', example: 'card'),
                                        new OA\Property(property: 'status', type: 'string', example: 'failed'),
                                        new OA\Property(property: 'amount', type: 'integer', example: 25000),
                                        new OA\Property(property: 'currency', type: 'string', example: 'KRW'),
                                    ]
                                )
                            ),
                            new OA\Property(property: 'total', type: 'integer', example: 10),
                            new OA\Property(property: 'per_page', type: 'integer', example: 15),
                            new OA\Property(property: 'current_page', type: 'integer', example: 1),
                            new OA\Property(property: 'last_page', type: 'integer', example: 1),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Get(
    path: '/api/payments',
    summary: 'Get all payments for the current user',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved payments',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'payments',
                                type: 'array',
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: 'transaction_id', type: 'string', example: 't_12345abcde'),
                                        new OA\Property(property: 'payment_method', type: 'string', example: 'card'),
                                        new OA\Property(property: 'status', type: 'string', example: 'pending'),
                                        new OA\Property(property: 'amount', type: 'integer', example: 25000),
                                        new OA\Property(property: 'currency', type: 'string', example: 'KRW'),
                                    ]
                                )
                            ),
                            new OA\Property(property: 'total', type: 'integer', example: 10),
                            new OA\Property(property: 'per_page', type: 'integer', example: 15),
                            new OA\Property(property: 'current_page', type: 'integer', example: 1),
                            new OA\Property(property: 'last_page', type: 'integer', example: 1),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Get(
    path: '/api/payments/{transactionId}',
    summary: 'Get payment detail for the current user',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'transactionId', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'txn_12345')),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved payment detail',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully retrieved payment detail'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'transaction_id', type: 'string', example: 't_12345abcde'),
                            new OA\Property(property: 'payment_method', type: 'string', example: 'card'),
                            new OA\Property(property: 'status', type: 'string', example: 'completed'),
                            new OA\Property(property: 'amount', type: 'integer', example: 25000),
                            new OA\Property(property: 'currency', type: 'string', example: 'KRW'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Payment not found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Get(
    path: '/api/payments/order-progress/{orderNumber}',
    summary: 'Get payment progress list for a specific order',
    security: [['sanctum' => []]],
    tags: ['Payments'],
    parameters: [
        new OA\Parameter(name: 'orderNumber', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'ORD-20240301-001')),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Successfully retrieved payment progress',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Successfully retrieved payment progress'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'order_number', type: 'string', example: 'ORD-20240301-001'),
                            new OA\Property(
                                property: 'payments',
                                type: 'array',
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: 'id', type: 'integer', example: 1),
                                        new OA\Property(property: 'status', type: 'string', example: 'pending'),
                                        new OA\Property(property: 'amount', type: 'integer', example: 10000),
                                    ]
                                )
                            ),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Payment progress not available', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
class PaymentEndpoints {}
