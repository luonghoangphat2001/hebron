<?php

namespace App\Docs\Endpoints;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Auth', description: 'Authentication — register, login, logout')]
#[OA\Post(
    path: '/api/auth/register',
    summary: 'Customer registration',
    description: 'Register a new customer account for a specific site (everaward.com / hebron.biz / gpgs.co.kr)',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['name', 'username', 'email', 'password', 'password_confirmation'],
            properties: [
                new OA\Property(property: 'name', type: 'string', example: '홍길동'),
                new OA\Property(property: 'username', type: 'string', example: 'hong_gildong', description: 'Lowercase letters, numbers and underscores only'),
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'password123'),
                new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                new OA\Property(property: 'phone', type: 'string', nullable: true, example: '010-1234-5678'),
                new OA\Property(property: 'mobile', type: 'string', nullable: true, example: '010-1234-5678'),
                new OA\Property(property: 'customer_id', type: 'integer', nullable: true, description: 'Customer ID for business registration'),
                new OA\Property(property: 'organization_id', type: 'integer', nullable: true),
                new OA\Property(property: 'member_type', type: 'string', enum: ['individual', 'business'], example: 'individual'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 201,
            description: 'Registration successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '회원가입이 완료되었습니다.'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'user', ref: '#/components/schemas/UserResponseSchema'),
                        new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
                        new OA\Property(property: 'refresh_token', type: 'string', example: 'def456...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                        new OA\Property(property: 'refresh_expires_in', type: 'integer', example: 2592000),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/login',
    summary: 'Login',
    description: 'Login for all users (customer & admin). Returns Bearer token.',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['login', 'password'],
            properties: [
                new OA\Property(property: 'username', type: 'string', example: 'superadmin', description: 'Email or username'),
                new OA\Property(property: 'password', type: 'string', example: 'password123'),
                new OA\Property(property: 'device_name', type: 'string', nullable: true, description: 'Device name for token identification'),
                new OA\Property(property: 'remember', type: 'boolean', example: false, description: 'Remember login state'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Login successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'user', ref: '#/components/schemas/UserResponseSchema'),
                        new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
                        new OA\Property(property: 'refresh_token', type: 'string', example: 'def456...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                        new OA\Property(property: 'refresh_expires_in', type: 'integer', example: 2592000),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Invalid credentials', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/logout',
    summary: 'Logout',
    description: 'Revoke the current access token',
    security: [['sanctum' => []]],
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Logged out',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Logged out successfully'),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Get(
    path: '/api/auth/me',
    summary: 'Get current user',
    description: "Returns the authenticated user's profile",
    security: [['sanctum' => []]],
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'User profile',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserResponseSchema'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/auth/refresh',
    summary: 'Refresh token',
    description: 'Refresh an expired access token using refresh token',
    security: [['sanctum' => []]],
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Token refreshed successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Unauthenticated', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
    ]
)]
#[OA\Post(
    path: '/api/auth/send-verification-code',
    summary: 'Send verification code',
    description: 'Send a verification code to registered phone number (for password reset or phone change)',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['phone'],
            properties: [
                new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Verification code sent',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '인증번호가 전송되었습니다.'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/verify-verification-code',
    summary: 'Verify verification code',
    description: 'Verify a verification code sent to phone',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['phone', 'code'],
            properties: [
                new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
                new OA\Property(property: 'code', type: 'string', example: '123456'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Verification successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '인증번호가 확인되었습니다.'),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'verified', type: 'boolean', example: true),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Invalid code', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/find-username',
    summary: 'Find username',
    description: 'Find username by email or phone',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            oneOf: [
                new OA\Schema(required: ['email'], properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                ]),
                new OA\Schema(required: ['phone'], properties: [
                    new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
                ]),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Username found',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'username', type: 'string', example: 'hong_gildong'),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 404, description: 'User not found', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/forgot-password',
    summary: 'Forgot password',
    description: 'Send password reset link to email',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Reset link sent',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '비밀번호 재설정 링크가 이메일로 전송되었습니다.'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/reset-password',
    summary: 'Reset password',
    description: 'Reset password using email and password reset token',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'token', 'password', 'password_confirmation'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                new OA\Property(property: 'token', type: 'string', description: 'Password reset token from email', example: 'abc123...'),
                new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'newpassword123'),
                new OA\Property(property: 'password_confirmation', type: 'string', example: 'newpassword123'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Password reset successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '비밀번호가 재설정되었습니다.'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Invalid token', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Get(
    path: '/api/auth/organization-options',
    summary: 'Get organization options',
    description: 'Get organization options for registration form (조직 코드 선택 옵션)',
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Organization options retrieved',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'organizations', type: 'array', items: new OA\Items(
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'value', type: 'string', example: 'team-1'),
                                new OA\Property(property: 'label', type: 'string', example: 'Marketing Team'),
                                new OA\Property(property: 'customer_id', type: 'integer', example: 1),
                            ]
                        )),
                        new OA\Property(property: 'meta', properties: [
                            new OA\Property(property: 'scope', type: 'string', example: 'all_tenants'),
                        ], type: 'object'),
                    ], type: 'object'),
                ]
            )
        ),
    ]
)]
#[OA\Post(
    path: '/api/auth/reset-password/with-code',
    summary: 'Reset password with verification code',
    description: 'Reset password using phone verification code instead of email token',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['phone', 'code', 'password', 'password_confirmation'],
            properties: [
                new OA\Property(property: 'phone', type: 'string', example: '010-1234-5678'),
                new OA\Property(property: 'code', type: 'string', example: '123456'),
                new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'newpassword123'),
                new OA\Property(property: 'password_confirmation', type: 'string', example: 'newpassword123'),
            ]
        )
    ),
    tags: ['Auth'],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Password reset successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: '비밀번호가 재설정되었습니다.'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Get(
    path: '/api/auth/social/{provider}/redirect-url',
    summary: 'Get social login redirect URL',
    description: 'Get redirect URL for social login (Kakao, Naver, etc.)',
    tags: ['Auth'],
    parameters: [
        new OA\Parameter(name: 'provider', in: 'path', required: true, description: 'Social provider (kakao, naver)', schema: new OA\Schema(type: 'string', enum: ['kakao', 'naver', 'google', 'apple'])),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Redirect URL retrieved',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'redirect_url', type: 'string', example: 'https://kauth.kakao.com/...'),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 422, description: 'Invalid provider', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/auth/social/{provider}/callback',
    summary: 'Social login callback',
    description: 'Handle social login callback (Kakao, Naver, etc.)',
    tags: ['Auth'],
    parameters: [
        new OA\Parameter(name: 'provider', in: 'path', required: true, description: 'Social provider (kakao, naver)', schema: new OA\Schema(type: 'string', enum: ['kakao', 'naver', 'google', 'apple'])),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['code'],
            properties: [
                new OA\Property(property: 'code', type: 'string', example: 'abc123...', description: 'Authorization code from social provider'),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Social login successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'data', properties: [
                        new OA\Property(property: 'user', ref: '#/components/schemas/UserResponseSchema'),
                        new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                    ], type: 'object'),
                ]
            )
        ),
        new OA\Response(response: 401, description: 'Social authentication failed', content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
class AuthEndpoints {}