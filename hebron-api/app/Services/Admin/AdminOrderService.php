<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Enums\OrderShipmentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminOrderService
{
    public function __construct(protected OrderRepositoryInterface $orderRepo) {}

    /**
     * Get orders for admin with filters
     *
     * @param  array<string, mixed>  $filters
     */
    public function getOrdersForAdmin(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        // Apply sorting
        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Get grouped order count (묶음건수)
     * This counts unique order groups based on some grouping logic
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGroupedOrderCount(array $filters): int
    {
        // TODO: Implement grouping logic based on business requirements
        // For now, return individual count as grouped count
        $query = $this->buildQuery($filters);

        return $query->count();
    }

    /**
     * Build query with filters
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = Order::with([
            'user:id,username,name,email',
            'product:id,name,slug',
            'items',
            'paymentTransaction',
        ]);

        // FSD: Search filters such as order number, customer, orderer, order status, and order period

        // Order number
        if ($orderNumber = Arr::get($filters, 'order_number')) {
            $query->where('order_number', 'like', '%'.$orderNumber.'%');
        }

        // Customer name (company_name)
        if ($customerName = Arr::get($filters, 'customer_name')) {
            $query->where('company_name', 'like', '%'.$customerName.'%');
        }

        // Orderer name (contact_name)
        if ($ordererName = Arr::get($filters, 'orderer_name')) {
            $query->where('contact_name', 'like', '%'.$ordererName.'%');
        }

        // Order status
        if ($status = Arr::get($filters, 'status')) {
            $query->where('status', $status);
        }

        // Order date range (placed_at)
        if ($orderDateFrom = Arr::get($filters, 'order_date_from')) {
            $query->whereDate('placed_at', '>=', $orderDateFrom);
        }
        if ($orderDateTo = Arr::get($filters, 'order_date_to')) {
            $query->whereDate('placed_at', '<=', $orderDateTo);
        }

        return $query;
    }

    /**
     * Create internal order for sales representatives.
     *
     * @param  array<string, mixed>  $data
     */
    public function createInternalOrder(array $data, User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $basic = $data['basic_information'];
            $products = $data['product_information']['product_list'];
            $payment = $data['payment_information'];

            // Build product_name for internal order (required by DB; use first product title or summary)
            $productTitles = array_map(fn ($p) => $p['title'], $products);
            $orderProductName = count($productTitles) === 1
                ? $productTitles[0]
                : implode(', ', array_slice($productTitles, 0, 3)).(count($productTitles) > 3 ? '...' : '');

            // Create order — set all NOT NULL columns (no DB default) to avoid SQL 1364
            $contactInfo = $basic['contact_info'] ?? '';
            $order = new Order;
            $order->order_number = $this->generateOrderNumber();
            $order->user_id = $user->id;
            $order->company_name = $basic['customer_name'];
            $order->contact_name = $basic['orderer_name'];
            $order->contact_phone = $contactInfo;
            $order->contact_phone2 = $contactInfo;
            $order->contact_tel = $contactInfo;
            $order->shipping_address = $basic['delivery_address'];
            $order->shipping_address_detail = null;
            $order->payment_method = $payment['payment_method'];
            $order->total_amount = $payment['payment_amount'];
            $order->status = 'pending';
            $order->payment_status = 'unpaid';
            $order->currency = 'KRW';
            $order->placed_at = now();
            $order->customer_note = $data['memo'] ?? null;
            $order->product_name = $orderProductName;

            $order->save();

            $order->orderShipment()->firstOrCreate([], [
                'status' => OrderShipmentStatus::PENDING->value,
                'shipping_name' => $order->shipping_name,
                'shipping_phone' => $order->shipping_phone,
                'shipping_postcode' => $order->shipping_postcode,
                'shipping_address' => $order->shipping_address,
                'shipping_address_detail' => $order->shipping_address_detail,
                'shipping_fee' => $order->shipping_fee ?? 0,
            ]);

            // Create order items (unit is NOT NULL in order_items, use 'ea')
            foreach ($products as $product) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'title' => $product['title'],
                    'quantity' => $product['quantity'],
                    'unit_price' => $product['amount'],
                    'total_amount' => $product['amount'],
                    'configuration' => $product['options'] ?? [],
                    'multiplier' => 1,
                    'unit' => 'ea',
                    'production_days' => null,
                    'notes' => null,
                ]);
            }

            return $order->fresh(['items', 'user', 'product']);
        });
    }

    /**
     * Generate internal order number.
     */
    protected function generateOrderNumber(): string
    {
        return 'INT-'.now()->format('YmdHis').'-'.substr(Str::uuid()->toString(), 0, 8);
    }

    /**
     * Get order detail for admin by order number
     * Admin can view any order without user restriction
     *
     * @throws ModelNotFoundException
     */
    public function getOrderForAdmin(string $orderNumber, bool $includeDeleted = false): Order
    {
        $query = Order::with([
            'user:id,username,name,email,phone,mobile',
            'product:id,name,slug',
            'items',
            'items.designGroup',
            'items.orderDesignContent',
            'designFiles',
            'paymentTransaction',
        ]);

        if ($includeDeleted) {
            $query->withTrashed();
        }

        $order = $query->where('order_number', $orderNumber)->first();

        if (! $order) {
            throw new ModelNotFoundException('Order not found.');
        }

        return $order;
    }

    /**
     * Process Bulk update order status
     */
    public function bulkUpdateOrdersStatus(array $data, User $user): array
    {
        $responseData = $this->initBulkUpdateStatusResponse();

        if (empty($data['order_numbers'] ?? []) || ! isset($data['status'])) {
            return $responseData;
        }
        $responseData['summary']['total'] = count($data['order_numbers']);
        $batchId = Str::uuid()->toString();

        $orders = Order::whereIn('order_number', $data['order_numbers'])->get();
        $orderNumbers = $orders->pluck('order_number')->toArray();

        // Check not found order numbers
        $notFoundOrderNumbers = $this->getNotFoundOrderNumbers($data['order_numbers'], $orderNumbers);
        if (! empty($notFoundOrderNumbers)) {
            $responseData['skipped'][] = $this->responseSkippedOrder(implode(', ', $notFoundOrderNumbers), 'Order does not exist.');
            $responseData['summary']['skipped'] += count($notFoundOrderNumbers);
        }

        foreach ($orders as $order) {
            try {
                DB::transaction(function () use ($order, $data, &$responseData, $batchId) {
                    $targetStatus = $data['status'];

                    // Check if status is the same
                    if ($order->status === $targetStatus) {
                        $responseData['skipped'][] = $this->responseSkippedOrder($order->order_number, 'Order status has not changed.');
                        $responseData['summary']['skipped']++;

                        return;
                    }
                    $statusOld = $order->status;
                    $order->status = $targetStatus;
                    $order->logReason = $data['reason'];
                    $order->logBatchId = $batchId;
                    $order->save();

                    $responseData['updated'][] = $this->responseUpdatedOrder($order->order_number, $targetStatus, $statusOld);
                    $responseData['summary']['updated']++;
                });
            } catch (\Exception $e) {
                $responseData['skipped'][] = $this->responseSkippedOrder($order->order_number, $e->getMessage());
                $responseData['summary']['skipped']++;

                continue;
            }
        }

        return $responseData;
    }

    /**
     * Compare and get order number difference
     */
    private function getNotFoundOrderNumbers(array $orderNumbers, array $foundOrderNumbers): array
    {
        return array_diff($orderNumbers, $foundOrderNumbers);
    }

    /**
     * Init response bulk order update status
     */
    private function initBulkUpdateStatusResponse(): array
    {
        return [
            'summary' => [
                'total' => 0,
                'skipped' => 0,
                'updated' => 0,
            ],
            'updated' => [],
            'skipped' => [],
        ];
    }

    /**
     * Response skipped order
     */
    private function responseSkippedOrder(string $orderNumber, string $message): array
    {
        return [
            'order_number' => $orderNumber,
            'reason' => $message,
        ];
    }

    /**
     * Response updated order
     */
    private function responseUpdatedOrder(string $orderNumber, string $status, string $statusOld): array
    {
        return [
            'order_number' => $orderNumber,
            'status' => $status,
            'status_old' => $statusOld,
        ];
    }

    /**
     * Order statics
     */
    public function getOrderStatics(array $customerIds = [], array $configPeriod = []): array
    {
        $summary = $this->getSummaryOrders($customerIds, $configPeriod);
        $salesAnalytics = $this->getSaleStatics($customerIds, $configPeriod);
        $ratiosOrderStatus = $this->getRatiosOrderStatus($customerIds, $configPeriod, $summary['orders']['total'] ?? 0);
        $chartData = $this->getChartOrders($customerIds, $configPeriod);

        return [
            'summary' => $summary,
            'sales_analytics' => $salesAnalytics,
            'ratios_order_status' => $ratiosOrderStatus,
            'chart' => $chartData,
        ];
    }

    /**
     * summary statueses ratios orders
     */
    private function getRatiosOrderStatus(array $customerIds = [], array $configPeriod = [], int $totalOrders = 0): array
    {
        $ratioStatus = $this->initRatioOrderStatus();

        if ($totalOrders <= 0) {
            return $ratioStatus;
        }
        $filters = [...$configPeriod, 'customer_ids' => $customerIds];
        $data = $this->orderRepo->getOrderStatusCounts($filters);

        // caculate percent of status
        foreach ($data as $key => $value) {
            $percent = ($value / $totalOrders) * 100;
            $ratioStatus[$key] = round($percent, 2);
        }

        return $ratioStatus;
    }

    /**
     * init ratios order status
     */
    private function initRatioOrderStatus()
    {
        $orderStatuses = OrderStatus::cases();
        $orderStatuses = array_column($orderStatuses, 'value');
        $setValueDefault = array_fill(0, count($orderStatuses), 0);
        $orderStatusesDefault = array_combine($orderStatuses, $setValueDefault);

        return $orderStatusesDefault;
    }

    /**
     * sale statics
     */
    private function getSaleStatics(array $customerIds = [], array $configPeriod = [], string $view = 'daily'): array
    {
        $filters = [
            ...$configPeriod,
            'customer_ids' => $customerIds,
            'group_by' => $view === 'weekly' ? 'week' : 'date',
        ];

        return [
            'product' => $this->getSalesOrderProducts($filters),
            'category' => $this->getSaleCategoryStaticData($filters),
            'users' => $this->getSaleCustomerStaticData($filters),
        ];
    }

    /**
     * get customer static data
     */
    private function getSaleCustomerStaticData(array $filters): array
    {
        return $this->orderRepo->getSaleCustomerStatics($filters);
    }

    /**
     * get category static data
     */
    private function getSaleCategoryStaticData(array $filters = []): array
    {
        return $this->orderRepo->getSaleCategoryStatic($filters);
    }

    /**
     * get product static data
     */
    private function getSalesOrderProducts(array $filters = []): array
    {
        return $this->orderRepo->getSaleOrderProductStatics($filters);
    }

    /**
     * get summary orders
     */
    private function getSummaryOrders(array $customerIds = [], array $configPeriod = []): array
    {
        $filters = [
            ...$configPeriod,
            'customer_ids' => $customerIds,
        ];
        $initData = $this->initDataSummary();

        $orderSummary = $this->getSummaryOrdersData($filters);
        if (empty($orderSummary)) {
            return $initData;
        }

        return array_merge($initData, [
            'orders' => [
                'total' => $orderSummary['orders_current_total'] ?? 0,
                'total_amount' => $orderSummary['orders_current_amount'] ?? 0,
                'change' => $this->calculateChange($orderSummary['orders_current_total'], $orderSummary['orders_previous_total']),
                'unit' => 'count',
            ],
            'sales' => [
                'total' => $orderSummary['sales_current_total'] ?? 0,
                'total_amount' => $orderSummary['sales_current_amount'] ?? 0,
                'change' => $this->calculateChange($orderSummary['sales_current_total'], $orderSummary['sales_previous_total']),
                'unit' => 'count',
            ],
            'cancellations_returns' => [
                'total' => $orderSummary['cancellations_current_total'] ?? 0,
                'total_amount' => $orderSummary['cancellations_current_total_amount'] ?? 0,
                'change' => $this->calculateChange($orderSummary['cancellations_current_total'], $orderSummary['cancellations_previous_total']),
                'unit' => 'count',
            ],
        ]);
    }

    /**
     * init data summary
     */
    private function initDataSummary(): array
    {
        return [
            'orders' => [
                'total' => 0,
                'total_amount' => 0,
                'change' => 0,
                'unit' => 'count',
            ],
            'sales' => [
                'total' => 0,
                'total_amount' => 0,
                'change' => 0,
                'unit' => 'count',
            ],
            'cancellations_returns' => [
                'total' => 0,
                'total_amount' => 0,
                'change' => 0,
                'unit' => 'count',
            ],
        ];
    }

    /**
     * summary data orders
     */
    private function getSummaryOrdersData(array $filters = []): array
    {
        return $this->orderRepo->getSummaryOrders($filters);
    }

    /**
     * calculeate change
     */
    private function calculateChange(?float $current, ?float $previous): float
    {
        if ($previous <= 0) {
            return 0;
        }

        if ($current == 0 && $previous == 0) {
            return 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Get chart orders by daily and weekly
     */
    public function getChartOrders(array $customerIds = [], array $configPeriod = []): array
    {
        $filters = [...$configPeriod, 'customer_ids' => $customerIds];

        return [
            'daily' => $this->getDailyChartData($filters),
            'weekly' => $this->getWeeklyChartData($filters),
        ];
    }

    /**
     * Get daily chart data
     */
    private function getDailyChartData(array $filters): array
    {
        $data = $this->orderRepo->getDailyOrderCounts($filters);
        $total = 0;

        // calculate total amount
        if (! empty($data)) {
            $total = array_sum(array_column($data, 'total_amount'));
        }

        return [
            'data' => $data,
            'total_amount' => round($total, 2),
        ];
    }

    /**
     * Get weekly chart data
     */
    private function getWeeklyChartData(array $filters): array
    {
        $data = $this->orderRepo->getWeeklyOrderCounts($filters);
        $total = 0;

        // Caculate total amount
        if (! empty($data)) {
            $total = array_sum(array_column($data, 'total_amount'));
        }

        return [
            'data' => $data,
            'total_amount' => round($total, 2),
        ];
    }

    /**
     * Init config period
     */
    public function configPeriod(string $period): array
    {
        $now = now();

        return match ($period) {
            '7d' => [
                'start_date' => $now->copy()->subDays(7)->startOfDay()->toDateString(),
                'end_date' => $now->copy()->endOfDay()->toDateString(),
                'previous_start_date' => $now->copy()->subDays(14)->startOfDay()->toDateString(),
                'previous_end_date' => $now->copy()->subDays(7)->endOfDay()->toDateString(),
            ],
            default => [
                'start_date' => $now->copy()->subDays(30)->startOfDay()->toDateString(),
                'end_date' => $now->copy()->endOfDay()->toDateString(),
                'previous_start_date' => $now->copy()->subDays(60)->startOfDay()->toDateString(),
                'previous_end_date' => $now->copy()->subDays(30)->endOfDay()->toDateString(),
            ],
        };
    }
}
