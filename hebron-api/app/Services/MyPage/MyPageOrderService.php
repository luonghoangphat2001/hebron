<?php

namespace App\Services\MyPage;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class MyPageOrderService
{
    /**
     * Get order-delivery-tracking list for MyPage screen.
     */
    public function getOrders(User $user, array $filters = []): LengthAwarePaginator
    {
        try {
            $query = $this->buildOrdersQuery($user->id, $filters);
            $perPage = $filters['per_page'] ?? 15;
            $perPage = min($perPage, config('exports.max_per_page'));

            return $query->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get MyPage orders failed', [
                'user_id' => $user->id,
                'filters' => $filters,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Build the filtered MyPage order-history query shared by list and export flows.
     *
     * @param  array<string, mixed>  $filters
     */
    public function buildOrdersQuery(int $userId, array $filters = []): Builder
    {
        $query = Order::with(['items.designGroup', 'items.orderDesignContent', 'items.product', 'product', 'orderShipment'])
            ->where('user_id', $userId);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $filterLabel = $filters['filter_label'] ?? 'all';
        if ($filterLabel === 'exclude_cancelled') {
            $query->where('status', '!=', OrderStatus::Cancelled->value);
        }
        if ($filterLabel === 'file_error') {
            $query->where('metadata->proof_status', 'file_error');
        }

        if (($filters['product_scope'] ?? 'all') !== 'all') {
            $query->where('metadata->product_scope', $filters['product_scope']);
        }

        if (! empty($filters['order_number_keyword'])) {
            $query->where('order_number', 'like', '%'.$filters['order_number_keyword'].'%');
        }

        if (! empty($filters['product_name_keyword'])) {
            $productKeyword = $filters['product_name_keyword'];
            $query->whereHas('items', function (Builder $itemQuery) use ($productKeyword): void {
                $itemQuery->whereHas('product', function (Builder $productQuery) use ($productKeyword): void {
                    $productQuery->where('name', 'like', '%'.$productKeyword.'%');
                });
            });
        }

        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;
        if ((! $dateFrom || ! $dateTo) && ! empty($filters['period'])) {
            $now = now();
            $dateTo = $dateTo ?: $now->toDateString();
            $dateFrom = match ($filters['period']) {
                '1w' => $now->copy()->subWeek()->toDateString(),
                '1m' => $now->copy()->subMonth()->toDateString(),
                '3m' => $now->copy()->subMonths(3)->toDateString(),
                '6m' => $now->copy()->subMonths(6)->toDateString(),
                default => $dateFrom,
            };
        }

        if (! empty($dateFrom)) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if (! empty($dateTo)) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_order'] ?? 'desc');
    }

    /**
     * Get order detail for MyPage order-delivery-tracking screen.
     */
    public function getOrderDetail(User $user, string $orderNumber): Order
    {
        try {
            $order = Order::with([
                'user',
                'items.product',
                'items.designGroup',
                'items.orderDesignContent',
                'paymentTransaction',
                'orderShipments',
                'orderShipment',
                'designRevisions'
            ])
                ->where('user_id', $user->id)
                ->where('order_number', $orderNumber)
                ->first();

            if (! $order) {
                throw new ModelNotFoundException('주문을 찾을 수 없습니다.');
            }

            return $order;
        } catch (\Exception $e) {
            Log::error('Get MyPage order detail failed', [
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
