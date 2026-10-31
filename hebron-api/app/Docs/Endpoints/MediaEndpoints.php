<?php

namespace App\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Media', description: 'Public media catalog')]
#[OA\Tag(name: 'Brand', description: 'Brand site APIs')]
class MediaEndpoints
{
    #[OA\Get(
        path: '/api/media',
        summary: 'List active media',
        tags: ['Media'],
        parameters: [
            new OA\Parameter(name: 'site_type', in: 'query', schema: new OA\Schema(type: 'string', enum: ['SHOPPING_MALL', 'BRAND_SITE', 'PLAIN_SITE'])),
            new OA\Parameter(name: 'category_id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
        ],
        responses: [new OA\Response(response: 200, description: 'Media retrieved successfully')]
    )]
    public function index() {}

    #[OA\Get(
        path: '/api/brand/media',
        summary: 'List active brand media',
        tags: ['Brand'],
        parameters: [
            new OA\Parameter(name: 'category_id', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 100, default: 20)),
        ],
        responses: [new OA\Response(response: 200, description: 'Brand media retrieved successfully')]
    )]
    public function brandIndex() {}

    #[OA\Get(
        path: '/api/media/{id}',
        summary: 'Get an active media item',
        tags: ['Media'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Media detail retrieved successfully'), new OA\Response(response: 404, description: 'Media not found')]
    )]
    public function show() {}

    #[OA\Get(
        path: '/api/media/category',
        summary: 'List active media categories',
        tags: ['Media'],
        responses: [new OA\Response(response: 200, description: 'Media categories retrieved successfully')]
    )]
    public function categories() {}

    #[OA\Get(
        path: '/api/media/category/{id}',
        summary: 'Get an active media category',
        tags: ['Media'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Media category retrieved successfully'), new OA\Response(response: 404, description: 'Category not found')]
    )]
    public function categoryDetail() {}
}
