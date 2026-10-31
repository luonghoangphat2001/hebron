<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    private static function toAssetUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return FileStorage::publicUrl($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $configuration = is_array($this->configuration) ? $this->configuration : [];
        $qty = (int) ($this->quantity ?? 0);
        $productSnapshot = $configuration['product_snapshot'] ?? null;
        $designGroup = $this->relationLoaded('designGroup') ? $this->designGroup : null;
        $orderDesignContent = $this->relationLoaded('orderDesignContent') ? $this->orderDesignContent : null;

        return [
            'id' => $this->id,
            'product_id' => $productSnapshot['id'] ?? null,
            'title' => $productSnapshot['name'] ?? null,
            'quantity' => $qty,
            'design_group' => $designGroup
                ? [
                    'id' => $designGroup->id,
                    'title' => $designGroup->title,
                    'preview_image_url' => self::toAssetUrl($designGroup->preview_image_path),
                    'metadata' => $designGroup?->metadata,
                ]
                : null,
            'order_design_content' => $orderDesignContent
                ? new OrderDesignContentResource($orderDesignContent)
                : null,

            'supply_price' => $this->supply_price,
            'selling_price' => $this->selling_price,
            'option_price' => $this->option_price,
            'sub_total_amount' => $this->sub_total_amount,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'configuration' => [
                'product_snapshot' => [
                    'images' => collect($productSnapshot['images'] ?? [])->map(fn (string $path) => self::toAssetUrl($path))->all(),
                    'specification' => $productSnapshot['specification'] ?? null,
                ],
                'selected_option_values' => $configuration['selected_option_values'] ?? null,
            ],
            'notes' => $this->notes,
        ];
    }
}
