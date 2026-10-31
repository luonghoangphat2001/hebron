<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavedProductOptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product?->name),
            'product_slug' => $this->whenLoaded('product', fn () => $this->product?->slug),
            'order_name' => $this->order_name,
            'summary_text' => $this->summary_text,
            'detail' => $this->detail,
            'product_quantity_price_id' => $this->product_quantity_price_id,
            'quantity' => $this->quantity,
            'number_of_cases' => $this->number_of_cases,
            'options' => $this->options,
            'design_id' => $this->design_id,
            'design_ids' => $this->design_ids,
            'notes' => $this->notes,
            'saved_at' => $this->created_at,
            'expires_at' => $this->expires_at,
        ];
    }
}
