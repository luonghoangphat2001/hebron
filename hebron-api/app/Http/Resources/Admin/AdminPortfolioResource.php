<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\PostCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminPortfolioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_type' => $this->site_type,
            'title' => $this->title,
            'client' => $this->client,
            'category_id' => $this->whenLoaded('categories', fn () => $this->categories->first()?->id),
            'post_category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'category' => $this->category,
            'year' => $this->year,
            'description' => $this->description,
            'cover_image' => $this->cover_image,
            'gallery' => $this->gallery ?? [],
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
