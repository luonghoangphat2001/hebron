<?php

namespace App\Docs\Endpoints\Admin;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Admin Inquiries', description: 'Admin inquiry management')]
class AdminInquiryEndpoints
{
    #[OA\Delete(
        path: '/api/admin/inquiries/{id}',
        summary: 'Delete inquiry',
        description: 'Soft-delete an inquiry from admin inquiry management.',
        tags: ['Admin Inquiries'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'Inquiry ID',
                schema: new OA\Schema(type: 'integer', format: 'int64', minimum: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Inquiry deleted successfully'
            ),
            new OA\Response(
                response: 404,
                description: 'Inquiry not found',
                content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
            )
        ]
    )]
    public function destroy() {}
}
