<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryAttachmentResource extends JsonResource
{
    /**
     * Transform the inquiry attachment into the API representation.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_url' => FileStorage::publicUrl($this->file_path),
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
        ];
    }
}
