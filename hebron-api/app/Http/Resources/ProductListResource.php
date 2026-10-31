<?php

namespace App\Http\Resources;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductListResource extends JsonResource
{
    private static function toFullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return $disk->url($path);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'slug' => $this->slug,
            'supply_price' => $this->supply_price,
            'selling_price' => $this->selling_price,
            'brand_site_price' => $this->brand_site_price,
            'plain_site_price' => $this->plain_site_price,
            'price_content' => $this->price_content,
            'sku' => $this->sku,
            'first_image' => self::toFullImageUrl($this->images[0] ?? null),
            'is_popular' => (bool) $this->is_popular,
            'is_featured' => (bool) $this->is_featured,
            'is_top_product' => (bool) $this->is_top_product,
            'is_active' => (bool) $this->is_active,
            'position' => $this->position,
            'sort_order' => $this->sort_order,
            'has_discount' => $this->supply_price > $this->selling_price,
            'discount_percentage' => $this->supply_price > $this->selling_price
                ? round(($this->supply_price - $this->selling_price) / $this->supply_price * 100)
                : 0,
            'average_rating' => $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'created_at' => $this->created_at?->toISOString()
        ];
    }
}
