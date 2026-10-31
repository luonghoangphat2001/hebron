<?php

namespace App\Services\Admin;

use App\Enums\OrderShipmentStatus;
use App\Models\Order;
use App\Models\OrderShipment;
use App\Models\User;
use App\Services\PaginationService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;

class AdminShipmentService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        $managerOptions = User::query()
            ->whereNotNull('name')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($u) => ['value' => $u->id, 'label' => $u->name])
            ->toArray();

        return [
            'shipment_status_options' => collect([
                OrderShipmentStatus::PENDING,
                OrderShipmentStatus::IN_TRANSIT,
                OrderShipmentStatus::DELIVERED,
            ])->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->value,
            ])->toArray(),
            'delivery_manager_options' => $managerOptions,
            // Backward-compatible key for existing admin clients.
            'shipping_manager_options' => $managerOptions,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getShipments(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $sortBy = Arr::get($filters, 'sort_by', 'shipped_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $sortColumn = match ($sortBy) {
            'order_number' => 'orders.order_number',
            'shipped_at'   => 'order_shipments.shipped_at',
            default        => 'order_shipments.created_at',
        };

        $query->orderBy($sortColumn, $sortOrder);
        $currentPage = (int) Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['order_shipments.*'], 'page', $currentPage);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function buildQuery(array $filters): Builder
    {
        $query = OrderShipment::query()
            ->select('order_shipments.*')
            ->join('orders', 'order_shipments.order_id', '=', 'orders.id')
            ->with(['order.items.product']);

        $searchTerm = Arr::get($filters, 'search_term');
        if ($searchTerm !== null && $searchTerm !== '') {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $searchTerm).'%';
            $query->where(function (Builder $q) use ($like) {
                $q->where('orders.order_number', 'like', $like)
                    ->orWhere('orders.company_name', 'like', $like)
                    ->orWhere('order_shipments.tracking_number', 'like', $like);
            });
        }

        $dateFrom = Arr::get($filters, 'shipment_date_from');
        if ($dateFrom) {
            $query->where('order_shipments.shipped_at', '>=', $dateFrom);
        }
        $dateTo = Arr::get($filters, 'shipment_date_to');
        if ($dateTo) {
            $query->where('order_shipments.shipped_at', '<=', $dateTo.' 23:59:59');
        }

        $orderNumber = Arr::get($filters, 'order_number');
        if ($orderNumber) {
            $query->where('orders.order_number', 'like', '%'.$orderNumber.'%');
        }

        $customerName = Arr::get($filters, 'customer_name');
        if ($customerName) {
            $query->where(function (Builder $q) use ($customerName) {
                $q->where('orders.company_name', 'like', '%'.$customerName.'%')
                    ->orWhere('orders.contact_name', 'like', '%'.$customerName.'%');
            });
        }

        $productName = Arr::get($filters, 'product_name');
        if ($productName) {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $productName).'%';
            $query->whereHas('order.items', function (Builder $q) use ($like) {
                $q->where(function (Builder $itemQuery) use ($like) {
                    $itemQuery->where('order_items.title', 'like', $like)
                        ->orWhereHas('product', function (Builder $productQuery) use ($like) {
                            $productQuery->where('products.name', 'like', $like)
                                ->orWhere('products.name_en', 'like', $like)
                                ->orWhere('products.sku', 'like', $like);
                        });
                });
            });
        }

        $managerId = Arr::get($filters, 'delivery_manager_id', Arr::get($filters, 'shipping_manager_id'));
        if ($managerId !== null && $managerId !== '') {
            $query->where(function (Builder $q) use ($managerId) {
                $q->where('orders.metadata->delivery_manager_id', $managerId)
                    ->orWhere('orders.metadata->shipping_manager_id', $managerId);
            });
        }

        $status = Arr::get($filters, 'shipment_status');
        if ($status !== null && $status !== '') {
            $query->where('order_shipments.status', $status);
        }

        $trackingNumber = Arr::get($filters, 'tracking_number');
        if ($trackingNumber) {
            $query->where('order_shipments.tracking_number', 'like', '%'.$trackingNumber.'%');
        }

        $invoiceNumber = Arr::get($filters, 'invoice_number');
        if ($invoiceNumber) {
            $query->where('order_shipments.invoice_number', 'like', '%'.$invoiceNumber.'%');
        }

        return $query;
    }

    public function getByInvoiceNumber(string $invoiceNumber): ?OrderShipment
    {
        return OrderShipment::query()
            ->where('invoice_number', $invoiceNumber)
            ->with('order')
            ->first();
    }
}
