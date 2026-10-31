<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\PostCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminExampleSentenceSampleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'board_category_no' => $this->board_category_no,
            'category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'content' => $this->content,
            'attachments' => $this->attachments ?? [],
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'view_count' => $this->view_count,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
