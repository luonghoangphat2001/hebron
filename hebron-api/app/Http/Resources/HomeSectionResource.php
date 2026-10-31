<?php

namespace App\Http\Resources;

use App\Enums\SiteType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeSectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_type' => $this->site_type instanceof SiteType ? $this->site_type->value : $this->site_type,
            'type' => $this->type,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'content' => $this->content,
            'image' => $this->image,
            'link' => $this->link,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'is_currently_active' => $this->isCurrentlyActive(),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
