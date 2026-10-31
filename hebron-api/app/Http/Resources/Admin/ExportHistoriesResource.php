<?php

namespace App\Http\Resources\Admin;

use App\Support\FileStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExportHistoriesResource extends JsonResource
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
            'file_name' => $this->file_name,
            'file_path' => FileStorage::publicUrl($this->file_path),
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
