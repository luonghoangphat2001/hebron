<?php

namespace App\Http\Resources;

use App\Services\PrintPdfService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesignGroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'title' => $this->title,
            'layout_data' => $this->layout_data,
            'layout_s3_path' => $this->layout_s3_path,
            'logo_path' => $this->logo_path,
            'preview_image_path' => $this->preview_image_path,
            'metadata' => $this->metadata,
            'design_revision' => PrintPdfService::revision($this->resource),
            'print_pdf' => PrintPdfService::status($this->resource),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
