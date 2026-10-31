<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesignRevisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'status' => $this->status->value,
            'files' => $this->files,
            'comments' => $this->comments,
            'created_at' => $this->created_at?->toIso8601String(),

            'order' => $this->whenLoaded('order', function () {
                return [
                    'id' => $this->order->id,
                    'order_number' => $this->order->order_number,

                    'items' => $this->order->items->map(function ($item) {
                        $configuration = is_array($item->configuration)
                            ? $item->configuration
                            : [];

                        $productSnapshot = $configuration['product_snapshot'] ?? [];

                        return [
                            'id' => $item->id,
                            'product_id' => $productSnapshot['id'] ?? null,
                            'title' => $productSnapshot['name'] ?? null,
                        ];
                    }),
                ];
            }),
        ];
    }
}
