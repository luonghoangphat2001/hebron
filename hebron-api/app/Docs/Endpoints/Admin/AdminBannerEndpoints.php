<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;

#[OA\Get(
    path: '/api/admin/banners',
    summary: '배너 목록 (Banner List)',
    description: 'View all banners with search filters (Super Admin 전용)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    parameters: [
        new OA\Parameter(name: 'banner_name', in: 'query', required: false, description: 'Banner name (배너명)', schema: new OA\Schema(type: 'string', example: '메인')),
        new OA\Parameter(name: 'exposure_location', in: 'query', required: false, description: 'Exposure location (노출 위치)', schema: new OA\Schema(type: 'string', example: 'main')),
        new OA\Parameter(name: 'site_type', in: 'query', required: false, description: 'Site type (사이트 구분)', schema: new OA\Schema(type: 'string', enum: ['SHOPPING_MALL', 'BRAND_SITE', 'PLAIN_SITE'])),
        new OA\Parameter(name: 'page_type', in: 'query', required: false, description: 'Page type (페이지 구분)', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'status', in: 'query', required: false, description: 'Status (상태)', schema: new OA\Schema(type: 'string', enum: ['exposed', 'non-exposed'])),
        new OA\Parameter(name: 'period_from', in: 'query', required: false, description: 'Period from (기간 시작일)', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'period_to', in: 'query', required: false, description: 'Period to (기간 종료일)', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'registrant_id', in: 'query', required: false, description: 'Registrant ID (등록자 ID)', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'exposure_period_from', in: 'query', required: false, description: 'Exposure period from (노출 기간 시작일)', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'exposure_period_to', in: 'query', required: false, description: 'Exposure period to (노출 기간 종료일)', schema: new OA\Schema(type: 'string', format: 'date')),
        new OA\Parameter(name: 'sort_by', in: 'query', required: false, description: 'Sort by (정렬 기준)', schema: new OA\Schema(type: 'string', enum: ['name', 'status', 'created_at'], default: 'created_at')),
        new OA\Parameter(name: 'sort_order', in: 'query', required: false, description: 'Sort order (정렬 방향)', schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'], default: 'desc')),
        new OA\Parameter(name: 'page', in: 'query', required: false, description: 'Page number', schema: new OA\Schema(type: 'integer', default: 1, minimum: 1)),
        new OA\Parameter(name: 'per_page', in: 'query', required: false, description: 'Items per page', schema: new OA\Schema(type: 'integer', default: 20, minimum: 1, maximum: 100)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Banners retrieved successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'banners',
                                type: 'array',
                                items: new OA\Items(ref: '#/components/schemas/AdminBanner')
                            ),
                            new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Post(
    path: '/api/admin/banners',
    summary: '배너 등록 (Banner Registration)',
    description: 'Register a new banner (Super Admin 전용)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/AdminBannerStoreRequest')
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: 'Banner created successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '배너가 성공적으로 생성되었습니다.'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'banner', ref: '#/components/schemas/AdminBanner'),
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
    path: '/api/admin/banners/{id}',
    summary: '배너 상세 (Banner Details)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    parameters: [
        new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Banner details retrieved successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'banner', ref: '#/components/schemas/AdminBanner'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Banner not found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Put(
    path: '/api/admin/banners/{id}',
    summary: '배너 수정 (Update Banner)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    parameters: [
        new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/AdminBannerUpdateRequest')
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Banner updated successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '배너가 성공적으로 수정되었습니다.'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'banner', ref: '#/components/schemas/AdminBanner'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Banner not found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]
#[OA\Delete(
    path: '/api/admin/banners/{id}',
    summary: '배너 삭제 (Delete Banner)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    parameters: [
        new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
    ],
    responses: [
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 404, description: 'Banner not found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]

// Banner Search Filters
#[OA\Get(
    path: '/api/admin/banners/search-filters',
    summary: '배너 검색 필터 (Banner Search Filters)',
    description: 'Get search filter options for banners (Super Admin 전용)',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Search filters retrieved successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'filters',
                                type: 'object',
                                properties: [
                                    new OA\Property(
                                        property: 'exposure_location_options',
                                        type: 'array',
                                        items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: 'value', type: 'string', example: 'main'),
                                                new OA\Property(property: 'label', type: 'string', example: '메인 페이지'),
                                            ]
                                        )
                                    ),
                                    new OA\Property(
                                        property: 'status_options',
                                        type: 'array',
                                        items: new OA\Items(
                                            properties: [
                                                new OA\Property(property: 'value', type: 'string', example: 'exposed', enum: ['exposed', 'non-exposed']),
                                                new OA\Property(property: 'label', type: 'string', example: '노출'),
                                            ]
                                        )
                                    ),
                                ]
                            ),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)]

// Upload Banner Image
#[OA\Post(
    path: '/api/admin/banners/upload-image',
    summary: '배너 이미지 업로드 (Upload Banner Image)',
    description: 'Upload banner image and get path/url to use in `image_path` when creating or updating banners. Super Admin 전용.',
    security: [['sanctum' => []]],
    tags: ['Admin Banner'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                type: 'object',
                required: ['file'],
                properties: [
                    new OA\Property(property: 'file', type: 'string', format: 'binary', description: 'Banner image file (JPEG/PNG, max 5MB)'),
                ]
            )
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: 'Image uploaded successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '이미지가 성공적으로 업로드되었습니다.'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'path', type: 'string', example: 'banners/main-top-123456.png'),
                            new OA\Property(property: 'url', type: 'string', format: 'uri', example: 'https://cdn.example.com/storage/banners/main-top-123456.png'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthorized', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation failed', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
        new OA\Response(response: 500, description: 'Server error', content: new OA\JsonContent(ref: '#/components/schemas/ServerError')),
    ]
)] class AdminBannerEndpoints {}
