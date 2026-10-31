<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MyPageOrderDeliveryTrackingListResource extends JsonResource
{
    private static function toAssetUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk(config('filesystems.public_disk'));

        return $disk->url($path);
    }

    public function toArray(Request $request): array
    {
        $firstItem = $this->relationLoaded('items') ? $this->items->first() : null;
        $designGroup = $firstItem?->designGroup;
        $thumbPath = $designGroup?->preview_image_path ?: $this->product?->first_image;
        $quantity = $this->relationLoaded('items')
            ? (int) $this->items->sum(fn ($item) => (int) ($item->quantity ?? 0) * (float) ($item->multiplier ?? 1))
            : 0;
        $status = $this->status ? OrderStatus::tryFrom($this->status) : null;

        return [
            'order_number' => $this->order_number,
            'ordered_at' => $this->created_at?->toDateTimeString(),
            'thumbnail_url' => self::toAssetUrl($thumbPath),
            'product_name' => $firstItem?->product?->name,
            'product_spec' => $firstItem?->configuration,
            'quantity' => $quantity,
            'amount' => (string) ($this->total_amount ?? '0.00'),
            'status' => $this->status,
            'status_label' => $status?->customerLabel() ?? $this->status,
            'customer_status' => $status?->customerStage(),
            'proof_status' => $this->metadata['proof_status'] ?? null,
            'invoice_number' => $this->orderShipment?->invoice_number,
            'tracking_number' => $this->orderShipment?->tracking_number,
            'can_track_delivery' => ! empty($this->orderShipment?->invoice_number),
        ];
    }
}
