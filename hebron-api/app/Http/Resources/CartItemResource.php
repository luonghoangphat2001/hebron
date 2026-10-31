<?php

namespace App\Http\Resources;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CartItemResource extends JsonResource
{
    /**
     * Convert stored image path to public URL (same rules as ProductResource).
     */
    private static function productImageUrl(?string $path): ?string
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

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'cart_id' => $this->cart_id,
            'product_id' => $this->product_id,
            'order_design_content' => $this->orderDesignContent
                ? new OrderDesignContentResource($this->orderDesignContent)
                : null,
            'design_group' => $this->relationLoaded('designGroup') && $this->designGroup
                ? new DesignGroupResource($this->designGroup)
                : null,
            'quantity' => $this->quantity,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'selected_options' => $this->selected_options,
            'option_price' => $this->option_price ? (float) $this->option_price : null,
            'total_amount' => ($this->sale_price + $this->option_price) * $this->quantity,
            'notes' => $this->notes,
            'storage_date' => $this->storage_date?->toIso8601String(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if ($this->relationLoaded('product') && $this->product) {
            $productData = [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'name_en' => $this->product->name_en,
                'slug' => $this->product->slug,
                'sku' => $this->product->sku,
                'supply_price' => $this->product->supply_price ? (float) $this->product->supply_price : null,
                'selling_price' => $this->product->selling_price ? (float) $this->product->selling_price : null,
                'images' => $this->product->images,
                'is_active' => (bool) $this->product->is_active,
                'stock_quantity' => $this->product->stock_quantity,
            ];

            if ($this->product->relationLoaded('specification') && $this->product->specification) {
                $spec = $this->product->specification;
                $productData['specification'] = [
                    ...(new ProductSpecificationResource($spec))->resolve($request),
                    'production_time_days' => $spec->production_time_days,
                ];
            }

            $data['product'] = $productData;
        }

        if ($this->relationLoaded('design') && $this->design) {
            $data['design'] = [
                'id' => $this->design->id,
                'name' => $this->design->name ?? null,
            ];
        }

        return $data;
    }
}
