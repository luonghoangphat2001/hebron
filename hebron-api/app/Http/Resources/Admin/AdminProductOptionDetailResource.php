<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductOptionDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'option_group_id' => $this->option_group_id,
            'group' => $this->whenLoaded('group', function () {
                return $this->group ? [
                    'id' => $this->group->id,
                    'name' => $this->group->name,
                    'code' => $this->group->code,
                ] : null;
            }),
            'name' => $this->name,
            'additional_price' => $this->additional_price,
            'additional_brand_site_price' => $this->additional_brand_site_price,
            'additional_plain_site_price' => $this->additional_plain_site_price,
            'metadata' => $this->metadata,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
