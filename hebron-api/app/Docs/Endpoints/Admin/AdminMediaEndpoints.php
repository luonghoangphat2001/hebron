<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Admin Media', description: 'Admin media management')]
class AdminMediaEndpoints
{
    #[OA\Get(path: '/api/admin/media', summary: 'List media', tags: ['Admin Media'], security: [['sanctum' => []]], parameters: [
        new OA\Parameter(name: 'site_type', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'category_id', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'is_active', in: 'query', schema: new OA\Schema(type: 'boolean')),
        new OA\Parameter(name: 'keyword', in: 'query', schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer')),
        new OA\Parameter(name: 'per_page', in: 'query', schema: new OA\Schema(type: 'integer')),
    ], responses: [new OA\Response(response: 200, description: 'Success')])]
    public function index() {}

    #[OA\Post(path: '/api/admin/media', summary: 'Create media', tags: ['Admin Media'], security: [['sanctum' => []]], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/AdminMediaStoreRequest')), responses: [new OA\Response(response: 201, description: 'Created')])]
    public function store() {}

    #[OA\Get(path: '/api/admin/media/{id}', summary: 'Show media', tags: ['Admin Media'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Success'), new OA\Response(response: 404, description: 'Not Found')])]
    public function show() {}

    #[OA\Put(path: '/api/admin/media/{id}', summary: 'Update media', tags: ['Admin Media'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/AdminMediaUpdateRequest')), responses: [new OA\Response(response: 200, description: 'Updated'), new OA\Response(response: 404, description: 'Not Found'), new OA\Response(response: 422, description: 'Validation failed')])]
    public function update() {}

    #[OA\Delete(path: '/api/admin/media/{id}', summary: 'Delete media', tags: ['Admin Media'], security: [['sanctum' => []]], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))], responses: [new OA\Response(response: 200, description: 'Deleted'), new OA\Response(response: 404, description: 'Not Found')])]
    public function destroy() {}
}
