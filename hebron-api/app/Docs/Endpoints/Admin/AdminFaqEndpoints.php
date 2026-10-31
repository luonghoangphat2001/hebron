<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;
use App\Http\Resources\Admin\AdminFaqResource;
use App\Http\Requests\Admin\AdminFaqStoreRequest;
use App\Http\Requests\Admin\AdminFaqUpdateRequest;
use App\Http\Requests\Admin\AdminFaqSearchFilterRequest;

#[OA\Tag(name: 'Admin FAQs', description: 'Admin FAQ management (Super Admin)')]
class AdminFaqEndpoints
{
    #[OA\Get(
        path: '/api/admin/faqs/search-filters',
        summary: 'Get search filters',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFaqSearchFilterResponse'
                )
            )
        ]
    )]
    public function searchFilters() {}

    #[OA\Get(
        path: '/api/admin/faqs',
        summary: 'List FAQs',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFaqListResponse'
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/api/admin/faqs',
        summary: 'Store FAQ',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminFaqStoreRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFaqResource'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/api/admin/faqs/{id}',
        summary: 'Show FAQ',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'FAQ ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFaqResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/api/admin/faqs/{id}',
        summary: 'Update FAQ',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'FAQ ID', schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminFaqUpdateRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFaqResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/api/admin/faqs/{id}',
        summary: 'Delete FAQ',
        tags: ['Admin FAQs'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'FAQ ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 204,
                description: 'No Content'
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function destroy() {}
}
