<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductResource extends ProductResource
{
    /**
     * Convert file path to full URL (public /uploads/... or storage).
     */
    private static function toFullImagePath(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        // Path like /uploads/products/... (public folder)
        if (str_starts_with($path, '/')) {
            return url($path);
        }

        // Path relative to storage/app/public
        return Storage::disk(config('filesystems.public_disk'))->url($path);
    }

    /**
     * Transform the resource into an array for admin view.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        return array_merge($data, [
            // Public status (공개여부) - maps to is_active
            'is_public' => $this->is_active,
            'mes_inventory_enabled' => $this->mes_inventory_enabled,
            'stock_inventory_enabled' => $this->stock_inventory_enabled,
        ]);
    }
}
