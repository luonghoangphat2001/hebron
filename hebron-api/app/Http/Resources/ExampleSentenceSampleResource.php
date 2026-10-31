<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExampleSentenceSampleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'category' => $this->whenLoaded('categories', fn () => $this->categories->first()
                ? new PostCategoryResource($this->categories->first())
                : null),
            'content' => $this->content,
            'attachments' => $this->attachments ?? [],
            'is_featured' => $this->is_featured,
            'view_count' => $this->view_count,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
