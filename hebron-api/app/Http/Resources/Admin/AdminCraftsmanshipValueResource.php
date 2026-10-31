<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\CraftsmanshipValueResource;

class AdminCraftsmanshipValueResource extends CraftsmanshipValueResource
{
    public function toArray($request): array
    {
        return array_merge(parent::toArray($request), [
            'product_ids' => $this->whenLoaded('products', fn () => $this->products->pluck('id')->values()),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ]);
    }
}
