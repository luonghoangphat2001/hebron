<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Admin Files', description: 'Admin file management (Super Admin)')]
class AdminFileEndpoints
{
    #[OA\Get(
        path: '/api/admin/files/search-filters',
        summary: 'Get search filters',
        tags: ['Admin Files'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFileSearchFilterResponse'
                )
            )
        ]
    )]
    public function searchFilters() {}

    #[OA\Get(
        path: '/api/admin/files',
        summary: 'List files',
        tags: ['Admin Files'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFileListResponse'
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/api/admin/files',
        summary: 'Upload file',
        tags: ['Admin Files'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'file', type: 'string', format: 'binary'),
                        new OA\Property(property: 'type', type: 'string', description: 'File type (e.g. product/ai, banners, etc.)', example: 'product/ai'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFileResource'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function upload() {}

    #[OA\Get(
        path: '/api/admin/files/{id}',
        summary: 'Show file',
        tags: ['Admin Files'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'File ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminFileResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function show() {}
}
