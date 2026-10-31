<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;
use App\Http\Resources\Admin\AdminPopupResource;
use App\Http\Requests\Admin\AdminPopupStoreRequest;
use App\Http\Requests\Admin\AdminPopupUpdateRequest;
use App\Http\Requests\Admin\AdminPopupSearchFilterRequest;

#[OA\Tag(name: 'Admin Popups', description: 'Admin pop-up management (Super Admin)')]
class AdminPopupEndpoints
{
    #[OA\Get(
        path: '/api/admin/popups',
        summary: 'List popups',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminPopupListResponse'
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/api/admin/popups',
        summary: 'Store popup',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminPopupStoreRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Created',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminPopupResource'
                )
            ),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/api/admin/popups/{id}',
        summary: 'Show popup',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Popup ID', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminPopupResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse'))
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/api/admin/popups/{id}',
        summary: 'Update popup',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Popup ID', schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                ref: '#/components/schemas/AdminPopupUpdateRequest'
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminPopupResource'
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
            new OA\Response(response: 422, description: 'Validation Error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'))
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/api/admin/popups/{id}',
        summary: 'Delete popup',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Popup ID', schema: new OA\Schema(type: 'integer'))
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

    #[OA\Get(
        path: '/api/admin/popups/search-filters',
        summary: 'Get search filters',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Success',
                content: new OA\JsonContent(
                    ref: '#/components/schemas/AdminPopupSearchFilterResponse'
                )
            )
        ]
    )]
    public function searchFilters() {}

    #[OA\Post(
        path: '/api/admin/popups/upload-image',
        summary: 'Upload popup image',
        tags: ['Admin Popups'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'image', type: 'string', format: 'binary')
                    ])
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
    public function uploadImage() {}
}

