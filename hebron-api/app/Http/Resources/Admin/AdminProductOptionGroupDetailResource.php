<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Admin\AdminProductOptionDetailResource;
use App\Http\Resources\Admin\AdminProductResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionGroupDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'display_type' => $this->display_type,
            'is_required' => $this->is_required,
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
            'options' => $this->whenLoaded('options', function () {
                return AdminProductOptionDetailResource::collection($this->options);
            }),
            'products' => $this->whenLoaded('products', function () {
                return $this->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
