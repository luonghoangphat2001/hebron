<?php

namespace App\Http\Resources;

use App\Services\DesignService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderArtworkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $designService = app(DesignService::class);

        return [
            'id' => $this->id,
            'side' => $this->side,
            'layout_data' => $this->layout_data,
            'layout_data_url' => $designService->getLayoutDataUrl($this->resource),
            'logo_url' => $designService->getLogoUrl($this->resource),
            'preview_url' => $designService->getPreviewUrl($this->resource),
        ];
    }
}
