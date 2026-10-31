<?php

namespace App\Docs\Endpoints\MyPage;

use OpenApi\Attributes as OA;
use App\Http\Resources\NoticeResource;
use App\Docs\Schemas\PaginationResponse;

#[OA\Tag(name: 'MyPage', description: 'MyPage profile management')]
class MyPageNoticeEndpoints
{
    #[OA\Get(
        path: '/api/mypage/notices',
        summary: 'List mypage notices',
        tags: ['MyPage'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notices retrieved',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'notices', type: 'array', items: new OA\Items(ref: '#/components/schemas/NoticeResource')),
                            new OA\Property(property: 'pagination', ref: '#/components/schemas/PaginationResponse'),
                        ]),
                    ]
                )
            )
        ]
    )]
    public function index() {}

    #[OA\Get(
        path: '/api/mypage/notices/{id}',
        summary: 'Show mypage notice',
        tags: ['MyPage'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Notice ID', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notice detail',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', properties: [
                            new OA\Property(property: 'notice', ref: '#/components/schemas/NoticeResource'),
                        ], type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Not Found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        ]
    )]
    public function show() {}
}
