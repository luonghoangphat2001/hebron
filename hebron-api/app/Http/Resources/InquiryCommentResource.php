<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryCommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'author_name' => $this->author_name,
            'content' => $this->content,
            'is_admin' => $this->is_admin,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if ($this->relationLoaded('attachments')) {
            $data['attachments'] = InquiryAttachmentResource::collection($this->attachments);
        }

        return $data;
    }
}
