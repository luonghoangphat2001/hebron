<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class TemplateAssetUrls
{
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return $path;
        }
        if (preg_match('~^(https?://|//|data:|blob:)~i', $path)) {
            return $path;
        }
        if (str_starts_with($path, '/storage/') || str_starts_with($path, 'storage/')) {
            $path = preg_replace('~^/?storage/~', '', $path);
        } elseif (str_starts_with($path, '/')) {
            return url($path);
        }

        return Storage::disk(config('filesystems.public_disk'))->url($path);
    }

    public static function layout(?array $layout): ?array
    {
        if ($layout === null) {
            return null;
        }
        foreach (['front_image_url', 'back_image_url'] as $key) {
            if (isset($layout['background'][$key])) {
                $layout['background'][$key] = self::url($layout['background'][$key]);
            }
        }
        foreach ($layout['layers'] ?? [] as $index => $layer) {
            foreach (['image_url', 'mask_image_url'] as $key) {
                if (isset($layer[$key])) {
                    $layout['layers'][$index][$key] = self::url($layer[$key]);
                }
            }
            if (isset($layer['style']['fill_image_url'])) {
                $layout['layers'][$index]['style']['fill_image_url'] = self::url($layer['style']['fill_image_url']);
            }
        }

        return $layout;
    }
}
