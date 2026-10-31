<?php

namespace App\Docs\Schemas\Admin\Popup;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'FileResponse',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', example: 'Image uploaded successfully.'),
        new OA\Property(property: 'data', properties: [
            new OA\Property(property: 'file_url', type: 'string', example: 'https://cdn.example.com/popups/new-image.jpg'),
            new OA\Property(property: 'file_name', type: 'string', example: 'new-image.jpg'),
        ], type: 'object')
    ]
)]
class FileResponse {}
