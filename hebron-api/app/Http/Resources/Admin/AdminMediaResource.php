<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\MediaResource;

class AdminMediaResource extends MediaResource
{
    public function toArray($request): array
    {
        return array_merge(parent::toArray($request), [
            'site_type' => $this->site_type?->value ?? $this->site_type,
            'file_path' => $this->file_path,
            'thumbnail_path' => $this->thumbnail_path,
            'created_by' => $this->createdBy?->name ?? $this->createdBy?->username,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ]);
    }
}
