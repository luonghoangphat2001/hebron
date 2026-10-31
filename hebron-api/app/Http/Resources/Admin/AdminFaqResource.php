<?php

namespace App\Http\Resources\Admin;

use App\Enums\SiteType;
use App\Http\Resources\PostCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminFaqResource extends JsonResource
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
            'category_id' => $this->whenLoaded('categories', fn () => $this->categories->first()?->id),
            'post_category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'category' => $this->category,
            'question' => $this->question,
            'answer' => $this->answer,
            'sort_order' => $this->sort_order,
            'view_count' => $this->view_count,
            'posting_status' => [
                'value' => $this->is_active ? 'exposed' : 'non-exposed',
                'label' => $this->is_active ? 'Exposed' : 'Non-Exposed',
            ],
            'exposure_target' => $this->exposure_target ?? 'all',
            'site_type' => $this->site_type ?? SiteType::SHOPPING_MALL,
            'author' => $this->whenLoaded('createdBy', function () {
                return $this->createdBy ? [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                    'name' => $this->createdBy->name,
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
