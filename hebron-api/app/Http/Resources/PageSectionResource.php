<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PageSectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'section_type' => $this->section_type,
            'title' => $this->title,
            'description' => $this->description,
            'subtitle' => $this->subtitle,
            'content' => $this->content,
            'image' => $this->image,
            'link' => $this->link,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'metadata' => $this->metadata,
        ];
    }
}
