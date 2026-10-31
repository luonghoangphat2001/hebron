<?php

namespace App\Http\Resources\Admin;

use App\Enums\SiteType;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAboutCtaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'site_type' => $this->site_type instanceof SiteType
                ? $this->site_type->value
                : $this->site_type,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'content' => $this->content,
            'image' => $this->image,
            'link' => $this->link,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
