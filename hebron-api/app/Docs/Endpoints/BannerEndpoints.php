<?php

namespace App\Docs\Endpoints;

use OpenApi\Attributes as OA;


#[OA\Get(
    path: '/api/banners/homepage',
    summary: '홈 배너 조회 (Homepage Banners)',
    description: 'Get visible banners for homepage. Uses exposure_location = "main".',
    tags: ['Banners'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Homepage banners retrieved successfully',
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
                                items: new OA\Items(ref: '#/components/schemas/Banner')
                            )
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 500, description: 'Internal server error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/banners/login',
    summary: '로그인 모달 배너 조회 (Login Modal Banners)',
    description: 'Get visible banners for login modal. Uses exposure_location = "login".',
    tags: ['Banners'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Login banners retrieved successfully',
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
                                items: new OA\Items(ref: '#/components/schemas/Banner')
                            )
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(response: 500, description: 'Internal server error', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)] class BannerEndpoints {}
