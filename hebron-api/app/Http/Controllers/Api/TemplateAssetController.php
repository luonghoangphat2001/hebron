<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TemplateAssetController extends Controller
{
    public function show(string $path): StreamedResponse|Response
    {
        $path = ltrim(rawurldecode($path), '/');
        abort_if(
            $path === '' || str_contains($path, '..')
            || (! str_starts_with($path, 'templates/') && ! str_starts_with($path, 'backgrounds/')),
            404,
        );

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));
        abort_unless($disk->exists($path), 404);

        return $disk->response($path, null, [
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
