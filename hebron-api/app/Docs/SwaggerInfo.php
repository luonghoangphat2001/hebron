<?php

namespace App\Docs;

use OpenApi\Attributes as OA;

/** @noinspection PhpUndefinedConstantInspection */
#[OA\Info(
    title: 'Hebron API',
    version: '1.0.0',
    description: 'Hebron 통합 쇼핑몰 · 브랜드 · 무지사이트 API (3 domains: everaward.com, hebron.biz, gpgs.co.kr)',
    contact: new OA\Contact(email: 'dev@hebron.biz')
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'API Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter token from login response'
)]
#[OA\Tag(name: 'Auth', description: 'Authentication — register, login, logout')]
#[OA\Tag(name: 'Storage', description: 'File upload to AWS S3')]
#[OA\Tag(name: 'Admin Users', description: 'Admin — user management')]
class SwaggerInfo {}
