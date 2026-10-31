<?php

namespace App\Http\Resources\Admin;

use App\Support\FileStorage;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'path' => $this->path,
            'url' => FileStorage::publicUrl($this->path) ?? $this->url,
            'type' => $this->type,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'created_by' => $this->createdBy?->name ?? $this->createdBy?->username ?? null,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
