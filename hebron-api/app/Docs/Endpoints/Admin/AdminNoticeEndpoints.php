<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;
use App\Http\Resources\Admin\AdminNoticeResource;
use App\Http\Requests\Admin\AdminNoticeStoreRequest;
use App\Http\Requests\Admin\AdminNoticeUpdateRequest;
use App\Http\Requests\Admin\AdminNoticeSearchFilterRequest;
use App\Docs\Schemas\FileAttachment;

#[OA\Tag(name: 'Admin Notices', description: 'Admin notice management (Super Admin)')]
class AdminNoticeEndpoints
{
    #[OA\Get(
        path: '/api/admin/notices/search-filters',
        summary: 'Get search filters',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminNoticeSearchFilterResponse'
                )
            )
        ]
    )]
    public function searchFilters() {}

    #[OA\Post(
        path: '/api/admin/notices/upload-attachment',
        summary: 'Upload attachment',
        tags: ['Admin Notices'],
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
        path: '/api/admin/notices',
        summary: 'List notices',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminNoticeListResponse'
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/api/admin/notices',
        summary: 'Store notice',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminNoticeStoreRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminNoticeResource'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/api/admin/notices/{id}',
        summary: 'Show notice',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Notice ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminNoticeResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/api/admin/notices/{id}',
        summary: 'Update notice',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Notice ID', schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminNoticeUpdateRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminNoticeResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/api/admin/notices/{id}',
        summary: 'Delete notice',
        tags: ['Admin Notices'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Notice ID', schema: new OA\Schema(type: 'integer'))
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
