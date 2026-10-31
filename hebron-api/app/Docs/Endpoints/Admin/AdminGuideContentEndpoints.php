<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;
use App\Http\Resources\Admin\AdminGuideContentResource;
use App\Http\Requests\Admin\AdminGuideContentStoreRequest;
use App\Http\Requests\Admin\AdminGuideContentUpdateRequest;
use App\Http\Requests\Admin\AdminGuideContentSearchFilterRequest;
use App\Docs\Schemas\FileAttachment;

#[OA\Tag(name: 'Admin Guide Contents', description: 'Admin guide content management (Super Admin)')]
class AdminGuideContentEndpoints
{
    #[OA\Get(
        path: '/api/admin/guide-contents/search-filters',
        summary: 'Get search filters',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminGuideContentSearchFilterResponse'
                )
            )
        ]
    )]
    public function searchFilters() {}

    #[OA\Post(
        path: '/api/admin/guide-contents/upload-attachment',
        summary: 'Upload attachment',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'file', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/FileAttachment'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function uploadAttachment() {}

    #[OA\Get(
        path: '/api/admin/guide-contents',
        summary: 'List guide contents',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminGuideContentListResponse'
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/api/admin/guide-contents',
        summary: 'Store guide content',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminGuideContentStoreRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminGuideContentResource'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/api/admin/guide-contents/{id}',
        summary: 'Show guide content',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Guide Content ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminGuideContentResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/api/admin/guide-contents/{id}',
        summary: 'Update guide content',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Guide Content ID', schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminGuideContentUpdateRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminGuideContentResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/api/admin/guide-contents/{id}',
        summary: 'Delete guide content',
        tags: ['Admin Guide Contents'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Guide Content ID', schema: new OA\Schema(type: 'integer'))
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
