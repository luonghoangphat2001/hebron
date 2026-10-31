<?php

namespace App\Docs\Endpoints\MyPage;

use OpenApi\Attributes as OA;
use App\Http\Resources\FaqResource;
use App\Docs\Schemas\PaginationResponse;

#[OA\Tag(name: 'MyPage', description: 'MyPage profile management')]
class MyPageFaqEndpoints
{
    #[OA\Get(
        path: '/api/mypage/faqs',
        summary: 'List mypage FAQs',
        tags: ['MyPage'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'faqs', type: 'array', items: new OA\Items(ref: '#/components/schemas/FaqResource')),
                            new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse'),
                        ]),
                    ]
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Get(
        path: '/api/mypage/faqs/{id}',
        summary: 'Show mypage FAQ',
        tags: ['MyPage'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'FAQ ID', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', properties: [
                            new OA\Property(property: 'faq', ref: '#/components/schemas/FaqResource'),
                        ], type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ]
    )]
    public function show() {}

    #[OA\Get(
        path: '/api/mypage/faqs/category-counts',
        summary: 'Get FAQ category counts',
        tags: ['MyPage'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'category_counts', type: 'array', items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'category_id', type: 'integer', example: 1),
                                    new OA\Property(property: 'category_name', type: 'string', example: 'Login'),
                                    new OA\Property(property: 'count', type: 'integer', example: 5),
                                ]
                            )),
                        ]),
                    ]
                )
            )
        ]
    )]
    public function categoryCounts() {}
}
