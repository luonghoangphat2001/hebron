<?php

namespace App\Http\Resources;

use App\Enums\OrderShipmentStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Resources\Admin\AdminUserResource;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrderResource extends JsonResource
{
    /**
     * Convert stored image path to absolute URL without double-prefixing.
     */
    private static function toFullImageUrl(?string $path): ?string
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

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $paidAmount = null;
        $paidTransaction = null;
        if ($this->relationLoaded('paymentTransaction')) {
            $paidTransaction = $this->paymentTransaction
                ->where('status', PaymentStatus::PAID->value)
                ->sortByDesc('paid_at')
                ->first();
            $paidAmount = $paidTransaction?->amount;
        }

        $shippingStatusValue = null;
        $shippingStatusLabelKo = null;
        $shippingStatusLabelEn = null;
        $invoiceNumber = null;
        if ($this->orderShipment) {
            $shipment = $this->orderShipment;
            $shippingStatusValue = $shipment->status?->value;
            $shippingStatusLabelKo = $shipment->status?->label('ko');
            $shippingStatusLabelEn = $shipment->status?->label('en');
            $invoiceNumber = $shipment->invoice_number;
        }
        if ($shippingStatusValue === null && $this->status) {
            $s = OrderStatus::tryFrom($this->status);
            if (in_array($s, [OrderStatus::DeliveryCompleted, OrderStatus::Completed], true)) {
                $shippingStatusValue = 'delivered';
                $shippingStatusLabelKo = '배송완료';
                $shippingStatusLabelEn = 'Delivered';
            } elseif (in_array($s, [OrderStatus::Shipping, OrderStatus::Shipped], true)) {
                $shippingStatusValue = 'in_transit';
                $shippingStatusLabelKo = '배송중';
                $shippingStatusLabelEn = 'In transit';
            }
        }

        return [
            'id' => $this->id,
            'user' => new AdminUserResource($this->user),
            'order_number' => $this->order_number,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'customer_status' => OrderStatus::tryFrom($this->status)?->customerStage(),
            'customer_status_label' => OrderStatus::tryFrom($this->status)?->customerLabel(),
            'status_label_ko' => OrderStatus::tryFrom($this->status)?->label() ?? $this->status,
            'status_label_en' => OrderStatus::tryFrom($this->status)?->labelEn() ?? $this->status,
            'payment_status' => $this->payment_status,
            'order_status_stage' => $this->getOrderStatusStage(),
            'estimated_production_days' => $this->estimated_production_days,
            'shipping_fee' => (string) ($this->shipping_fee ?? '0'),
            'shipping_branch_name' => $this->shipping_branch_name,
            'shipping_time' => $this->shipping_time,
            'amount_shipping' => (string) ($this->amount_shipping ?? '0'),
            'shipping_method' => $this->shipping_method?->value,
            'currency' => $this->currency,
            'totals' => [
                'subtotal' => (string) ($this->subtotal_amount ?? '0'),
                'discount' => (string) ($this->discount_amount ?? '0'),
                'tax' => (string) ($this->tax_amount ?? '0'),
                'shipping_fee' => (string) ($this->shipping_fee ?? '0'),
                'total' => (string) ($this->total_amount ?? '0'),
            ],
            'contact' => [
                'name' => $this->contact_name,
                'phone' => $this->contact_phone,
                'phone2' => $this->contact_phone2,
                'email' => $this->contact_email,
                'company_name' => $this->company_name,
            ],
            'shipping' => [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'postcode' => $this->shipping_postcode,
                'address' => $this->shipping_address,
                'address_detail' => $this->shipping_address_detail,
                'method' => $this->shipping_method?->value,
                'shipping_carrier' => $this->orderShipment?->carrier_name,
                'shipped_date' => $this->orderShipment?->shipped_at?->format('Y-m-d'),
                'estimated_shipping_date' => $this->metadata['estimated_shipping_date'] ?? null,
                'tracking_number' => $this->orderShipment?->tracking_number,
                'tracking_number' => $this->orderShipment?->tracking_number,
                'shipping_memo' => $this->customer_note,
                'shipping_status' => $shippingStatusValue,
                'shipping_status_label_ko' => $shippingStatusLabelKo,
                'shipping_status_label_en' => $shippingStatusLabelEn,
                'invoice_number' => $invoiceNumber,
            ],
            'payment_details' => [
                'order_amount' => (string) ($this->subtotal_amount ?? '0'),
                'shipping_fee' => (string) ($this->shipping_fee ?? '0'),
                'payment_amount' => (string) ($this->total_amount ?? '0'),
                'paid_amount' => (string) ($paidAmount ?? '0'),
                'payment_method' => $paidTransaction?->payment_method?->value,
                'card_number' => $paidTransaction?->card_number,
                'virtual_account_number' => $paidTransaction?->virtual_account_number,
                'virtual_account_bank' => $paidTransaction?->virtual_account_bank,
                'virtual_account_expires_at' => $paidTransaction?->virtual_account_expires_at,
                'bank_account_holder' => $paidTransaction?->bank_account_holder,
            ],
            'proof' => [
                'status' => $this->metadata['proof_status'] ?? null,
                'confirmed_at' => $this->metadata['proof_confirmed_at'] ?? null,
                'corrections' => $this->metadata['corrections'] ?? [],
                'file_resubmissions' => $this->metadata['file_resubmissions'] ?? [],
            ],
            'last_design_revision' => $this->designRevisions()->latest()->first()
                ? new DesignRevisionResource($this->designRevisions()->latest()->first())
                : null,
            'metadata' => [
                'selected_options' => $this->selected_options,
                'selected_option_values' => $this->selected_option_values,
                'estimated_production_days' => $this->estimated_production_days,
                'placed_at' => $this->placed_at?->toIso8601String(),
                'customer_note' => $this->customer_note,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'order_shipments' => $this->whenLoaded('orderShipments', function () {
                return $this->orderShipments->map(function ($shipment) {
                    return [
                        'id' => $shipment->id,
                        'type' => $shipment->type?->value,
                        'type_label_ko' => $shipment->type === 'combined' ? '합배송' : '따로배송',
                        'status' => $shipment->status?->value,
                        'status_label_ko' => match ($shipment->status) {
                            OrderShipmentStatus::PENDING => '배송 준비중',
                            OrderShipmentStatus::IN_TRANSIT => '배송중',
                            OrderShipmentStatus::DELIVERED => '배송완료',
                            default => null,
                        },
                        'invoice_number' => $shipment->invoice_number,
                        'tracking_number' => $shipment->tracking_number,
                        'carrier_code' => $shipment->carrier_code,
                        'carrier_name' => $shipment->carrier_name,
                        'shipping_method' => $shipment->shipping_method,
                        'memo' => $shipment->memo,
                        'shipping_fee' => (string) ($shipment->shipping_fee ?? '0'),
                        'shipping_name' => $shipment->shipping_name,
                        'shipping_phone' => $shipment->shipping_phone,
                        'shipping_postcode' => $shipment->shipping_postcode,
                        'shipping_address' => $shipment->shipping_address,
                        'shipping_address_detail' => $shipment->shipping_address_detail,
                        'shipped_at' => $shipment->shipped_at?->format('Y-m-d'),
                        'delivered_at' => $shipment->delivered_at?->format('Y-m-d'),
                        'items' => $shipment->relationLoaded('items')
                            ? $shipment->items->map(fn ($item) => [
                                'id' => $item->id,
                                'product_name' => $item->product_name ?? $item->title ?? null,
                                'quantity' => $item->quantity,
                            ])->values()->all()
                            : [],
                    ];
                })->values()->all();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Map internal order/payment status to a 5-step order status stage for MyPage UI.
     *
     * Stages (lowercase snake_case for FE):
     * - payment_completed
     * - order_confirmed
     * - in_production
     * - shipping
     * - delivered
     */
    private function getOrderStatusStage(): ?string
    {
        $status = $this->status ? OrderStatus::tryFrom($this->status) : null;

        if (! $status) {
            $paymentStatus = $this->payment_status ? PaymentStatus::tryFrom($this->payment_status) : null;

            if ($paymentStatus && $paymentStatus->isCompleted()) {
                return 'payment_completed';
            }

            return null;
        }

        if (in_array($status, OrderStatus::getInProductionEnum(), true)) {
            return 'in_production';
        }

        return match ($status) {
            // 1. Payment completed (earliest stage or cancelled/refund flow)
            OrderStatus::Draft,
            OrderStatus::Pending,
            OrderStatus::AwaitingPayment,
            OrderStatus::Cancelled,
            OrderStatus::RefundRequested,
            OrderStatus::RefundCompleted => 'payment_completed',

            // 2. Order confirmed
            OrderStatus::Confirmed,
            OrderStatus::PurchaseConfirmed,
            // Design workflow statuses remain in the confirmed stage while
            // their individual status is used by the dashboard design group.
            OrderStatus::DesignConfirmationRequested,
            OrderStatus::DesignConfirmed,
            OrderStatus::DesignRejected => 'order_confirmed',

            // 3. In production use above (in_production)

            // 4. Shipping
            OrderStatus::ReadyToShip,
            OrderStatus::Shipping,
            OrderStatus::Shipped => 'shipping',

            // 5. Delivered (end state)
            OrderStatus::DeliveryCompleted,
            OrderStatus::Completed => 'delivered',
        };
    }
}
