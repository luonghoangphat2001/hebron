<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'site_type' => $this->site_type,
            'title' => $this->title,
            'client' => $this->client,
            'category' => $this->category,
            'year' => $this->year,
            'description' => $this->description,
            'cover_image' => $this->cover_image,
            'gallery' => $this->gallery ?? [],
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
