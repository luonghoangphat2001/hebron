<?php

namespace App\Support;

use App\Enums\FileType;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorage
{
    public static function publicDisk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return $disk;
    }

    public static function store(UploadedFile $file, FileType $type): string
    {
        $extension = $file->guessExtension();
        if ($type === FileType::PRODUCT_AI) {
            // Keep Illustrator uploads as .ai even when the client sends a
            // generic application/pdf MIME type.
            $originalExtension = strtolower($file->getClientOriginalExtension());
            $originalExtension = preg_replace('/[^a-z0-9]+/', '', $originalExtension);
            $extension = $originalExtension ?: $extension;
        }
        $filename = Str::random(40).($extension ? '.'.$extension : '');

        return $file->storeAs($type->value, $filename, config('filesystems.public_disk'));
    }

    public static function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return self::publicDisk()->url($path);
    }
}
