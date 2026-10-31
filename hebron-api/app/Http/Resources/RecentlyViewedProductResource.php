<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class RecentlyViewedProductResource extends JsonResource
{
    /**
     * Convert image path to full URL.
     */
    private static function toFullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk(config('filesystems.public_disk'))->url($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'viewed_at' => $this->viewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Include product if loaded
        if ($this->relationLoaded('product') && $this->product) {
            $product = $this->product;
            $productData = [
                'id' => $product->id,
                'name' => $product->name,
                'name_en' => $product->name_en,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'selling_price' => $product->selling_price,
                'original_price' => $product->supply_price,
                'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
                'price_content' => $product->price_content,
                'images' => array_values(array_map(
                    fn ($path) => self::toFullImageUrl((string) $path),
                    $product->images ?? []
                )),
                'first_image' => self::toFullImageUrl($product->first_image ?? null),
                'short_description' => $product->short_description,
                'is_active' => (bool) $product->is_active,
                'is_popular' => (bool) $product->is_popular,
                'is_featured' => (bool) $product->is_featured,
                'stock_quantity' => $product->stock_quantity,
                'min_quantity' => $product->min_quantity,
                'max_quantity' => $product->max_quantity,
                'view_count' => $product->view_count,
            ];

            // Include category if loaded
            if ($product->relationLoaded('category') && $product->category) {
                $category = $product->category;
                $productData['category'] = [
                    'id' => $category->id,
                    'name' => [
                        'ko' => $category->name,
                        'en' => $category->name_en ?? $category->name,
                    ],
                    'slug' => $category->slug,
                ];
            }

            // Include product specification if loaded
            if ($product->relationLoaded('specification') && $product->specification) {
                $spec = $product->specification;
                $productData['specification'] = [
                    'size_width_mm' => $spec->size_width_mm ? (float) $spec->size_width_mm : null,
                    'size_height_mm' => $spec->size_height_mm ? (float) $spec->size_height_mm : null,
                    'size_unit' => $spec->size_unit,
                    'production_time_days' => $spec->production_time_days,
                ];
            }

            $data['product'] = $productData;
        }

        return $data;
    }
}
