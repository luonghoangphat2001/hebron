<?php

namespace App\Http\Resources\Admin;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCategoryDetailResource extends JsonResource
{
    private static function toFullUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        if (str_starts_with($path, '/')) {
            return url($path);
        }

        return FileStorage::publicUrl($path);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_en' => $this->name_en,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'parent' => $this->whenLoaded('parent', function () {
                return $this->parent ? [
                    'id' => $this->parent->id,
                    'name' => $this->parent->name,
                    'name_en' => $this->parent->name_en,
                    'code' => $this->parent->code,
                ] : null;
            }),
            'description' => $this->description,
            'subtitle' => $this->subtitle,
            'image' => self::toFullUrl($this->image),
            'icon' => self::toFullUrl($this->icon),
            'banner_image' => self::toFullUrl($this->banner_image),
            'sort_order' => $this->sort_order,
            'exposure_order' => $this->exposure_order,
            'level' => $this->resolveCategoryLevel(),
            'status' => [
                'value' => $this->is_active ? 'active' : 'hidden',
                'label' => $this->is_active ? 'Active' : 'Hidden',
            ],
            'is_best' => (bool) $this->is_best,
            'exposure_start_date' => $this->exposure_start_date?->toIso8601String(),
            'exposure_end_date' => $this->exposure_end_date?->toIso8601String(),
            'registrant' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'children' => $this->whenLoaded('allChildren', function () {
                return AdminCategoryDetailResource::collection($this->allChildren);
            }),
            'position' => $this->position,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Resolve category level from tree depth.
     * large = root (no parent), medium = direct child of root, small = grandchild (or deeper).
     */
    private function resolveCategoryLevel(): string
    {
        if ($this->parent_id === null) {
            return 'large';
        }

        // Treat categories whose direct parent is a root as "medium".
        // Do not rely on relationLoaded so that level is consistent even when parent isn't eagerly loaded.
        $parent = $this->parent;
        if ($parent && $parent->parent_id === null) {
            return 'medium';
        }

        return 'small';
    }
}
