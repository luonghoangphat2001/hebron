<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSpecificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'size' => $this->size,
            'materials' => $this->materials,
            'case' => $this->case,
            'product_period' => $this->product_period,
            'total_product_amount' => $this->total_product_amount,
            'shipping_info' => $this->shipping_info,
            'weight' => $this->weight,
            'notes' => $this->notes,
        ];
    }

    /**
     * Format print side value to Korean display text
     */
    private function formatPrintSide(?string $printSide): ?string
    {
        return match (strtolower($printSide ?? '')) {
            'double', 'both', '양면' => '양면',
            'single', 'one', '단면' => '단면',
            default => $printSide,
        };
    }
}
