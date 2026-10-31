<?php

namespace App\Http\Resources;

use App\Support\FileStorage;
use Illuminate\Http\Resources\Json\JsonResource;

class CraftsmanshipValueResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'image_url' => $this->imageUrl($this->image_url),
            'description' => $this->description,
            'button_label' => $this->button_label,
            'products' => PageProductResource::collection($this->whenLoaded('products')),
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }

    private function imageUrl(?string $path): ?string
    {
        if ($path === null || $path === '' || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return FileStorage::publicUrl(ltrim($path, '/'));
    }
}
