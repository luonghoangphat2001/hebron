<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostCategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'page_type' => $this->page_type,
            'is_active' => $this->is_active,
            'total_post' => $this->when(
                $this->resource->getAttribute('total_post') !== null,
                (int) $this->resource->getAttribute('total_post'),
            ),
        ];
    }
}
