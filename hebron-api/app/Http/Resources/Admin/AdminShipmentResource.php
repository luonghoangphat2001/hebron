<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminShipmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $order = $this->order;
        $items = $order?->items ?? collect();
        $metadata = $order?->metadata ?? [];

        return [
            'id'              => $this->id,
            'order_number'    => $order?->order_number,
            'customer_name'   => $order?->company_name ?: $order?->contact_name,
            'product_name'    => $items->map(fn ($item) => $item->title ?: $item->product?->name)
                ->filter()->unique()->values()->implode(', '),
            'quantity'        => (int) $items->sum('quantity'),
            'delivery_manager' => [
                'id' => $metadata['delivery_manager_id'] ?? $metadata['shipping_manager_id'] ?? null,
                'name' => $metadata['delivery_manager_name'] ?? $metadata['shipping_manager_name'] ?? null,
            ],
            'status'          => $this->status?->value,
            'invoice_number'  => $this->invoice_number,
            'tracking_number' => $this->tracking_number,
            'carrier_code'    => $this->carrier_code,
            'carrier_name'    => $this->carrier_name,
            'shipping_method' => $this->shipping_method,
            'shipping_fee'    => $this->shipping_fee,
            'shipping_name'   => $this->shipping_name,
            'shipping_phone'  => $this->shipping_phone,
            'shipping_postcode'=> $this->shipping_postcode,
            'shipping_address' => trim($this->shipping_address.' '.$this->shipping_address_detail),
            'shipping_address_detail'=> $this->shipping_address_detail,
            'shipped_at'      => $this->shipped_at?->format('Y-m-d H:i:s'),
            'delivered_at'    => $this->delivered_at?->format('Y-m-d H:i:s'),
        ];
    }
}
