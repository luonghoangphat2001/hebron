<?php

namespace App\Services\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Models\DeliveryTracking;
use App\Models\Order;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AdminDeliveryTrackingService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        return [
            'delivery_status_options' => DeliveryStatus::options(),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getDeliveryTrackings(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $sortBy = Arr::get($filters, 'sort_by', 'waybill_registered_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $sortColumn = match ($sortBy) {
            'invoice_number' => 'delivery_trackings.invoice_number',
            'delivery_status' => 'delivery_trackings.delivery_status',
            default => 'delivery_trackings.waybill_registered_at',
        };
        $query->orderBy($sortColumn, $sortOrder);
        $currentPage = (int) Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['delivery_trackings.*'], 'page', $currentPage);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = DeliveryTracking::query()
            ->select('delivery_trackings.*')
            ->join('orders', 'delivery_trackings.order_id', '=', 'orders.id')
            ->with(['order.items', 'order.product']);

        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm !== null && $searchTerm !== '') {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $searchTerm).'%';
            $query->where(function (Builder $q) use ($like) {
                $q->where('delivery_trackings.invoice_number', 'like', $like)
                    ->orWhere('orders.order_number', 'like', $like)
                    ->orWhere('orders.company_name', 'like', $like)
                    ->orWhere('orders.product_name', 'like', $like);
            });
        }

        $invoiceNumber = Arr::get($filters, 'invoice_number');
        if ($invoiceNumber) {
            $query->where('delivery_trackings.invoice_number', 'like', '%'.$invoiceNumber.'%');
        }
        $orderNumber = Arr::get($filters, 'order_number');
        if ($orderNumber) {
            $query->where('orders.order_number', 'like', '%'.$orderNumber.'%');
        }
        $customerName = Arr::get($filters, 'customer_name');
        if ($customerName) {
            $query->where('orders.company_name', 'like', '%'.$customerName.'%');
        }
        $productName = Arr::get($filters, 'product_name');
        if ($productName) {
            $query->where('orders.product_name', 'like', '%'.$productName.'%');
        }
        $deliveryStatus = Arr::get($filters, 'delivery_status');
        if ($deliveryStatus !== null && $deliveryStatus !== '') {
            $query->where('delivery_trackings.delivery_status', $deliveryStatus);
        }
        $from = Arr::get($filters, 'waybill_registration_date_from');
        if ($from) {
            $query->where('delivery_trackings.waybill_registered_at', '>=', $from);
        }
        $to = Arr::get($filters, 'waybill_registration_date_to');
        if ($to) {
            $query->where('delivery_trackings.waybill_registered_at', '<=', $to);
        }

        return $query;
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?DeliveryTracking
    {
        return DeliveryTracking::query()
            ->where('invoice_number', $invoiceNumber)
            ->with(['order.items', 'order.product'])
            ->first();
    }

    /**
     * Create or update the delivery record for an order and mark the order ready to ship.
     *
     * @return array{order: Order, delivery_tracking: DeliveryTracking}
     */
    public function createByOrderNumber(string $orderNumber): array
    {
        return DB::transaction(function () use ($orderNumber): array {
            $order = Order::query()
                ->with('orderShipment')
                ->where('order_number', $orderNumber)
                ->first();

            if (! $order) {
                throw new HttpException(404, 'Order not found.');
            }

            $currentStatus = OrderStatus::tryFrom((string) $order->status);
            if (in_array($currentStatus, [OrderStatus::Cancelled, OrderStatus::Completed], true)) {
                throw new HttpException(422, 'Delivery cannot be created for this order status.');
            }

            $shipment = $order->orderShipment;
            if (! $shipment) {
                throw new HttpException(402, 'Order shipment not found.');
            }

            if ($shipment->tracking_number) {
                throw new HttpException(422, 'Delivery cannot be created because this order already has a tracking number.');
            }

            $deliveryTracking = DeliveryTracking::query()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'invoice_number' => $shipment->tracking_number,
                    'waybill_registered_at' => $shipment->shipped_at?->toDateString(),
                    'delivery_status' => DeliveryStatus::ReadyToShip,
                    'courier_name' => $shipment->carrier_name,
                    'tracking_info' => [
                        'shipping_name' => $shipment->shipping_name,
                        'shipping_phone' => $shipment->shipping_phone,
                        'shipping_postcode' => $shipment->shipping_postcode,
                        'shipping_address' => $shipment->shipping_address,
                        'shipping_address_detail' => $shipment->shipping_address_detail,
                    ],
                ]
            );

            $order->update(['status' => OrderStatus::ReadyToShip->value]);
            $order->refresh();

            return [
                'order' => $order->load('orderShipment'),
                'delivery_tracking' => $deliveryTracking->load(['order.items', 'order.product', 'order.orderShipment']),
            ];
        });
    }

    /**
     * @return array{order: ?Order, delivery_tracking: DeliveryTracking}
     */
    public function updateStatusByInvoiceNumber(string $invoiceNumber, DeliveryStatus $status): array
    {
        return DB::transaction(function () use ($invoiceNumber, $status): array {
            $deliveryTracking = DeliveryTracking::query()
                ->where(function (Builder $query) use ($invoiceNumber): void {
                    $query->where('invoice_number', $invoiceNumber)
                        ->orWhereHas('order', function (Builder $orderQuery) use ($invoiceNumber): void {
                            $orderQuery->where('order_number', $invoiceNumber);
                        });
                })
                ->with(['order.items', 'order.product'])
                ->first();

            if (! $deliveryTracking) {
                throw new HttpException(404, 'Delivery tracking not found.');
            }

            $deliveryTracking->update(['delivery_status' => $status->value]);

            $order = $deliveryTracking->order;
            if ($status === DeliveryStatus::Delivered && $order) {
                $order->update(['status' => OrderStatus::Completed->value]);
                $order->refresh();
            }

            return [
                'order' => $order,
                'delivery_tracking' => $deliveryTracking->refresh(),
            ];
        });
    }

    /**
     * @return array{order_number: string}
     */
    public function deleteByInvoiceNumber(string $invoiceNumber): array
    {
        $deliveryTracking = DeliveryTracking::query()
            ->where('invoice_number', $invoiceNumber)
            ->with('order:id,order_number')
            ->first();

        if (! $deliveryTracking) {
            throw new HttpException(404, 'Delivery tracking not found.');
        }

        $orderNumber = (string) $deliveryTracking->order?->order_number;
        $deliveryTracking->delete();

        return ['order_number' => $orderNumber];
    }
}
