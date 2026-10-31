<?php

namespace App\Docs\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'FileAttachment',
    description: 'Uploaded file attachment object (from upload-attachment endpoint)',
    required: ['key', 'name', 'url', 'size'],
    properties: [
        new OA\Property(property: 'key', type: 'string', description: 'Storage path (store this value in attachments[] when creating/updating)', example: 'guide-contents-attachments/abc123.pdf'),
        new OA\Property(property: 'name', type: 'string', description: 'Original filename', example: 'document.pdf'),
        new OA\Property(property: 'url', type: 'string', description: 'Full URL for display/download', example: 'https://hebron-api.axndx.org/storage/guide-contents-attachments/abc123.pdf'),
        new OA\Property(property: 'size', type: 'integer', description: 'File size in bytes', example: 102400),
    ]
)]
class FileAttachment {}
