<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'display_type' => $this->display_type,
            'is_required' => $this->is_required,
            'options_count' => $this->when(isset($this->options_count), $this->options_count),
            'products_count' => $this->when(isset($this->products_count), $this->products_count),
            'options' => $this->whenLoaded('options', function () {
                return AdminProductOptionDetailResource::collection($this->options);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
