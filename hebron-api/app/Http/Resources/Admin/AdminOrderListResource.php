<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;

class AdminOrderListResource extends AdminOrderResource
{
    /**
     * Transform an order into the compact shape used by the admin order list.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        return [
            'id' => $data['id'],
            'order_number' => $data['order_number'],
            'user' => $this->user ? $data['user'] : null,
            'company_name' => $data['company_name'],
            'recipient_name' => $this->shipping_name,
            'recipient_phone' => $this->shipping_phone,
            'status' => $data['status'],
            'status_label_ko' => $data['status_label_ko'],
            'status_label_en' => $data['status_label_en'],
            'order_status_stage' => $data['order_status_stage'],
            'payment_method' => $data['payment_method'],
            'payment_status' => $data['payment_status'],
            'total_amount' => $this->total_amount,
            'currency' => $data['currency'],
            'item_count' => $data['item_count'],
            'first_item_title' => $this->items->first()?->title,
            'has_design' => $this->items->contains(fn ($item) => $item->design_group_id !== null || $item->order_design_content_id !== null
            ),
            'created_at' => $data['created_at'],
            'updated_at' => $data['updated_at'],
        ];
    }
}
