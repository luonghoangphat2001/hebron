<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->id,
            'product_code' => $this->sku ?? $this->slug,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'slug' => $this->slug,
            'selling_price' => $this->selling_price,
            'original_price' => $this->supply_price,
            'price_content' => $this->price_content,
            'first_image' => $this->firstImageUrl(),
            'is_popular' => (bool) $this->is_popular,
            'is_featured' => (bool) $this->is_featured,
            'is_top_product' => (bool) $this->is_top_product,
            'is_active' => (bool) $this->is_active,
            'sort_order' => $this->sort_order,
            'has_discount' => $this->supply_price > $this->selling_price,
            'discount_percentage' => $this->supply_price > $this->selling_price
                ? round(($this->supply_price - $this->selling_price) / $this->supply_price * 100)
                : 0,
            'category_ids' => $this->whenLoaded('categories', fn () => $this->categories->pluck('id')->values()),
        ];
    }

    private function firstImageUrl(): ?string
    {
        $images = is_array($this->images) ? $this->images : [];
        $image = $images[0] ?? null;

        if (! $image || str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        return FileStorage::publicUrl($image);
    }
}
