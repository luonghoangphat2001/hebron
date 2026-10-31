<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUnitPriceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'erp_option_id' => $this->erp_option_id,
            'erp_option' => $this->whenLoaded('erpOption', fn () => $this->erpOption ? [
                'id' => $this->erpOption->id,
                'label' => $this->erpOption->label,
                'attributes' => $this->erpOption->attributes,
            ] : null),
            'category' => $this->category,
            'unit_price_tab' => $this->unit_price_tab,
            'unit_price_name' => $this->unit_price_name,
            'unit_price_key' => $this->unit_price_key,
            'applicable_estimate' => $this->applicable_estimate,
            'status' => [
                'value' => $this->is_active ? 'active' : 'inactive',
                'label' => $this->is_active ? 'Active' : 'Inactive',
            ],
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'items' => $this->whenLoaded('allItems', function () {
                return $this->allItems->map(fn ($item) => [
                    'id' => $item->id,
                    'price_value' => (string) $item->price_value,
                    'raw_cost' => $item->raw_cost ? (string) $item->raw_cost : null,
                    'attributes' => $item->attributes,
                    'quantity_min' => $item->quantity_min,
                    'is_active' => $item->is_active,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ]);
            }),
        ];
    }
}
