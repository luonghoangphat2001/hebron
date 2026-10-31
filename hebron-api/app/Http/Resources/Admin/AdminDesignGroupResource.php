<?php

namespace App\Http\Resources\Admin;

use App\Services\PrintPdfService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDesignGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'title' => $this->title,
            'layout_data' => $this->layout_data,
            'metadata' => $this->metadata,
            'design_revision' => PrintPdfService::revision($this->resource),
            'print_pdf' => PrintPdfService::status($this->resource),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
