<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $children = null;
        $hasChildren = null;

        if ($this->relationLoaded('childrenRecursive')) {
            $children = CategoryResource::collection($this->childrenRecursive);
            $hasChildren = $this->childrenRecursive->isNotEmpty();
        } elseif ($this->relationLoaded('children')) {
            $children = CategoryResource::collection($this->children);
            $hasChildren = $this->children->isNotEmpty();
        } elseif (array_key_exists('children_exists', $this->resource->getAttributes())) {
            $hasChildren = (bool) $this->children_exists;
        }

        return [
            'id' => $this->id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'description' => $this->description,
            'subtitle' => $this->subtitle,
            'image' => $this->image,
            'icon' => $this->icon,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'parent' => $this->when(
                $this->relationLoaded('parent') && $this->parent,
                fn () => new CategoryResource($this->parent)
            ),
            'children' => $this->when(! is_null($children), $children),
            'has_children' => $this->when(! is_null($hasChildren), $hasChildren),
            'products_count' => $this->when(
                ! is_null($this->products_count),
                (int) $this->products_count
            ),
        ];
    }
}
