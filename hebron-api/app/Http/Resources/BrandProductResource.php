<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => [
                'ko' => $this->name,
                'en' => $this->name_en ?? $this->name,
            ],
            'slug' => $this->slug,
            'category_ids' => $this->whenLoaded(
                'categories',
                fn () => $this->categories->pluck('id')->values()
            ),
        ];
    }
}
