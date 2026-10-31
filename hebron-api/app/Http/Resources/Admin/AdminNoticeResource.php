<?php

namespace App\Http\Resources\Admin;

use App\Enums\SiteType;
use App\Http\Resources\PostCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNoticeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Determine exposure status based on is_active, published_at, and expires_at
        $isExposed = $this->is_active
            && ($this->published_at === null || $this->published_at <= now())
            && ($this->expires_at === null || $this->expires_at >= now());

        return [
            'id' => $this->id,
            'site_type' => $this->site_type instanceof SiteType ? $this->site_type->value : $this->site_type,
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'attachments' => $this->attachments,
            'is_pinned' => $this->is_pinned,
            'view_count' => $this->view_count,
            'exposure_status' => [
                'value' => $isExposed ? 'exposed' : 'non-exposed',
                'label' => $isExposed ? 'Exposed' : 'Non-Exposed',
            ],
            'exposure_target' => $this->exposure_target ?? 'all',
            'exposure_location' => $this->exposure_location,
            'exposure_start_date' => $this->published_at?->format('Y-m-d H:i:s'),
            'exposure_end_date' => $this->expires_at?->format('Y-m-d H:i:s'),
            'author' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
