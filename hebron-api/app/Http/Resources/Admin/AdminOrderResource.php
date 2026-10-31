<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\OrderResource;
use App\Support\FileStorage;
use Illuminate\Http\Request;

class AdminOrderResource extends OrderResource
{
    /**
     * Transform the resource into an array for admin view.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $data['payment_details']['transaction_id'] = $this->relationLoaded('paymentTransaction')
            ? $this->paymentTransaction->sortByDesc('id')->first()?->transaction_id
            : null;

        // Add admin-specific fields
        return array_merge($data, [
            // User information (회원 정보)
            'user' => [
                'id' => $this->user?->id,
                'username' => $this->user?->username,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ],

            // Company name from order (고객사)
            'company_name' => $this->company_name,

            // Order counts (수량/건수)
            'quantity' => $this->items->sum('quantity') ?? 0,
            'item_count' => $this->items->count(),

            // Design: order has at least one artwork (for showing "Design PDF" button on list)
            'has_design' => ($this->artworks_count ?? 0) > 0,

            'design_files' => $this->whenLoaded('designFiles', fn () => $this->designFiles
                ->map(fn ($file) => [
                    'id' => $file->id,
                    'file_name' => $file->file_name,
                    'file_url' => FileStorage::publicUrl($file->file_path),
                    'created_at' => $file->created_at?->format('Y-m-d H:i:s'),
                ])->values()->all(), []),

            // Manager assignments (담당자 지정)
            'reception_manager' => [
                'id' => $this->metadata['reception_manager_id'] ?? null,
                'name' => $this->metadata['reception_manager_name'] ?? null,
            ],
            'production_manager' => [
                'id' => $this->metadata['production_manager_id'] ?? null,
                'name' => $this->metadata['production_manager_name'] ?? null,
            ],

            // Production site (생산처)
            'production_site' => $this->metadata['production_site'] ?? null,

            // Shipping method (배송처)
            'shipping_method' => $this->shipping_method,

            // Delivery date (납기일)
            'requested_delivery_date' => $this->requested_delivery_date?->format('Y-m-d'),

            // Waybill information (운송장 정보)
            'waybill' => [
                'invoice_number' => $this->orderShipment?->invoice_number,
                'number' => $this->orderShipment?->tracking_number,
                'courier' => $this->orderShipment?->carrier_name,
                'registered_at' => $this->orderShipment?->shipped_at?->toIso8601String(),
            ],

            // Order source (주문처)
            'order_source' => $this->metadata['order_source'] ?? null,

            // Order linkage (주문연동)
            'order_linkage' => $this->metadata['order_linkage'] ?? null,

            // Reception point (접수처)
            'reception_point' => $this->metadata['reception_point'] ?? null,

            // Deleted status
            'deleted_at' => $this->deleted_at?->toIso8601String(),

            // FSD: Order Details - Product Information (ordered products, options, quantity, amount, post-processing + design for PDF export)
            'product_information' => [
                'items' => AdminOrderItemResource::collection($this->whenLoaded('items')),
            ],
        ]);
    }
}
