<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CalligraphyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image_path' => $this->image_path,
            'image_url' => $this->image_path
                ? Storage::disk(config('filesystems.public_disk'))->url($this->image_path)
                : null,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'text' => $this->text,
        ];
    }
}
