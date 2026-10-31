<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\OrderDesignContentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin order item resource with product information (FSD: Order Details - Product Information)
 * and design/artwork data for PDF export flow.
 */
class AdminOrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'quantity' => $this->quantity,
            'multiplier' => $this->multiplier,
            'unit' => $this->unit,
            'production_days' => $this->production_days,
            'unit_price' => (string) ($this->unit_price ?? '0.00'),
            'total_amount' => (string) ($this->total_amount ?? '0.00'),
            'options' => $this->configuration,
            'configuration' => $this->configuration,
            'notes' => $this->notes,
            'post_processing' => $this->notes,
            'design_group' => $this->whenLoaded(
                'designGroup',
                fn () => $this->designGroup ? new AdminDesignGroupResource($this->designGroup) : null,
            ),
            'order_design_content' => $this->whenLoaded(
                'orderDesignContent',
                fn () => $this->orderDesignContent
                    ? (new OrderDesignContentResource($this->orderDesignContent))->resolve($request)
                    : null,
            ),
        ];
    }
}
