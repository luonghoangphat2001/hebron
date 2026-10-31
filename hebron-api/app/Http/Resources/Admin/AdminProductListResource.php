<?php

namespace App\Http\Resources\Admin;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AdminProductListResource extends JsonResource
{
    private static function imageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return str_starts_with($path, '/') ? url($path) : $disk->url($path);
    }

    public function toArray(Request $request): array
    {
        $images = is_array($this->images) ? $this->images : [];

        return [
            'id' => $this->id,
            'images' => array_values(array_map(
                fn ($path) => self::imageUrl((string) $path),
                $images
            )),
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'sku' => $this->sku,
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => [
                    'ko' => $category->name,
                    'en' => $category->name_en ?? $category->name,
                ],
                'slug' => $category->slug,
            ])->values()),
            'selling_price' => $this->selling_price,
            'price_content' => $this->price_content,
            'stock_quantity' => $this->stock_quantity,
            'position' => $this->position,
            'is_public' => (bool) $this->is_active,
            'is_top_product' => (bool) $this->is_top_product,
            'mes_inventory_enabled' => (bool) $this->mes_inventory_enabled,
            'stock_inventory_enabled' => (bool) $this->stock_inventory_enabled,
            'created_at' => $this->created_at,
        ];
    }
}
