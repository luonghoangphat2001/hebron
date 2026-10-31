<?php

namespace App\Http\Resources;

use App\Enums\SiteType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoticeResource extends JsonResource
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
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
            'category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'attachments' => $this->attachments ?? [],
            'is_pinned' => $this->is_pinned,
            'is_new' => $this->published_at ? $this->published_at->gte(now()->subDays(7)) : ($this->created_at && $this->created_at->gte(now()->subDays(7))),
            'view_count' => $this->view_count,
            'published_at' => $this->published_at?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
