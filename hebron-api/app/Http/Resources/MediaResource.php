<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class MediaResource extends JsonResource
{
    public function toArray($request): array
    {
        $category = $this->whenLoaded('categories', fn () => $this->categories->first());

        return [
            'id' => $this->id,
            'category_id' => $category?->id,
            'category' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => Str::slug($category->name),
            ] : null,
            'title' => $this->title,
            'description' => $this->description,
            'url' => $this->url ?: FileStorage::publicUrl($this->file_path),
            'image_url' => FileStorage::publicUrl($this->thumbnail_path),
            'link_url' => $this->link_url,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }
}
